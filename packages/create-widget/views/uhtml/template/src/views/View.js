import Counter from '../components/Counter';
import ErrorView from './ErrorView';

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

export default View;
