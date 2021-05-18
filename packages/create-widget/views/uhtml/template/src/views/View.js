import Counter from '../component/Counter';
import ErrorView from '../component/ErrorView';
import { headlineSlotFactory } from '../slots/HeadlineSlot';

async function viewFactory(widget) {
  return {
    View: View,
    containerSelector: '.merkur-view',
    slots: await Promise.all([headlineSlotFactory(widget)]),
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
