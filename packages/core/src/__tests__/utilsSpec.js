import { isFunction, isUndefined, setDefaultValueForUndefined } from '../utils';

describe('utils function', () => {
  describe('isFunction', () => {
    it('should return true for passing function as argument', () => {
      expect(isFunction(() => {})).toBeTruthy();
    });

    it('should return false for passing undefined as argument', () => {
      expect(isFunction()).toBeFalsy();
    });
  });

  describe('isUndefined', () => {
    it('should return true for passing undefined as argument', () => {
      expect(isUndefined(undefined)).toBeTruthy();
    });

    it('should return false for passing object as argument', () => {
      expect(isUndefined({})).toBeFalsy();
    });
  });

  describe('setDefaultValueForUndefined', () => {
    it('should defined empty object for "a" and "b" keys', () => {
      expect(setDefaultValueForUndefined({}, ['a', 'b'], {}))
        .toMatchInlineSnapshot(`
        Object {
          "a": Object {},
          "b": Object {},
        }
      `);
    });

    it('should keep original object unmodified', () => {
      const original = {};

      setDefaultValueForUndefined(original, ['a', 'b'], {});

      expect(original).toEqual({});
    });
  });
});
