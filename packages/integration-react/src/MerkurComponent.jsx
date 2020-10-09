import React from 'react';
import { getMerkur } from '@merkur/core';
import { loadScriptAssets, loadStyleAssets } from '@merkur/integration';

// error event name from @merkur/plugin-error
const MERKUR_ERROR_EVENT_NAME = '@merkur/plugin-error.error';

function WidgetWrapper({ html, className }) {
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export default class MerkurComponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._html = null;
    this._widget = null;
    this._isMounted = false;

    this._handleClientError = this._handleError.bind(this);

    this.state = {
      encounteredError: false,
      assetsLoaded: false,
      cachedWidgetMeta: null,
    };
  }

  /**
   * Checks if widget has changed, e.g has different name or version.
   *
   * @param {{ name: string, version: string }} props
   * @param {{ name: string, vesrion: string }} nextProps
   */
  static hasWidgetChanged(props, nextProps) {
    return (
      props &&
      nextProps &&
      (props.version !== nextProps.version || props.name !== nextProps.name)
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
    if (nextProps.widgetProperties) {
      const { version, name } = nextProps.widgetProperties;

      if (!prevState.cachedWidgetMeta) {
        // Cache widget meta data (name & version)
        return {
          cachedWidgetMeta: {
            name,
            version,
          },
        };
      } else if (
        prevState.cachedWidgetMeta &&
        MerkurComponent.hasWidgetChanged(
          prevState.cachedWidgetMeta,
          nextProps.widgetProperties
        )
      ) {
        // Replace cached widget meta data with new ones and reset state
        return {
          encounteredError: false,
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
   * Component should be updated only in these cases:
   *  1) State of MerkurComponent has changed (excluding { @code this.state.cachedWidgetMeta }).
   *  2) Component has no props.widgetProperties.
   *  3) Widget properties changed (name or version).
   *
   * In case { @code widgetProperties.state } or { @code widgetProperties.props }
   * the component should still not update, however we should update the widget
   * state and props using appropriate methods on the widget instance.
   *
   * @param {object} nextProps
   * @param {object} nextState
   */
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.assetsLoaded !== nextState.assetsLoaded ||
      this.state.encounteredError !== nextState.encounteredError ||
      !this.props.widgetProperties ||
      MerkurComponent.hasWidgetChanged(this.props, nextProps)
    ) {
      return true;
    }

    if (
      this._widget &&
      nextProps.widgetProperties &&
      nextProps.widgetProperties.props
    ) {
      if (
        Object.keys(nextProps.widgetProperties.props).length !==
        Object.keys(this.props.widgetProperties.props).length
      ) {
        /**
         * In case the new props are only subset of the existing ones
         * and all existing values are the same, simple key/value
         * comparison below would not work.
         */
        this._widget.setProps(nextProps.widgetProperties.props);

        return false;
      } else {
        /**
         * In case the lenght of both property instances is the same
         * we need to shallow compare their values.
         */
        for (let key in nextProps.widgetProperties.props) {
          if (
            !this.props.widgetProperties ||
            !this.props.widgetProperties.props ||
            nextProps.widgetProperties.props[key] !==
              this.props.widgetProperties.props[key]
          ) {
            this._widget.setProps(nextProps.widgetProperties.props);

            return false;
          }
        }
      }
    }

    if (
      this._widget &&
      nextProps.widgetProperties &&
      nextProps.widgetProperties.state
    ) {
      if (
        Object.keys(nextProps.widgetProperties.state).length !==
        Object.keys(this.props.widgetProperties.state).length
      ) {
        this._widget.setState(nextProps.widgetProperties.state);

        return false;
      } else {
        for (let key in nextProps.widgetProperties.state) {
          if (
            !this.props.widgetProperties ||
            !this.props.widgetProperties.state ||
            nextProps.widgetProperties.state[key] !==
              this.props.widgetProperties.state[key]
          ) {
            this._widget.setState(nextProps.widgetProperties.state);

            return false;
          }
        }
      }
    }

    return false;
  }

  /**
   * In case of mounting the component, we allways try to first load
   * the widget assets. Be it first mount after SSR or mount after
   * first render on client.
   */
  componentDidMount() {
    this._isMounted = true;
    this._loadWidgetAssets();
  }

  /**
   * After the component has been updated, we still need to handle few situations.
   *  1) In case assets have been loaded, we need to mount the widget.
   *  2) Handle situations where either old or new widget properties have changed.
   *
   * @param {object} prevProps
   * @param {object} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    const { widgetProperties: currentWidgetProperties } = this.props;
    const { widgetProperties: prevWidgetProperties } = prevProps;

    // 1) Assets have been loaded => mount the widget
    if (
      this.state.assetsLoaded &&
      prevState.assetsLoaded !== this.state.assetsLoaded
    ) {
      return this._mountWidget();
    }

    if (!currentWidgetProperties && prevWidgetProperties) {
      // 2.1) In case we receive empty new properties, we need to cleanup.
      this._removeWidget();
      this.setState({
        encounteredError: false,
        assetsLoaded: false,
      });

      return;
    } else if (currentWidgetProperties && !prevWidgetProperties) {
      /**
       * 2.2) In case there were no widget properties before, we try to
       * initialize widget first by doing the same as if it first mounted
       * (loading assets into the DOM).
       */
      return this._loadWidgetAssets();
    } else if (
      currentWidgetProperties &&
      prevWidgetProperties &&
      MerkurComponent.hasWidgetChanged(
        currentWidgetProperties,
        prevWidgetProperties
      )
    ) {
      /**
       * 2.3) In case widget has changed, first we need to cleanup (remove previous widget),
       * reset state and then we again try to intialize the new widget same way as
       * if it has mounted for the first time.
       */
      this._removeWidget();
      this.setState(
        {
          encounteredError: false,
          assetsLoaded: false,
        },
        () => {
          this._loadWidgetAssets();
        }
      );

      return;
    }
  }

  /**
   * In case of unmounting we only really need to do the cleanup.
   */
  componentWillUnmount() {
    this._removeWidget();
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
    const { widgetProperties, widgetClassName } = this.props;
    const { encounteredError, assetsLoaded } = this.state;

    if (
      !widgetProperties ||
      encounteredError ||
      (this._isClient() && !this._isSSRHydrate() && !assetsLoaded)
    ) {
      return this._renderFallback();
    }

    const html = this._getWidgetHTML();

    return (
      <>
        {(!this._isClient() || this._isSSRHydrate()) &&
          this._renderStyleAssets()}
        <WidgetWrapper className={widgetClassName} html={html} />
      </>
    );
  }

  /**
   * @return {React.ReactElement|null}
   */
  _renderFallback() {
    const { children } = this.props;
    const { encounteredError } = this.state;

    if (typeof children === 'function') {
      return children({ error: encounteredError });
    } else if (React.isValidElement(children)) {
      return children;
    }

    return null;
  }

  /**
   * Renders widget style assets inline. This is used on SSR
   * and in first render after SSR hydratation.
   *
   * @return {[React.ReactElement]}
   */
  _renderStyleAssets() {
    const { widgetProperties } = this.props;
    const assets =
      (Array.isArray(widgetProperties.assets) && widgetProperties.assets) || [];

    return assets.map((asset, key) => {
      switch (asset.type) {
        case 'stylesheet':
          return <link rel="stylesheet" href={asset.source} key={key} />;

        case 'inlineStyle':
          return (
            <style
              key={key}
              dangerouslySetInnerHTML={{ __html: asset.source }}
            />
          );
      }
    });
  }

  /**
   * @return {string} SSR rendered HTML, html from widgetProperties or ''.
   */
  _getWidgetHTML() {
    if (this._html !== null) {
      return this._html;
    }

    this._html = this.props.widgetProperties.html || this._getSSRHtml();

    return this._html;
  }

  _handleError(error) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error);
    }

    this.setState({ encounteredError: error });
  }

  /**
   * Handles widget unmounting and removal, while removing
   * event listeners, calling unmount on props and widget.
   */
  _removeWidget() {
    if (!this._widget) {
      return;
    }

    if (this.props.onWidgetUnmounting) {
      this.props.onWidgetUnmounting(this._widget);
    }

    // widget might not be using @merkur/plugin-event-emitter
    if (typeof this._widget.off === 'function') {
      this._widget.off(MERKUR_ERROR_EVENT_NAME, this._handleClientError);
    }

    this._widget.unmount();
    this._widget = null;
    this._html = null;
  }

  /**
   * Loads widget assets into page.
   */
  _loadWidgetAssets() {
    const { widgetProperties } = this.props;

    if (!widgetProperties || this._widget) {
      return;
    }

    return Promise.all([
      loadStyleAssets(widgetProperties.assets),
      loadScriptAssets(widgetProperties.assets),
    ])
      .then(
        () =>
          new Promise((resolve) => {
            this.setState(
              {
                assetsLoaded: true,
              },
              () => {
                resolve();
              }
            );
          })
      )
      .catch((error) => this._handleError(error));
  }

  /**
   * Creates and mounts widget instance after all resource loaded.
   */
  async _mountWidget() {
    const { widgetProperties, onWidgetMounted, debug = false } = this.props;

    if (!widgetProperties || this._widget) {
      return;
    }

    try {
      const merkur = getMerkur();
      this._widget = await merkur.create(widgetProperties);
      await this._widget.mount();

      if (typeof this._widget.on === 'function') {
        // widget might not be using @merkur/plugin-event-emitter
        this._widget.on(MERKUR_ERROR_EVENT_NAME, this._handleClientError);
      }

      if (typeof onWidgetMounted === 'function') {
        onWidgetMounted(this._widget);
      }
    } catch (error) {
      if (debug) {
        console.warn(error);
      }
    }
  }

  /**
   * Return server-side rendered html, if its the first render on client
   * after SSR.
   *
   * @return {string} server-side rendered html, if it's not available, return empty string.
   */
  _getSSRHtml() {
    if (
      !this._isMounted &&
      this._isClient() &&
      typeof document !== 'undefined'
    ) {
      const container = document.querySelector(
        this.props.widgetProperties.props.containerSelector
      );

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
    return this._getSSRHtml().length > 0;
  }

  /**
   * @return {boolean} true in browser environment.
   */
  _isClient() {
    return typeof window !== 'undefined';
  }
}
