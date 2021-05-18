import Welcome from '../component/Welcome';
import WidgetDescription from '../component/WidgetDescription';
import ErrorView from '../component/ErrorView';

async function headlineSlotFactory() {
  return {
    name: 'headline',
    View: HeadlineSlot,
    containerSelector: '.headline',
  };
}

function HeadlineSlot(widget) {
  if (widget.error && widget.error.status) {
    return ErrorView(widget);
  }

  return `
      <div class='merkur__page'>
        <div class='merkur__headline'>
          <div class='merkur__view'>
            ${Welcome(widget)}
            <h3>Current count: <span id="counter">${
              widget.state.counter
            }</span></h3>
            ${WidgetDescription(widget)}
          </div>
        </div>
      </div>
  `;
}

export { headlineSlotFactory };
export default HeadlineSlot;
