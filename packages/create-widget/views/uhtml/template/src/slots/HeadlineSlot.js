import Welcome from '../components/Welcome';
import WidgetDescription from '../components/WidgetDescription';
import ErrorView from '../views/ErrorView';

function HeadlineSlot(widget) {
  if (widget.error && widget.error.status) {
    return ErrorView(widget);
  }

  return widget.$dependencies.html`
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

export default HeadlineSlot;
