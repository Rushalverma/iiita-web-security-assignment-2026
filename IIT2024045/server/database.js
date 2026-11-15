import { randomBytes, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
const keyLength = 64;

// Fictional accounts for the local lesson. SQLite stores their salted hashes.
const demoUsers = [
  { username: "admin", password: "AdminDemo42!", role: "administrator" },
  { username: "student", password: "StudentDemo42!", role: "student" },
  { username: "o'connor", password: "StudentDemo42!", role: "student" },
];

function hashDemoPassword(password) {
  const salt = randomBytes(16);
  return { salt, passwordHash: scryptSync(password, salt, keyLength) };
}

export function createUserStore() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE users (
      username TEXT PRIMARY KEY NOT NULL,
      role TEXT NOT NULL,
      password TEXT NOT NULL,
      salt BLOB NOT NULL,
      password_hash BLOB NOT NULL
    )
  `);

  const insert = db.prepare(
    "INSERT INTO users (username, role, password, salt, password_hash) VALUES (?, ?, ?, ?, ?)",
  );
  for (const { username, password, role } of demoUsers) {
    const { salt, passwordHash } = hashDemoPassword(password);
    insert.run(username, role, password, salt, passwordHash);
  }

  const findUser = db.prepare(
    "SELECT username, role, salt, password_hash FROM users WHERE username = ?",
  );
  const dummy = hashDemoPassword(randomBytes(24));

  async function authenticate(username, password, mode = "secure") {
    if (mode === "vulnerable") {
      const sql = `SELECT username, role FROM users WHERE username = '${username}' AND password = '${password}'`;
      const user = db.prepare(sql).get();
      return user
        ? { user: { username: user.username, role: user.role }, sql, bypassed: password !== demoUsers.find((entry) => entry.username === user.username)?.password }
        : { user: null, sql, bypassed: false };
    }

    // The statement is already prepared. The username fills a data parameter.
    const user = findUser.get(username);
    const computed = await deriveKey(password, user?.salt ?? dummy.salt, keyLength);
    const matches = timingSafeEqual(computed, user?.password_hash ?? dummy.passwordHash);

    return {
      user: user && matches ? { username: user.username, role: user.role } : null,
      sql: "SELECT username, role, salt, password_hash FROM users WHERE username = ?",
      bypassed: false,
    };
  }

  return { authenticate, close: () => db.close() };
}
