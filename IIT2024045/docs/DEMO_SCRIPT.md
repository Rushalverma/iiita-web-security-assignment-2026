# Rushal's SQL injection demonstration

Assigned owner: **Rushal Verma - IIT2024045**.

Target duration: **2 minutes 30 seconds to 3 minutes**. Rehearse and explain the concepts in your own words. This is a narration guide, not a recording of your voice. Read the code and complete the walkthrough yourself before recording.

Before recording, start the application and open the source in your editor. Make the text readable and use a fresh browser session for the walkthrough. [Application source](../app.py)

| Time | Screen / action | Suggested narration |
| --- | --- | --- |
| 0:00-0:15 | Lab overview showing name and roll number | "I am Rushal Verma, IIT2024045. My category is SQL injection, and my variant is authentication bypass. I will show a vulnerable login and the same attack blocked by parameterized queries." |
| 0:15-0:35 | Open `authenticate_vulnerable` in `app.py` | "The login selects a user whose username and password match. This version puts both inputs directly into the SQL string. That allows input to change the SQL syntax." |
| 0:35-0:50 | Vulnerable login: `admin` / `wrong-password` | "First I enter an ordinary username with a wrong password. Login is rejected, as expected." |
| 0:50-1:15 | Vulnerable login: `admin' -- ` / `wrong-password`; show query inspector | "Now the username includes a quote followed by two hyphens and a space. The quote ends the username value, and the hyphens comment out the remaining password condition. The query returns the admin row even though this password is wrong." |
| 1:15-1:25 | Click Open account dashboard | "The application creates an admin session. This protected page confirms the bypass affected authentication, rather than only displaying a success message." |
| 1:25-1:50 | Open `authenticate_parameterized` in `app.py` | "My implemented mitigation is parameterized queries. The statement uses question-mark placeholders, and I pass the input values separately to execute. Input is treated as data rather than SQL syntax." |
| 1:50-2:10 | Parameterized login: identical attack values | "I repeat exactly the same payload and wrong password. Login is rejected. The query template stays unchanged, and the entire injected string is treated as a literal username." |
| 2:10-2:20 | Parameterized login: `admin` / `AdminDemo42!` | "A normal login with the correct password still works, so the fix preserves the intended behavior." |
| 2:20-2:55 | Explain alternative mitigations, using notes if needed | "Allow-list validation restricts expected formats and helps with identifiers that cannot be bound as values. Least privilege limits damage, but does not repair the query. Generic errors reduce information leakage. Parameter binding is my main fix. These dummy passwords are plaintext only to isolate the SQL injection lesson; production authentication also needs proper password hashing." |

Finish on the blocked-attempt screenshot or code comparison. Record your own voice; do not submit the silent reference capture as the final narrated group video. Combine your segment with the other members' segments according to the course instructions.

