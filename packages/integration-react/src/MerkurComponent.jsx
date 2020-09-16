import { getMerkur } from '@merkur/core';
import { loadScriptAssets, loadStyleAssets } from '@merkur/integration';
import React from 'react';

// error event name from @merkur/plugin-error
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
    const { widgetProperties, widgetClassName } = this.props;
    const { encounteredError } = this.state;

    if (!widgetProperties || encounteredError) {
      return this._renderFallback();
    }

    const html = this._getWidgetHTML();

    return (
      <div
        className={widgetClassName}
        dangerouslySetInnerHTML={{ __html: html }}></div>
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
  }

  async _tryCreateWidget() {
    const { widgetProperties, onWidgetMounted, debug } = this.props;

    if (!widgetProperties || this._widget) {
      return;
    }

    try {
      await loadStyleAssets(widgetProperties.assets);
      await loadScriptAssets(widgetProperties.assets);
    } catch (error) {
      this._handleError(error);
      return;
    }

    const merkur = getMerkur();

    try {
      this._widget = await merkur.create(widgetProperties);
      await this._widget.mount();

      if (typeof this._widget.on === 'function') {
        // widget might not be using @merkur/plugin-event-emitter
        this._widget.on(MERKUR_ERROR_EVENT_NAME, this._handleClientError);
      }

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
