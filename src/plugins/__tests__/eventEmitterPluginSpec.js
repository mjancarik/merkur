import { createCustomWidget } from '../../index';
import eventEmitterPlugin from '../eventEmitter';

describe('createWidget method with component plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createCustomWidget({
      $plugins: [eventEmitterPlugin],
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
        "$in": Object {
          "eventEmitter": Object {
            "event": Object {},
          },
        },
        "$plugins": Array [
          Object {
            "setup": [Function],
          },
        ],
        "$setEmptyObjectForUndefined": [Function],
        "create": [Function],
        "emit": [Function],
        "off": [Function],
        "on": [Function],
        "setup": [Function],
      }
    `);
  });
});

describe('event emitter plugin API', () => {
  let widget = null;
  let mocks = null;

  beforeEach(async () => {
    widget = await createCustomWidget({
      ...mocks,
      $plugins: [eventEmitterPlugin]
    });
  });

  describe('on method', () => {
    it('should add listener', async () => {
      const mock = jest.fn();

      widget.on('listener', mock);

      expect(widget.$in.eventEmitter.event.listener).toBeDefined();
      expect(widget.$in.eventEmitter.event.listener.length).toEqual(1);
    });
  });

  describe('emit method', () => {
    it('should run listener', async () => {
      const mock = jest.fn();

      widget.on('listener', mock);

      widget.emit('listener', 1);

      expect(mock).toHaveBeenCalledWith(widget, 1);
    });
  });

  describe('off method', () => {
    it('should remove listener', async () => {
      const mock = jest.fn();

      widget.on('listener', mock);
      widget.off('listener', mock);

      expect(widget.$in.eventEmitter.event.listener.length).toEqual(0);
    });
  });
});
