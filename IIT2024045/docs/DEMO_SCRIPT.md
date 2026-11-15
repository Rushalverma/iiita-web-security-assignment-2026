# Three-minute demo video script

Rushal Verma · IIT2024045 · SQL injection authentication bypass

Start the app with `npm start`, open `http://127.0.0.1:5000`, and keep
`server/database.js` available in a second window. Begin signed out. Speak
slowly and pause briefly after each result.

| Time | What to do on screen | What to say |
| --- | --- | --- |
| 0:00–0:20 | Show the landing page, the title, and the footer containing your name and roll number. | “Hello, I’m Rushal Verma, roll number IIT2024045. My assigned web-security topic is SQL injection authentication bypass. This demo shows the vulnerable behavior first, followed by the secure fix.” |
| 0:20–0:45 | Point to the **Vulnerable mode** button and the payload hint. | “An authentication bypass means obtaining an authenticated account without proving the real password. This application includes a deliberately vulnerable mode for this local classroom demonstration. It must not be deployed publicly.” |
| 0:45–1:05 | Select **Vulnerable mode**. Enter username `admin' --` and password `anything`. Do not submit until the audience can see both values. | “I am using the payload admin, followed by a quote and two hyphens. The quote closes the username string, and the double hyphen starts a SQL comment. The password value is intentionally incorrect.” |
| 1:05–1:30 | Submit the form. Point to the displayed SQL, the administrator role, and the **AUTHENTICATION BYPASSED** banner. | “The generated query places the username directly into the SQL statement. The comment removes the password condition, so the database returns the administrator row. The application incorrectly treats that row as proof of authentication and creates a session.” |
| 1:30–1:45 | Refresh the page or open `/api/account` in another tab to show the authenticated account, then click **Sign out**. | “This is a real session in the local demo, not just a visual message. The protected account endpoint recognizes the session. I will now sign out before testing the mitigation.” |
| 1:45–2:05 | Select **Secure mode**, enter the exact same `admin' --` payload and `anything` password, then submit. | “Next I switch to secure mode and reuse the exact same attacker input. No payload has changed; only the server-side query implementation has changed.” |
| 2:05–2:25 | Show the error message and point to the secure `WHERE username = ?` explanation. | “The secure login treats the entire payload as a literal username. It does not change the SQL structure, so no account matches and the login is rejected. No authenticated session is created.” |
| 2:25–2:45 | Switch to the code window and show the prepared statement and `findUser.get(username)` in `server/database.js`. | “The primary mitigation is parameterized SQL. The question-mark placeholder fixes the query structure, while the username is supplied separately as data. The secure path then derives and compares the stored password hash.” |
| 2:45–3:00 | Return to the browser. Log in using `admin` and `AdminDemo42!`, show the normal dashboard, then sign out. | “Finally, I verify that the fix does not break legitimate users. The correct administrator credentials succeed, while the injected credentials fail. This demonstrates both the authentication bypass and its prevention. Thank you.” |

## Recording checklist

1. Run the application locally and keep the browser signed out before recording.
2. Make sure the payload is visible before clicking **Sign in**.
3. Pause after the vulnerable result so the SQL and bypass banner are readable.
4. Use the same payload again in secure mode; do not alter the username or password.
5. Show the code only after both browser results are visible.
6. End on a successful legitimate login, then sign out.

The vulnerable sequence demonstrates the bypass, and the secure sequence
demonstrates the mitigation. See the [user store](../server/database.js) and
[Express routes](../server/app.js).

