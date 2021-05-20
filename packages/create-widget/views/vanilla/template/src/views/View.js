import Counter from '../component/Counter';
import ErrorView from '../component/ErrorView';
import { headlineSlotFactory } from '../slots/HeadlineSlot';

async function viewFactory(widget) {
  const slots = (await Promise.all([headlineSlotFactory(widget)])).reduce(
    (acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    },
    {}
  );

  return {
    View: View,
    containerSelector: '.merkur-view',
    slots,
  };
}

function View(widget) {
  if (widget.error && widget.error.status) {
    return ErrorView(widget);
  }

  return `
      <div class='merkur__page'>
        <div class='merkur__view'>
          ${Counter(widget)}
        </div>
      </div>
  `;
}

export { viewFactory };
export default View;
