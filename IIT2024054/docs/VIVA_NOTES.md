# Reflected XSS viva notes

Herit Desai · IIT2024054

## Viva questions

**Why is the input described as reflected?** The response depends on data in the current request. The demonstration keeps no comment store or other database.

**Where is the trust boundary?** The query begins as untrusted browser input, remains a string through the JSON response, and reaches a display-only React text child.

**Does putting input in JSON solve XSS by itself?** The JSON response carries data. The page must still use a safe rendering context when it consumes the response.

**What would a vulnerable search page get wrong?** It would let the browser interpret user-controlled text as part of the page's instructions. The reader's browser would then use the application's origin when running any active content.

**Can React render untrusted content safely in every context?** The protection here comes from using a normal text child. A feature that intentionally renders rich HTML needs a sanitizer, and links require appropriate URL validation.

**What is the difference between encoding and sanitizing?** Encoding preserves a string for display in a specific syntax. Sanitizing keeps selected markup and removes disallowed parts before displaying rich content.

**What does CSP add?** It sets browser rules for scripts and resources. This app uses a fixed same-origin policy alongside text rendering.

**How did you verify the mitigation?** Ordinary searches still work. The markup example displays all its characters, and the output has zero element children. Clearing the query removes the result.
