# Web Server Security Assignment

Cyber Security (IT-30001), IIIT Allahabad, Autumn 2026.

This group repository currently contains **Rushal Verma's SQL injection / authentication bypass module**. The remaining members' modules and final group video still need to be added. It does not represent a completed five-member submission.

## Run Rushal's module

Requires Python 3.10 or newer.

```powershell
cd sql-auth-bypass
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Open **http://127.0.0.1:5000**. No database server is needed; SQLite initializes dummy accounts automatically. On macOS/Linux use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.

## Ownership declaration

| Member name | Roll number | Category | Variant | Module |
| --- | --- | --- | --- | --- |
| Rushal Verma | IIT2024045 | SQL injection | Authentication bypass | [sql-auth-bypass](sql-auth-bypass/) |

This records the assigned owner. Rushal must review, understand, and be able to explain the implementation before submitting. AI assistance was used to prepare the initial implementation, tests, and study materials; follow the course's rules for permitted assistance and disclosure. Add the other four members' names, roll numbers, categories, and variants when known. Do not assign someone work they have not done.

For five members, the detailed assignment instructions require covering all four categories with distinct variants; two members can share a category only if their variants differ. The assignment header also says a maximum of four members, so confirm acceptance of the five-person group with the instructor.

## Included materials

- [SQL module and exact reproduction steps](sql-auth-bypass/README.md)
- [2-3 minute narration script](docs/DEMO_SCRIPT.md)
- [Viva questions and mitigation theory](docs/VIVA_NOTES.md)
- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Evidence and recording instructions](evidence/README.md)
- [Verification record](docs/VALIDATION.md)

## Scope

This is an intentionally vulnerable, local educational application using fictional accounts. Run it only on your own machine for this assignment. The entry point binds to loopback (`127.0.0.1`) with the debugger disabled. The parameterized version fixes the demonstrated SQL injection; it is not a production authentication system. See the module README for its deliberate simplifications.

