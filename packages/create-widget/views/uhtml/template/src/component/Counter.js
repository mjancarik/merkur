export default function Counter(widget) {
  return widget.$dependencies.html`
    <div>
      <h3>Counter widget:</h3>
      <p>Count: ${widget.state.counter}</p>
      <button onclick=${widget.onClick}>
        increase counter
      </button>
      <button onclick=${widget.onReset}>
        reset counter
      </button>
    </div>
  `;
}
