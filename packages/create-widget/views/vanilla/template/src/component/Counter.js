export default function Counter(widget) {
  return `
    <div>
      <h3>Counter widget:</h3>
      <p>Count: <span id="counter">${widget.state.counter}</span></p>
      <button id="increase">
        increase counter
      </button>
      <button id="reset">
        reset counter
      </button>
    </div>
  `;
}
