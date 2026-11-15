# Reflected cross-site scripting

| Member | Roll number | Category | Variant |
| --- | --- | --- | --- |
| Herit Desai | IIT2024054 | Cross-Site Scripting (XSS) | Reflected XSS |

This search demo shows how an Express service can return user input as JSON and a React page can display it as plain text. It uses the current request and requires no database. The guide explains the vulnerable behavior conceptually. The runnable demo covers the mitigation, and the screenshots show its verified behavior.

## Run locally

From the group repository root, use Node.js 22.12 or newer and npm.

~~~sh
cd IIT2024054
npm ci
npm run build
npm start
~~~

Open [the lab on port 4175](http://127.0.0.1:4175). The Express process serves the built React page and the API on the same address. Stop it with Ctrl+C. If the port is occupied, set the PORT environment variable before starting and open the new port.

## Source and data flow

| Step | Behavior | Source |
| --- | --- | --- |
| Request | The search form puts the current term in the URL as parameter q. | [React page](src/main.jsx) |
| Response | Express checks that q is a single string of at most 240 UTF-16 code units and returns it in JSON. | [Express application](server/app.js) |
| Rendering | React passes the returned string to an ordinary text child in an output element. | [Result rendering](src/main.jsx) |

## Vulnerability and root cause

Reflected XSS can occur when a page takes input from the current request and includes it in a browser context that interprets it as active content. For example, a search page may place a query in its response, and an unsafe rendering step may let that query change the page structure. The root cause is crossing the boundary between untrusted data and browser instructions. In a stored XSS case, the input persists and is served in later requests. Here, opening the page without a query clears the result.

## Implemented mitigation

The React result uses the query string as JSX text. React creates a text node, which preserves angle brackets and ampersands for the reader while keeping the DOM structure fixed. The Express endpoint uses the JSON content type and sends X-Content-Type-Options. A restrictive Content Security Policy provides a second layer. The length and type limits define the search form's input contract. The text sink is the core XSS control for this case. [OWASP guidance on output encoding and safe sinks](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#output-encoding)

## Demonstration and evidence

1. Search for **campus library** and show the reflected result.
2. Select **Try a markup example**. The result displays the harmless string `<strong>Sample note</strong> & friends` literally.
3. In the browser's Elements panel, inspect the result beneath the output element. The visible tag characters are part of a text node.
4. Select **Clear search** to show that the result depends on the current URL.

| Evidence | What to look for |
| --- | --- |
| [Ordinary search](evidence/01-normal-search.png) | The form still reflects ordinary search terms. |
| [Markup rendered as text](evidence/02-markup-as-text.png) | The markup characters appear in the result. |

## Other mitigations

- **Context-specific output encoding** protects a text value when a server template writes it into HTML. Attributes, URLs, JavaScript, and CSS have different rules.
- **Safe DOM APIs** such as textContent on an ordinary display element are the direct DOM equivalent of using a React text child.
- **HTML sanitization** is useful when a feature intentionally supports rich text. Use a maintained sanitizer configured for the allowed markup.
- **Content Security Policy** limits which scripts and resources the browser can load or execute. Treat it as an additional layer alongside safe rendering.
- **HttpOnly cookies** prevent JavaScript from reading those cookies directly. They limit that particular impact if script execution occurs.

[OWASP Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) · [React DOM common components](https://react.dev/reference/react-dom/components/common)

## Verification

Run `npm test` from this folder to check the API response, text round trip, empty input, and input limits. The browser demonstration checks that the result contains text with zero element children and that clearing the search removes the result. GitHub Actions builds the frontend and runs the API checks for changes to this module. [Verification workflow](../.github/workflows/reflected-xss.yml)

[Group checklist](../docs/SUBMISSION_CHECKLIST.md)
