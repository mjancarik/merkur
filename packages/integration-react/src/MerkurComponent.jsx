import { getMerkur } from '@merkur/core';
import { loadScriptAssets } from '@merkur/integration';
import React from 'react';

const MERKUR_ERROR_EVENT_NAME = '@merkur/plugin-error.error';

export default class MerkurComponent extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._html = null;
    this._widget = null;

    this._handleClientError = this._handleError.bind(this);

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

  _handleError(error) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error);
    }

    this.setState({ encounteredError: true });
  }

  _removeWidget() {
    if (!this._widget) {
      return;
    }

    if (this.props.onWidgetUnmounting) {
      this.props.onWidgetUnmounting(this._widget);
    }

    this._widget.off(MERKUR_ERROR_EVENT_NAME, this._handleClientError);

    this._widget.unmount();
    this._widget = null;
  }

  async _tryCreateWidget() {
    const { widgetProperties, onWidgetMounted, debug } = this.props;

    if (!widgetProperties || this._widget) {
      return;
    }

    try {
      await loadScriptAssets(widgetProperties.assets);
    } catch (error) {
      this._handleError(error);
      return;
    }

    const merkur = getMerkur();

    try {
      this._widget = await merkur.create(widgetProperties);
      await this._widget.mount();

      this._widget.on(MERKUR_ERROR_EVENT_NAME, this._handleClientError);

      if (typeof onWidgetMounted === 'function') {
        onWidgetMounted(this._widget);
      }
    } catch (_) {
      if (debug) {
        console.warn(_);
      }
    }
  }
}
