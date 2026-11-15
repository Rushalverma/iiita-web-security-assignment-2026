import os
import re
import ipaddress
import platform
import subprocess
import time
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

IS_WINDOWS = platform.system().lower() == "windows"
PING_COUNT_FLAG = "-n" if IS_WINDOWS else "-c"


def is_valid_target(target: str) -> bool:
    if not target or not isinstance(target, str):
        return False
    
    target = target.strip()
    
    try:
        ipaddress.ip_address(target)
        return True
    except ValueError:
        pass

    hostname_regex = re.compile(
        r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*$"
    )
    if hostname_regex.match(target):
        return True

    return False


@app.route("/")
def index():
    return render_template("index.html", os_name=platform.system())


@app.route("/api/ping/vulnerable", methods=["POST"])
def ping_vulnerable():
    data = request.get_json(silent=True) or request.form
    target = data.get("target", "").strip()

    if not target:
        return jsonify({
            "status": "error",
            "mode": "vulnerable",
            "error": "Target parameter is required."
        }), 400

    raw_command = f"ping {PING_COUNT_FLAG} 1 {target}"
    
    start_time = time.time()
    try:
        output = subprocess.check_output(
            raw_command,
            shell=True,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=10
        )
        elapsed = round((time.time() - start_time) * 1000, 2)
        return jsonify({
            "status": "success",
            "mode": "vulnerable",
            "target": target,
            "command_executed": raw_command,
            "output": output,
            "execution_time_ms": elapsed
        })
    except subprocess.CalledProcessError as e:
        elapsed = round((time.time() - start_time) * 1000, 2)
        return jsonify({
            "status": "error",
            "mode": "vulnerable",
            "target": target,
            "command_executed": raw_command,
            "output": e.output,
            "error": f"Command returned exit code {e.returncode}",
            "execution_time_ms": elapsed
        }), 200
    except subprocess.TimeoutExpired:
        return jsonify({
            "status": "timeout",
            "mode": "vulnerable",
            "target": target,
            "command_executed": raw_command,
            "error": "Command timed out after 10 seconds."
        }), 408
    except Exception as ex:
        return jsonify({
            "status": "exception",
            "mode": "vulnerable",
            "target": target,
            "error": str(ex)
        }), 500


@app.route("/api/ping/mitigated", methods=["POST"])
def ping_mitigated():
    data = request.get_json(silent=True) or request.form
    target = data.get("target", "").strip()

    if not target:
        return jsonify({
            "status": "error",
            "mode": "mitigated",
            "error": "Target parameter is required."
        }), 400

    if not is_valid_target(target):
        return jsonify({
            "status": "blocked",
            "mode": "mitigated",
            "target": target,
            "command_executed": None,
            "output": None,
            "error": "Mitigation blocked input: Target does not match strict IP/hostname allow-list. Shell metacharacters are rejected.",
            "execution_time_ms": 0
        }), 400

    command_vector = ["ping", PING_COUNT_FLAG, "1", target]

    start_time = time.time()
    try:
        result = subprocess.run(
            command_vector,
            shell=False,
            capture_output=True,
            text=True,
            timeout=10
        )
        elapsed = round((time.time() - start_time) * 1000, 2)
        combined_output = result.stdout + (("\n" + result.stderr) if result.stderr else "")
        return jsonify({
            "status": "success" if result.returncode == 0 else "error",
            "mode": "mitigated",
            "target": target,
            "command_executed": " ".join(command_vector),
            "output": combined_output,
            "execution_time_ms": elapsed
        })
    except subprocess.TimeoutExpired:
        return jsonify({
            "status": "timeout",
            "mode": "mitigated",
            "target": target,
            "error": "Command timed out after 10 seconds."
        }), 408
    except Exception as ex:
        return jsonify({
            "status": "exception",
            "mode": "mitigated",
            "target": target,
            "error": str(ex)
        }), 500


if __name__ == "__main__":
    print("[*] Starting Web Server Security Lab - OS Command Injection (Variant 1)")
    print("[*] Vulnerable endpoint: http://127.0.0.1:5001/api/ping/vulnerable")
    print("[*] Mitigated endpoint:  http://127.0.0.1:5001/api/ping/mitigated")
    print("[*] Dashboard:           http://127.0.0.1:5001/")
    app.run(host="127.0.0.1", port=5001, debug=False)
