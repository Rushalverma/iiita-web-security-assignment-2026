/**
 * ============================================================
 *  INTENTIONALLY VULNERABLE CODE  -  Stored XSS  (CWE-79)
 *  This is the ONLY file that contains the flaw.
 * ============================================================
 * Untrusted data read from MySQL (author, message) is concatenated
 * straight into HTML with NO output encoding. A stored value such as
 *   <script>alert('Stored XSS Demonstration')</script>
 * is therefore parsed by the browser as real markup and executed.
 */
function renderCommentsVulnerable(comments) {
  if (comments.length === 0) {
    return '<p class="empty">No comments yet. Be the first to post one.</p>';
  }
  return comments
    .map(
      (c) => `
    <article class="comment">
      <header><strong title="${c.author}">${c.author}</strong>
        <time>${formatDate(c.created_at)}</time></header>
      <div class="body">${c.message}</div>
    </article>`
    )
    .join('\n');
}

function formatDate(d) {
  return new Date(d).toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

module.exports = { renderCommentsVulnerable };
