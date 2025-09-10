import { hookMethod } from '@merkur/core';
import { WIDGET_UPDATE_EVENT } from './useSelect';

export function selectPlugin() {
  return {
    create(widget) {
      hookMethod(widget, 'update', (widget, originalFunction, ...args) => {
        widget.emit(WIDGET_UPDATE_EVENT);

        return originalFunction(...args);
      });

      return widget;
    },
    setup(widget) {
      return widget;
    },
  };
}

export { useSelect } from './useSelect';
export { SelectProvider } from './SelectProvider.jsx';
