let _isES9Supported;

function isES9Supported() {
  if (_isES9Supported === undefined) {
    _isES9Supported =
      exported.test('return (async () => ({}))()') && !!Object.values;
  }

  return _isES9Supported;
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
  test,
};

export default exported;
