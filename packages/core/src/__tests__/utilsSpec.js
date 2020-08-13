import {
  isFunction,
  isUndefined,
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  hook,
} from '../utils';

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

  describe('bindWidgetToFunctions', () => {
    it('should bind widget to all widget methods', () => {
      let widget = {
        a: function (widget, a) {
          return a;
        },
        b: function (widget, b) {
          return b;
        },
        c: {},
        d: 'string',
      };

      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('a');
      expect(widget.a('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });
  });

  describe('hook', () => {
    let widget = null;

    beforeEach(() => {
      widget = {
        a: function (widget, a) {
          return a;
        },
        b: function (widget, b) {
          return b;
        },
        c: {},
        d: 'string',
      };
    });

    it('hook defined method on widget', () => {
      hook(
        widget,
        'a',
        (widget, originalMethod, ...rest) => 'a' + originalMethod(...rest)
      );
      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('aa');
      expect(widget.b('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });

    it('hook defined method on widget multiple times', () => {
      hook(
        widget,
        'a',
        (widget, originalMethod, ...rest) => 'a' + originalMethod(...rest)
      );
      hook(
        widget,
        'a',
        (widget, originalMethod, ...rest) => 'b' + originalMethod(...rest)
      );
      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('baa');
      expect(widget.b('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });
  });
});
