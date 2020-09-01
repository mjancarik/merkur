import testScript from '../testScript';

describe('Merkur component', () => {
  describe('isES9Supported() function', () => {
    it('should return true', () => {
      spyOn(testScript, 'test').and.callThrough();

      const isES9Supported = testScript.isES9Supported();

      expect(isES9Supported).toEqual(true);
      expect(testScript.test).toHaveBeenCalledTimes(1);
    });

    it('should return true but not test again', () => {
      spyOn(testScript, 'test').and.callThrough();

      const isES9Supported = testScript.isES9Supported();

      expect(isES9Supported).toEqual(true);
      expect(testScript.test).toHaveBeenCalledTimes(0);
    });
  });

  describe('test() function', () => {
    it('should return true', () => {
      expect(testScript.test('var a;')).toEqual(true);
    });

    it('should return false', () => {
      expect(testScript.test('(function () {foo();})()')).toEqual(false);
    });
  });
});
