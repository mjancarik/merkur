import { hookMethod } from '@merkur/core';
import scramblerFactory from './scramblerFactory';
import numberToCssClass from './numberToCssClass';

function cssScramblePlugin() {
  return {
    async setup(widget, widgetDefinition) {
      const { classnameHashtable } = widgetDefinition;
      widget.$in.classNameScrambler = scramblerFactory(classnameHashtable);

      widget.cn = (...args) => widget.$in.classNameScrambler(...args).className;

      return widget;
    },
    async create(widget) {
      hookMethod(widget, 'info', infoHook);

      return widget;
    },
  };
}

async function infoHook(widget, originalInfo, ...rest) {
  const result = await originalInfo(...rest);

  return {
    classnameHashtable: widget.classnameHashtable,
    ...result,
  };
}

export { numberToCssClass, cssScramblePlugin };
