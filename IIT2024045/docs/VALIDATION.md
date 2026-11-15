# JavaScript module verification

The test suite checks a direct request to the protected account, successful authentication, invalid credentials, legitimate apostrophes, server-side logout, and invalid request bodies.

Run `npm run build` and `npm test` with Node.js 24 or newer. The module's GitHub Actions workflow runs these commands after installing dependencies from the lockfile. [Workflow](../../.github/workflows/tests.yml)

The browser checks follow the recording script. They cover the wrong-password result, successful login with the same username, session restoration on refresh, and sign-out. [Browser evidence](../evidence/README.md)

