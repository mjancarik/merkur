import { getMerkur } from '@merkur/core';
import React from 'react';

export default class MerkurComponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._mounted = false;
    this._html = null;
    this._widget = null;
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
    this._mounted = true;

    this._tryCreateWidget();
  }

  componentDidUpdate() {
    this._tryCreateWidget();
  }

  componentWillUnMount() {
    this._mounted = false;

    this._widget.unmount();
  }

  render() {
    if (!this.props.widgetProperties) {
      return this.props.children || null;
    }

    const html = this._getWidgetHTML();

    return (
      <>
        {this._renderAssets()}
        <div
          className={this.props.widgetClassName}
          dangerouslySetInnerHTML={{ __html: html }}></div>
      </>
    );
  }

  _tryCreateWidget() {
    if (!this.props.widgetProperties || this._widget) {
      return;
    }

    this._loadAssets(() => {
      const merkur = getMerkur();

      try {
        merkur.create(this.props.widgetProperties).then((widget) => {
          this._widget = widget;
          widget.mount();
        });
      } catch (_) {
        if (this.props.debug) {
          console.warn(_);
        }
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

  _renderAssets() {
    if (
      !this.props.widgetProperties ||
      !Array.isArray(this.props.widgetProperties.assets)
    ) {
      return null;
    }

    return this.props.widgetProperties.assets.map((asset, key) => {
      if (asset.type === 'stylesheet') {
        return <link rel="stylesheet" href={asset.source} key={key} />;
      }

      if (asset.type === 'inlineStyle') {
        return <style key={key}>{asset.source}</style>;
      }
    });
  }

  //TODO refactoring
  _loadAssets(callback) {
    if (
      !this.props.widgetProperties ||
      !Array.isArray(this.props.widgetProperties.assets)
    ) {
      return null;
    }

    let scripts = {
      pending: 0,
    };

    const scriptLoadedCallback = () => {
      scripts.pending -= 1;

      if (scripts.pending === 0 && this._mounted) {
        scripts.pending = -1;
        callback();
      }
    };

    this.props.widgetProperties.assets.forEach((asset) => {
      if (asset.type !== 'script') {
        return;
      }

      if (document.querySelector(`script[src='${asset.source}']`)) {
        return;
      }

      scripts.pending += 1;
      this._loadScript(asset, scriptLoadedCallback);
    });

    if (scripts.pending === 0 && this._mounted) {
      scripts.pending = -1;
      callback();
    }
  }

  _loadScript(asset, callback) {
    let script = document.createElement('script');
    script.defer = true;
    script.onload = callback;
    script.src = asset.source;
    document.head.appendChild(script);
  }
}
