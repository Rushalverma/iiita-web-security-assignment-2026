import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, test } from "node:test";
import { createApp } from "../server/app.js";

let server;
let base;

before(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("returns normal queries and Unicode unchanged", async () => {
  const query = "नमस्ते & campus library";
  const response = await fetch(base + "/api/search?" + new URLSearchParams({ q: query }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { query });
});

test("keeps harmless markup in JSON data", async () => {
  const query = "<strong>Sample note</strong> & friends";
  const response = await fetch(base + "/api/search?" + new URLSearchParams({ q: query }));
  assert.match(response.headers.get("content-type"), /^application\/json\b/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(response.headers.get("content-security-policy").includes("script-src 'self'"));
  const raw = await response.text();
  assert.ok(!raw.includes("<strong>"));
  assert.deepEqual(JSON.parse(raw), { query });
});

test("handles an empty query without retaining previous input", async () => {
  const response = await fetch(base + "/api/search");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { query: "" });
});

test("accepts the length limit and rejects longer or repeated terms", async () => {
  for (const [queryString, expected] of [
    ["q=" + "a".repeat(240), 200],
    ["q=" + "a".repeat(241), 400],
    ["q=first&q=second", 400],
  ]) {
    const response = await fetch(base + "/api/search?" + queryString);
    assert.equal(response.status, expected);
    await response.json();
  }
});
