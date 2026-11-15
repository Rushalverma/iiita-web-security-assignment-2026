import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createApp } from "../server/app.js";
import { createUserStore } from "../server/database.js";

let users;
let server;
let base;

before(async () => {
  users = createUserStore();
  server = createApp(users).listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  users.close();
});

function post(path, data, cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  return fetch(base + path, { method: "POST", headers, body: JSON.stringify(data) });
}

function account(cookie) {
  return fetch(base + "/api/account", { headers: cookie ? { Cookie: cookie } : {} });
}

test("the account API requires a session", async () => {
  const response = await account();
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("correct credentials create a session with a protected account", async () => {
  const response = await post("/api/login", { username: "admin", password: "AdminDemo42!" });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  const session = await account(cookie.split(";")[0]);
  assert.equal(session.status, 200);
  assert.deepEqual(await session.json(), { user: { username: "admin", role: "administrator" } });
});

test("vulnerable mode demonstrates authentication bypass with a comment payload", async () => {
  const response = await post("/api/login", {
    username: "admin' --",
    password: "anything",
    mode: "vulnerable",
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.authenticatedBypass, true);
  assert.equal(data.user.role, "administrator");
  assert.match(data.sql, /admin' --/);
});

test("secure mode treats the bypass payload as data", async () => {
  const response = await post("/api/login", {
    username: "admin' --",
    password: "anything",
    mode: "secure",
  });
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("set-cookie"), null);
});

test("wrong passwords and unknown accounts produce the same failure", async () => {
  for (const username of ["admin", "guest's-account"]) {
    const response = await post("/api/login", { username, password: "wrong-password" });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("set-cookie"), null);
    assert.deepEqual(await response.json(), { error: "Invalid username or password." });
  }
});

test("a legitimate username containing an apostrophe stays valid", async () => {
  const response = await post("/api/login", { username: "o'connor", password: "StudentDemo42!" });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: { username: "o'connor", role: "student" } });
});

test("logout destroys the old session on the server", async () => {
  const login = await post("/api/login", { username: "admin", password: "AdminDemo42!" });
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const logout = await post("/api/logout", {}, cookie);
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/);
  assert.equal((await account(cookie)).status, 401);
});

test("login validates input and returns a generic error for malformed JSON", async () => {
  assert.equal((await post("/api/login", { username: [], password: "password" })).status, 400);
  const form = await fetch(base + "/api/login", { method: "POST", body: new URLSearchParams({ username: "admin" }) });
  assert.equal(form.status, 415);
  const response = await fetch(base + "/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Send valid JSON." });
});
