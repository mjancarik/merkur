import {
  isFunction,
  isUndefined,
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  hookMethod,
} from '../utils';

describe('utils function', () => {
  describe('isFunction', () => {
    it('should return true for passing function as argument', () => {
      expect(isFunction(jest.fn())).toBeTruthy();
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
      const widget = {
        name: 'widget',
        version: '0.0.1',
        a: function (_widget, a?) {
          return a;
        },
        b: function (_widget, b) {
          return b;
        },
        c: {},
        d: 'string',
        $in: {},
        $external: {},
        $dependencies: {},
        $plugins: [],
        setup: async (widget) => widget,
        create: async (widget) => widget,
      };

      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('a');
      expect(widget.a('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });
  });

  describe('hookMethod', () => {
    let widget: any = null;

    beforeEach(() => {
      widget = {
        a: function (_widget, a) {
          return a;
        },
        b: function (_widget, b) {
          return b;
        },
        c: {},
        d: 'string',
      };
    });

    it('hook defined method on widget', () => {
      hookMethod(
        widget,
        'a',
        (_widget, originalMethod, ...rest) => 'a' + originalMethod(...rest)
      );
      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('aa');
      expect(widget.b('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });

    it('hook defined method on widget multiple times', () => {
      hookMethod(
        widget,
        'a',
        (_widget, originalMethod, ...rest) => 'a' + originalMethod(...rest)
      );
      hookMethod(
        widget,
        'a',
        (_widget, originalMethod, ...rest) => 'b' + originalMethod(...rest)
      );
      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('baa');
      expect(widget.b('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });
  });
});
