# Verification Record

**Member:** Ansh Kumar · **Roll number:** IIT2024055

## How to run

With the Flask server running (`python app.py`), execute:

```sh
python verify_exploit.py
```

## Expected results

| Test | Endpoint | Payload | Expected |
| --- | --- | --- | --- |
| Exploit succeeds | `/api/ping/vulnerable` | `127.0.0.1 ; whoami` | HTTP 200, output contains OS username |
| Exploit blocked | `/api/ping/mitigated` | `127.0.0.1 ; whoami` | HTTP 400, status `blocked` |
| Benign ping works | `/api/ping/mitigated` | `127.0.0.1` | HTTP 200, normal ping output |

## Evidence output

The script saves results to:
- `evidence/exploit_evidence.txt` — captured in-band output proving command execution
- `evidence/mitigation_evidence.txt` — proof that the same payload is blocked
- `evidence/summary_report.md` — markdown summary of all results
