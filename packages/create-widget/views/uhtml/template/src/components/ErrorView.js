export default function ErrorView(widget) {
  return widget.$dependencies.html`
    <div className='merkur__error'>
      <h1>Status: ${widget.error.status}</h1>
      <h2>Message: ${widget.error.message}</h2>
      <pre>${widget.error.stack}</pre>
    </div>
  `;
}
