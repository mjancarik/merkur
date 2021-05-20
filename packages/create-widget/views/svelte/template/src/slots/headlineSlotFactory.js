import HeadlineSlot from './HeadlineSlot.svelte';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
    containerSelector: '.headline-view',
  };
}

export { headlineSlotFactory };
