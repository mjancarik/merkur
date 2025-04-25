import Counter from '../components/Counter';
import { headlineSlotFactory } from '../slots/HeadlineSlot';
import ErrorView from './ErrorView';

async function viewFactory(widget) {
  const slot = (await Promise.all([headlineSlotFactory(widget)])).reduce(
    (acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    },
    {},
  );

  return {
    View,
    ErrorView,
    slot,
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
