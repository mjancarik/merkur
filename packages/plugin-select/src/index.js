import { hookMethod } from '@merkur/core';

export function selectPlugin() {
  return {
    create(widget) {
      hookMethod(widget, 'update', (widget, originalFunction, ...args) => {
        widget.emit('widget:update');

        return originalFunction(...args);
      });

      return widget;
    },
    setup(widget) {
      return widget;
    },
    // async update(widget) {
    //   widget.emit('widget:update');
    // },
  };
}

export { useSelect } from './useSelect';
