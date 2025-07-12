import { deepMerge, registerCustomElement } from '../index';

describe('Merkur integration custom element', () => {
  describe('deepMerge method', () => {
    it('should merge source object to target with target modification', () => {
      let target = {
        a: 1,
        b: {
          c: '2',
          d: ['3', '4'],
        },
      };
      let source = {
        e: '5',
        b: {
          f: '6',
          d: ['7'],
        },
      };
      expect(deepMerge(target, source)).toEqual({
        a: 1,
        e: '5',
        b: {
          c: '2',
          f: '6',
          d: ['3', '4', '7'],
        },
      });

      // let clonedTarget = deepMerge({}, target);
      // let deepTarget = deepMerge({}, target);
      // deepTarget.a = 2;
      // expect(target.a !== deepTarget.a).toEqual(true);
    });
  });

  describe('registerCustomElement method', () => {
    const callbacks = {
      constructor: jest.fn(),
      connectedCallback: jest.fn(),
      disconnectedCallback: jest.fn(),
      adoptedCallback: jest.fn(),
      attributeChangedCallback: jest.fn(),
    };

    const widgetDefinition = {
      name: 'merkur-test',
      version: '1.0.0',
      assets: [],
      props: {
        name: 'John',
        multiName: ['John', 'Doe'],
        config: {
          key: 'value',
        },
      },
      createWidget: () => {
        return widgetDefinition;
      },

      setProps: jest.fn(),
      mount: jest.fn(),
      unmount: jest.fn(),
      update: jest.fn(),

      attributeChangedCallback: jest.fn(),
    };

    const observedAttributes = ['name'];
    const attributesParser = {
      config: (value) => {
        try {
          return JSON.parse(value);
        } catch (e) {
          return null;
        }
      },
    };

    let WidgetElement = registerCustomElement({
      widgetDefinition,
      observedAttributes,
      attributesParser,
      callbacks,
    });
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call constructor, connectedCallback and mount methods after widget is created', async () => {
      const widgetElement = new WidgetElement();
      widgetElement.connectedCallback(); // simulate browser

      await widgetElement._widgetPromise;

      expect(widgetElement._widget.props.name).toBe('John');
      expect(widgetDefinition.mount).toHaveBeenCalledTimes(1);
      expect(callbacks.constructor).toHaveBeenCalledTimes(1);
      expect(callbacks.connectedCallback).toHaveBeenCalledTimes(1);
    });

    it('should call attributeChangedCallback when attributes change', async () => {
      const widgetElement = new WidgetElement();
      widgetElement.connectedCallback(); // simulate browser

      await widgetElement._widgetPromise;

      await widgetElement.attributeChangedCallback('name', 'John', 'Jane');
      await widgetElement.attributeChangedCallback(
        'multi-name',
        'John Doe',
        'Jane Doe',
      );
      await widgetElement.attributeChangedCallback(
        'config',
        '{"key": "value"}',
        '{"key": "newValue"}',
      );

      expect(callbacks.attributeChangedCallback).toHaveBeenCalledTimes(3);
      expect(widgetDefinition.attributeChangedCallback).toHaveBeenCalledTimes(
        3,
      );
      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        name: 'Jane',
      });
      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        multiName: 'Jane Doe',
      });
      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        config: { key: 'newValue' },
      });
    });
  });
});
