export default function ViewDescription(widget) {
  return widget.$dependencies.wire(widget.props)`
    <p>Configured view is <strong>${widget.state.name}</strong>.</p>
  `;
}
