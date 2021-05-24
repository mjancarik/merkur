import React from 'react';

export default class AbstractMerkurWidget extends React.Component {
  /**
   * Checks if widget has changed, e.g has different name or version.
   *
   * @param {{ name: string, version: string }} props
   * @param {{ name: string, version: string }} nextProps
   * @return {boolean} true if both inputs have name and version defined and any of them changed.
   */
  static hasWidgetChanged(props, nextProps) {
    return !!(
      props &&
      props.name &&
      props.version &&
      nextProps &&
      nextProps.name &&
      nextProps.version &&
      (props.version !== nextProps.version || props.name !== nextProps.name)
    );
  }

  /**
   * Widget SSR rendered html (from server response).
   */
  get html() {
    throw new Error('The html getter is abstract and must be overridden');
  }

  /**
   * Widget container element.
   */
  get container() {
    throw new Error('The container getter is abstract and must be overridden');
  }

  constructor(props) {
    super(props);

    this._isMounted = false;
    this._html = null;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  /**
   * Renders fallback (children) when widget is already mounted
   * but not ready or any error has occurred.
   *
   * @return {React.ReactElement|null}
   */
  _renderFallback() {
    const { children } = this.props;
    const { encounteredError = null } = this.state || {};

    if (typeof children === 'function') {
      return children({ error: encounteredError });
    } else if (React.isValidElement(children)) {
      return children;
    }

    return null;
  }

  /**
   * Clears cached SSR rendered html.
   */
  _clearCachedHtml() {
    this._html = null;
  }

  /**
   * @return {boolean} true in browser environment.
   */
  _isClient() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * @return {string} SSR rendered HTML, html from widgetProperties or ''.
   */
  _getWidgetHTML() {
    if (this._html !== null) {
      return this._html;
    }

    this._html = this.html || this._getSSRHTML();

    return this._html;
  }

  /**
   * Return server-side rendered html, if its the first render on client
   * after SSR.
   *
   * @return {string} server-side rendered html, if it's not available, return empty string.
   */
  _getSSRHTML() {
    if (!this._isMounted && this._isClient()) {
      return this.container?.children?.[0]?.outerHTML;
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
