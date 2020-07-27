import { getMerkur } from '@merkur/core';
import React from 'react';

export default class MerkurComponent extends React.Component {
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

  _loadScriptAssets() {
    const { widgetProperties } = this.props;

    if (!widgetProperties || !Array.isArray(widgetProperties.assets)) {
      return Promise.resolve();
    }

    return Promise.all(
      widgetProperties.assets
        .filter(
          (asset) =>
            asset.type === 'script' &&
            !document.querySelector(`script[src='${asset.source}']`)
        )
        .map((asset) => this._loadScript(asset))
    ).catch((error) => this._handleError(error));
  }

  _loadScript(asset) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      script.src = asset.source;

      document.head.appendChild(script);
    });
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

  _handleError(error) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error);
    }

    this.setState({ encounteredError: true });
  }
}
