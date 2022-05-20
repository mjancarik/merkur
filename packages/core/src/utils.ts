function createBoundedFunction(widget, originalFunction) {
  return (...rest) => {
    return originalFunction(widget, ...rest);
  };
}

export function setDefaultValueForUndefined(object, keys, value = {}) {
  let objectClone = { ...object };

  keys.forEach((key) => {
    objectClone[key] = objectClone[key] || value;
  });

  return objectClone;
}

export function bindWidgetToFunctions(widget, target?) {
  target = target || widget;
  Object.keys(target).forEach((key) => {
    if (isFunction(target[key])) {
      let originalFunction = target[key];

      target[key] = createBoundedFunction(widget, originalFunction);
    }
  });
}

export function hookMethod(widget, methodName, handler) {
  const originalFunction = createBoundedFunction(widget, widget[methodName]);

  widget[methodName] = function (widget, ...rest) {
    return handler(widget, originalFunction, ...rest);
  };

  return originalFunction;
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isUndefined(value) {
  return typeof value === 'undefined';
}
