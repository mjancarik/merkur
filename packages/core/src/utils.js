export function setDefaultValueForUndefined(object, keys, value = {}) {
  let objectClone = { ...object };

  keys.forEach((key) => {
    objectClone[key] = objectClone[key] || value;
  });

  return objectClone;
}

export function isFunction(value) {
  return typeof value === 'function';
}

export function isUndefined(value) {
  return typeof value === 'undefined';
}
