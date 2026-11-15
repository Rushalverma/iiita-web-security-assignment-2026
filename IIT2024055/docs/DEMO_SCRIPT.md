# Video Demonstration & Viva Walkthrough Script

## OS Command Injection — Variant 1: In-Band (Command Output Returned)

**Student Name:** Ansh Kumar
**Roll Number:** IIT2024055
**Target Duration:** ~2 minutes 30 seconds to 3 minutes

---

## Preparation Checklist Before You Hit Record:
1. **Screen Layout:**
   - Have **VS Code** open on one side (or ready to switch) with `app.py` opened.
   - Have your **Web Browser** open to `http://127.0.0.1:5000/`.
   - Make sure your Flask server is running in a terminal (`python app.py`).
2. **Audio Check:** Ensure your microphone is clear and background noise is minimal.

---

## Detailed Scene-by-Scene Script

### [0:00 – 0:20] Scene 1: Introduction & Ownership (Table 3)
* **WHERE TO LOOK / WHAT TO SHOW ON SCREEN:**
  - Browser showing the running web application header (`http://127.0.0.1:5000/`).
* **WHAT TO DO:**
  - Hover mouse over the title: **"OS Command Injection: Variant 1 (In-Band)"**.
* **VOICE-OVER / WHAT TO SAY:**
  > *"Hello everyone. My name is **Ansh Kumar**, roll number **IIT2024055**.
  > In our group project for Web Server Security, I am demonstrating **OS Command Injection**, specifically **Variant 1: In-Band command output returned**, along with its live exploitation, root cause, and defensive mitigation."*

---

### [0:20 – 0:50] Scene 2: Vulnerable Implementation (Item a)
* **WHERE TO LOOK / WHAT TO SHOW ON SCREEN:**
  - Switch window to **VS Code**, opening `app.py`.
  - Scroll to line 57: `@app.route("/api/ping/vulnerable", methods=["POST"])`.
* **WHAT TO DO:**
  - Highlight lines 68 to 78 (specifically `raw_command = f"ping {PING_COUNT_FLAG} 1 {target}"` and `subprocess.check_output(..., shell=True)`).
* **VOICE-OVER / WHAT TO SAY:**
  > *"Here is the vulnerable code path inside `app.py` at the endpoint `/api/ping/vulnerable`.
  > This feature simulates a network diagnostic ping utility. As you can see, the application takes the user-supplied `target` parameter and directly concatenates it into a shell string using Python f-strings.
  > Crucially, it then passes this string to `subprocess.check_output` with `shell=True`. Because `shell=True` delegates parsing to the operating system's command interpreter—`sh` on Linux/macOS or `cmd.exe` on Windows—the interpreter will process any shell metacharacters embedded inside the input."*

---

### [0:50 – 1:10] Scene 3: Root Cause (Item c)
* **WHERE TO LOOK / WHAT TO SHOW ON SCREEN:**
  - Keep VS Code on screen or switch to the web app's **"Vulnerability Analysis"** tab.
* **WHAT TO DO:**
  - Highlight the root cause callout box.
* **VOICE-OVER / WHAT TO SAY:**
  > *"The **root cause** of this vulnerability is two-fold:
  > First, unsanitized user input is directly concatenated into a system command without any allow-list validation.
  > Second, execution occurs through an operating system shell interpreter (`shell=True`), allowing metacharacters like ampersand (`&`), pipe (`|`), or semicolon (`;`) to act as command delimiters rather than literal text."*

---

### [1:10 – 1:50] Scene 4: Working Exploit with Evidence (Item b)
* **WHERE TO LOOK / WHAT TO SHOW ON SCREEN:**
  - Switch to your **Web Browser** on `http://127.0.0.1:5000/`.
  - Ensure the **"Vulnerable Mode"** red button is active.
* **WHAT TO DO:**
  1. Click on the Quick Preset button: `127.0.0.1 & whoami` (or type it into the input box).
  2. Point at the input field.
  3. Click the blue **"Execute Ping"** button.
  4. Wait ~1 second for the terminal box to populate with output.
  5. Use your mouse cursor to highlight the bottom line of the output showing your username (e.g., `anshkumar`).
* **VOICE-OVER / WHAT TO SAY:**
  > *"Now let's demonstrate the exploit in action.
  > On our web console, we are in **Vulnerable Mode**. I enter the payload: `127.0.0.1 & whoami`.
  > Here, the ampersand `&` instructs the shell to execute the initial ping command and immediately follow it with the secondary command `whoami`.
  > When I click 'Execute Ping', you can see the terminal output right here. The ping packet was transmitted, and immediately below it, we see the host user identity: `anshkumar`.
  > This is the defining characteristic of **Variant 1 (In-Band OS Injection)**: the command output is returned directly to the user in the HTTP response body without requiring blind timing delays or out-of-band channels."*

---

### [1:50 – 2:30] Scene 5: Implemented Mitigation (Item d)
* **WHERE TO LOOK / WHAT TO SHOW ON SCREEN:**
  - Quickly switch back to **VS Code** to show `ping_mitigated()` in `app.py` (Lines 118–142).
  - Then switch back to the **Web Browser**.
* **WHAT TO DO:**
  1. In VS Code, briefly point out `is_valid_target(target)` and `subprocess.run(command_vector, shell=False)`.
  2. In the browser, click the green **"Mitigated Mode"** button.
  3. Enter the exact same payload: `127.0.0.1 & whoami`.
  4. Click **"Execute Ping"**.
  5. Point to the terminal output displaying `STATUS: BLOCKED` (HTTP 400).
* **VOICE-OVER / WHAT TO SAY:**
  > *"Now, let's defend against this attack. In `app.py` under `/api/ping/mitigated`, we implemented two layers of defense:
  > First, **strict allow-list input validation** using regular expressions and Python's `ipaddress` library to reject any metacharacters or whitespace.
  > Second, **parameterized execution with an argument vector (`shell=False`)**, where arguments are passed as discrete list elements `['ping', '-c', '1', target]`. Because no shell interpreter is invoked, metacharacters cannot execute.
  > Let's test this: in the browser, I switch to **Mitigated Mode** and submit the **exact same payload**: `127.0.0.1 & whoami`.
  > When I click execute, the request is immediately blocked with HTTP 400 Bad Request. The malicious input is completely neutralized before any system command is reached."*

---

### [2:30 – 2:55] Scene 6: Theoretical Mitigations (Item e) & Conclusion
* **WHERE TO LOOK / WHAT TO SHOW ON SCREEN:**
  - Click on the **"Mitigation Theory (Item e)"** tab on the right side of the web interface (or show the README).
* **WHAT TO DO:**
  - Scroll gently through the 4 listed items as you name them.
* **VOICE-OVER / WHAT TO SAY:**
  > *"To summarize the other mitigation alternatives covered in our lecture slides:
  > 1. **Avoiding the shell:** Using native programming language APIs rather than invoking system command lines.
  > 2. **Parameterized execution:** Using argument vectors with `shell=False` so arguments are treated strictly as data, not code.
  > 3. **Allow-list validation:** Strictly matching input against expected IP/hostname formats.
  > 4. **Principle of least privilege:** Running the web server under an unprivileged system account to limit blast radius.
  > All source code and evidence logs have been documented in our public GitHub repository. Thank you!"*
