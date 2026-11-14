# Herit Desai's demo and viva notes

Herit Desai · IIT2024054 · Reflected XSS

Start the app before recording. Keep the browser and the Express and React source files open. The outline is designed for a 2–3 minute segment in Herit's own voice. [Run instructions](../README.md#run-locally)

| Time | What to show | What to explain |
| --- | --- | --- |
| 0:00–0:25 | Lab home page and an ordinary search | Introduce your assigned variant. Point to the query in the URL and the result on the page. |
| 0:25–0:55 | The JSON request in the Network panel | Express reads the input from the current request. The response carries the string as JSON data. |
| 0:55–1:35 | The markup example and the result in the Elements panel | Explain that the displayed angle brackets are part of a text node. An unsafe application can let untrusted request data change how the browser parses the page. |
| 1:35–2:05 | The React result element and the Express response headers | Point to the JSX text child as the mitigation. Explain how the JSON content type and CSP provide additional protection. |
| 2:05–2:35 | Clear the search and summarize other mitigations | Connect the empty result to the current request. Describe when to use a sanitizer for rich text or context-specific encoding for server templates. |

## Viva questions

**Why is the input described as reflected?** The response depends on data in the current request. The demonstration keeps no comment store or other database.

**Where is the trust boundary?** The query begins as untrusted browser input, remains a string through the JSON response, and reaches a display-only React text child.

**Does putting input in JSON solve XSS by itself?** The JSON response carries data. The page must still use a safe rendering context when it consumes the response.

**What would a vulnerable search page get wrong?** It would let the browser interpret user-controlled text as part of the page's instructions. The reader's browser would then use the application's origin when running any active content.

**Can React render untrusted content safely in every context?** The protection here comes from using a normal text child. A feature that intentionally renders rich HTML needs a sanitizer, and links require appropriate URL validation.

**What is the difference between encoding and sanitizing?** Encoding preserves a string for display in a specific syntax. Sanitizing keeps selected markup and removes disallowed parts before displaying rich content.

**What does CSP add?** It sets browser rules for scripts and resources. This app uses a fixed same-origin policy alongside text rendering.

**How did you verify the mitigation?** Ordinary searches still work. The markup example displays all its characters, and the output has zero element children. Clearing the query removes the result.

The recorded segment should distinguish mitigation evidence from the assignment's exploit requirement. The module explains the vulnerable path conceptually and supplies a running mitigation demo.
