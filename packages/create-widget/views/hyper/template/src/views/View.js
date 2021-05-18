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

function View(widget, render) {
  if (widget.error && widget.error.status) {
    return render`${ErrorView(widget)}`;
  }

  return render`
      <div class='merkur__page'>
        <div class='merkur__view'>
          ${Counter(widget)}
        </div>
      </div>
  `;
}

export { viewFactory };
export default View;
