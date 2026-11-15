import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

async function requestApi(path, data) {
  const response = data === undefined
    ? await fetch(path)
    : await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

  return {
    status: response.status,
    data: response.status === 204 ? null : await response.json(),
  };
}

function App() {
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    requestApi("/api/account")
      .then(({ status, data }) => {
        if (status === 200) setUser(data.user);
        else if (status !== 401) setNotice({ text: data.error, error: true });
      })
      .catch(() => setNotice({ text: "Could not check your session.", error: true }))
      .finally(() => setBusy(false));
  }, []);

  async function signIn(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const credentials = Object.fromEntries(new FormData(form));
    setBusy(true);
    setNotice(null);

    try {
      const { status, data } = await requestApi("/api/login", credentials);
      if (status === 200) setUser(data.user);
      else setNotice({ text: data.error, error: true });
    } catch {
      setNotice({ text: "Could not reach the login service. Try again.", error: true });
    } finally {
      form.elements.password.value = "";
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setNotice(null);
    try {
      const { status, data } = await requestApi("/api/logout", {});
      if (status === 204) {
        setUser(null);
        setNotice({ text: "Signed out." });
      } else {
        setNotice({ text: data.error, error: true });
      }
    } catch {
      setNotice({ text: "Could not sign out. Try again.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="shell header-row">
          <a href="/" className="brand">Web Security Lab</a>
          <span>IIIT Allahabad · IT-30001</span>
        </div>
      </header>

      <main className="shell">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">Preventing SQL injection<br />in login</h1>
          <p>
            Understand authentication bypass and try a login that keeps user
            input separate from SQL code.
          </p>
        </section>

        <div className="workspace">
          <section className="card" aria-labelledby="auth-heading">
            <h2 id="auth-heading">{user ? "Account dashboard" : "Parameterized login"}</h2>
            {notice && (
              <p role="status" className={notice.error ? "notice error" : "notice"}>
                {notice.text}
              </p>
            )}
            {user ? (
              <div>
                <p>Signed in as <strong>{user.username}</strong>.</p>
                <p className="role">Account role <strong>{user.role}</strong></p>
                <button type="button" onClick={signOut} disabled={busy}>Sign out</button>
              </div>
            ) : (
              <>
                <form action="/api/login" method="post" onSubmit={signIn}>
                  <label htmlFor="username">Username</label>
                  <input id="username" name="username" autoComplete="username" maxLength={80} required />
                  <label htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} required />
                  <button type="submit" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
                </form>
                <details className="examples">
                  <summary>Demo accounts</summary>
                  <dl>
                    <dt>Administrator</dt>
                    <dd><code>admin</code> / <code>AdminDemo42!</code></dd>
                    <dt>Student</dt>
                    <dd><code>student</code> / <code>StudentDemo42!</code></dd>
                    <dt>Student with an apostrophe in the username</dt>
                    <dd><code>o'connor</code> / <code>StudentDemo42!</code></dd>
                  </dl>
                </details>
              </>
            )}
          </section>

          <aside className="card explanation" aria-labelledby="query-heading">
            <h2 id="query-heading">How the query stays fixed</h2>
            <pre><code>WHERE username = ?</code></pre>
            <ol>
              <li>SQLite prepares the query with a placeholder.</li>
              <li>The username is supplied as a separate value.</li>
              <li>Express opens a session after checking the password hash.</li>
            </ol>
            <h3>What a bypass would look like</h3>
            <p>
              Imagine SQL injection causes the login query to return the
              administrator’s account without proving the password.
            </p>
            <dl className="decisions">
              <div>
                <dt>Bypass outcome</dt>
                <dd>The login grants access based on the returned row alone.</dd>
              </div>
              <div>
                <dt>Correct decision</dt>
                <dd>The login denies access until the password is verified.</dd>
              </div>
            </dl>
          </aside>
        </div>
      </main>

      <footer className="shell footer">Rushal Verma · IIT2024045</footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
