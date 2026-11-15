# Web Server Security Assignment: Evidence Summary

**Category:** OS Command Injection

**Variant:** Variant 1: In-Band (Command output returned)

**Date Generated:** 2026-11-15 17:27:34

---

## 1. Vulnerable Implementation & Exploitation (Item a & b)

- **Vulnerable Endpoint:** `/api/ping/vulnerable`
- **Injected Payload:** `127.0.0.1 ; whoami`
- **Command Executed on Host:** `ping -c 1 127.0.0.1 ; whoami`

### In-Band Output Received by Client:
```text
PING 127.0.0.1 (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.076 ms

--- 127.0.0.1 ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.076/0.076/0.076/0.000 ms
anshkumar

```

---

## 2. Root Cause (Item c)

> **Root Cause:** User input was formatted directly into a system command string and passed to `subprocess.check_output(..., shell=True)`. The operating system shell interpreter parsed the `&` metacharacter as a command delimiter, executing the attacker's arbitrary command (`whoami`) and returning its stdout directly in the HTTP response.

---

## 3. Mitigation Implemented (Item d)

- **Mitigated Endpoint:** `/api/ping/mitigated`
- **Same Payload Attempted:** `127.0.0.1 ; whoami`
- **Result Status:** `blocked` (HTTP 400 Bad Request)
- **Blocking Reason:** `Mitigation blocked input: Target does not match strict IP/hostname allow-list. Shell metacharacters are rejected.`

---

## 4. Verdict

The vulnerability was successfully reproduced in-band, and the mitigation completely stops the attack while preserving legitimate network diagnostic functionality.
