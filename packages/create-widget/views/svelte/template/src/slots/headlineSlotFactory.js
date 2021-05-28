import HeadlineSlot from './HeadlineSlot.svelte';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
  };
}

export { headlineSlotFactory };
