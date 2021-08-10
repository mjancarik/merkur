let _isES9Supported;
let _isES11Supported;

function isES9Supported() {
  if (_isES9Supported === undefined) {
    _isES9Supported =
      exported.test(
        'return (() => { const o = { t: 1 }; return { ...o }; })() && (async () => ({}))()'
      ) && !!Object.values;
  }

  return _isES9Supported;
}

function isES11Supported() {
  if (_isES11Supported === undefined) {
    _isES11Supported =
      exported.test(
        'return (() => { const o = { t: { q: true } }; return o?.t?.q && (o?.a?.q ?? true); })()'
      ) &&
      exported.test('return typeof Promise.allSettled === "function"') &&
      exported.test('return typeof globalThis !== "undefined"') &&
      exported.test('return typeof 9007199254740991n === "bigint"');
  }

  return _isES11Supported;
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
  test,
};

export default exported;
