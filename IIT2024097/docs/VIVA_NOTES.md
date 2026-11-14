# Viva Notes - CSRF (GET-based forged action)
Owner: Panara Bhavya (IIT2024097)

## One-line summary
A logged-in user's display name is changed by a forged link because the app changes state on GET and trusts the session cookie alone.

## Key facts
- **Vulnerable code:** `app.py` -> `update()` in `MODE == "vulnerable"`.
- **Payload:** `http://localhost:5000/profile/update?display_name=HACKED_BY_CSRF`
- **Root cause:** state-changing GET + ambient cookie authentication (no proof of intent).
- **Fix implemented:** POST-only + per-session synchronizer token, checked with `secrets.compare_digest`.
- **Result after fix:** same link -> 405; forged POST without token -> 403.

## Likely questions
**Why does the attack work?** Browsers attach cookies automatically to requests to the target site, even when triggered from another site. The server only checks the cookie.

**Is CSRF stealing the session?** No. The attacker never sees the cookie; they make the victim's browser send a request.

**Why did the hidden `<img>` not work?** Chrome defaults to SameSite=Lax, which withholds cookies on cross-site subresource requests but allows top-level navigations (link click, redirect).

**Does switching to POST alone fix it?** No. An attacker can auto-submit a hidden POST form. The token is the real defence; POST only removes GET abuse.

**Why can't the attacker read the token?** Same-origin policy stops the attacker's page from reading responses from our origin.

**Why `compare_digest`?** Constant-time comparison avoids timing leaks.

**Why different hosts for victim and attacker?** `localhost` and `127.0.0.1` are different sites; ports do not change the site, so this simulates a real cross-site attack.

**Other mitigations?** SameSite cookies (Strict/Lax), re-authentication for sensitive actions, avoiding state-changing GET requests.

**How is CSRF different from XSS?** CSRF abuses the server's trust in the browser; XSS runs attacker script inside the trusted site. XSS can defeat CSRF tokens (script can read them).

**Why is the SameSite=Lax cookie in the code but the attack still works?** Lax permits top-level GET navigation, which is exactly the forged-link case; that is why GET must never change state.

## Be ready to
- Run both modes live and switch between them.
- Point to the exact vulnerable and fixed lines.
- Explain the audit log (method + Referer).
