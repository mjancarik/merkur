export default function MerkurIcon(widget) {
  return widget.$dependencies.wire(widget.props, ':icon')`
    <div class='merkur__icon'>
      <img src='/static/merkur-icon.png' alt='Merkur'/>
    </div>
  `;
}
