import { createMerkurWidget, createMerkur } from '@merkur/core';
import { widgetProperties } from './widget';
import style from './style.css'; // eslint-disable-line no-unused-vars

function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetProperties,
    ...widgetParams,
    $dependencies: {},
    mount(widget) {
      document.getElementById('increase').addEventListener('click', () => {
        widget.onClick();
      });

      document.getElementById('reset').addEventListener('click', () => {
        widget.onReset();
      });
    },
    unmount(widget) {
      document.querySelector(widget.props.containerSelector).innerHTML = '';
    },
    update(widget) {
      document.getElementById('counter').innerText = widget.state.counter;
    },
  });
}

const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});
