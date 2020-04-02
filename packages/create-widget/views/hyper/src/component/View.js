import Welcome from './Welcome';
import MerkurIcon from './MerkurIcon';
import Counter from './Counter';
import WidgetDescription from './WidgetDescription';

export default function View(widget, render) {
  return render`
      <div class='merkur__page'>
        <div class='merkur__headline'>
          <div class='merkur__view'>
            ${MerkurIcon(widget)}
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
