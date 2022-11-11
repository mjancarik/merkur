import testScript from '../testScript';

describe('Merkur component', () => {
  describe('isES11Supported() function', () => {
    beforeEach(() => {
      jest.spyOn(testScript, 'test');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true', () => {
      const isES11Supported = testScript.isES11Supported();

      expect(isES11Supported).toEqual(true);
      expect(testScript.test).toHaveBeenCalledTimes(4);
    });

    it('should return true but not test again', () => {
      const isES11Supported = testScript.isES11Supported();

      expect(isES11Supported).toEqual(true);
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
