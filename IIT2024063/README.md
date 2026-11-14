# Stored XSS – Exploitation and Mitigation Demo

Individual part of the *Web Server Security – Exploitation and Mitigation of Four Vulnerability Categories* assignment.
**Category:** Cross-Site Scripting (XSS) **Variant:** Stored XSS

> ⚠️ This application is **intentionally vulnerable**. It binds to `127.0.0.1` only. Never deploy it or expose it to a network.

## 1. Project overview

A Feedback Guestbook (Node.js + Express + MySQL). Visitors post comments, which are stored in MySQL and shown to everyone. The same app, same database, and same stored comments can be viewed in two modes, switched with a link at the top of the page:

| Mode | Behaviour |
|---|---|
| **Vulnerable Mode** (red banner) | Stored comments are written into the page as raw HTML → stored scripts execute. |
| **Secure Mode** (green banner) | Stored comments are context-aware output-encoded → stored scripts display as harmless text. |

## 2. What is Stored XSS?

Stored (persistent) XSS happens when an attacker's input containing HTML/JavaScript is saved on the server (database, file, etc.) and later sent to other users' browsers as part of a page *without being encoded*. The browser cannot distinguish the attacker's script from the site's own markup, so it runs with the site's origin and privileges, every time the page is viewed. (Typical real-world impact: session/token theft, unauthorised actions, defacement – this demo only uses a harmless `alert`.)

## 3. Technologies

HTML, CSS, JavaScript, Node.js, Express.js, MySQL (`mysql2` driver, parameterized queries), `dotenv`. Dev-only: `jsdom` for the automated test script.

## 4. Features

- Comment form (name + comment), stored in MySQL with a proper schema and parameterized SQL.
- Stored comments listed newest first (latest 100).
- Clearly distinguished Vulnerable / Secure modes with a one-click switch (the chosen mode is kept after posting).
- Feedback messages (saved / validation error / database error), responsive layout.
- Input validation limits **only length/emptiness** – HTML is never stripped or rejected, so the fix is purely output encoding.
- Least-privilege DB user (`SELECT`, `INSERT` only), localhost-only binding, no secrets in the repo.

## 5. Project structure

