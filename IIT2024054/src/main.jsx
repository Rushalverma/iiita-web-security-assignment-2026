import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const example = "<strong>Sample note</strong> & friends";
const search = new URLSearchParams(window.location.search);
const submitted = search.has("q");

function App() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!submitted) return;
    const controller = new AbortController();

    async function readSearch() {
      try {
        const response = await fetch(`/api/search?${search}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setResult(response.ok ? { query: data.query } : { error: data.error });
      } catch (error) {
        if (error.name !== "AbortError") {
          setResult({ error: "Could not read the search response. Try again." });
        }
      }
    }

    readSearch();
    return () => controller.abort();
  }, []);

  return (
    <>
      <header className="site-header">
        <div className="shell header-row">
          <a className="brand" href="/">
            <span aria-hidden="true" className="brand-mark">&lt;/&gt;</span>
            Web Security Lab
          </a>
          <span className="course">IIIT Allahabad · IT-30001</span>
        </div>
      </header>

      <main className="shell">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">Reflected XSS</h1>
          <p>Follow a search term from the URL to the page and see how React keeps reflected input as plain text.</p>
        </section>

        <div className="workspace">
          <section className="card" aria-labelledby="search-heading">
            <h2 id="search-heading">Search input</h2>
            <form action="/" method="get">
              <label htmlFor="query">Search term</label>
              <div className="form-row">
                <input
                  id="query"
                  name="q"
                  placeholder="e.g. campus library"
                  defaultValue={search.get("q") ?? ""}
                  maxLength={240}
                  autoComplete="off"
                />
                <button type="submit">Search</button>
              </div>
            </form>
            <nav className="examples" aria-label="Search examples">
              <a href={`/?${new URLSearchParams({ q: example })}`}>Try a markup example</a>
              {submitted && <a href="/">Clear search</a>}
            </nav>
            <hr />
            <h2>Reflected result</h2>
            <div className="result" aria-live="polite">
              {!submitted && <p className="muted">Enter a term to inspect the response.</p>}
              {submitted && !result && <p className="muted">Reading the response…</p>}
              {result?.error && <p className="error">{result.error}</p>}
              {typeof result?.query === "string" && (
                <>
                  <p className="status">Rendered as text</p>
                  <output className="reflected-text" aria-label="Reflected search term">
                    {result.query}
                  </output>
                </>
              )}
            </div>
          </section>

          <aside className="card explanation" aria-labelledby="flow-heading">
            <h2 id="flow-heading">How reflection works</h2>
            <ol>
              <li><strong>URL</strong><span>The query parameter carries the search term.</span></li>
              <li><strong>Express</strong><span>The search endpoint returns the term as JSON.</span></li>
              <li><strong>React</strong><span>The result is rendered as a text node.</span></li>
            </ol>
            <h3>Where the risk starts</h3>
            <p>Reflected XSS becomes possible when the browser interprets untrusted request data as executable page content.</p>
          </aside>
        </div>
      </main>

      <footer className="shell footer">Herit Desai · IIT2024054</footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
