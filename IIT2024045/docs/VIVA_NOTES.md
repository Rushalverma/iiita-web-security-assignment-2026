# SQL injection viva notes

**What causes SQL injection?** Untrusted data becomes part of SQL source and can change the meaning of the statement. If that statement contributes to the login decision, the result can lead to authentication bypass.

**Which lines implement the fix?** The query is prepared with `db.prepare`. The placeholder in `WHERE username = ?` is bound by `findUser.get(username)`, so the SQL stays fixed and the username is supplied as data. [User store](../server/database.js)

**How does the login work?** React posts the form to Express as JSON. SQLite looks up the user by name. Node.js checks a hash of the password using the salt stored for that user. Express creates a session upon success and requires it to serve the account data. [Express routes](../server/app.js)

**Why use a legitimate username containing an apostrophe?** It shows that parameter binding can preserve punctuation in valid data. The same name fails with the wrong password and succeeds with the correct one.

**Why use password hashes?** A salted password hash makes it harder to recover passwords from stored records. Parameter binding and hashing address different risks.

**What are the other mitigations?** Validate request types and lengths, keep the database scope as small as possible, and send generic errors. For dynamic table names or sort options, map user selections to a small set of fixed application values.

**What happens at logout?** Express destroys the stored session and clears its cookie. The account API requires a valid session on subsequent requests.

[OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) · [Express session middleware](https://expressjs.com/en/resources/middleware/session/)

