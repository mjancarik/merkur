export default function ViewDescription(widget) {
  return widget.$dependencies.html`
    <p>The widget's name is <strong>${widget.name}@${widget.version}</strong>.</p>
  `;
}
