let _isES9Supported;

function isES9Supported() {
  if (_isES9Supported === undefined) {
    _isES9Supported = exported.test('(async () => ({}))()') && !!Object.values;
  }

  return _isES9Supported;
}

function test(snippet) {
  try {
    const fn = new Function(snippet);
    fn();
    return true;
  } catch (e) {
    return false;
  }
}

const exported = {
  isES9Supported,
  test,
};

export default exported;
