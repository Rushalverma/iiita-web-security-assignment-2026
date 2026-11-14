# Validation - CSRF (GET-based forged action)

Fill the "Actual" column while testing and attach the matching screenshot from `evidence/`.

| # | Mode | Test | Expected | Actual | Evidence |
|---|---|---|---|---|---|
| 1 | vulnerable | Log in as alice, view profile | Welcome, Alice | | 01-normal-login.png |
| 2 | vulnerable | Open attacker page while logged in | Page shows forged link | | 02-attacker-page.png |
| 3 | vulnerable | Click forged link | Name becomes HACKED_BY_CSRF; audit log shows GET with attacker Referer | | 03-csrf-success.png |
| 4 | secure | Click same forged link | 405 Method Not Allowed; name unchanged | | 04-same-link-blocked.png |
| 5 | secure | Forged POST without token (optional, e.g. curl) | 403 Forbidden | | |
| 6 | secure | Change name with the real form | Success; audit log shows POST | | 05-valid-change-after-fix.png |
| 7 | secure | Not logged in, open update URL | Redirect to login | | |

## Notes
- Victim host: `localhost:5000`; attacker host: `127.0.0.1:8000` (different sites).
- Chrome/Edge default to SameSite=Lax: link click / redirect works, hidden `<img>` does not.

## Optional forged-POST check (test 5)
```bash
curl -i -X POST http://localhost:5000/profile/update -d "display_name=X"
```
(No session cookie -> redirected to login; with a valid cookie but no token -> 403.)
