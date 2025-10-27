let _isES9Supported;
let _isES11Supported;
let _isES13Supported;
let _isES15Supported;

function isES9Supported() {
  if (_isES9Supported === undefined) {
    _isES9Supported =
      exported.test(
        'return (() => { const o = { t: 1 }; return { ...o }; })() && (async () => ({}))()',
      ) && !!Object.values;
  }

  return _isES9Supported;
}

function isES11Supported() {
  if (_isES11Supported === undefined) {
    _isES11Supported =
      exported.test(
        'return (() => { const o = { t: { q: true } }; return o?.t?.q && (o?.a?.q ?? true); })()',
      ) &&
      exported.test('return typeof Promise.allSettled === "function"') &&
      exported.test('return typeof globalThis !== "undefined"') &&
      exported.test('return typeof 9007199254740991n === "bigint"');
  }

  return _isES11Supported;
}

function isES13Supported() {
  if (_isES13Supported === undefined) {
    _isES13Supported =
      exported.test('return [1,1].findLast(e => e === 1)') &&
      exported.test('return Object.hasOwn({a:1}, "a")');
  }

  return _isES13Supported;
}

function isES15Supported() {
  if (_isES15Supported === undefined) {
    _isES15Supported =
      exported.test('return typeof Promise.withResolvers === "function"') &&
      exported.test('return typeof Object.groupBy === "function"');
  }

  return _isES15Supported;
}

function test(snippet) {
  try {
    const fn = new Function(snippet);
    const result = fn();

    return !!result;
  } catch (e) {
    return false;
  }
}

const exported = {
  isES9Supported,
  isES11Supported,
  isES13Supported,
  isES15Supported,
  test,
};

export default exported;
