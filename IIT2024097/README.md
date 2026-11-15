# CSRF - GET-based forged action (display-name change)

Course: Cyber Security (IT-30001), IIIT Allahabad - Web Server Security assignment

## Ownership declaration (Table 3)
| Category | Variant | Member |
|---|---|---|
| CSRF | GET-based forged action | **Bhavya Panara (IIT2024097)** |

**Repository status:** The Flask implementation, validation notes, and screenshots are present. [Group ownership and project status](../README.md#group-ownership-and-project-status)

## Setup
```bash
pip install -r requirements.txt
# Terminal 1 - victim app (vulnerable)
MODE=vulnerable python app.py          # http://localhost:5000
# Terminal 2 - attacker site (different SITE: 127.0.0.1, not localhost)
cd attacker && python -m http.server 6000 --bind 127.0.0.1
```
Windows PowerShell: `$env:MODE="vulnerable"; python app.py`

> Use `localhost:5000` for the victim and `127.0.0.1:6000` for the attacker. Ports do not
> make a different *site*, so `localhost:6000` would be same-site and defeat the demo.

## (a) Vulnerable implementation
`app.py` -> `update()` in `MODE=vulnerable`: display name is changed by `GET /profile/update?display_name=...`,
authorised only by the session cookie.

## (b) Working exploit
1. Open `http://localhost:5000`, log in as `alice / alice123`.
2. In the same browser open `http://127.0.0.1:6000/index.html` and click **Claim my prize**
   (or open `auto.html` for a no-click version).
3. Back on the app, the name is now `HACKED_BY_CSRF`; the audit log shows a GET with Referer `127.0.0.1:6000`.

Payload: `http://localhost:5000/profile/update?display_name=HACKED_BY_CSRF`

## (c) Root cause
A state-changing action is exposed on GET and authenticated only by an ambient cookie that the browser
attaches automatically, so the server cannot tell whether the user actually intended the request.

## (d) Mitigation implemented
`MODE=secure python app.py`: (1) the endpoint is POST-only (GET -> 405, i.e. no state-changing GET),
(2) a per-session random synchronizer token is embedded in the form and verified with
`secrets.compare_digest`; missing/wrong token -> 403. Re-run the same forged link: it fails (405).
Take a screenshot of the blocked attempt.

## (e) Other mitigations (theory)
- **Anti-CSRF (synchronizer) tokens:** an unguessable per-session value must accompany each state-changing
  request; the attacker's page cannot read it (same-origin policy), so forged requests are rejected.
- **SameSite cookies:** `Strict`/`Lax` stop the browser attaching the session cookie to cross-site requests
  (Lax still allows top-level GET navigation, which is why GET must never change state).
- **Re-authentication:** asking for the password / OTP before sensitive actions proves intent.
- **Avoid state-changing GET:** GET must be safe/idempotent; use POST/PUT/DELETE for changes.
