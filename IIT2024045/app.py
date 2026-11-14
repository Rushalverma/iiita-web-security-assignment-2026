"""Local SQL injection authentication-bypass lab with two comparable code paths."""

import os
from pathlib import Path
import secrets
import sqlite3

from flask import Flask, abort, redirect, render_template, request, session, url_for


DEMO_USERS = (
    ("admin", "AdminDemo42!", "administrator"),
    ("student", "StudentDemo42!", "student"),
)
DEMO_PAYLOAD = "admin' -- "  # The trailing space is intentional.
SAFE_QUERY = (
    "SELECT id, username, role FROM users "
    "WHERE username = ? AND password = ?"
)
MODES = {
    "vulnerable": {
        "title": "Vulnerable login",
        "label": "01 / Before the fix",
        "description": "User input is joined directly into the SQL statement.",
    },
    "parameterized": {
        "title": "Parameterized login",
        "label": "02 / After the fix",
        "description": "The SQL structure stays fixed. Input is supplied as data.",
    },
}


def connect_db(path):
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database(path):
    """Create dummy users without resetting an existing lab database."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    connection = connect_db(path)
    try:
        connection.execute(
            "CREATE TABLE IF NOT EXISTS users ("
            "id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, "
            "password TEXT NOT NULL, role TEXT NOT NULL)"
        )
        connection.executemany(
            "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
            DEMO_USERS,
        )
        connection.commit()
    finally:
        connection.close()


def authenticate_vulnerable(connection, username, password):
    # INTENTIONAL FLAW: untrusted input becomes part of the SQL syntax.
    query = (
        "SELECT id, username, role FROM users "
        f"WHERE username = '{username}' AND password = '{password}'"
    )
    user = connection.execute(query).fetchone()
    return user, query, None


def authenticate_parameterized(connection, username, password):
    # IMPLEMENTED MITIGATION: bind values separately from the fixed SQL statement.
    parameters = (username, password)
    user = connection.execute(SAFE_QUERY, parameters).fetchone()
    return user, SAFE_QUERY, parameters


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=secrets.token_hex(32),
        DATABASE=str(Path(app.instance_path) / "lab.sqlite3"),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        MAX_CONTENT_LENGTH=16 * 1024,
    )
    if test_config:
        app.config.update(test_config)
    initialize_database(app.config["DATABASE"])

    def validate_mode(mode):
        if mode not in MODES:
            abort(404)

    @app.after_request
    def response_headers(response):
        # These keep the SQLi lesson from accidentally adding reflected XSS.
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; style-src 'self'; img-src 'self'; "
            "form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
        )
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.route("/login/<mode>", methods=["GET", "POST"])
    def login(mode):
        validate_mode(mode)
        username = ""
        password = ""
        outcome = None
        user = None
        query = None
        parameters = None

        if request.method == "POST":
            # A failed retry must not retain an earlier successful login.
            session.pop(f"user_{mode}", None)
            username = request.form.get("username", "")
            password = request.form.get("password", "")
            connection = connect_db(app.config["DATABASE"])
            try:
                if not username or not password:
                    outcome = "empty"
                elif mode == "vulnerable":
                    user, query, parameters = authenticate_vulnerable(
                        connection, username, password
                    )
                else:
                    user, query, parameters = authenticate_parameterized(
                        connection, username, password
                    )
                if outcome is None:
                    outcome = "success" if user else "denied"
                if user:
                    session[f"user_{mode}"] = dict(user)
            except sqlite3.Error:
                # Do not leak database exception details to the browser.
                outcome = "query_error"
            finally:
                connection.close()

        return render_template(
            "login.html",
            mode=mode,
            details=MODES[mode],
            username=username,
            password=password,
            outcome=outcome,
            user=user,
            query=query,
            parameters=parameters,
            payload=DEMO_PAYLOAD,
        )

    @app.get("/dashboard/<mode>")
    def dashboard(mode):
        validate_mode(mode)
        user = session.get(f"user_{mode}")
        if not user:
            return redirect(url_for("login", mode=mode))
        return render_template("dashboard.html", mode=mode, user=user)

    @app.post("/logout/<mode>")
    def logout(mode):
        validate_mode(mode)
        session.pop(f"user_{mode}", None)
        return redirect(url_for("login", mode=mode))

    return app


if __name__ == "__main__":
    create_app().run(
        host="127.0.0.1",
        port=int(os.environ.get("SQLI_LAB_PORT", "5000")),
        debug=False,
        use_reloader=False,
    )

