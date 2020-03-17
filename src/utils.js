export function setDefaultValueForUndefined(object, keys, value = {}) {
  keys.forEach(key => {
    object[key] = object[key] || value;
  });
}
