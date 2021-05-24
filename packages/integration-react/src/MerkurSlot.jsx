import React from 'react';

import WidgetWrapper from './WidgetWrapper';
import AbstractMerkurComponent from './AbstractMerkurComponent';

export default class MerkurSlot extends AbstractMerkurComponent {
  /**
   * Returns access to current slot properties, based on it's name
   * passed in props.
   */
  get slot() {
    const { widgetProperties, slotName } = this.props;

    return (
      (widgetProperties &&
        widgetProperties.slots &&
        widgetProperties.slots[slotName]) ||
      null
    );
  }

  /**
   * @inheritdoc
   */
  get html() {
    return this.slot?.html;
  }

  /**
   * @inheritdoc
   */
  get container() {
    return document?.querySelector(this.slot?.containerSelector);
  }

  constructor(props) {
    super(props);

    this.state = {
      cachedWidgetMeta: null,
    };
  }

  /**
   * In case widget props change to new widget, we need to reset
   * state before next render. This enables us to immediately render
   * fallback without first rendering empty widget wrapper.
   *
   * @param {object} nextProps
   * @param {object} prevState
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState && nextProps && nextProps.widgetProperties) {
      const { version, name } = nextProps.widgetProperties;

      // Cache widget meta data (name & version)
      if (!prevState.cachedWidgetMeta) {
        return {
          cachedWidgetMeta: {
            name,
            version,
          },
        };
      }

      // Replace cached widget meta data with new ones and reset state
      if (
        AbstractMerkurComponent.hasWidgetChanged(
          prevState.cachedWidgetMeta,
          nextProps.widgetProperties
        )
      ) {
        return {
          cachedWidgetMeta: {
            name,
            version,
          },
        };
      }
    }

    return null;
  }

  /**
   * The component should update only in following cases:
   *  1) Component has no props.widgetProperties.
   *  2) Widget properties changed (name or version).
   *
   * @param {object} nextProps
   */
  shouldComponentUpdate(nextProps) {
    if (
      !this.props.widgetProperties ||
      AbstractMerkurComponent.hasWidgetChanged(
        this.props.widgetProperties,
        nextProps.widgetProperties
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * After the component has been updated, we still need to handle situations
   * where either old or new widget properties have changed.
   *
   * @param {object} prevProps
   * @param {object} prevState
   */
  componentDidUpdate(prevProps) {
    const { widgetProperties: currentWidgetProperties } = this.props;
    const { widgetProperties: prevWidgetProperties } = prevProps;

    // In case we receive empty new properties, we need to cleanup.
    if (!currentWidgetProperties && prevWidgetProperties) {
      this._removeSlot();
      this.setState({
        cachedWidgetMeta: null,
      });

      return;
    }

    // In case widget has changed, first we need to cleanup
    if (
      AbstractMerkurComponent.hasWidgetChanged(
        currentWidgetProperties,
        prevWidgetProperties
      )
    ) {
      this._removeSlot();

      return;
    }
  }

  /**
   * In case of unmounting we only really need to do the cleanup.
   */
  componentWillUnmount() {
    this._removeSlot();
  }

  /**
   * There are two possible outputs from the render method:
   *  1) Fallback is rendered only, when assets are not yet loaded
   *     or there was en error or there are no widget properties.
   *  2) WidgetWrapper is rendered in case of SSR (on server-side),
   *     SSR hydrate, with server-side rendered HTML, when assets
   *     are loaded with widget HTML, which is later mounted.
   *
   * @return {React.ReactElement|null}
   */
  render() {
    const { widgetProperties } = this.props;

    if (!widgetProperties || !this.slot) {
      return this._renderFallback();
    }

    /**
     * In case of SPA rendering, we render fallback (which can also display
     * loading placeholders) inside the component wrapper, until the widget
     * assets are loaded and mounted, which results in overriding the contents
     * of the wrapper (containing fallback) with slot markup. In case of SPA
     * we also don't want to render html to prevent FOUC.
     */
    const isInitialSPARender = this._isClient() && !this._isSSRHydrate();
    const html = isInitialSPARender ? '' : this._getWidgetHTML();

    return (
      <WidgetWrapper
        containerSelector={this.slot.containerSelector}
        html={html}>
        {isInitialSPARender && this._renderFallback()}
      </WidgetWrapper>
    );
  }

  /**
   * Cleanup after slot removal.
   */
  _removeSlot() {
    this._clearCachedHtml();
  }
}
