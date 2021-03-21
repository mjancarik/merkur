<script>
  import {getContext} from 'svelte';

  const widget = getContext('widget');
</script>

<div class='merkur__error'>
  <h1>Status: ${widget.error.status}</h1>
  <h2>Message: ${widget.error.message}</h2>
  <pre>${widget.error.stack}</pre>
</div>

