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

export function bindWidgetToFunctions(widget, target) {
  target = target || widget;
  Object.keys(target).forEach((key) => {
    if (isFunction(target[key])) {
      let originalFunction = target[key];

      target[key] = createBoundedFunction(widget, originalFunction);
    }
  });
}

export function hookMethod(widget, path, handler) {
  const { target, methodName } = parsePath(widget, path);
  const originalFunction = createBoundedFunction(widget, target[methodName]);

  target[methodName] = function (widget, ...rest) {
    return handler(widget, originalFunction, ...rest);
  };

  return originalFunction;
}

function parsePath(widget, path = '') {
  const paths = path.split('.');
  const methodName = paths.pop();
  const target = paths.reduce((target, path) => target[path], widget);

  return { target, methodName };
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isUndefined(value) {
  return typeof value === 'undefined';
}
