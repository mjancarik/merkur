import React from 'react';
import { shallow } from 'enzyme';

import {
  mockedWidgetProperties,
  widgetMockCleanup,
  widgetMockInit,
} from '../__mocks__/widgetMock';
import MerkurSlot from '../MerkurSlot';

jest.mock('../WidgetWrapper', () => {
  const { WidgetWrapperComponent } = jest.requireActual('../WidgetWrapper');

  return {
    __esModule: true,
    default: WidgetWrapperComponent,
  };
});

describe('MerkurSlot component', () => {
  let widgetProperties = null;
  let wrapper = null;

  beforeEach(() => {
    // Cache mocked widget data
    widgetProperties = { ...mockedWidgetProperties };

    // Mock basic function so first render can pass
    jest.spyOn(MerkurSlot.prototype, '_isSSRHydrate').mockReturnValue(true);

    // Shallow render component
    wrapper = shallow(
      <MerkurSlot widgetProperties={widgetProperties}>Fallback</MerkurSlot>
    );

    widgetMockInit();
  });

  afterEach(() => {
    widgetMockCleanup();
    jest.clearAllMocks();
  });

  describe('merkur component rendering', () => {
    it('should render fallback for not undefined widgetProperties', () => {
      wrapper = shallow(
        <MerkurSlot>
          <span>Fallback</span>
        </MerkurSlot>
      );

      expect(wrapper).toMatchInlineSnapshot(`
        <span>
          Fallback
        </span>
      `);
    });

    it('should render fallback for not undefined slot name widgetProperties', () => {
      wrapper = shallow(
        <MerkurSlot widgetProperties={widgetProperties}>
          <span>Fallback</span>
        </MerkurSlot>
      );

      expect(wrapper).toMatchInlineSnapshot(`
        <span>
          Fallback
        </span>
      `);
    });

    it('should render fallback for undefined slot name widgetProperties', () => {
      wrapper = shallow(
        <MerkurSlot
          widgetProperties={widgetProperties}
          slotName='non-existing-slot-name'
        >
          <span>Fallback</span>
        </MerkurSlot>
      );

      expect(wrapper).toMatchInlineSnapshot(`
        <span>
          Fallback
        </span>
      `);
    });

    it('should render merkur slot', () => {
      wrapper = shallow(
        <MerkurSlot widgetProperties={widgetProperties} slotName='headline'>
          <span>Fallback</span>
        </MerkurSlot>
      );

      expect(wrapper).toMatchInlineSnapshot(`
        <WidgetWrapper
          containerSelector=".headline"
          html="<div class="merkur__headline"></div>"
        />
      `);
    });

    it('should render on SPA without html', () => {
      jest.spyOn(MerkurSlot.prototype, '_isSSRHydrate').mockReturnValue(false);
      jest.spyOn(MerkurSlot.prototype, '_isClient').mockReturnValue(true);

      expect(
        shallow(
          <MerkurSlot widgetProperties={widgetProperties} slotName='headline'>
            <span>Fallback</span>
          </MerkurSlot>
        )
      ).toMatchInlineSnapshot(`
        <WidgetWrapper
          containerSelector=".headline"
          html=""
        >
          <span>
            Fallback
          </span>
        </WidgetWrapper>
      `);
    });
  });
});

describe('MerkurSlot component methods', () => {
  let widgetProperties = null;
  let wrapper = null;
  let instance = null;

  beforeEach(() => {
    // Cache mocked widget data
    widgetProperties = mockedWidgetProperties;

    // Mock basic function so first render can pass
    jest.spyOn(MerkurSlot.prototype, '_isSSRHydrate').mockReturnValue(true);
    jest.spyOn(MerkurSlot.prototype, '_isClient').mockReturnValue(true);
    jest
      .spyOn(MerkurSlot.prototype, '_getWidgetHTML')
      .mockReturnValue(widgetProperties.slot.headline.html);

    // Shallow render component
    wrapper = shallow(
      <MerkurSlot widgetProperties={widgetProperties} slotName='headline'>
        Fallback
      </MerkurSlot>,
      { disableLifecycleMethods: true }
    );

    // Update states so widget renders
    wrapper.setState({ assetsLoaded: true });
    instance = wrapper.instance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('slot getter', () => {
    it('should return slot properties', () => {
      expect(instance.slot).toStrictEqual(widgetProperties.slot.headline);
    });

    it('should return null', () => {
      wrapper.setProps({ widgetProperties: null });

      expect(instance.slot).toBeNull();
    });
  });

  describe('html getter', () => {
    it('should return slot SSR html', () => {
      expect(instance.html).toStrictEqual(widgetProperties.slot.headline.html);
    });

    it('should return null', () => {
      wrapper.setProps({ widgetProperties: null });

      expect(instance.html).toBeNull();
    });
  });

  describe('container getter', () => {
    it('should return container element', () => {
      jest.spyOn(instance, '_isClient').mockReturnValue(true);

      delete global.document;
      global.document = {
        querySelector: () => 'container-element',
        addEventListener: () => {},
      };

      expect(instance.container).toBe('container-element');
    });

    it('should return null on server', () => {
      jest.spyOn(instance, '_isClient').mockReturnValue(false);

      wrapper.setProps({ widgetProperties: null });

      expect(instance.container).toBeNull();
    });
  });

  describe('shouldComponentUpdate()', () => {
    it('should always return false when widgetProperties are defined, except for specific cases', () => {
      let defaultState = wrapper.state();

      expect(
        instance.shouldComponentUpdate({ widgetProperties }, defaultState)
      ).toBe(false);
      expect(
        instance.shouldComponentUpdate(
          {
            widgetProperties,
            sameProps: 'with new keys and values',
            butStill: 'the same name or version',
          },
          defaultState
        )
      ).toBe(false);
    });

    it('should return true when widgetProperties are not defined', () => {
      wrapper.setProps({ widgetProperties: null });

      expect(instance.shouldComponentUpdate({}, wrapper.state())).toBe(true);
    });

    it('should return true when widgetProperties are being deleted', () => {
      expect(instance.shouldComponentUpdate({})).toBe(true);
    });
  });

  describe('componentDidUpdate()', () => {
    beforeEach(() => {
      jest.spyOn(instance, '_removeSlot').mockImplementation();
    });

    it('should cleanup when receives empty widgetProperties', () => {
      wrapper.setProps({ widgetProperties: null });

      instance.componentDidUpdate({ widgetProperties });

      expect(instance._removeSlot).toHaveBeenCalledTimes(1);
    });
  });

  describe('componentWillUnmount()', () => {
    it('should remove slot from dom', () => {
      jest.spyOn(instance, '_removeSlot').mockImplementation();

      instance.componentWillUnmount();

      expect(instance._removeSlot).toHaveBeenCalledTimes(1);
    });
  });

  describe('_removeSlot()', () => {
    it('should clear cached html', () => {
      jest.spyOn(instance, '_clearCachedHtml').mockImplementation();

      instance._removeSlot();

      expect(instance._clearCachedHtml).toHaveBeenCalledTimes(1);
    });
  });
});
