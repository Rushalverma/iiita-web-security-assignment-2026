# Viva Notes — OS Command Injection (In-Band)

**Member:** Ansh Kumar · **Roll number:** IIT2024055

---

## Quick-fire Q&A

| Question | Answer |
| :--- | :--- |
| **What is your vulnerability category and variant?** | OS Command Injection, Variant 1: In-Band. The injected command's output is returned directly in the HTTP response body. |
| **Why is this called "In-Band"?** | Because the attacker sends the payload and receives the command execution output through the exact same direct communication channel (HTTP response body), unlike Blind injection where output must be inferred via timing or external callbacks. |
| **What is the root cause?** | User input is concatenated into a shell command string without sanitization and executed via `subprocess.check_output(..., shell=True)`. The shell parses metacharacters (`&`, `;`, `|`) as command separators. |
| **What is `shell=True` and why is it dangerous?** | `shell=True` tells Python to spawn a shell interpreter (`/bin/sh` on Linux/macOS, `cmd.exe` on Windows) to parse and execute the command string. The shell treats metacharacters as control syntax, allowing command chaining. |
| **What payload did you use?** | `127.0.0.1 & whoami` — the `&` runs ping, then immediately runs `whoami`. Both outputs are captured and returned. |
| **What other payloads could work?** | `127.0.0.1 && id` (runs id if ping succeeds), `127.0.0.1 ; ls` (runs ls after ping), `127.0.0.1 | cat /etc/passwd` (pipes ping output to cat, but cat reads the file). |
| **How does your mitigation work?** | Two layers: (1) Allow-list validation rejects any input that isn't a valid IP or hostname. (2) `subprocess.run([...], shell=False)` passes arguments as a list directly to the OS — no shell is invoked, so metacharacters have no special meaning. |
| **Why does `shell=False` stop command injection?** | When `shell=False`, the OS spawns the binary executable directly (`ping`) and passes the target as a single raw string argument. Without a shell interpreter, metacharacters like `&` and `|` have no special syntactic meaning and cannot chain new processes. |
| **Why is allow-listing preferred over blacklisting?** | Denylists are easily bypassed through alternative shell syntax (e.g., `$IFS`, `%0a`, backticks, variable expansions). Allow-lists strictly enforce what is safe, rejecting everything else. |
| **What if someone passes a valid IP but a malicious one?** | Allow-list validation prevents command injection but doesn't prevent SSRF or pinging internal hosts. That's a separate concern — you could further restrict to public IPs only. |
| **What is "Principle of Least Privilege" in this context?** | Running the web server under an unprivileged OS account so even if injection occurs, the attacker can't access admin tools, sensitive files, or escalate privileges. |
| **What's the difference between In-Band and Blind injection?** | In-Band: command output is returned directly in the response. Blind: no output is returned — the attacker infers success via time delays (`sleep 5`) or out-of-band callbacks (DNS/HTTP to attacker server). |

---

## Key code locations

| What | Where in `app.py` |
| --- | --- |
| Vulnerable endpoint | `ping_vulnerable()` — route `/api/ping/vulnerable` |
| The flaw (line ~79) | `raw_command = f"ping {PING_COUNT_FLAG} 1 {target}"` with `shell=True` |
| Mitigated endpoint | `ping_mitigated()` — route `/api/ping/mitigated` |
| Input validation | `is_valid_target()` — validates against IPv4/IPv6 and RFC hostname regex |
| Parameterized execution (line ~168) | `command_vector = ["ping", PING_COUNT_FLAG, "1", target]` with `shell=False` |
