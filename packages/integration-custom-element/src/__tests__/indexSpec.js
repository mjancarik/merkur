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

      // Wait for batch timeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callbacks.attributeChangedCallback).toHaveBeenCalledTimes(1);
      expect(widgetDefinition.attributeChangedCallback).toHaveBeenCalledTimes(
        1,
      );
      expect(widgetDefinition.setProps).toHaveBeenCalledTimes(1);
      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        name: 'Jane',
      });
    });

    it('should NOT call setProps during initialization for default attribute values', async () => {
      const widgetElement = new WidgetElement();

      // Simulate browser calling attributeChangedCallback during initialization
      await widgetElement.attributeChangedCallback('name', null, 'John');

      await widgetElement._widgetPromise;

      // setProps should not be called for default values during initialization
      expect(widgetDefinition.setProps).not.toHaveBeenCalled();

      // But widget props should still be set via _setDefaultProps
      expect(widgetElement._widget.props.name).toBe('John');
    });

    it('should batch multiple synchronous attribute changes into single setProps call', async () => {
      const widgetElement = new WidgetElement();
      widgetElement.connectedCallback(); // simulate browser

      await widgetElement._widgetPromise;

      jest.clearAllMocks();

      // Simulate multiple rapid attribute changes
      widgetElement.attributeChangedCallback('name', 'John', 'Jane');
      widgetElement.attributeChangedCallback(
        'multi-name',
        'John Doe',
        'Jane Doe',
      );
      widgetElement.attributeChangedCallback(
        'config',
        '{"key": "value"}',
        '{"key": "newValue"}',
      );

      // Wait for batch timeout to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // All callback methods should be called
      expect(callbacks.attributeChangedCallback).toHaveBeenCalledTimes(3);
      expect(widgetDefinition.attributeChangedCallback).toHaveBeenCalledTimes(
        3,
      );

      // But setProps should be called only ONCE with batched props
      expect(widgetDefinition.setProps).toHaveBeenCalledTimes(1);
      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        name: 'Jane',
        multiName: 'Jane Doe',
        config: { key: 'newValue' },
      });
    });

    it('should handle attribute parser in batched setProps calls', async () => {
      const widgetElement = new WidgetElement();
      widgetElement.connectedCallback();

      await widgetElement._widgetPromise;

      jest.clearAllMocks();

      // Change config attribute (which has a JSON parser)
      widgetElement.attributeChangedCallback(
        'config',
        '{"key": "value"}',
        '{"key": "newValue", "another": "field"}',
      );

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        config: { key: 'newValue', another: 'field' },
      });
    });

    it('should clear pending batched props on disconnectedCallback', async () => {
      const widgetElement = new WidgetElement();
      widgetElement.connectedCallback();

      await widgetElement._widgetPromise;

      jest.clearAllMocks();

      // Start attribute change (but don't wait for batch timeout)
      widgetElement.attributeChangedCallback('name', 'John', 'Jane');

      // Immediately disconnect
      await widgetElement.disconnectedCallback();

      // Wait to ensure no setProps was called
      await new Promise((resolve) => setTimeout(resolve, 10));

      // setProps should not be called because element was disconnected
      expect(widgetDefinition.setProps).not.toHaveBeenCalled();
      expect(widgetElement._batchTimeout).toBeNull();
      expect(widgetElement._pendingProps).toEqual({});
    });

    it('should handle kebab-case to camelCase conversion in batched props', async () => {
      const widgetElement = new WidgetElement();
      widgetElement.connectedCallback();

      await widgetElement._widgetPromise;

      jest.clearAllMocks();

      // Test kebab-case attribute name conversion
      widgetElement.attributeChangedCallback('multi-name', 'old', 'new value');

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(widgetDefinition.setProps).toHaveBeenCalledWith({
        multiName: 'new value',
      });
    });
  });
});
