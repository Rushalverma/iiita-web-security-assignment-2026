# OS Command Injection — In-Band (Command Output Returned)

| Member | Roll number | Category | Variant |
| --- | --- | --- | --- |
| Ansh Kumar | IIT2024055 | OS Command Injection | In-Band (command output returned) |

A Flask-based network diagnostics tool that demonstrates in-band OS command injection and its defense-in-depth mitigation using parameterized execution and allow-list validation.

## Run locally

Open a terminal inside `IIT2024055` with Python 3.10 or newer.

On macOS or Linux:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python app.py
```

On Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

Open http://127.0.0.1:5001. Stop the server with Ctrl+C.

## Source and supporting materials

| File or folder | Contents |
| --- | --- |
| [app.py](app.py) | Flask routes: vulnerable and mitigated ping endpoints |
| [Templates](templates/) and [styles](static/) | Diagnostic console UI and styling |
| [verify_exploit.py](verify_exploit.py) | Automated exploit and mitigation verification |
| [Evidence gallery](evidence/README.md) | Exploit and mitigation evidence |
| [Narration guide](docs/DEMO_SCRIPT.md) | Timing and screens for the video segment |
| [Viva notes](docs/VIVA_NOTES.md) | Questions, explanations, and alternative mitigations |
| [Verification record](docs/VALIDATION.md) | Recorded test results |

## Vulnerability and root cause

**File:** [app.py](app.py) — function `ping_vulnerable()`, route `/api/ping/vulnerable`

The application takes user-supplied input from the `target` POST parameter and concatenates it directly into a shell command string:

```python
raw_command = f"ping {PING_COUNT_FLAG} 1 {target}"
output = subprocess.check_output(raw_command, shell=True, stderr=subprocess.STDOUT, text=True)
```

**Root cause:** User input is concatenated into a system command string without sanitization and executed through an OS shell interpreter (`shell=True`). The shell parses metacharacters (`&`, `|`, `;`) as command delimiters rather than literal text, allowing an attacker to chain arbitrary commands whose output is returned directly in the HTTP response (in-band).

### Exploit payload

| Payload | Shell command formed |
| --- | --- |
| `127.0.0.1 & whoami` | `ping -c 1 127.0.0.1 & whoami` |
| `127.0.0.1 && id` | `ping -c 1 127.0.0.1 && id` |
| `127.0.0.1 ; ls` | `ping -c 1 127.0.0.1 ; ls` |

The `&` instructs the shell to execute ping and then immediately run `whoami`. The output of both commands is captured by `subprocess.check_output` and returned in the JSON response body — this is what makes it **Variant 1 (In-Band)**.

## Implemented mitigation

**File:** [app.py](app.py) — function `ping_mitigated()`, route `/api/ping/mitigated`

Two layers of defense:

**1. Allow-list input validation** — the `is_valid_target()` function validates the target against strict IPv4/IPv6 format (`ipaddress` module) or RFC-1123 hostname regex. Any input containing shell metacharacters, spaces, or unexpected characters is rejected with HTTP 400 before any execution.

**2. Parameterized execution with argument vector (`shell=False`)** — arguments are passed as a discrete list `["ping", PING_COUNT_FLAG, "1", target]` with `shell=False`. The OS spawns `ping` directly without a shell interpreter; metacharacters are treated as literal data.

```python
if not is_valid_target(target):
    return jsonify({"status": "blocked", "error": "..."}), 400

command_vector = ["ping", PING_COUNT_FLAG, "1", target]
result = subprocess.run(command_vector, shell=False, capture_output=True, text=True)
```

When the exact same payload `127.0.0.1 & whoami` is sent to the mitigated endpoint, it is rejected immediately:

```json
{
  "status": "blocked",
  "error": "Mitigation blocked input: Target does not match strict IP/hostname allow-list."
}
```

Normal pings (e.g. `127.0.0.1`, `google.com`) still work correctly on the mitigated endpoint.

## Demonstration and evidence

The web interface at http://127.0.0.1:5001 provides:

- A **Vulnerable Mode** (red) and **Mitigated Mode** (green) toggle
- Quick test payload buttons for one-click exploit demonstration
- A terminal output area displaying the in-band response
- Tabs showing code paths, vulnerability analysis, and mitigation theory

| Step | Mode | Input | Expected result |
| --- | --- | --- | --- |
| 1. Normal ping | Vulnerable | `127.0.0.1` | Ping output only |
| 2. Exploit | Vulnerable | `127.0.0.1 & whoami` | Ping output + username (injected command) |
| 3. Same exploit blocked | Mitigated | `127.0.0.1 & whoami` | HTTP 400 — blocked by validation |
| 4. Normal ping still works | Mitigated | `127.0.0.1` | Ping output only |

Evidence files are in [evidence/](evidence/README.md).

## Other mitigations (theory)

1. **Avoid the shell:** Use native language APIs (e.g. Python sockets, HTTP libraries) instead of spawning system commands through a shell interpreter. When no shell exists, metacharacters have no special parsing logic.

2. **Parameterized execution with an argument vector:** Pass arguments as separate elements of an array with `shell=False`. The OS treats each element as literal data for that argument position, making command injection syntactically impossible.

3. **Allow-list input validation:** Enforce strict positive allow-lists rather than denylists. Validate expected formats (IP addresses, hostnames) and reject everything else. Denylists are easily bypassed through alternative shell syntax (`$IFS`, backticks, variable expansions).

4. **Principle of least privilege:** Run the web server process under an isolated, unprivileged OS account with restricted filesystem permissions and no access to administrative tools, bounding the damage if injection occurs.

## Verification

With the server running, execute the automated verification script:

```sh
.venv/bin/python verify_exploit.py
```

This tests both endpoints with exploit payloads and benign inputs, and saves evidence to the `evidence/` folder. Results are also summarized in [docs/VALIDATION.md](docs/VALIDATION.md).

## References

- [OWASP Command Injection](https://owasp.org/www-community/attacks/Command_Injection)
- [Python subprocess — security considerations](https://docs.python.org/3/library/subprocess.html#security-considerations)
- [CWE-78: OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)
