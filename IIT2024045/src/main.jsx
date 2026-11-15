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
  const [mode, setMode] = useState("secure");
  const [bypass, setBypass] = useState(false);
  const [executedSql, setExecutedSql] = useState("");
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    requestApi("/api/account")
      .then(({ status, data }) => {
        if (status === 200) {
          setUser(data.user);
          setBypass(data.authenticatedBypass);
        }
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
      const { status, data } = await requestApi("/api/login", { ...credentials, mode });
      setExecutedSql(data.sql || "");
      if (status === 200) {
        setUser(data.user);
        setBypass(data.authenticatedBypass);
      } else setNotice({ text: data.error, error: true });
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
        setBypass(false);
        setExecutedSql("");
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
          <h1 id="page-title">Authentication bypass<br />with SQL injection</h1>
          <p>
          Run the same login payload against a deliberately vulnerable query,
          then switch to the parameterized fix.
          </p>
        </section>

        <div className="workspace">
          <section className="card" aria-labelledby="auth-heading">
            <h2 id="auth-heading">{user ? "Account dashboard" : `${mode === "vulnerable" ? "Vulnerable" : "Secure"} login`}</h2>
            {!user && (
              <div className="mode-toggle" role="group" aria-label="Login mode">
                <button type="button" className={mode === "vulnerable" ? "selected" : "secondary"} onClick={() => setMode("vulnerable")}>
                  Vulnerable mode
                </button>
                <button type="button" className={mode === "secure" ? "selected" : "secondary"} onClick={() => setMode("secure")}>
                  Secure mode
                </button>
              </div>
            )}
            {notice && (
              <p role="status" className={notice.error ? "notice error" : "notice"}>
                {notice.text}
              </p>
            )}
            {user ? (
              <div>
                {bypass && <p className="bypass-banner">AUTHENTICATION BYPASSED</p>}
                <p>Signed in as <strong>{user.username}</strong>.</p>
                <p className="role">Account role <strong>{user.role}</strong></p>
                {executedSql && <pre className="executed-sql"><code>{executedSql}</code></pre>}
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
                {mode === "vulnerable" && (
                  <div className="payload">
                    <strong>Try the bypass payload</strong>
                    <p>Username: <code>admin' --</code><br />Password: <code>anything</code></p>
                  </div>
                )}
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
            <h2 id="query-heading">Why the bypass works</h2>
            <pre><code>{mode === "vulnerable"
              ? "WHERE username = '" + "admin' --" + "' AND password = 'anything'"
              : "WHERE username = ?"}</code></pre>
            <ol>
              <li>Vulnerable mode concatenates input into SQL text.</li>
              <li><code>--</code> comments out the password condition.</li>
              <li>Secure mode binds the same payload as data.</li>
            </ol>
            <h3>{mode === "vulnerable" ? "VULNERABLE: password check removed" : "SECURE: parameterized query"}</h3>
            <p>
              {mode === "vulnerable"
                ? "The database returns the administrator row before a password is checked."
                : "The payload is treated as a literal username and cannot change the query."}
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
            {executedSql && <pre className="executed-sql"><code>{executedSql}</code></pre>}
          </aside>
        </div>
      </main>

      <footer className="shell footer">Rushal Verma · IIT2024045</footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
