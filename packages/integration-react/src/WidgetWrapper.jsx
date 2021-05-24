import React from 'react';

/**
 * Parses container selector into element property. Currently
 * only works with IDs and classnames.
 *
 * @param {string} [containerSelector='']
 * @return {{ string: string }} Property name and value tuple.
 */
function selectorToAttribute(containerSelector = '') {
  const lastPart = containerSelector.split(' ').pop();

  return {
    [lastPart[0] === '#' ? 'id' : 'className']: lastPart.substr(1),
  };
}

/**
 * Returns empty <div> with SSR html as it's contents (if provided) and
 * container selector defined, which is used as merkur widget wrapper.
 *
 * @param {{ html, containerSelector, children }}
 * @return {import('react').ReactElement}
 */
function WidgetWrapper({ html, containerSelector, children }) {
  const selector = selectorToAttribute(containerSelector);

  return html ? (
    <div {...selector} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <div {...selector}>{children}</div>
  );
}

export { selectorToAttribute, WidgetWrapper as WidgetWrapperComponent };
export default React.memo(WidgetWrapper);
