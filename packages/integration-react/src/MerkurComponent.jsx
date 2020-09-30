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
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !this._widget ||
      !this.props.widgetProperties ||
      this.state.assetsLoaded !== nextState.assetsLoaded ||
      this.state.encounteredError !== nextState.encounteredError
    ) {
      return true;
    }

    // TODO refactoring
    if (nextProps.widgetProperties && nextProps.widgetProperties.props) {
      for (let key in nextProps.widgetProperties.props) {
        if (
          !this.props.widgetProperties ||
          !this.props.widgetProperties.props ||
          nextProps.widgetProperties.props[key] !==
            this.props.widgetProperties.props[key]
        ) {
          this._widget.setProps(nextProps.widgetProperties.props);
        }
      }
    }

    if (nextProps.widgetProperties && nextProps.widgetProperties.state) {
      for (let key in nextProps.widgetProperties.state) {
        if (
          !this.props.widgetProperties ||
          !this.props.widgetProperties.state ||
          nextProps.widgetProperties.state[key] !==
            this.props.widgetProperties.state[key]
        ) {
          this._widget.setState(nextProps.widgetProperties.state);
        }
      }
    }

    return false;
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadWidgetAssets();
  }

  componentDidUpdate(prevProps, prevState) {
    const { widgetProperties: currentWidgetProperties } = this.props;
    const { widgetProperties: prevWidgetProperties } = prevProps;

    // Mount widget after resources have been loaded
    if (
      this.state.assetsLoaded &&
      prevState.assetsLoaded !== this.state.assetsLoaded
    ) {
      return this._mountWidget();
    }

    if (!currentWidgetProperties && prevWidgetProperties) {
      this._removeWidget();
      this.setState({
        assetsLoaded: false,
      });

      return;
    }

    if (currentWidgetProperties && !prevWidgetProperties) {
      return this._loadWidgetAssets();
    }

    if (!currentWidgetProperties && !prevWidgetProperties) {
      return;
    }

    const { name: prevName, version: prevVersion } = prevWidgetProperties;
    const { name, version } = currentWidgetProperties;

    if (prevName !== name || prevVersion !== version) {
      this._removeWidget();
      this.setState(
        {
          assetsLoaded: false,
        },
        () => {
          this._loadWidgetAssets();
        }
      );
    }
  }

  componentWillUnmount() {
    this._removeWidget();
  }

  render() {
    const { widgetProperties, widgetClassName } = this.props;
    const { encounteredError, assetsLoaded } = this.state;

    if (!widgetProperties || encounteredError || !assetsLoaded) {
      return this._renderFallback();
    }

    const html = this._getWidgetHTML();

    return (
      <>
        {(!this._isClient() || this._getSSRHtml().length > 0) &&
          this._renderStyleAssets()}
        <WidgetWrapper className={widgetClassName} html={html} />
      </>
    );
  }

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

  _removeWidget() {
    if (!this._widget) {
      return;
    }

    if (this.props.onWidgetUnmounting) {
      this.props.onWidgetUnmounting(this._widget);
    }

    if (typeof this._widget.off === 'function') {
      // widget might not be using @merkur/plugin-event-emitter
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
   * Returns server-side rendered html, if its the first render on client
   * after SSR.
   *
   * @return {string} server-side rendered html, if it's not available, returns empty string.
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

  _isClient() {
    return typeof window !== 'undefined';
  }
}
