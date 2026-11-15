# SQL injection authentication bypass video narration

Rushal Verma · IIT2024045

## Narration for your 2 minute 40 second recording

Use footage from your edited app for the assignment. Keep both the login page and the secure query in your editor ready to show. Begin signed out so a previous session cannot be mistaken for a new one.

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:20 | Show the login page with your name and roll number. | “Hi, I’m Rushal Verma, roll number IIT2024045. My variant is SQL injection authentication bypass. The React frontend sends the login request to Express, and SQLite looks up the account.” |
| 0:20–0:50 | Show the login form and point to the vulnerable mode label. | “The flaw is that untrusted input can become part of the SQL statement. If that changes what the database checks, the query can return an account row without verifying the password. The application makes the wrong decision when it treats that row as proof of identity.” |
| 0:50–1:15 | Cut to your recorded dashboard outcome. Frame the account identity and role. | “Here, the dashboard shows an administrator account even though the administrator password was never verified. The protected account view is the evidence that the login granted access without valid credentials.” |
| 1:15–1:55 | Show the secure lookup and password verification in the [user store](../server/database.js). | “In secure mode, the lookup uses a prepared statement. The username is supplied separately as a bound value, so SQLite keeps the query structure fixed. The application checks the submitted password against the account’s stored hash. Express creates the session only after authentication succeeds.” |
| 1:55–2:20 | Show the secure mode rejection. If you have a recording of a normal secure sign-in, show it next. | “In secure mode, the rejected attempt leaves the dashboard inaccessible. With valid credentials, the account can still sign in normally. That’s what I expect from a fix that preserves ordinary login behavior.” |
| 2:20–2:40 | Return to the prepared query and summarize. | “Parameter binding is the main SQL injection defense here. Validating input, limiting database access, and using generic error messages add other protections. The important difference is whether the server has valid credentials before it grants access.” |

Only describe a successful bypass or a normal sign-in if your footage shows that result. For the bypass, verify that the server granted access to protected account data. A screen that merely says “success” is weaker evidence.

## Voice-over for the supplied 45.6 second reference clip

This version follows the visible transitions in `sqli-auth-bypass-demo.mp4`. Introduce it as a reference recording if you show it.

| Approximate time | On screen | Say |
| --- | --- | --- |
| 0:00–0:07 | Vulnerable login page | “This recording compares two login implementations using the same demo account.” |
| 0:07–0:18 | Vulnerable login before the result | “In the vulnerable version, untrusted login input can change what the database checks. A returned account row can then be mistaken for proof of identity.” |
| 0:18–0:27 | Administrator dashboard | “The dashboard shows administrator access without a verified password. That’s the authentication bypass.” |
| 0:27–0:36 | Secure login page | “The secure version keeps the SQL statement fixed and passes the input separately as data.” |
| 0:36–0:45.6 | Sign-in rejected | “The secure login rejects the attempt. An authenticated session requires valid credentials.” |
