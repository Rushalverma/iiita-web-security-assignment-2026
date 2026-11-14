# Verification record

Checked on 13 November 2026 using Python 3.13, Flask 3.1.3, SQLite, Playwright 1.62.1, and installed Google Chrome on Windows.

- **10 unittest cases passed.** The cases cover both authentication paths, identical exploit inputs, injection in either field, legitimate apostrophes, session isolation, rejected retries, dashboard protection, logout, missing input, unknown modes, escaped HTML, and generic database errors.
- **Browser walkthrough passed.** A wrong password was rejected, the vulnerable login created an admin session with the demonstrated injection, the protected dashboard opened, the parameterized login rejected the same payload, and valid credentials continued to work after the fix.
- **Mobile layout checked at 390 pixels wide.** No horizontal page overflow was detected. Desktop captures use a 1365 x 1000 viewport.
- Six screenshots were captured from the running application, along with a silent reference recording. The screenshots were visually inspected for readability.

The recording has no voice-over or editor walkthrough. Rushal's narrated video, final group integration, and live individual explanation remain necessary. Passing these checks confirms the demonstrated SQL injection behavior and its mitigation; it is not a general security audit.

Run the tests and the browser capture yourself using the instructions in the module and evidence READMEs.

The GitHub Actions workflow runs six checks for login, valid data, and session behavior from the IIT2024045 folder. [Workflow](../../.github/workflows/tests.yml)

