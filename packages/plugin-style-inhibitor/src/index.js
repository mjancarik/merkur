import { hookMethod } from '@merkur/core';
import inhibitOuterStyles from './styleInhibitor';

function styleInhibitorPlugin() {
  return {
    async setup(widget) {
      return widget;
    },
    async create(widget) {
      hookMethod(widget, 'mount', mountHook);

      return widget;
    },
  };
}

async function mountHook(widget, originalMount, ...rest) {
  const result = await originalMount(...rest);

  if (typeof window === 'object') {
    const container = document.querySelector(widget.props.containerSelector);

    inhibitOuterStyles(container, widget.assets);
  }
  return result;
}

export { styleInhibitorPlugin };
