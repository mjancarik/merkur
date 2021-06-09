import React from 'react';
import { shallow } from 'enzyme';

import {
  mockedWidgetProperties,
  widgetMockCleanup,
  widgetMockInit,
} from '../__mocks__/widgetMock';
import AbstractMerkurWidget from '../AbstractMerkurWidget';

// Mock extending abstract class
class MockMerkurComponent extends AbstractMerkurWidget {
  get html() {
    return this.props.widgetProperties?.html;
  }

  constructor(props) {
    super(props);
  }

  render() {
    return null;
  }
}

describe('AbstractMerkurWidget', () => {
  let widgetProperties = null;
  let instance = null;
  let wrapper = null;

  beforeEach(() => {
    // Cache mocked widget data
    widgetProperties = mockedWidgetProperties;

    // Shallow render component
    wrapper = shallow(
      <MockMerkurComponent widgetProperties={widgetProperties}>
        Fallback
      </MockMerkurComponent>
    );

    instance = wrapper.instance();

    widgetMockInit();
  });

  afterEach(() => {
    widgetMockCleanup();
    jest.clearAllMocks();
  });

  describe('html getter', () => {
    it('should throw an error when not overridden', () => {
      expect(() => {
        new AbstractMerkurWidget().html;
      }).toThrowError();
    });
  });

  describe('container getter', () => {
    it('should throw an error when not overridden', () => {
      expect(() => {
        new AbstractMerkurWidget().container;
      }).toThrowError();
    });
  });

  describe('componentDidMount() method', () => {
    it('should set _isMounted flag to true', () => {
      instance._isMounted = false;
      expect(instance._isMounted).toBe(false);

      instance.componentDidMount();

      expect(instance._isMounted).toBe(true);
    });
  });

  describe('static hasWidgetChanged() method', () => {
    it('should return false for invalid inputs', () => {
      expect(AbstractMerkurWidget.hasWidgetChanged(null, undefined)).toBe(
        false
      );
      expect(AbstractMerkurWidget.hasWidgetChanged()).toBe(false);
      expect(AbstractMerkurWidget.hasWidgetChanged('', '')).toBe(false);
      expect(AbstractMerkurWidget.hasWidgetChanged(1, {})).toBe(false);
      expect(AbstractMerkurWidget.hasWidgetChanged({ a: 1, b: 2 })).toBe(false);
      expect(
        AbstractMerkurWidget.hasWidgetChanged(
          { name: 'name', version: 'version' },
          { a: 4, b: 5 }
        )
      ).toBe(false);
    });

    it('should return false for same widgets', () => {
      expect(
        AbstractMerkurWidget.hasWidgetChanged(
          { name: 'todo', version: '1.0.0' },
          { name: 'todo', version: '1.0.0' }
        )
      ).toBe(false);
    });

    it('should return true for different versions of the widget', () => {
      expect(
        AbstractMerkurWidget.hasWidgetChanged(
          { name: 'todo', version: '1.0.0' },
          { name: 'todo', version: '0.1.0' }
        )
      ).toBe(true);
      expect(
        AbstractMerkurWidget.hasWidgetChanged(
          { name: 'todo', version: '1.1.0' },
          { name: 'todo', version: '1.0.0' }
        )
      ).toBe(true);
    });

    it('should return true for different widgets', () => {
      expect(
        AbstractMerkurWidget.hasWidgetChanged(
          { name: 'articles', version: '1.0.0' },
          { name: 'todo', version: '0.1.0' }
        )
      ).toBe(true);
      expect(
        AbstractMerkurWidget.hasWidgetChanged(
          { name: 'todos', version: '1.0.0' },
          { name: 'todo', version: '1.0.0' }
        )
      ).toBe(true);
    });
  });

  describe('static validateWidgetProperties() method', () => {
    it.each([
      [undefined, false],
      [null, false],
      [{}, false],
      [{ a: 'b' }, false],
      [{ name: 'foo' }, false],
      [{ version: '0.0.1' }, false],
      [{ name: 'foo', version: '0.0.1' }, true],
      [{ hi: 'hello', name: 'foo', version: '0.0.1' }, true],
      [{ props: {}, name: 'foo', version: '0.0.1' }, true],
    ])('should validate %j input as %b', (input, expected) => {
      expect(AbstractMerkurWidget.validateWidgetProperties(input)).toBe(
        expected
      );
    });
  });

  describe('_renderFallback() method', () => {
    it('should return null if no children are given', () => {
      wrapper.setProps({ children: undefined });

      expect(instance._renderFallback()).toBe(null);
    });

    it('should return react element', () => {
      let element = <span>Fallback</span>;
      wrapper.setProps({ children: element });

      expect(instance._renderFallback()).toBe(element);
      expect(instance._renderFallback()).toMatchInlineSnapshot(`
        <span>
          Fallback
        </span>
      `);
    });

    it('should return result of children function call', () => {
      wrapper.setProps({ children: ({ error }) => `error:${error}` });
      wrapper.setState({
        encounteredError: 'test-error',
      });

      expect(instance._renderFallback()).toBe('error:test-error');
    });
  });

  describe('_clearCachedHtml', () => {
    it('should set _html to null', () => {
      instance._html = 'html';

      expect(instance._html).toBe('html');

      instance._clearCachedHtml();

      expect(instance._html).toBe(null);
    });
  });

  describe('_isClient() method', () => {
    beforeEach(() => {
      delete global.document;
      delete global.window;
    });

    it('should return false for non-browser environments', () => {
      expect(instance._isClient()).toBe(false);

      global.window = {};

      expect(instance._isClient()).toBe(false);

      delete global.window;
      global.document = {};

      expect(instance._isClient()).toBe(false);
    });

    it('should return true for browser environments', () => {
      global.window = {};
      global.document = {};

      expect(instance._isClient()).toBe(true);
    });
  });

  describe('_getWidgetHTML() method', () => {
    beforeEach(() => {
      spyOn(instance, '_getSSRHTML').and.returnValue('SSR HTML');
    });

    it('should return SSR rendered HTML', () => {
      wrapper.setProps({
        widgetProperties: {
          ...widgetProperties,
          html: '',
        },
      });

      expect(instance._html).toBe(null);
      expect(instance.props.widgetProperties.html).toBe('');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
    });

    it('should return widgetProperties html if available', () => {
      expect(instance._html).toBe(null);
      expect(instance._getWidgetHTML()).toBe(widgetProperties.html);
    });

    it('should return cached html when called multiple times', () => {
      wrapper.setProps({
        widgetProperties: {
          ...widgetProperties,
          html: '',
        },
      });

      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getWidgetHTML()).toBe('SSR HTML');
      expect(instance._getSSRHTML).toHaveBeenCalledTimes(1);
    });
  });

  describe('_getSSRHTML() method', () => {
    beforeEach(() => {
      Object.defineProperty(instance, 'container', {
        get: () => {
          return {
            children: [
              {
                outerHTML: 'outerHTML',
              },
            ],
          };
        },
      });
    });

    it('return empty string if component is already mounted', () => {
      instance._isMounted = true;
      spyOn(instance, '_isClient').and.returnValue(true);

      expect(instance._getSSRHTML()).toBe('');
    });

    it('return empty string if we are not on client', () => {
      instance._isMounted = false;
      spyOn(instance, '_isClient').and.returnValue(false);

      expect(instance._getSSRHTML()).toBe('');
    });

    it('return html widget content from document', () => {
      instance._isMounted = false;
      spyOn(instance, '_isClient').and.returnValue(true);

      expect(instance._getSSRHTML()).toBe('outerHTML');
    });
  });

  describe('_isSSRHydrate() method', () => {
    it("should return true if there's some server side rendered html", () => {
      spyOn(instance, '_getSSRHTML').and.returnValue('html');

      expect(instance._isSSRHydrate()).toBe(true);
    });

    it('should return false, if SSR renderd html is empty', () => {
      spyOn(instance, '_getSSRHTML').and.returnValue('');

      expect(instance._isSSRHydrate()).toBe(false);
    });
  });
});
