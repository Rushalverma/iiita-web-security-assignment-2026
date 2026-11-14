# Stored Cross-Site Scripting (Stored XSS)

| **Member** | **Roll number** | **Vulnerability category** | **Variant** |
|---|---|---|---|
| Surbhi Kumari Sah | IIT2024063 | Cross-Site Scripting (XSS) | Stored XSS |

## Run locally

### Prerequisites

- Node.js and npm
- MySQL Server 8.0 or later
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Rushalverma/iiita-web-security-assignment-2026.git
cd iiita-web-security-assignment-2026/IIT2024063
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the database

Make sure your MySQL server is running.

Import the database schema:

```bash
mysql -u root -p < database/schema.sql
```

The schema creates the application database, database user, and comments table.

### 4. Configure environment variables

Copy `.env.example` to `.env` and update the database credentials according to your MySQL configuration.

Example configuration:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=xss_app
DB_PASSWORD=your_database_password
DB_NAME=stored_xss_demo
PORT=3000
```

Do not commit your `.env` file or share database credentials.

### 5. Start the application

```bash
npm start
```

Open the application at:

**http://localhost:3000**

No preconfigured fictional accounts are required. Users can submit comments through the application.

## Vulnerability and root cause

Stored Cross-Site Scripting (Stored XSS) occurs when an application stores untrusted user input and later displays it in a webpage without properly handling it.

In this project, users can submit comments through a feedback application. The comments are stored in a MySQL database and displayed when the application loads.

### Vulnerable implementation

- **Source file:** `views/vulnerableRenderer.js`
- **Related route:** `routes/comments.js`

The vulnerable renderer inserts stored comment content into the HTML without appropriate output encoding.

An attacker can submit a malicious payload such as:

```html
<script>alert('Stored XSS Demonstration')</script>
```

The payload is stored in the database. Whenever the comments are displayed in Vulnerable Mode, the browser interprets and executes the injected JavaScript.

This can affect users who subsequently visit the application and view the malicious comment.

### Root cause

The root cause is the unsafe handling of untrusted user input during HTML rendering.

Although the application stores comments in the database, storing the input does not make it safe. The application must properly encode untrusted data when inserting it into an HTML page.

## Implemented mitigation

**Mitigation: Context-aware output encoding**

- **Source file:** `views/secureRenderer.js`

The secure implementation applies context-aware output encoding before inserting user-generated content into the HTML.

It uses separate encoding functions for:

- HTML text content.
- Quoted HTML attribute values.

Special characters are converted into their corresponding HTML entities so that user input is displayed as text rather than interpreted as executable HTML or JavaScript.

### Verification of mitigation

The same malicious payload is submitted in Vulnerable Mode and then viewed in Secure Mode.

**Before mitigation:**
- The malicious JavaScript executes.
- An alert box appears when the comment is rendered.
- The payload executes again when the page is refreshed.

**After mitigation:**
- The malicious payload is displayed as ordinary text.
- The browser does not execute the injected JavaScript.
- Previously stored malicious comments are also rendered safely.

Both modes use the same stored comments, allowing the vulnerable and secure behavior to be compared.

## Demonstration and evidence

The demonstration covers the following scenarios:

| **Test case** | **Expected behavior** |
|---|---|
| Normal comment submission | Comment is successfully stored and displayed. |
| Multiple comments | Multiple comments are displayed correctly. |
| Stored XSS in Vulnerable Mode | JavaScript payload executes. |
| Page refresh | Previously stored malicious payload executes again in Vulnerable Mode. |
| Same payload in Secure Mode | Payload is displayed as text without execution. |
| Previously stored malicious comment in Secure Mode | Malicious content remains harmless. |
| Normal comment in Secure Mode | Ordinary comments continue to work correctly. |
| Server restart | Previously stored comments remain available. |

Add screenshots of the vulnerable execution, repeated execution after refresh, and secure-mode output to the `evidence/` folder.

## Other mitigations

The following are alternative or additional measures that can help prevent or reduce the impact of XSS vulnerabilities.

### 1. Framework auto-escaping

Modern web frameworks automatically escape dynamic values in many HTML rendering contexts. This helps prevent user input from being interpreted as executable markup.

### 2. HTML sanitization

When an application intentionally allows users to submit rich HTML content, an HTML sanitizer can remove dangerous elements, attributes, and scripts while preserving permitted formatting.

### 3. Content Security Policy (CSP)

CSP is a browser security mechanism that restricts which scripts and other resources can execute or load. It provides an additional layer of protection if an injection vulnerability exists.

### 4. HttpOnly cookies

The HttpOnly cookie attribute prevents JavaScript from directly accessing cookies through browser scripting APIs. It helps reduce the risk of cookie theft through XSS but does not prevent XSS itself.

### 5. Safe DOM sinks

Using safe DOM APIs such as `textContent` instead of unsafe HTML insertion methods prevents user-provided strings from being interpreted as HTML.

### Relationship with the implemented mitigation

Context-aware output encoding directly addresses the root cause in this project by ensuring that untrusted input is treated as data rather than executable content.

The other measures provide additional protection or address specific rendering and browser-security risks.

## Verification

Run the automated test suite from the project directory:

```bash
node tests/run-tests.js
```

The test suite covers normal comment handling, multiple comments, stored XSS execution in vulnerable rendering, repeated execution, secure rendering, special-character handling, and comment persistence.

The project was initially tested using MySQL 8.0.46 and the automated test suite. Real-browser testing was also performed manually to demonstrate the vulnerable and secure modes.
