export default function MerkurIcon(widget) {
  return widget.$dependencies.wire(widget.props, ':icon')`
    <div class='merkur__icon'>
      <img src='http://localhost:4444/static/merkur-icon.png' alt='Merkur'/>
    </div>
  `;
}
