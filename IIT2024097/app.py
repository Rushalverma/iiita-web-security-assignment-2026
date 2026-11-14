"""
CSRF (GET-based forged action) demo - display-name change.
Educational use only: run on localhost against your own app.

MODE=vulnerable  -> state change via GET, no proof of intent   (default)
MODE=secure      -> POST only + synchronizer (anti-CSRF) token
"""
import os, secrets
from datetime import datetime
from flask import Flask, request, session, redirect, url_for, render_template_string, abort

MODE = os.environ.get("MODE", "vulnerable").lower()
app = Flask(__name__)
app.secret_key = "dev-only-secret-change-me"
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")

USERS = {
    "alice": {"password": "alice123", "display_name": "Alice"},
    "bob":   {"password": "bob123",   "display_name": "Bob"},
}
LOG = []  # audit log of display-name changes (evidence for the video)

BASE = """<!doctype html><html><head><meta charset="utf-8"><title>CSRF Demo App</title>
<style>
body{font-family:system-ui,sans-serif;background:#f4f6f8;margin:0;color:#1d2733}
header{background:#1f3a5f;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.badge{padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600}
.vuln{background:#d64545}.sec{background:#2e9e5b}
main{max-width:680px;margin:30px auto;padding:0 16px}
.card{background:#fff;border-radius:10px;padding:22px;margin-bottom:18px;box-shadow:0 1px 4px #0002}
input{padding:9px;border:1px solid #bbb;border-radius:6px;width:60%}
button{padding:9px 16px;border:0;border-radius:6px;background:#1f3a5f;color:#fff;cursor:pointer}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{border-bottom:1px solid #eee;padding:6px;text-align:left}
.err{color:#b00020}.ok{color:#1b7a3e}code{background:#eef;padding:2px 5px;border-radius:4px}
</style></head><body>
<header><b>SecureBank Profile (CSRF Lab)</b>
<span class="badge {{ 'sec' if mode=='secure' else 'vuln' }}">MODE: {{ mode|upper }}</span></header>
<main>{{ body|safe }}</main></body></html>"""

def page(body_tpl, **ctx):
    body = render_template_string(body_tpl, **ctx)  # body is auto-escaped here
    return render_template_string(BASE, body=body, mode=MODE)

@app.route("/")
def index():
    return redirect(url_for("profile" if "user" in session else "login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    err = None
    if request.method == "POST":
        u = request.form.get("username", "")
        p = request.form.get("password", "")
        if u in USERS and USERS[u]["password"] == p:
            session.clear()
            session["user"] = u
            session["csrf_token"] = secrets.token_hex(32)
            return redirect(url_for("profile"))
        err = "Invalid credentials"
    return page("""<div class="card"><h2>Login</h2>
      <form method="post"><p><input name="username" placeholder="username (alice)"></p>
      <p><input name="password" type="password" placeholder="password (alice123)"></p>
      <button>Login</button></form>{% if err %}<p class="err">{{err}}</p>{% endif %}</div>""", err=err)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/profile")
def profile():
    if "user" not in session:
        return redirect(url_for("login"))
    u = session["user"]
    msg = request.args.get("msg")
    return page("""<div class="card"><h2>Welcome, {{ name }}!</h2>
      <p>Logged in as <code>{{ u }}</code> &middot; <a href="/logout">logout</a></p>
      {% if msg %}<p class="ok">{{ msg }}</p>{% endif %}
      <h3>Change display name</h3>
      {% if mode == 'secure' %}
        <form method="post" action="/profile/update">
          <input type="hidden" name="csrf_token" value="{{ token }}">
          <input name="display_name" placeholder="New display name" required>
          <button>Update</button></form>
      {% else %}
        <form method="get" action="/profile/update">
          <input name="display_name" placeholder="New display name" required>
          <button>Update</button></form>
      {% endif %}</div>
      <div class="card"><h3>Audit log (server side)</h3>
      <table><tr><th>Time</th><th>User</th><th>New name</th><th>Method</th><th>Referer</th></tr>
      {% for r in log %}<tr><td>{{r.t}}</td><td>{{r.u}}</td><td>{{r.n}}</td><td>{{r.m}}</td><td>{{r.ref}}</td></tr>{% endfor %}
      </table></div>""",
      name=USERS[u]["display_name"], u=u, msg=msg, token=session.get("csrf_token"),
      log=reversed(LOG[-10:]))

def apply_change(new_name):
    u = session["user"]
    USERS[u]["display_name"] = new_name[:50]
    LOG.append(dict(t=datetime.now().strftime("%H:%M:%S"), u=u, n=new_name[:50],
                    m=request.method, ref=request.headers.get("Referer", "-")))

# ---------------------------------------------------------------------------
# (a) VULNERABLE CODE PATH / (d) MITIGATION - selected by MODE
# ---------------------------------------------------------------------------
@app.route("/profile/update", methods=["GET", "POST"])
def update():
    if "user" not in session:
        return redirect(url_for("login"))

    if MODE == "vulnerable":
        # FLAW: state-changing action on GET; the only check is the session
        # cookie, which the browser attaches automatically to ANY request
        # (including one triggered by an attacker's page). No proof of intent.
        new_name = request.args.get("display_name", "").strip()
        if new_name:
            apply_change(new_name)
        return redirect(url_for("profile", msg="Display name updated."))

    # ---- SECURE: POST only + synchronizer token ----
    if request.method != "POST":
        abort(405)  # GET can no longer change state
    sent = request.form.get("csrf_token", "")
    real = session.get("csrf_token", "")
    if not real or not secrets.compare_digest(sent, real):
        abort(403, "CSRF token missing or invalid")
    new_name = request.form.get("display_name", "").strip()
    if new_name:
        apply_change(new_name)
    return redirect(url_for("profile", msg="Display name updated."))

if __name__ == "__main__":
    print(f"Running in {MODE.upper()} mode at http://localhost:5000")
    app.run(host="localhost", port=5000, debug=False)
