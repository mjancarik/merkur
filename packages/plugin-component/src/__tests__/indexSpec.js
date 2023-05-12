import { createMerkurWidget } from '@merkur/core';
import { componentPlugin } from '../index';

describe('createWidget method with component plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [componentPlugin],
      name: 'my-widget',
      version: '1.0.0',
      containerSelector: '.container',
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
            "suspendedTasks": [],
          },
        },
        "$plugins": [
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
        "containerSelector": ".container",
        "create": [Function],
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
        "state": {},
        "unmount": [Function],
        "update": [Function],
        "version": "1.0.0",
      }
    `);
  });

  it('should defined base information about component', async () => {
    const widget = await createMerkurWidget({
      $plugins: [componentPlugin],
      name: 'my-widget',
      version: '1.0.0',
      containerSelector: '.container',
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

    const info = await widget.info();

    expect(info).toMatchInlineSnapshot(`
      {
        "assets": [
          {
            "source": "http://www.example.com/static/1.0.0/widget.js",
            "type": "script",
          },
        ],
        "containerSelector": ".container",
        "name": "my-widget",
        "props": {
          "param": 1,
        },
        "state": {},
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
      update: jest.fn(),
    };

    widget = await createMerkurWidget({
      ...mocks,
      $plugins: [componentPlugin],
      load(widget) {
        return {
          name: widget.props.name || 'unkonwn',
        };
      },
      mount(widget) {
        return `<div>Hello ${widget.state.name}</div>`;
      },
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
        {
          "name": "unkonwn",
        }
      `);
    });

    it('should create widget state with defined widget props', async () => {
      await widget.setProps({ name: 'Widget' });

      await widget.mount();

      expect(widget.state).toMatchInlineSnapshot(`
        {
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
        key: 'value',
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

    it('should allow setting new widget state using fn callback', async () => {
      await widget.mount();
      await widget.setState({ name: 'black' });

      let setState = jest.fn((state) => ({ name: state.name + ' surname' }));
      await widget.setState(setState);

      expect(widget.state.name).toEqual('black surname');
      expect(setState).toHaveBeenCalledWith({ name: 'black' });
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

    it('should allow setting new widget props using fn callback', async () => {
      await widget.mount();
      await widget.setProps({ name: 'black' });

      let setProps = jest.fn((props) => ({ name: props.name + ' surname' }));
      await widget.setProps(setProps);

      expect(widget.props.name).toEqual('black surname');
      expect(setProps).toHaveBeenCalledWith({ name: 'black' });
    });

    it('should call life cycle update method', async () => {
      widget.update = jest.fn();

      await widget.mount();
      await widget.setProps({ name: 'black' });

      expect(widget.update).toHaveBeenCalled();
    });

    it('should call life cycle load method', async () => {
      widget.load = jest.fn();

      await widget.mount();
      await widget.setProps({ name: 'black' });

      expect(widget.load).toHaveBeenCalled();
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
