import {
  assignMissingKeys,
  isFunction,
  isUndefined,
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  hookMethod,
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
        {
          "a": {},
          "b": {},
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

  describe('hookMethod', () => {
    let widget = null;

    beforeEach(() => {
      widget = {
        a: function (widget, a) {
          return a;
        },
        b: function (widget, b) {
          return b;
        },
        c: {
          e: function (widget, e) {
            return e;
          },
        },
        d: 'string',
      };
    });

    it('hook defined method on widget', () => {
      hookMethod(
        widget,
        'a',
        (widget, originalMethod, ...rest) => 'a' + originalMethod(...rest),
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
        (widget, originalMethod, ...rest) => 'a' + originalMethod(...rest),
      );
      hookMethod(
        widget,
        'a',
        (widget, originalMethod, ...rest) => 'b' + originalMethod(...rest),
      );
      bindWidgetToFunctions(widget);

      expect(widget.a('a')).toEqual('baa');
      expect(widget.b('b')).toEqual('b');
      expect(widget.d).toEqual('string');
    });

    it('hook deep defined method on widget', () => {
      hookMethod(
        widget,
        'c.e',
        (widget, originalMethod, ...rest) => 'c.e' + originalMethod(...rest),
      );
      bindWidgetToFunctions(widget);
      bindWidgetToFunctions(widget.c);

      expect(widget.a('a')).toEqual('a');
      expect(widget.b('b')).toEqual('b');
      expect(widget.c.e('e')).toEqual('c.ee');
      expect(widget.d).toEqual('string');
    });

    it('hook throw error for bad path', () => {
      expect.assertions(1);
      try {
        hookMethod(widget, 'x.y.z', (widget, originalMethod, ...rest) =>
          originalMethod(...rest),
        );
      } catch (e) {
        expect(e.message).toMatchInlineSnapshot(
          `"Defined path 'x.y.z' is incorrect. Check your widget structure."`,
        );
      }
    });

    it('hook throw error for path not resolving as method', () => {
      expect.assertions(1);
      try {
        hookMethod(widget, 'd', (widget, originalMethod, ...rest) =>
          originalMethod(...rest),
        );
      } catch (e) {
        expect(e.message).toMatchInlineSnapshot(
          `"Defined path 'd' is incorrect. Check your widget structure."`,
        );
      }
    });
  });

  describe('assignMissingKeys(target, ...sources)', () => {
    let widget;

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

    it.each([
      null,
      undefined,
      0,
      42,
      'string',
      { e: 1, f: function () {} },
      function () {},
      false,
      true,
      [],
    ])(
      'should return the same result as Object.assign(widget, %p)',
      (source) => {
        const assignResult = { ...widget };
        Object.assign(assignResult, source);
        const result = assignMissingKeys(widget, source);

        expect(result).toEqual(widget);
        expect(result).toEqual(assignResult);
      }
    );

    it('should add only e, f, g keys once', () => {
      const source1 = {
        a: 42,
        f: function (widget, f) {
          return f;
        },
      };
      const source2 = {
        c: function (widget, c) {
          return c;
        },
        e: { prop: 1 },
        f: 'string',
        g: [],
      };
      const result = assignMissingKeys(widget, source1, source2);

      expect(result).toEqual({
        ...widget,
        e: source2.e,
        f: source1.f,
        g: source2.g,
      });
    });
  });
});