```
stored-xss/
├── public/
│   ├── index.html              # page template ({{PLACEHOLDERS}} filled by the server)
│   ├── style.css
│   └── script.js               # marks the active mode link
├── routes/comments.js          # GET / (list) and POST /comments (insert, parameterized)
├── views/
│   ├── vulnerableRenderer.js   # <- the ONLY file containing the flaw
│   └── secureRenderer.js       # <- the mitigation (context-aware output encoding)
├── config/db.js                # MySQL pool (credentials from .env)
├── database/schema.sql         # database, table, least-privilege user
├── tests/run-tests.js          # automated verification (npm test)
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 6. Prerequisites

- Node.js 18+ (tested with 22) and npm
- MySQL 8 server running locally (tested with MySQL 8.0.46) and the `mysql` command-line client

## 7. Installation

```bash
git clone <your-repo-url> stored-xss
cd stored-xss
npm install
```

## 8. MySQL database setup

1. Open `database/schema.sql` and change the password `change_me` in the `CREATE USER` line to a password of your choice.
2. Create the database, table and app user (as a MySQL admin user):

```bash
mysql -u root -p < database/schema.sql
```

(On Linux with socket authentication for root, use `sudo mysql < database/schema.sql`.)

## 9. Environment configuration

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

Edit `.env` and set `DB_PASSWORD` to the **same password** you put in `schema.sql`. Other defaults work as-is (`DB_USER=xss_app`, `DB_NAME=stored_xss_demo`, `PORT=3000`). `.env` is git-ignored.

## 10. Run

```bash
npm start
```

Open <http://localhost:3000>.

## 11. Demonstrate Vulnerable Mode

1. Open <http://localhost:3000/?mode=vulnerable> (red **Vulnerable Mode** banner).
2. Post a normal comment first (e.g. Name `Alice`, Comment `Hello!`) – it appears normally.
3. Post the exploit. **Exact payload** (paste into the *Comment* field, any name):

```html
<script>alert('Stored XSS Demonstration')</script>
```

4. After submitting, the page reloads and an alert box **"Stored XSS Demonstration"** appears → the payload executed.
5. Click OK, then press **F5 / refresh** – the alert appears **again**, because the payload is stored in MySQL and re-served every time. Revisiting the URL later or from another tab gives the same result.
6. (Optional) Right-click → *View Page Source*: the comment appears as a live `<script>` element in the HTML.

## 12. Demonstrate Secure Mode

1. Click **Secure Mode** (green banner) or open <http://localhost:3000/?mode=secure>.
2. The **already stored** malicious comment is now displayed as plain text – `<script>alert('Stored XSS Demonstration')</script>` – and **no alert appears**, even after refreshing.
3. Post the same payload again in Secure Mode: still displayed as text, no alert.
4. Normal comments (`Alice – Hello!`) display normally. Page source shows the encoded output: `&lt;script&gt;alert(&#x27;Stored XSS Demonstration&#x27;)&lt;/script&gt;`.
5. Switch back to Vulnerable Mode to show the same database row executing again – proving the data was never altered or deleted; only the output handling differs.

## 13. Vulnerable code and root cause (assignment items a–c)

**(a) Vulnerable code** – `views/vulnerableRenderer.js`, function `renderCommentsVulnerable`:

```js
<header><strong title="${c.author}">${c.author}</strong> ...
<div class="body">${c.message}</div>
```

`c.author` and `c.message` come straight from MySQL (originally from the user) and are concatenated into the HTML string unchanged. The server sends this string to the browser as the page.

**(b) Working exploit** – the payload in section 11, submitted through the comment form (`POST /comments`, fields `author`, `message`, `mode`). Equivalent request:

```bash
curl -d "author=Mallory" --data-urlencode "message=<script>alert('Stored XSS Demonstration')</script>" -d "mode=vulnerable" http://localhost:3000/comments
```

Resulting HTML sent in Vulnerable Mode: `<div class="body"><script>alert('Stored XSS Demonstration')</script></div>`.

**(c) Root cause** – Untrusted data is placed into an HTML context without output encoding, so the browser's HTML parser treats data as code (markup/script). Storing the input is not the bug; the failure is trusting stored data when generating output.

## 14. Implemented mitigation (assignment item d): context-aware output encoding

Implemented in `views/secureRenderer.js`. Each untrusted value is encoded for the context where it is inserted, at output time:

| Context | Encoder | Characters converted |
|---|---|---|
| HTML element text (`<div>…</div>`) | `encodeHtmlText` | `& < > " '` → HTML entities |
| Quoted attribute value (`title="…"`) | `encodeHtmlAttr` | `& < > " '` and backtick → entities |

Result: `<` becomes `&lt;`, so the browser shows `<script>…` as characters instead of creating a script element. The identical payload that executed in Vulnerable Mode is displayed as text in Secure Mode, using the same table and rows. Normal comments are unaffected (and `white-space: pre-wrap` keeps line breaks). Nothing is deleted, sanitised at input, or rejected.

Note: this encoder covers HTML text and quoted attributes, the only contexts this app uses. Other contexts (JavaScript strings, URLs, CSS) need their own encoders.

## 15. Other mitigations – theory only (assignment item e)

- **Context-aware output encoding** – (implemented above) encode data according to where it is placed: HTML body, attribute, JavaScript, URL and CSS each need different escaping rules.
- **Framework auto-escaping** – template engines/frameworks (React JSX, Angular, Vue, Jinja2, Handlebars `{{ }}`) encode values by default, so the safe path is the default; vulnerabilities then arise mainly from explicit opt-outs such as `dangerouslySetInnerHTML` or `v-html`.
- **Sanitiser for rich HTML** – when users must submit some HTML (e.g. bold text), a well-maintained allow-list sanitiser such as DOMPurify removes scripts, event handlers and dangerous URLs while keeping safe tags. Preferable to hand-written regex filtering, which is routinely bypassed.
- **Content Security Policy (CSP)** – an HTTP response header restricting which scripts may run (e.g. `script-src 'self'`, no inline scripts). It is defence-in-depth: even if injection occurs, inline/injected scripts are blocked by the browser.
- **HttpOnly cookies** – marking session cookies `HttpOnly` stops JavaScript from reading them, limiting session theft via XSS. It does not stop XSS itself or other actions the script can perform.
- **Safe DOM sinks** – in client-side code, use `textContent` / `innerText` / `setAttribute` rather than `innerHTML`, `document.write` or `eval`, so data is never parsed as markup.

## 16. Testing results

Automated by `npm test` (`tests/run-tests.js`) against the **real MySQL 8.0.46** database and the real running Express app (HTTP requests to the live server). Each page returned by the server was loaded into jsdom with script execution enabled and `window.alert` instrumented, to detect whether stored scripts ran. Results of the actual run (table cleared beforehand):

| # | Test | Result |
|---|---|---|
| 1 | Normal comments can be submitted | ✅ PASS (302 → `msg=posted`) |
| 2 | Multiple comments stored correctly | ✅ PASS (`Alice,Bob,Carol` found in MySQL) |
| 3 | Payload executes in Vulnerable Mode | ✅ PASS (alert `Stored XSS Demonstration` fired) |
| 4 | Payload executes again after refresh | ✅ PASS (fired again on a fresh page load) |
| 5 | Same payload does not execute in Secure Mode | ✅ PASS (0 alerts, no `<script>` in comments, shown as literal text) |
| 6 | Existing malicious comments harmless in Secure Mode | ✅ PASS (text-context payload and an attribute-breakout payload: 0 alerts, 0 injected elements; the same rows execute in Vulnerable Mode) |
| 7 | Normal comments work in Secure Mode | ✅ PASS (including `& < ' "` and line breaks) |
| 8 | Comments persist after restarting the application | ✅ PASS (app process stopped and restarted; all 5 rows still present and behave identically) |

`8/8 checks passed`. Raw HTML captured with `curl`:

- Vulnerable: `<div class="body"><script>alert('Stored XSS Demonstration')</script></div>`
- Secure: `<div class="body">&lt;script&gt;alert(&#x27;Stored XSS Demonstration&#x27;)&lt;/script&gt;</div>`

**Limitation:** the automated tests use jsdom, not a real browser (none could be installed in the test environment). jsdom runs inline `<script>` elements, but it is not a substitute for the manual browser demonstration in sections 11–12, which should be performed and screenshotted in Chrome/Firefox.

To re-run the tests: clear the table first (the app user cannot delete, so use an admin account), then run:

```bash
mysql -u root -p -e "TRUNCATE stored_xss_demo.comments;"
npm test
```

The tests add 5 comments (including malicious ones). Clear the table again afterwards for a clean demo.

## 17. Security notes

- All SQL uses parameterized queries. Other vulnerability classes (SQL injection, CSRF, etc.) and their hardening are out of scope – this project isolates a single vulnerability.
- Feedback messages are fixed server-side strings and never reflect user input.
- Real credentials live only in `.env` (git-ignored); `.env.example` contains placeholders.
