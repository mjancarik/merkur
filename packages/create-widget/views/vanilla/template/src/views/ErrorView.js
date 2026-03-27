function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function ErrorView(widget) {
  return `
    <div class='merkur__error'>
      <h1>Status: ${escHtml(widget.error.status)}</h1>
      <h2>Message: ${escHtml(widget.error.message)}</h2>
      <pre>${escHtml(widget.error.stack)}</pre>
    </div>
  `;
}
