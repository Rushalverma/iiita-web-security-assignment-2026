# Demo video script

Rushal Verma · IIT2024045 · Simulated bypass and live mitigation

Start the app. Open the browser, `server/database.js`, and `server/app.js`. Begin signed out. The script takes about 2–3 minutes with the on-screen actions. [Run instructions](../README.md#run-locally)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:20 | Show the page and your name and roll number in the footer. | “Hi, I’m Rushal Verma, IIT2024045. My topic is SQL injection authentication bypass. First I’ll explain what counts as a bypass, then I’ll show how this login prevents it.” |
| 0:20–0:55 | Select **Show simulated admin access**. Point to **Password verification** and **Access in this scenario**, then close the simulation. | “An authentication bypass means getting signed-in access without proving valid credentials. Imagine a vulnerable login grants access when its query returns an administrator row, even though the password was never verified. In this simulation you can see that incorrect result. The panel uses fictional data, so my real login is still signed out.” |
| 0:55–1:35 | Show `db.prepare` and `findUser.get(username)` in the user store, then point to the hash check. | “My app prepares the SQL with a question-mark placeholder and passes the username separately. SQLite uses it as data. The lookup identifies an account, and the app verifies the password before Express creates a session.” |
| 1:35–2:05 | Sign in as `o'connor` with a wrong password. Show the error. Open `/api/account` on the same server in another tab and show its sign-in error. | “This is a normal failed login. The apostrophe is part of a real demo username. With the wrong password, I get a rejection and the protected account endpoint stays inaccessible.” |
| 2:05–2:40 | Return to the login tab. Use the same username with its correct demo password, show the dashboard, then sign out. | “The correct password opens the session for the same user. That shows the protection keeps ordinary logins working. Parameter binding keeps the SQL fixed. Input validation, limited privileges, and generic errors provide additional layers.” |

The simulated scene illustrates the bypass outcome. The live sequence checks that invalid credentials leave the protected endpoint inaccessible and valid credentials open it. Evidence of a working exploit remains outstanding. [User store](../server/database.js) · [Express routes](../server/app.js)

