# SQL injection authentication bypass

| Member | Roll number | Category | Variant |
| --- | --- | --- | --- |
| Rushal Verma | IIT2024045 | SQL injection | Authentication bypass |

This local lab implements the mitigation for SQL injection in a login form. React sends the form to Express. SQLite looks up the account using a prepared statement, and Node.js checks the password hash before Express creates a session. The guide explains the original vulnerability conceptually.

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

This app prepares a fixed statement containing `WHERE username = ?`. The value in `findUser.get(username)` fills the placeholder through SQLite's API. A quote in a name such as `o'connor` stays part of the name. Express issues an authenticated session only after the password check succeeds. [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html#parameterized-queries)

Input length and type checks help define valid requests. Least privilege limits what the application can access, and generic errors limit what it reveals. These are additional controls. Parameter binding protects the structure of this query.

## Demonstrate and verify

1. Sign in as `o'connor` with a wrong password. The app displays **Invalid username or password**.
2. Point to the prepared statement and the bound username in `server/database.js`.
3. Use the same username with its correct demo password. The student dashboard opens. Refresh to check that the session still works.
4. Sign out and refresh. The login form is visible again.

Run `npm test` to verify the Express API and the session lifecycle. The app is scoped to the local classroom demonstration and uses an in-memory session store.

[Scripts and screen cues for the 2–3 minute recording](docs/DEMO_SCRIPT.md) · [Viva notes](docs/VIVA_NOTES.md) · [Browser evidence](evidence/README.md) · [Verification](docs/VALIDATION.md)

