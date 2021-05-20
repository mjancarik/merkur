import React from 'react';

import WidgetWrapper from './WidgetWrapper';
import MerkurComponent from './MerkurComponent';
import { isClient } from './utils';

export default class MerkurSlot extends React.Component {
  constructor(props) {
    super(props);

    this._html = null;
    this._isMounted = false;

    this.state = {
      assetsLoaded: false, // TODO figure out how to get this information from MerkurComponent for SPA rendering
      cachedWidgetMeta: null,
    };
  }

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
        MerkurComponent.hasWidgetChanged(
          prevState.cachedWidgetMeta,
          nextProps.widgetProperties
        )
      ) {
        return {
          assetsLoaded: false,
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
   *  1) State of MerkurComponent has changed (excluding { @code this.state.cachedWidgetMeta }).
   *  2) Component has no props.widgetProperties.
   *  3) Widget properties changed (name or version).
   *
   * @param {object} nextProps
   * @param {object} nextState
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.assetsLoaded !== nextState.assetsLoaded ||
      !this.props.widgetProperties ||
      MerkurComponent.hasWidgetChanged(
        this.props.widgetProperties,
        nextProps.widgetProperties
      )
    ) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    this.setState({
      assetsLoaded: true,
    }); // simulation of widget assets fetching
    this._isMounted = true;
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
      this._html = null;
      this.setState({
        assetsLoaded: false,
        cachedWidgetMeta: null,
      });

      return;
    }

    // In case widget has changed, first we need to cleanup
    if (
      MerkurComponent.hasWidgetChanged(
        currentWidgetProperties,
        prevWidgetProperties
      )
    ) {
      this._html = null;

      return;
    }
  }

  /**
   * In case of unmounting we only really need to do the cleanup.
   */
  componentWillUnmount() {
    this._html = null;
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
    const { widgetProperties, slotClassName } = this.props;
    const { assetsLoaded } = this.state;

    if (
      !slotClassName ||
      !widgetProperties ||
      !this.slot ||
      (isClient() && !this._isSSRHydrate() && !assetsLoaded)
    ) {
      return this._renderFallback();
    }

    const html = this._getWidgetHTML();

    return <WidgetWrapper className={slotClassName} html={html} />;
  }

  /**
   * @return {React.ReactElement|null}
   */
  _renderFallback() {
    const { children } = this.props;
    // const { encounteredError } = this.state;

    if (typeof children === 'function') {
      return children({ error: null }); // TODO also pass somehow error handling along with loaded assets ? :dunno:
    } else if (React.isValidElement(children)) {
      return children;
    }

    return null;
  }

  /**
   * @return {string} SSR rendered HTML, html from widgetProperties or ''.
   */
  _getWidgetHTML() {
    if (this._html !== null) {
      return this._html;
    }

    this._html = this.slot.html || this._getSSRHTML();

    return this._html;
  }

  /**
   * Return server-side rendered html, if its the first render on client
   * after SSR.
   *
   * @return {string} server-side rendered html, if it's not available, return empty string.
   */
  _getSSRHTML() {
    if (!this._isMounted && isClient()) {
      const container = document.querySelector(this.slot.containerSelector);

      return (
        container &&
        container.children &&
        container.children[0] &&
        container.children[0].outerHTML
      );
    }

    return '';
  }

  /**
   * Checks if it's the first render after SSR.
   *
   * @return {boolean} true in case of a first render after SSR, otherwise false.
   */
  _isSSRHydrate() {
    return this._getSSRHTML().length > 0;
  }
}
