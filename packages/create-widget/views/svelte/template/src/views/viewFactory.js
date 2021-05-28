import View from './View.svelte';
import { headlineSlotFactory } from '../slots/headlineSlotFactory';

async function viewFactory(widget) {
  const slots = (await Promise.all([headlineSlotFactory(widget)])).reduce(
    (acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    },
    {}
  );

  return {
    View,
    slots,
  };
}
export { viewFactory };
