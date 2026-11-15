# Demo video script

Rushal Verma · IIT2024045 · SQL injection authentication bypass

Start the app. Open the browser, `server/database.js`, and `server/app.js`. Begin signed out. The script takes about 2–3 minutes with the on-screen actions. [Run instructions](../README.md#run-locally)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:25 | Show the login page and the name and roll number in the footer. | “Hi, I’m Rushal Verma, IIT2024045. My assigned variant is SQL injection authentication bypass. I’ll explain the vulnerability and show its mitigation using a React login page, an Express API, and SQLite.” |
| 0:25–0:50 | Point to the explanation panel. | “A login is vulnerable when it puts user input directly into SQL source. The database can then interpret the input as part of the query. If the application trusts the resulting row as proof of identity, it can make an incorrect login decision.” |
| 0:50–1:10 | Enter `o'connor` with a wrong password. Show the error. | “I’m signing in as the student account whose name includes an apostrophe. With the wrong password, the server rejects the login. No new session is created.” |
| 1:10–1:45 | Show `db.prepare`, `findUser.get(username)`, and the password check in the user store. | “Here, the SQL is prepared using a question-mark placeholder. The lookup sends the username as a separate value. SQLite treats the apostrophe as part of the name. Node then checks the password against the salted hash stored for the account. The Express route creates a session only if that check succeeds.” |
| 1:45–2:15 | Enter the same username with its correct demo password. Show the student dashboard, refresh, then sign out. | “With the correct password, the same username opens the student dashboard. Refreshing keeps the session. Signing out destroys the session and returns me to the login form.” |
| 2:15–2:40 | Return to the query and session code. | “Parameterized queries keep the SQL structure fixed. Input validation, limited database privileges, and generic error messages are additional layers. This walkthrough verifies the mitigation using a legitimate value and two different password outcomes.” |

The wrong-password clip verifies login rejection. The apostrophe in the student's username is a legitimate data value. The recording covers the mitigation and a conceptual explanation of the vulnerability. [User store](../server/database.js) · [Express routes](../server/app.js)

