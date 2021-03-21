<script>
  import { getContext } from 'svelte';

  const widget = getContext('widget');
  const state = getContext('state');
</script>


<div>
  <h3>Counter widget:</h3>
  <p>Count: <span id="counter">{$state.counter}</span></p>
  <button on:click={widget.onClick}>
    increase counter
  </button>
  <button on:click={widget.onReset}>
    reset counter
  </button>
</div>
  
