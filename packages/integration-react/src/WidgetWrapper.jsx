import React from 'react';

const SelectorIdentifierMap = Object.freeze({
  '#': 'id',
  '.': 'className',
});

/**
 * Parses container selector into element property. Currently
 * only works with IDs and classnames.
 *
 * @param {string} [containerSelector='']
 * @return {{ string: string }} Property name and value tuple.
 */
function selectorToAttribute(containerSelector = '') {
  if (typeof containerSelector !== 'string' || containerSelector.length === 0) {
    return {};
  }

  let lastIdentifierIndex = -1;
  for (let identifierKey in SelectorIdentifierMap) {
    let curLastIndex = containerSelector.lastIndexOf(identifierKey);

    if (lastIdentifierIndex < curLastIndex) {
      lastIdentifierIndex = curLastIndex;
    }
  }

  const identifier = containerSelector[lastIdentifierIndex];
  const selectorName = containerSelector.substr(lastIdentifierIndex + 1);

  return {
    [SelectorIdentifierMap[identifier]]: selectorName,
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
