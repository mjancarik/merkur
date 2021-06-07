<script>
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  import Counter from '../components/Counter.svelte';
  import ErrorView from '../views/ErrorView.svelte';

  export let widget;
  export let state;
  export let props;

  let reactiveState = writable(state);
  let reactiveProps = writable(props);

  setContext('widget', widget);
  setContext('props', reactiveProps);
  setContext('state', reactiveState);

  $: {
    $reactiveState = state;
    $reactiveProps = props;
  }
</script>

{#if widget.error && widget.error.message }
  <div>
    <ErrorView />
  </div>
{:else}
  <div class="merkur__page">
    <div class="merkur__view">
      <Counter />
    </div>
  </div>
{/if}
