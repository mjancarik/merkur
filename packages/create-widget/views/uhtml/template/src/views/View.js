import Counter from '../components/Counter';
import ErrorView from './ErrorView';
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
    View,
    slots,
  };
}

function View(widget) {
  if (widget.error && widget.error.status) {
    return ErrorView(widget);
  }

  return widget.$dependencies.html`
      <div class='merkur__page'>
        <div class='merkur__view'>
          ${Counter(widget)}
        </div>
      </div>
  `;
}

export { viewFactory };
export default View;
