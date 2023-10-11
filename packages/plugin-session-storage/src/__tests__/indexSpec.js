import { createMerkurWidget } from '@merkur/core';
import { sessionStoragePlugin, setKeyPrefix } from '../index';

describe('Session Storage plugin', () => {
  const sessionStorage = {
    _storage: new Map(),
    setItem: jest.fn((key, value) => sessionStorage._storage.set(key, value)),
    getItem: jest.fn((key) => sessionStorage._storage.get(key) || null),
    removeItem: jest.fn((key) => sessionStorage._storage.delete(key)),
    clear: jest.fn(() => sessionStorage._storage.clear()),
  };
  const widgetProperties = {
    $plugins: [sessionStoragePlugin],
    name: 'my-widget',
    version: '1.0.0',
    props: {
      param: 1,
      containerSelector: '.container',
    },
    assets: [
      {
        type: 'script',
        source: 'http://www.example.com/static/1.0.0/widget.js',
      },
    ],
  };
  const customKeyPrefixWord = 2023;
  const keyPrefix = `__widget__${widgetProperties.name}__${widgetProperties.version}__${customKeyPrefixWord}__`;
  const keyPrefixDefault = `__widget__${widgetProperties.name}__${widgetProperties.version}__`;
  let widget;
  let session;

  beforeEach(async () => {
    widget = await createMerkurWidget(widgetProperties);
    session = widget.sessionStorage;
    setKeyPrefix(widget, [customKeyPrefixWord]);

    if ('sessionStorage' in widget.$dependencies) {
      widget.$dependencies.sessionStorage = sessionStorage;
    }

    jest.useFakeTimers();
  });

  afterEach(() => {
    sessionStorage.clear();
    jest.useRealTimers();
  });

  it('should create empty widget', async () => {
    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {
          "sessionStorage": {
            "_storage": Map {},
            "clear": [MockFunction],
            "getItem": [MockFunction],
            "removeItem": [MockFunction],
            "setItem": [MockFunction],
          },
        },
        "$external": {
          "sessionStorage": {
            "_storage": Map {},
            "clear": [MockFunction],
            "getItem": [MockFunction],
            "removeItem": [MockFunction],
            "setItem": [MockFunction],
          },
        },
        "$in": {
          "sessionStorage": {
            "keyPrefix": "__widget__my-widget__1.0.0__2023__",
          },
        },
        "$plugins": [
          {
            "create": [Function],
            "setup": [Function],
          },
        ],
        "create": [Function],
        "name": "my-widget",
        "sessionStorage": {
          "delete": [Function],
          "get": [Function],
          "set": [Function],
        },
        "setup": [Function],
        "version": "1.0.0",
      }
    `);
  });

  it(`should prefix an item key with ${keyPrefix} in sessionStorage`, () => {
    session.set('item1', 1);

    expect(sessionStorage.getItem('item1')).toBeNull();
    expect(sessionStorage.getItem(`${keyPrefix}item1`)).not.toBeNull();
  });

  it(`should prefix an item key with ${keyPrefixDefault} in sessionStorage`, () => {
    setKeyPrefix(widget);
    session.set('item1', 1);

    expect(sessionStorage.getItem('item1')).toBeNull();
    expect(sessionStorage.getItem(`${keyPrefixDefault}item1`)).not.toBeNull();
  });

  it('should set and get items', () => {
    session.set('item1', 1);

    expect(session.get('item1')).toBe(1);

    session.set('item2', 'test');

    expect(session.get('item2')).toBe('test');

    session.set('item3', false);

    expect(session.get('item3')).toBe(false);

    const obj = { testedProp: 'testedValue' };
    session.set('item4', obj);

    expect(session.get('item4')).toStrictEqual(obj);

    const arr = [0, 'val', true, {}];
    session.set('item5', arr);

    expect(session.get('item5')).toStrictEqual(arr);
  });

  it('should have (not) an item', () => {
    expect(session.get('item1')).toBeUndefined();

    session.set('item1', 1);

    expect(session.get('item1')).toBeDefined();
  });

  it('should delete selected items only', () => {
    session.set('item1', 1);
    session.set('item2', 'test');
    session.set('item3', false);
    session.delete('item1');
    session.delete('item3');

    expect(session.get('item1')).toBeUndefined();
    expect(session.get('item2')).toBeDefined();
    expect(session.get('item3')).toBeUndefined();
  });

  it('should throw an error if an item in storage is not a valid JSON', () => {
    sessionStorage.setItem(`${keyPrefix}item1`, 'invalid JSON');

    expect(() => {
      session.get('item1');
    }).toThrow();
  });

  it('should return null if sessionStorage is not available in get()', () => {
    widget.$dependencies.sessionStorage = undefined;
    session.set('item1', 1);

    expect(session.get('item1')).toBeNull();
  });

  it.each(['delete', 'set'])(
    'should return false if sessionStorage is not available in %s()',
    (method) => {
      widget.$dependencies.sessionStorage = undefined;
      const returnValue = session[method]('item1', 1);

      expect(returnValue).toBeFalsy();
    },
  );

  it('should return false and log an error if sessionStorage.setItem() throws an error', () => {
    widget.$dependencies.sessionStorage.setItem.mockImplementationOnce(() => {
      throw new Error('setItem error');
    });
    jest.spyOn(console, 'error').mockImplementation();

    expect(console.error).not.toHaveBeenCalled();

    const returnValue = session.set('item1', 1);

    expect(returnValue).toBeFalsy();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should delete an item after ttl', () => {
    const ttl = 60;
    const value = 1;
    session.set('item1', value, { ttl });

    jest.advanceTimersByTime(ttl);
    expect(session.get('item1')).toBe(value);

    jest.advanceTimersByTime(1);
    expect(session.get('item1')).toBeUndefined();
  });

  it.each([-1, 0])('should not not set an item when ttl is %p', (ttl) => {
    expect(session.get('item1')).toBeUndefined();

    session.set('item1', 1, { ttl });

    expect(session.get('item1')).toBeUndefined();
  });

  it.each([-1, 0])('should delete an item when ttl is %p', (ttl) => {
    const value = 1;
    session.set('item1', value);

    expect(session.get('item1')).toBe(value);

    session.set('item1', value, { ttl });

    expect(session.get('item1')).toBeUndefined();
  });
});
