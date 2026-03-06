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
      "loadingPromise": null,
      "resolvedViews": Map {},
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
  "slot": {},
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

    it('should set loadingPromise to null after load completes', async () => {
      await widget.load();

      expect(widget.$in.component.loadingPromise).toBeNull();
    });

    it('should apply setState calls that were made during load', async () => {
      let resolveLoad;
      widget.$in.component.lifeCycle.load = jest.fn(
        () =>
          new Promise((resolve) => {
            resolveLoad = resolve;
          }),
      );

      const loadPromise = widget.load();

      expect(widget.$in.component.loadingPromise).not.toBeNull();

      const setStatePromise = widget.setState({ name: 'suspended' });

      resolveLoad({ name: 'fromLoad' });
      await loadPromise;
      await setStatePromise;

      expect(widget.state.name).toEqual('suspended');
      expect(widget.$in.component.loadingPromise).toBeNull();
    });

    it('should apply setState calls in correct order after load', async () => {
      let resolveLoad;
      widget.$in.component.lifeCycle.load = jest.fn(
        () =>
          new Promise((resolve) => {
            resolveLoad = resolve;
          }),
      );

      const loadPromise = widget.load();

      const p1 = widget.setState({ name: 'first' });
      const p2 = widget.setState((state) => ({ name: state.name + '-second' }));

      resolveLoad({ name: 'fromLoad' });
      await loadPromise;
      await Promise.all([p1, p2]);

      expect(widget.state.name).toEqual('first-second');
    });

    it('should not replay setState calls on subsequent load', async () => {
      let resolveLoad;
      widget.$in.component.lifeCycle.load = jest.fn(
        () =>
          new Promise((resolve) => {
            resolveLoad = resolve;
          }),
      );

      const loadPromise = widget.load();
      const setStatePromise = widget.setState({ name: 'suspended' });

      resolveLoad({ name: 'fromLoad' });
      await loadPromise;
      await setStatePromise;

      expect(widget.$in.component.loadingPromise).toBeNull();

      widget.$in.component.lifeCycle.load = jest.fn(() => ({
        name: 'fromSecondLoad',
      }));
      widget.$in.component.isMounted = true;
      const updateSpy = jest.fn();
      widget.$in.component.lifeCycle.update = updateSpy;

      await widget.load();

      // update should not be called from a replayed setState
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should use the latest load result when load is called twice concurrently', async () => {
      let resolveLoad1;
      let resolveLoad2;
      let callCount = 0;

      widget.$in.component.lifeCycle.load = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return new Promise((resolve) => {
            resolveLoad1 = resolve;
          });
        } else {
          return new Promise((resolve) => {
            resolveLoad2 = resolve;
          });
        }
      });

      const load1 = widget.load();
      const load2 = widget.load();

      // resolve second load first with newer state
      resolveLoad2({ name: 'second' });
      await load2;

      // resolve first load with older state - should NOT overwrite since load2 is the latest
      resolveLoad1({ name: 'first' });
      await load1;

      expect(widget.state.name).toEqual('second');
      // loadingPromise should be null after both complete
      expect(widget.$in.component.loadingPromise).toBeNull();
    });

    it('should await latest loadingPromise when setState is called during two concurrent loads', async () => {
      let resolveLoad1;
      let resolveLoad2;
      let callCount = 0;

      widget.$in.component.lifeCycle.load = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return new Promise((resolve) => {
            resolveLoad1 = resolve;
          });
        } else {
          return new Promise((resolve) => {
            resolveLoad2 = resolve;
          });
        }
      });

      const load1 = widget.load();
      const load2 = widget.load();

      // setState during both loads – should wait for loadingPromise (load2)
      const setStatePromise = widget.setState({ name: 'concurrent' });

      resolveLoad2({ name: 'second' });
      await load2;

      resolveLoad1({ name: 'first' });
      await load1;

      await setStatePromise;

      expect(widget.state.name).toEqual('concurrent');
      expect(widget.$in.component.loadingPromise).toBeNull();
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
