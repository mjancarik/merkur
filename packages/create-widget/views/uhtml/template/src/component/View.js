import Welcome from './Welcome';
import Counter from './Counter';
import WidgetDescription from './WidgetDescription';

export default function View(widget) {
  return widget.$dependencies.html`
      <div class='merkur__page'>
        <div class='merkur__headline'>
          <div class='merkur__view'>
            ${Welcome(widget)}
            ${WidgetDescription(widget)}
          </div>
        </div>
        <div class='merkur__view'>
          ${Counter(widget)}
        </div>
      </div>
  `;
}
