import { createMerkurWidget } from '@merkur/core';
import { errorPlugin, renderContent, setErrorInfo } from '../index';
import { componentPlugin } from '@merkur/plugin-component';

describe('createWidget method with error plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [componentPlugin, errorPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1,
      },
      assets: [
        {
          type: 'script',
          source: 'http://www.example.com/static/1.0.0/widget.js',
        },
      ],
    });

    expect(widget).toMatchInlineSnapshot(`
{
  "$dependencies": {},
  "$external": {},
  "$in": {
    "component": {
      "isHydrated": false,
      "isMounted": false,
      "lifeCycle": {
        "bootstrap": undefined,
        "info": undefined,
        "load": undefined,
        "mount": undefined,
        "unmount": undefined,
        "update": undefined,
      },
      "resolvedViews": Map {},
      "suspendedTasks": [],
    },
  },
  "$plugins": [
    {
      "create": [Function],
      "setup": [Function],
    },
    {
      "create": [Function],
      "setup": [Function],
    },
  ],
  "assets": [
    {
      "source": "http://www.example.com/static/1.0.0/widget.js",
      "type": "script",
    },
  ],
  "bootstrap": [Function],
  "containerSelector": null,
  "create": [Function],
  "error": {
    "message": null,
    "status": null,
  },
  "info": [Function],
  "load": [Function],
  "mount": [Function],
  "name": "my-widget",
  "props": {
    "param": 1,
  },
  "setProps": [Function],
  "setState": [Function],
  "setup": [Function],
  "slot": {},
  "state": {},
  "unmount": [Function],
  "update": [Function],
  "version": "1.0.0",
}
`);
  });
});

describe('renderContent', () => {
  it('should call the saved original method', async () => {
    const methodMock = jest.fn(() => {
      return Promise.resolve('');
    });

    const emitMock = jest.fn();
    const widgetMock = {
      error: {},
      emit: emitMock,
    };

    const renderProperties = ['value'];

    renderContent(widgetMock, methodMock, renderProperties);

    expect(methodMock).toBeCalled();
  });
});

describe('setErrorInfo', () => {
  const error = new Error('ERROR MESSAGE');
  error.status = 123;

  let widgetMock;

  beforeEach(() => {
    widgetMock = {
      error: {},
    };
  });

  it('should set error info on widget', () => {
    const expectedObject = {
      message: 'ERROR MESSAGE',
      status: 123,
    };

    try {
      throw error;
    } catch (err) {
      setErrorInfo(widgetMock, err);

      expect(widgetMock.error).toMatchObject(expectedObject);
    }
  });
});
