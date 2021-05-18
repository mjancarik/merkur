import HeadlineSlot from './HeadlineSlot';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
    containerSelector: '.headline',
  };
}

export { headlineSlotFactory };
