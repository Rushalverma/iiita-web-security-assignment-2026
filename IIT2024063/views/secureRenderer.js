/**
 * SECURE RENDERER - Context-aware output encoding.
 *
 * Every untrusted value is encoded for the HTML context it lands in
 * before it is placed in the page:
 *   - HTML text context        -> encodeHtmlText()
 *   - Quoted attribute context -> encodeHtmlAttr()  (title="...")
 * Data is stored exactly as submitted; encoding happens at output time.
 */
const ENTITY = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' };

// Context: HTML element content.
function encodeHtmlText(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ENTITY[ch]);
}

// Context: quoted HTML attribute value (also neutralises quotes and backticks).
function encodeHtmlAttr(value) {
  return String(value).replace(/[&<>"'`]/g, (ch) => ENTITY[ch]);
}

function formatDate(d) {
  return new Date(d).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

function renderCommentsSecure(comments) {
  if (comments.length === 0) {
    return '<p class="empty">No comments yet. Be the first to post one.</p>';
  }
  return comments
    .map(
      (c) => `
    <article class="comment">
      <header><strong title="${encodeHtmlAttr(c.author)}">${encodeHtmlText(c.author)}</strong>
        <time>${formatDate(c.created_at)}</time></header>
      <div class="body">${encodeHtmlText(c.message)}</div>
    </article>`
    )
    .join('\n');
}

module.exports = { renderCommentsSecure, encodeHtmlText, encodeHtmlAttr };
