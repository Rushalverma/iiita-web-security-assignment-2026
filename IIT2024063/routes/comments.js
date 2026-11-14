const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');
const { renderCommentsVulnerable } = require('../views/vulnerableRenderer');
const { renderCommentsSecure } = require('../views/secureRenderer');

const router = express.Router();
const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

const MODES = {
  vulnerable: {
    label: 'Vulnerable Mode',
    desc: 'Comments are inserted into the page as raw HTML. Stored scripts will execute.',
    render: renderCommentsVulnerable,
  },
  secure: {
    label: 'Secure Mode',
    desc: 'Comments are context-aware encoded before display. Stored scripts show as plain text.',
    render: renderCommentsSecure,
  },
};

// Fixed, server-side feedback messages (never reflects user input).
const FLASH = {
  posted: ['ok', 'Comment submitted and saved to the database.'],
  invalid: ['error', 'Name (max 50 chars) and comment (max 2000 chars) are required.'],
  dberror: ['error', 'Database error. Please check the server console and try again.'],
};

function pickMode(value) {
  return value === 'secure' ? 'secure' : 'vulnerable';
}

// Single-pass template fill: values are never re-scanned for {{placeholders}}.
function fill(vars) {
  return TEMPLATE.replace(/{{(\w+)}}/g, (_, key) => (key in vars ? vars[key] : ''));
}

router.get('/', async (req, res) => {
  const mode = pickMode(req.query.mode);
  const flash = FLASH[req.query.msg];
  let commentsHtml = '';
  let count = 0;
  let flashHtml = flash ? `<div class="flash ${flash[0]}" role="status">${flash[1]}</div>` : '';

  try {
    const [rows] = await pool.execute(
      'SELECT id, author, message, created_at FROM comments ORDER BY id DESC LIMIT 100'
    );
    count = rows.length;
    commentsHtml = MODES[mode].render(rows);
  } catch (err) {
    console.error('Failed to load comments:', err.message);
    flashHtml = `<div class="flash error" role="alert">${FLASH.dberror[1]}</div>`;
  }

  res.set('Cache-Control', 'no-store');
  res.send(
    fill({
      MODE: mode,
      MODE_LABEL: MODES[mode].label,
      MODE_DESC: MODES[mode].desc,
      FLASH: flashHtml,
      COUNT: String(count),
      COMMENTS: commentsHtml,
    })
  );
});

router.post('/comments', async (req, res) => {
  const mode = pickMode(req.body.mode);
  const author = typeof req.body.author === 'string' ? req.body.author.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  // Only length/emptiness is validated; HTML is deliberately NOT stripped or rejected.
  if (!author || !message || author.length > 50 || message.length > 2000) {
    return res.redirect(`/?mode=${mode}&msg=invalid`);
  }
  try {
    // Parameterized query (no SQL injection).
    await pool.execute('INSERT INTO comments (author, message) VALUES (?, ?)', [author, message]);
    res.redirect(`/?mode=${mode}&msg=posted`);
  } catch (err) {
    console.error('Failed to save comment:', err.message);
    res.redirect(`/?mode=${mode}&msg=dberror`);
  }
});

module.exports = router;
