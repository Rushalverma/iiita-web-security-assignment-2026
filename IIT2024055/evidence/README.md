# Evidence gallery

Screenshots and text logs demonstrating the exploit and its mitigation.

## Files

| File | Description |
| --- | --- |
| [exploit_evidence.txt](exploit_evidence.txt) | Raw in-band stdout captured from the vulnerable endpoint when the exploit payload was submitted |
| [mitigation_evidence.txt](mitigation_evidence.txt) | Response showing the same payload blocked by the mitigated endpoint |
| [summary_report.md](summary_report.md) | Markdown summary covering exploitation, root cause, and mitigation result |

## How to regenerate

With the Flask server running, execute from the project root:

```sh
python verify_exploit.py
```

This tests both endpoints and overwrites the evidence files with fresh results from your machine.
