import { getMerkur } from '@merkur/core';
import React from 'react';

export default class MerkurComponent extends React.Component {
  static get isES9Supported() {
    if (MerkurComponent._isES9Supported !== undefined) {
      return MerkurComponent._isES9Supported;
    }

    function checkAsyncAwait() {
      try {
        new Function('(async () => ({}))()');
        return true;
      } catch (e) {
        return false;
      }
    }

    return (MerkurComponent._isES9Supported =
      Object.values && checkAsyncAwait());
  }

  constructor(props, context) {
    super(props, context);

    this._html = null;
    this._widget = null;

    this.state = {
      encounteredError: false,
    };
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.widgetProperties || !this._widget) {
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
    this._tryCreateWidget();
  }

  componentDidUpdate(prevProps) {
    const { widgetProperties: currentWidgetProperties } = this.props;
    const { widgetProperties: prevWidgetProperties } = prevProps;

    if (!currentWidgetProperties && prevWidgetProperties) {
      return this._removeWidget();
    }

    if (currentWidgetProperties && !prevWidgetProperties) {
      return this._tryCreateWidget();
    }

    if (!currentWidgetProperties && !prevWidgetProperties) {
      return;
    }

    const { name: prevName, version: prevVersion } = prevWidgetProperties;
    const { name, version } = currentWidgetProperties;

    if (prevName !== name || prevVersion !== version) {
      this._removeWidget();
      this._tryCreateWidget();
    }
  }

  componentWillUnmount() {
    this._removeWidget();
  }

  render() {
    if (!this.props.widgetProperties || this.state.encounteredError) {
      return this.props.children || null;
    }

    const html = this._getWidgetHTML();

    return (
      <>
        {this._renderStyleAssets()}
        <div
          className={this.props.widgetClassName}
          dangerouslySetInnerHTML={{ __html: html }}></div>
      </>
    );
  }

  _renderStyleAssets() {
    const { widgetProperties } = this.props;

    if (!widgetProperties || !Array.isArray(widgetProperties.assets)) {
      return null;
    }

    return widgetProperties.assets.map((asset, key) => {
      if (asset.type === 'stylesheet') {
        return <link rel="stylesheet" href={asset.source} key={key} />;
      }

      if (asset.type === 'inlineStyle') {
        return <style key={key}>{asset.source}</style>;
      }
    });
  }

  _determineAssetSource(assetSource) {
    if (typeof assetSource === 'string') {
      return assetSource;
    }

    return MerkurComponent.isES9Supported ? assetSource.es9 : assetSource.es5;
  }

  _getWidgetHTML() {
    if (this._html !== null) {
      return this._html;
    }

    this._html = this.props.widgetProperties.html || '';

    if (typeof document !== 'undefined') {
      const container = document.querySelector(
        this.props.widgetProperties.props.containerSelector
      );

      if (container && container.children && container.children[0]) {
        this._html = container.children[0].outerHTML;
      }
    }

    return this._html;
  }

  _handleError(error) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error);
    }

    this.setState({ encounteredError: true });
  }

  _loadScript(assetSource) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      script.src = assetSource;

      document.head.appendChild(script);
    });
  }

  _loadScriptAssets() {
    const { widgetProperties } = this.props;

    if (!widgetProperties || !Array.isArray(widgetProperties.assets)) {
      return Promise.resolve();
    }

    const scriptsToRender = widgetProperties.assets
      .map((asset) => {
        const assetSource = this._determineAssetSource(asset.source);

        if (
          asset.type === 'script' &&
          !document.querySelector(`script[src='${assetSource}']`)
        ) {
          return assetSource;
        }
      })
      .filter((assetSource) => assetSource);

    return Promise.all(
      scriptsToRender.map((asset) => this._loadScript(asset))
    ).catch((error) => this._handleError(error));
  }

  _removeWidget() {
    if (!this._widget) {
      return;
    }

    if (this.props.onWidgetUnmounting) {
      this.props.onWidgetUnmounting(this._widget);
    }

    this._widget.unmount();
    this._widget = null;
  }

  async _tryCreateWidget() {
    if (!this.props.widgetProperties || this._widget) {
      return;
    }

    await this._loadScriptAssets();

    const merkur = getMerkur();

    try {
      this._widget = await merkur.create(this.props.widgetProperties);
      await this._widget.mount();

      if (typeof this.props.onWidgetMounted === 'function') {
        this.props.onWidgetMounted(this._widget);
      }
    } catch (_) {
      if (this.props.debug) {
        console.warn(_);
      }
    }
  }
}
