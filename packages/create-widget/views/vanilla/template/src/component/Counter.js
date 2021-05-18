export default function Counter(widget) {
  return `
    <div>
      <h3>Counter widget:</h3>
      <p>Count: <span data-merkur="counter">${widget.state.counter}</span></p>
      <button data-merkur="on-increase">
        increase counter
      </button>
      <button data-merkur="on-reset">
        reset counter
      </button>
    </div>
  `;
}
