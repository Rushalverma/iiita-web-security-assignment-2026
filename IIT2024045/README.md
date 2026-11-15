# SQL injection authentication bypass

| Member | Roll number | Category | Variant |
| --- | --- | --- | --- |
| Rushal Verma | IIT2024045 | SQL injection | Authentication bypass |

This local lab demonstrates a SQL-injection authentication bypass and its mitigation. Use **Vulnerable mode** with `admin' --` and any password to see the database return the administrator row without checking the password. Switch to **Secure mode** and submit the same payload; parameter binding treats it as data and rejects it.

> **Authorised local testing only:** Vulnerable mode is deliberately insecure for this classroom demonstration. Run it only on localhost and never deploy it publicly.

## Run locally

Use **Node.js 24 or newer**. From the group repository root, run:

~~~sh
cd IIT2024045
npm ci
npm run build
npm start
~~~

Open [the lab](http://127.0.0.1:5000). Express serves the built React frontend and the API on the same port. If another module is using port 5000, set the PORT environment variable before running npm start. SQLite runs in memory and seeds the same fictional accounts on each restart.

## Demo accounts

| Username | Password | Role |
| --- | --- | --- |
| admin | AdminDemo42! | administrator |
| student | StudentDemo42! | student |
| o'connor | StudentDemo42! | student |

Use the fictional credentials above. The passwords are public demo values, and the database stores their salted scrypt hashes.

## Source and data flow

| Step | What happens | Source |
| --- | --- | --- |
| Submit | React sends the username and password as JSON. | [React page](src/main.jsx) |
| Look up | SQLite prepares the query once and binds the submitted username to a placeholder. | [User store](server/database.js) |
| Verify | Node.js derives a hash from the submitted password and compares it to the stored hash. | [Password check](server/database.js) |
| Open session | Express creates a session for a valid account and uses it to protect the account endpoint. | [Express routes](server/app.js) |

## Root cause and mitigation

SQL injection can lead to authentication bypass when a login builds its SQL from untrusted input and accepts the database result as proof of identity. If input changes the meaning of the query, the application can make the wrong authentication decision.

Vulnerable mode concatenates input into `WHERE username = '...' AND password = '...'`, allowing `admin' --` to comment out the password check. Secure mode prepares a fixed statement containing `WHERE username = ?`; the value in `findUser.get(username)` fills the placeholder through SQLite's API. Express issues an authenticated session only after the password check succeeds. [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#parameterized-queries)

Input length and type checks help define valid requests. Least privilege limits what the application can access, and generic errors limit what it reveals. These are additional controls. Parameter binding protects the structure of this query.

## Demonstrate and verify

1. Select **Vulnerable mode**, enter `admin' --` as the username and any password. The page shows the executed SQL, an **AUTHENTICATION BYPASSED** banner, and the administrator dashboard.
2. Sign out, switch to **Secure mode**, and submit the same payload. The login fails because the payload is bound as a literal username.
3. Point to the vulnerable string-concatenated query and the secure prepared statement in `server/database.js`.
4. Sign in with a correct demo account to show that ordinary secure authentication still works, then sign out.

The vulnerable sequence demonstrates the bypass, and the secure sequence demonstrates the mitigation.

Run `npm test` to verify the Express API and the session lifecycle. The app is scoped to the local classroom demonstration and uses an in-memory session store.

[Scripts and screen cues for the 2–3 minute recording](docs/DEMO_SCRIPT.md) · [Viva notes](docs/VIVA_NOTES.md) · [Browser evidence](evidence/README.md) · [Verification](docs/VALIDATION.md)

