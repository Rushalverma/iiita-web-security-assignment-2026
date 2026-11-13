"""Behavioral tests for authentication, the demonstrated exploit, and its fix."""

from contextlib import closing
from pathlib import Path
import sqlite3
import tempfile
import unittest

from app import DEMO_PAYLOAD, create_app


class AuthenticationTests(unittest.TestCase):
    def setUp(self):
        # Keep SQLite files in the workspace on restricted Windows installations.
        self.directory = tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parent)
        self.database = str(Path(self.directory.name) / "test.sqlite3")
        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "test-only-secret",
            "DATABASE": self.database,
        })
        self.client = self.app.test_client()

    def tearDown(self):
        assert Path(self.directory.name).resolve().is_relative_to(
            Path(__file__).resolve().parent
        )
        self.directory.cleanup()

    def login(self, mode, username, password):
        return self.client.post(
            f"/login/{mode}", data={"username": username, "password": password}
        )

    def test_wrong_password_is_rejected_in_both_modes(self):
        for mode in ("vulnerable", "parameterized"):
            with self.subTest(mode=mode):
                response = self.login(mode, "admin", "wrong-password")
                self.assertIn(b"Login rejected", response.data)
                self.assertEqual(self.client.get(f"/dashboard/{mode}").status_code, 302)

    def test_correct_password_authenticates_in_both_modes(self):
        for mode in ("vulnerable", "parameterized"):
            with self.subTest(mode=mode):
                response = self.login(mode, "admin", "AdminDemo42!")
                self.assertIn(b"Login successful", response.data)
                dashboard = self.client.get(f"/dashboard/{mode}")
                self.assertEqual(dashboard.status_code, 200)
                self.assertIn(b"Welcome, admin.", dashboard.data)

    def test_exact_payload_bypasses_only_vulnerable_login(self):
        for mode, expected in (("vulnerable", 200), ("parameterized", 302)):
            with self.subTest(mode=mode):
                self.login(mode, DEMO_PAYLOAD, "wrong-password")
                response = self.client.get(f"/dashboard/{mode}")
                self.assertEqual(response.status_code, expected)
                if expected == 200:
                    self.assertIn(b"Welcome, admin.", response.data)

    def test_password_field_injection_is_also_blocked_by_binding(self):
        password = "' OR 1=1 -- "
        self.login("vulnerable", "does-not-exist", password)
        self.assertEqual(self.client.get("/dashboard/vulnerable").status_code, 200)
        self.login("parameterized", "does-not-exist", password)
        self.assertEqual(self.client.get("/dashboard/parameterized").status_code, 302)

    def test_apostrophe_is_valid_data_for_a_real_account(self):
        with closing(sqlite3.connect(self.database)) as connection:
            connection.execute(
                "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                ("o'connor", "test-password", "student"),
            )
            connection.commit()
        response = self.login("parameterized", "o'connor", "test-password")
        self.assertIn(b"Login successful", response.data)

    def test_failed_retry_clears_previously_authenticated_session(self):
        for mode in ("vulnerable", "parameterized"):
            with self.subTest(mode=mode):
                self.login(mode, "admin", "AdminDemo42!")
                self.login(mode, "admin", "wrong-password")
                self.assertEqual(self.client.get(f"/dashboard/{mode}").status_code, 302)

    def test_sessions_are_isolated_between_versions(self):
        self.login("vulnerable", DEMO_PAYLOAD, "wrong-password")
        self.assertEqual(self.client.get("/dashboard/vulnerable").status_code, 200)
        self.assertEqual(self.client.get("/dashboard/parameterized").status_code, 302)

    def test_logout_removes_authenticated_session(self):
        self.login("parameterized", "student", "StudentDemo42!")
        self.client.post("/logout/parameterized")
        self.assertEqual(self.client.get("/dashboard/parameterized").status_code, 302)

    def test_missing_fields_and_unknown_modes(self):
        for mode in ("vulnerable", "parameterized"):
            for data in ({}, {"username": "admin"}, {"password": "anything"}):
                with self.subTest(mode=mode, data=data):
                    response = self.client.post(f"/login/{mode}", data=data)
                    self.assertIn(b"Login rejected", response.data)
                    self.assertEqual(self.client.get(f"/dashboard/{mode}").status_code, 302)
        self.assertEqual(self.client.get("/login/unknown").status_code, 404)
        self.assertEqual(self.client.get("/dashboard/unknown").status_code, 404)

    def test_input_is_escaped_and_sql_errors_do_not_leak(self):
        response = self.login("parameterized", "<script>alert(1)</script>", "x")
        self.assertNotIn(b"<script>alert(1)</script>", response.data)
        response = self.login("vulnerable", "'", "x")
        self.assertIn(b"Login rejected", response.data)
        self.assertNotIn(b"OperationalError", response.data)
        self.assertNotIn(b"Traceback", response.data)


if __name__ == "__main__":
    unittest.main()

