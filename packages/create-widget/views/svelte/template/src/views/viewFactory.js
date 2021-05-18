import View from './View.svelte';
import { headlineSlotFactory } from '../slots/headlineSlotFactory';

async function viewFactory(widget) {
  return {
    View: View,
    containerSelector: '.merkur-view',
    slots: await Promise.all([headlineSlotFactory(widget)]),
  };
}
export { viewFactory };
