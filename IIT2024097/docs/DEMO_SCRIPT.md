# Demo Script - CSRF (GET-based forged action)
Presenter: Panara Bhavya (IIT2024097) | Target length: 2.5-3 min

## Setup before recording
- Terminal 1: `MODE=vulnerable python app.py` (PowerShell: `$env:MODE="vulnerable"; python app.py`)
- Terminal 2: `cd attacker && python -m http.server 8000 --bind 127.0.0.1`
- Tabs: `http://localhost:5000` (victim) and `http://127.0.0.1:8000/index.html` (attacker)
- Open `app.py` at the `update()` function. Browser zoom ~125%.

## Steps
| Time | Screen | Say |
|---|---|---|
| 0:00 | README ownership table | Name, roll no., variant: CSRF GET-based forged action (display-name change). |
| 0:15 | `app.py` vulnerable block | `/profile/update` changes state on GET; only the session cookie is checked; no token, no proof of intent. |
| 0:45 | Login as alice | Normal behaviour: display name is "Alice"; browser holds the session cookie. |
| 1:05 | Attacker page (127.0.0.1:8000) | Different origin. Hover link to show URL `...?display_name=HACKED_BY_CSRF`. Click. |
| 1:25 | Profile + audit log | Name changed without submitting the form. Log shows GET with attacker Referer. |
| 1:45 | - | Root cause: state change on GET + ambient cookie authentication. |
| 2:00 | Restart `MODE=secure`, secure code block | POST-only + synchronizer token verified with constant-time compare. |
| 2:15 | Click same forged link | 405 Method Not Allowed; name unchanged. Forged POST would give 403. |
| 2:30 | Real form | Legitimate change still works (token included). |
| 2:40 | - | Theory: SameSite cookies, re-authentication, avoid state-changing GET. |

## Payload
`http://localhost:5000/profile/update?display_name=HACKED_BY_CSRF`
