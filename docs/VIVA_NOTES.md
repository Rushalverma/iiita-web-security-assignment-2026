# Viva preparation: SQL injection authentication bypass

## The explanation to understand

The vulnerable application inserts untrusted username and password text into SQL. Input can then change the statement's meaning. In our demonstrated payload, `admin' -- `, the quote ends the username string and `--` starts a line comment. That removes the password condition, so the query returns the admin record. The application creates a session from that result. Parameter binding prevents the input from becoming SQL syntax.

## Likely questions

**1. What exactly is your vulnerability and variant?**

SQL injection; authentication bypass. The demonstrated outcome is obtaining an authenticated admin session without the correct password, rather than extracting a table with UNION.

**2. Which lines contain the flaw?**

The string construction and `connection.execute(query)` in `authenticate_vulnerable` in `app.py`. Point to the actual code, not only to the user interface.

**3. What exact payload did you use?**

Username `admin' -- `, including the trailing space; password `wrong-password`.

**4. Why does it work?**

The resulting query is `... WHERE username = 'admin' -- ' AND password = 'wrong-password'`. Everything after the comment marker on that line is ignored by SQLite. Only the admin username comparison remains effective.

**5. Is the admin password empty?**

No. Its dummy value is `AdminDemo42!`. The SQL password condition is removed by the comment, so that value is never checked in the exploit query.

**6. What is your implemented mitigation?**

Use `WHERE username = ? AND password = ?`, followed by `execute(query, (username, password))`. The values are bound separately from the SQL template.

**7. Why does the exact same payload fail after the fix?**

It is interpreted as a literal username, including the quote and hyphens. No account has that username. The password condition remains part of the statement.

**8. Are placeholders surrounded by quotes?**

No. Write `username = ?`, not `username = '?'`. The database driver handles value binding. String formatting, f-strings, and Python's `%` interpolation are not parameter binding.

**9. Why use a tuple as the second argument to execute?**

The query has two placeholders, and the tuple supplies the two values in order. For one placeholder, a one-element tuple needs a trailing comma: `(username,)`.

**10. Does hiding SQL errors fix injection?**

No. It reduces information leakage. The vulnerable query could still authenticate an attacker without displaying any SQL error.

**11. Does least privilege prevent this login bypass?**

No. The vulnerable login already needs to read its users table. Limiting access reduces other damage but does not restore the missing password check. SQLite has no separate database-account privilege model; OS file permissions are relevant here.

**12. Why not just ban quotes or SQL keywords?**

Block-lists are incomplete and can reject legitimate data, such as a name containing an apostrophe. Binding handles those values safely. The test suite includes a real account named `o'connor` to verify this behavior.

**13. Where is allow-list validation useful?**

For an expected format or a dynamic SQL identifier such as a sort column. A placeholder binds a value, not a table or column name. Map identifiers to a fixed list chosen by the application.

**14. Is the parameterized version completely production-ready?**

No. It fixes the demonstrated SQL injection. This focused lab keeps public dummy passwords in plaintext. A production login should parameterize the username lookup and verify a slow, salted password hash in application code, as well as implement other authentication protections.

**15. Would hashing passwords alone fix this attack?**

No. Hashing protects stored passwords; it does not make concatenated SQL safe. In a query where injected SQL removes a password predicate, the predicate's implementation is irrelevant.

**16. How do you know an old session did not cause apparent success?**

Each login POST clears that version's previous session before checking credentials. The vulnerable and parameterized implementations have separate session keys. An unauthenticated request to the dashboard redirects to login.

**17. Does parameter binding prevent all authorization errors?**

No. It protects the SQL structure for bound values. The application must still decide what authenticated users are allowed to access.

**18. Why use generic errors, HTML escaping, and a local-only server?**

Generic errors avoid revealing database details. Template escaping prevents displayed input from introducing an unrelated reflected XSS flaw. Loopback binding keeps the intentionally vulnerable lab on the machine used for the assignment. These do not replace parameter binding.

## Short theory paragraph for the submission

Parameterized queries are implemented to keep data values separate from SQL syntax. Other options include allow-list validation for expected formats and dynamic identifiers, least-privilege database or operating-system access to limit the effect of exploitation, and generic error handling to avoid revealing query or schema details. These measures complement parameter binding: validation and restricted privileges do not repair a query constructed by concatenating untrusted input, and hiding errors does not prevent a successful injection.

## Sources

- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Python sqlite3 parameter binding](https://docs.python.org/3/library/sqlite3.html#sqlite3-placeholders)
- [SQLite comments](https://www.sqlite.org/lang_comment.html)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

