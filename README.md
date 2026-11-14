# Web Server Security Assignment

Cyber Security (IT-30001) · IIIT Allahabad · Autumn 2026

Each member's project lives in a folder named after their roll number. The project guide covers setup, the assigned vulnerability, the mitigation, and the demonstration evidence.

## Group ownership

| Member | Roll number | Vulnerability | Variant | Project guide |
| --- | --- | --- | --- | --- |
| Rushal Verma | IIT2024045 | SQL injection | Authentication bypass | [SQL authentication lab](IIT2024045/README.md) |

Four ownership entries and their projects are pending. Add each row when the member's name, roll number, and variant are confirmed. The assignment covers SQL injection, OS command injection, XSS, and CSRF. Members sharing a category demonstrate distinct variants.

## Run a project

Clone the repository and open the guide for the project you want to run.

~~~text
git clone https://github.com/Rushalverma/iiita-web-security-assignment-2026.git
cd iiita-web-security-assignment-2026
~~~

Rushal's project uses Flask and SQLite with fictional accounts. Its guide includes Windows and macOS/Linux commands. [Run the SQL lab](IIT2024045/README.md#run-locally)

## Repository layout

~~~text
.
├── IIT2024045/            Rushal's SQL authentication lab
│   ├── README.md          Setup, mitigation, and walkthrough
│   ├── app.py             Flask application
│   ├── static/            Styles
│   ├── templates/         Login and dashboard pages
│   ├── tests/             Authentication tests
│   ├── evidence/          Screenshots and capture instructions
│   └── docs/              Narration guide, viva notes, and verification record
├── docs/                  Group checklist and project README template
├── CONTRIBUTING.md        Steps for adding a member's project
└── README.md              Group ownership and project index
~~~

## Group submission

Each member prepares and narrates their portion of the combined group video. The group submits the repository link and final video link through the course page. [Submission checklist](docs/SUBMISSION_CHECKLIST.md)

The contribution guide explains where to put each module and how to document it. [Contribution guide](CONTRIBUTING.md) · [Project README template](docs/PROJECT_README_TEMPLATE.md)

AI assistance was used to prepare the initial SQL lab, tests, and study materials. Each member should review and be able to explain their submission and follow the course's disclosure rules.

