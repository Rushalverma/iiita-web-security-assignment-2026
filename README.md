# Web Server Security Assignment

**Cyber Security (IT-30001) · IIIT Allahabad · Autumn 2026**

This repository contains individual projects developed for the Web Server Security assignment. Each member's implementation is maintained in a separate folder named after their roll number.

Each project guide covers setup instructions, the assigned vulnerability, its exploitation, the implemented mitigation, and demonstration evidence.

## Group ownership

| **Member** | **Roll number** | **Vulnerability** | **Variant** | **Project guide** |
|---|---|---|---|---|
| Rushal Verma | IIT2024045 | SQL Injection | Authentication bypass | [SQL authentication lab](IIT2024045/README.md) |
| Surbhi Kumari Sah | IIT2024063 | Cross-Site Scripting (XSS) | Stored XSS | [Stored XSS project](IIT2024063/README.md) |

Three ownership entries and their projects are pending. Add each row when the member's name, roll number, and variant are confirmed.

The assignment covers SQL injection, OS command injection, XSS, and CSRF. Members sharing a vulnerability category demonstrate distinct variants.

## Projects

### 1. SQL Injection – Authentication Bypass

**Member:** Rushal Verma · **Roll number:** IIT2024045

A Flask and SQLite-based authentication lab demonstrating SQL injection through authentication bypass, along with its mitigation.

[View project guide](IIT2024045/README.md)

### 2. Cross-Site Scripting (XSS) – Stored XSS

**Member:** Surbhi Kumari Sah · **Roll number:** IIT2024063

A comment and feedback application built using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

The project demonstrates Stored XSS by storing malicious input in the database and rendering it in the application. It provides two modes:

- **Vulnerable mode:** Demonstrates how stored malicious input can execute when comments are rendered.
- **Secure mode:** Implements context-aware output encoding to prevent injected scripts from executing.

Both modes use the same stored comments to demonstrate the vulnerability and verify the mitigation.

[View project guide](IIT2024063/README.md)

## Run a project

Clone the repository and open the README inside the folder of the project you want to run.

```bash
git clone https://github.com/Rushalverma/iiita-web-security-assignment-2026.git
cd iiita-web-security-assignment-2026
```

Follow the setup instructions in the respective project guide.

## Repository layout

```text
.
├── IIT2024045/                  Rushal's SQL injection project
│   ├── README.md
│   ├── app.py
│   ├── static/
│   ├── templates/
│   ├── tests/
│   ├── evidence/
│   └── docs/
│
├── IIT2024063/                  Surbhi's Stored XSS project
│   ├── README.md                Setup and project documentation
│   ├── server.js                Express application entry point
│   ├── config/                  Database configuration
│   ├── database/                Database schema
│   ├── routes/                  Comment routes
│   ├── views/                   Vulnerable and secure renderers
│   ├── public/                  Frontend files
│   ├── tests/                   Automated tests
│   ├── package.json
│   └── .env.example
│
├── docs/                        Group checklist and README template
├── CONTRIBUTING.md              Instructions for adding projects
└── README.md                    Group ownership and project index
```

## Group submission

Each member prepares and narrates their portion of the combined group video. The group submits the repository link and final video link through the course page.

- [Submission checklist](docs/SUBMISSION_CHECKLIST.md)
- [Contribution guide](CONTRIBUTING.md)
- [Project README template](docs/PROJECT_README_TEMPLATE.md)

AI assistance was used in preparing project implementations, tests, and study materials. Each member should review and be able to explain their submission and follow the course's disclosure rules.
