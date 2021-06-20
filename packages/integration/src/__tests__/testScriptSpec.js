import testScript from '../testScript';

describe('Merkur component', () => {
  describe('isES9Supported() function', () => {
    beforeEach(() => {
      jest.spyOn(testScript, 'test');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true', () => {
      const isES9Supported = testScript.isES9Supported();

      expect(isES9Supported).toEqual(true);
      expect(testScript.test).toHaveBeenCalledTimes(1);
    });

    it('should return true but not test again', () => {
      const isES9Supported = testScript.isES9Supported();

      expect(isES9Supported).toEqual(true);
      expect(testScript.test).toHaveBeenCalledTimes(0);
    });
  });

  describe('test() function', () => {
    it('should return true', () => {
      expect(testScript.test('return typeof window !== "undefined"')).toEqual(
        true
      );
    });

    it('should return false', () => {
      expect(testScript.test('return (function () {foo();})()')).toEqual(false);
    });
  });
});
