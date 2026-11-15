# Reflected XSS demo video script

Herit Desai · IIT2024054 · 2 minutes 40 seconds

Before recording, start the app and open it on [port 4175](http://127.0.0.1:4175). Keep the Express API and React page open in your editor. Open the browser's Network tab before submitting the first search. [Setup instructions](../README.md#run-locally) · [Express API](../server/app.js) · [React page](../src/main.jsx)

## 0:00–0:20 · Introduce the demo

**Show** the Reflected XSS page and your name and roll number in the footer.

> Hi, I’m Herit Desai, roll number IIT2024054. My assigned variant is reflected cross-site scripting. I’ll use a search form to show how a value from the current request reaches the page and how React displays it safely.

## 0:20–0:50 · Follow an ordinary search

**Show** a search for `campus library`. Point to the query parameter in the address bar, then select `/api/search` in the Network tab and show its response.

> I search for “campus library.” The browser puts the search term in the URL. Express reads it and returns it as a string in JSON. React takes that string and displays it in the result. We call it reflected because it comes from the current request.

## 0:50–1:15 · Explain the flaw

**Show** the **Where the risk starts** panel beside the search form.

> A vulnerable page can place an untrusted value where the browser will interpret it as page instructions. If that value can introduce executable content, the content can run in the site’s origin. The risk comes from how the application renders the value.

## 1:15–1:55 · Show the mitigation

**Show** **Try a markup example**. Point to the angle brackets in the **Reflected result**, then inspect the `<output>` element in the Elements tab. Show `{result.query}` in the React source.

> This example contains harmless markup. The angle brackets are visible in the result, and the Elements panel shows a text node with no nested HTML element. In our code, the result is an ordinary JSX text child. React keeps the entire input as text, so it can’t create elements inside this output.

## 1:55–2:25 · Show the server and explain other defenses

**Show** `response.json({ query })` and the Content Security Policy in the Express source.

> Express returns the input as JSON. React’s text rendering is the main defense here, and Content Security Policy adds a browser restriction on which scripts can run. A server-rendered page can use encoding for its output context. A feature that intentionally accepts rich HTML needs a maintained sanitizer.

## 2:25–2:40 · Clear the search

**Show** **Clear search** and the empty result.

> When I clear the search, the result disappears because it depends on the query in the current URL. That’s the reflected behavior and the mitigation.

The markup example verifies how the mitigation handles ordinary markup. The working-exploit requirement is a separate item in the assignment. [Browser evidence](../README.md#demonstration-and-evidence) · [Viva notes](DEMO_AND_VIVA.md)
