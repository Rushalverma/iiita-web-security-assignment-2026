/**
 * Automated verification. Starts the real app (real MySQL), drives it over HTTP,
 * and loads each returned page into jsdom with script execution enabled and
 * window.alert instrumented, to observe whether stored scripts run.
 * NOTE: jsdom is not a full browser; do the manual browser demo as well (see README).
 * Run against an EMPTY comments table for clean results (see README).
 */
require('dotenv').config();
const { spawn } = require('child_process');
const { JSDOM } = require('jsdom');
const pool = require('../config/db');

const PORT = process.env.PORT || 3000;
const BASE = `http://127.0.0.1:${PORT}`;
const PAYLOAD = "<script>alert('Stored XSS Demonstration')</script>";
// Breaks out of the title="..." attribute, then injects a script plus an <img> element.
const ATTR_PAYLOAD = '"><script>alert(\'attr-xss\')</script><img src=x>';
const results = [];
let server;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function record(name, pass, detail = '') {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
}

async function startServer() {
  server = spawn('node', ['server.js'], { stdio: 'ignore' });
  for (let i = 0; i < 30; i++) {
    try { await fetch(BASE + '/style.css'); return; } catch { await sleep(200); }
  }
  throw new Error('server did not start');
}
async function stopServer() { server.kill(); await sleep(400); }

async function post(author, message, mode) {
  const res = await fetch(BASE + '/comments', {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ author, message, mode }).toString(),
  });
  return { status: res.status, location: res.headers.get('location') };
}

// Load a page the way a browser would parse it, with scripts running.
async function load(mode) {
  const html = await (await fetch(`${BASE}/?mode=${mode}`)).text();
  const alerts = [];
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    beforeParse(w) { w.alert = (m) => alerts.push(String(m)); },
  });
  await sleep(50);
  return { doc: dom.window.document, alerts, html };
}

(async () => {
  await startServer();
  try {
    const [[{ n: before }]] = await pool.query('SELECT COUNT(*) n FROM comments');
    if (before !== 0) console.log(`WARNING: table had ${before} rows before tests; clear it for clean results.`);

    // 1. Normal comment
    const r1 = await post('Alice', 'Hello, this is a normal comment.', 'vulnerable');
    record('1. Normal comment submitted (302 -> msg=posted)', r1.status === 302 && r1.location.includes('msg=posted'), r1.location);

    // 2. Multiple comments stored
    await post('Bob', 'Second comment: Tom & Jerry <3 it\'s "great"', 'secure');
    await post('Carol', 'Third comment\nwith a line break', 'vulnerable');
    const [rows] = await pool.query('SELECT author FROM comments ORDER BY id');
    const authors = rows.slice(before).map((r) => r.author).join(',');
    record('2. Multiple comments stored in MySQL', authors === 'Alice,Bob,Carol', authors);

    // 3. Payload executes in vulnerable mode
    const rp = await post('Mallory', PAYLOAD, 'vulnerable');
    const v1 = await load('vulnerable');
    record('3. Payload executes in Vulnerable Mode',
      rp.status === 302 && v1.alerts.length === 1 && v1.alerts[0] === 'Stored XSS Demonstration',
      `alerts=${JSON.stringify(v1.alerts)}`);

    // 4. Executes again on revisit
    const v2 = await load('vulnerable');
    record('4. Payload executes again after refresh', v2.alerts.length === 1, `alerts=${JSON.stringify(v2.alerts)}`);

    // 5. Does not execute in secure mode (and shows as text)
    const s1 = await load('secure');
    const texts = [...s1.doc.querySelectorAll('#comments .body')].map((e) => e.textContent);
    record('5. Same payload does NOT execute in Secure Mode',
      s1.alerts.length === 0 && s1.doc.querySelectorAll('#comments script').length === 0 && texts.includes(PAYLOAD),
      `alerts=${s1.alerts.length}, rendered as literal text=${texts.includes(PAYLOAD)}`);

    // 6. Existing malicious comment still harmless after fresh load / attribute payload too
    await post(ATTR_PAYLOAD, 'attribute-context test', 'vulnerable');
    const v3 = await load('vulnerable');
    const s2 = await load('secure');
    const attrBlocked = s2.alerts.length === 0 && s2.doc.querySelectorAll('#comments img').length === 0;
    record('6. Existing malicious comments harmless in Secure Mode (text + attribute contexts)',
      attrBlocked && v3.alerts.includes('attr-xss') && v3.doc.querySelectorAll('#comments img').length >= 1,
      `vulnerable alerts=${JSON.stringify(v3.alerts)}; secure alerts=${s2.alerts.length}, injected <img>=${s2.doc.querySelectorAll('#comments img').length}`);

    // 7. Normal comments correct in secure mode
    const hasAlice = texts.includes('Hello, this is a normal comment.');
    const hasBob = texts.includes('Second comment: Tom & Jerry <3 it\'s "great"');
    const hasCarol = texts.includes('Third comment\nwith a line break');
    record('7. Normal comments (incl. & < \' " and newline) display correctly in Secure Mode', hasAlice && hasBob && hasCarol,
      `alice=${hasAlice} bob=${hasBob} carol=${hasCarol}`);

    // 8. Persistence across app restart
    await stopServer();
    await startServer();
    const [[{ n: after }]] = await pool.query('SELECT COUNT(*) n FROM comments');
    const v4 = await load('vulnerable');
    const s3 = await load('secure');
    record('8. Comments persist after restarting the application',
      after - before === 5 && v4.alerts.includes('Stored XSS Demonstration') && s3.alerts.length === 0 &&
      [...s3.doc.querySelectorAll('#comments .comment')].length === after,
      `rows=${after}, vulnerable alerts=${JSON.stringify(v4.alerts)}, secure alerts=${s3.alerts.length}`);
  } catch (e) {
    record('Test run aborted: ' + e.message, false);
  } finally {
    await stopServer();
    await pool.end();
    const failed = results.filter((r) => !r.pass).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed`);
    process.exit(failed ? 1 : 0);
  }
})();
