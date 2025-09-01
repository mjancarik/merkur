export function selectPlugin() {
  return {
    create(widget) {
      return widget;
    },
    setup(widget) {
      return widget;
    },
    async update(widget) {
      widget.emit('widget:update');
    },
  };
}

export { useSelect } from './useSelect';
