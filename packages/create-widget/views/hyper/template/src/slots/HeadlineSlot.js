import Welcome from '../component/Welcome';
import WidgetDescription from '../component/WidgetDescription';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
    containerSelector: '.headline-view',
  };
}

function HeadlineSlot(widget, render) {
  if (widget.error && widget.error.status) {
    return null;
  }

  return render`
      <div class='merkur__page'>
        <div class='merkur__headline'>
          <div class='merkur__view'>
            ${Welcome(widget)}
            <h3>Current count: ${widget.state.counter}</h3>
            ${WidgetDescription(widget)}
          </div>
        </div>
      </div>
  `;
}

export { headlineSlotFactory };
export default HeadlineSlot;
