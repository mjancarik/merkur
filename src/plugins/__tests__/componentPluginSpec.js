import { createCustomWidget } from '../../index';
import componentPlugin from '../component';

describe('createWidget method with component plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createCustomWidget({
      $plugins: [componentPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1
      },
      assets: [
        {
          type: 'script',
          source: 'http://www.example.com/static/1.0.0/widget.js'
        }
      ]
    });

    expect(widget).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {},
        "$external": Object {},
        "$in": Object {
          "component": Object {
            "isMounted": false,
            "lifeCycle": Object {
              "bootstrap": undefined,
              "info": undefined,
              "load": undefined,
              "mount": undefined,
              "unmount": undefined,
              "update": undefined,
            },
          },
        },
        "$plugins": Array [
          Object {
            "create": [Function],
            "setup": [Function],
          },
        ],
        "$setEmptyObjectForUndefined": [Function],
        "assets": Array [
          Object {
            "source": "http://www.example.com/static/1.0.0/widget.js",
            "type": "script",
          },
        ],
        "bootstrap": [Function],
        "create": [Function],
        "info": [Function],
        "load": [Function],
        "mount": [Function],
        "name": "my-widget",
        "props": Object {
          "param": 1,
        },
        "setProps": [Function],
        "setState": [Function],
        "setup": [Function],
        "state": Object {},
        "unmount": [Function],
        "update": [Function],
        "version": "1.0.0",
      }
    `);
  });

  it('should defined base information about component', async () => {
    const widget = await createCustomWidget({
      $plugins: [componentPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1
      },
      assets: [
        {
          type: 'script',
          source: 'http://www.example.com/static/1.0.0/widget.js'
        }
      ]
    });

    const info = await widget.info();

    expect(info).toMatchInlineSnapshot(`
      Object {
        "assets": Array [
          Object {
            "source": "http://www.example.com/static/1.0.0/widget.js",
            "type": "script",
          },
        ],
        "name": "my-widget",
        "props": Object {
          "param": 1,
        },
        "state": Object {},
        "version": "1.0.0",
      }
    `);
  });
});

describe('component plugin API', () => {
  let widget = null;
  let mocks = null;

  beforeEach(async () => {
    mocks = {
      bootstrap: jest.fn(),
      unmount: jest.fn(),
      update: jest.fn()
    };

    widget = await createCustomWidget({
      ...mocks,
      $plugins: [componentPlugin],
      load(widget) {
        return {
          name: widget.props.name || 'unkonwn'
        };
      },
      mount(widget) {
        return `<div>Hello ${widget.state.name}</div>`;
      }
    });
  });

  describe('mount method', () => {
    it('should call plugin bootstrap method', async () => {
      await widget.mount();

      expect(mocks.bootstrap).toHaveBeenCalledWith(widget);
    });

    it('should call plugin load method', async () => {
      widget.load = jest.fn();

      await widget.mount();

      expect(widget.load).toHaveBeenCalled();
    });

    it('should create widget state', async () => {
      await widget.mount();

      expect(widget.state).toMatchInlineSnapshot(`
        Object {
          "name": "unkonwn",
        }
      `);
    });

    it('should create widget state with defined widget props', async () => {
      await widget.setProps({ name: 'Widget' });

      await widget.mount();

      expect(widget.state).toMatchInlineSnapshot(`
        Object {
          "name": "Widget",
        }
      `);
    });

    it('should return html', async () => {
      const html = await widget.mount();

      expect(html).toMatchInlineSnapshot(`"<div>Hello unkonwn</div>"`);
    });
  });

  describe('load method', () => {
    it('should call load method for empty state', async () => {
      widget.load = jest.fn();

      await widget.load();

      expect(widget.load).toHaveBeenCalled();
    });

    it('should not call load method for defined state', async () => {
      widget.$in.component.lifeCycle.load = jest.fn();
      widget.state = {
        key: 'value'
      };

      await widget.load();

      expect(widget.$in.component.lifeCycle.load).not.toHaveBeenCalled();
    });
  });

  describe('setState method', () => {
    it('should set new state to widget', async () => {
      await widget.mount();
      await widget.setState({ name: 'black' });

      expect(widget.state.name).toEqual('black');
    });

    it('should call life cycle update method', async () => {
      widget.update = jest.fn();

      await widget.mount();
      await widget.setState({ name: 'black' });

      expect(widget.update).toHaveBeenCalled();
    });
  });

  describe('setProps method', () => {
    it('should set new widget props', async () => {
      await widget.mount();
      await widget.setProps({ name: 'black' });

      expect(widget.props.name).toEqual('black');
    });

    it('should call life cycle update method', async () => {
      widget.update = jest.fn();

      await widget.mount();
      await widget.setProps({ name: 'black' });

      expect(widget.update).toHaveBeenCalled();
    });
  });

  describe('unmount method', () => {
    it('should call plugin unmount method', async () => {
      await widget.unmount();

      expect(mocks.unmount).toHaveBeenCalledWith(widget);
    });
  });

  describe('update method', () => {
    it('should call plugin update method for mounted component', async () => {
      await widget.mount();

      await widget.update();

      expect(mocks.update).toHaveBeenCalledWith(widget);
    });

    it('should not call plugin update method for unmounted component', async () => {
      await widget.update();

      expect(mocks.update).not.toHaveBeenCalledWith(widget);
    });
  });
});
