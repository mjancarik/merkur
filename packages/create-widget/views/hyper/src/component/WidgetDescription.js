export default function ViewDescription(widget) {
  return widget.$dependencies.wire(widget.props)`
    <p>The widget's name is <strong>${widget.name}@${widget.version}</strong>.</p>
  `;
}
