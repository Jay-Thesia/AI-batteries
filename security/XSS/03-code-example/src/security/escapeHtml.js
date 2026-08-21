/**
 * Encode a string so HTML parsers treat it as text, not markup.
 *
 * Context: HTML body / text nodes. Pair this with textContent in the browser.
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
