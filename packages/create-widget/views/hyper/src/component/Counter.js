export default function Counter(widget) {
  return widget.$dependencies.wire()`
    <div>
      <h2>Counter widget:</h2>
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
