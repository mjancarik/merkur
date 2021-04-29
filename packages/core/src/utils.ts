type AnyFn = (...args: unknown[]) => unknown;
type AnyObj = Record<string, unknown>;
type Widget = AnyObj; // TODO

function createBoundedFunction(widget: Widget, originalFunction: AnyFn): AnyFn {
  return (...rest: unknown[]) => {
    return originalFunction(widget, ...rest);
  };
}

export function setDefaultValueForUndefined(
  object: AnyObj,
  keys: string[],
  value: unknown = {}
): AnyObj {
  const objectClone = { ...object };

  keys.forEach((key) => {
    objectClone[key] = objectClone[key] || value;
  });

  return objectClone;
}

export function bindWidgetToFunctions(widget: Widget, target?: AnyObj): void {
  const obj: Widget | AnyObj = target || widget;

  Object.keys(obj).forEach((key) => {
    if (isFunction(obj[key])) {
      const originalFunction = obj[key] as AnyFn;

      obj[key] = createBoundedFunction(widget, originalFunction);
    }
  });
}

export function hookMethod(
  widget: Widget,
  methodName: string,
  handler: (
    widget: Widget,
    originalFunction: AnyFn,
    ...args: unknown[]
  ) => unknown
): AnyFn {
  const originalFunction = createBoundedFunction(
    widget,
    widget[methodName] as AnyFn
  );

  widget[methodName] = function (widget: Widget, ...rest: unknown[]) {
    return handler(widget, originalFunction, ...rest);
  };

  return originalFunction;
}

// TODO optional value? (test)
export function isFunction(value?: unknown): boolean {
  return typeof value === 'function';
}

export function isUndefined(value: unknown): boolean {
  return typeof value === 'undefined';
}
