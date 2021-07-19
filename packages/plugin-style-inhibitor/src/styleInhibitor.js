import defaultCssDeclaration from './defaultCssDeclaration';

const GENERIC_SELECTOR_REGEX =
  /\s[.#]{0}([\w\-:()]+(?::not\([\w\-:.#()]+\))*)(?:,|$)/;

/**
 *
 * @param {HTMLElement} rootElement
 * @param {{Array<Object>}} widgetAssets
 */
export default function inhibitOuterStyles(rootElement, widgetAssets) {
  const cssRules = [],
    widgetCssRules = [];

  for (let i = 0; i < document.styleSheets.length; i++) {
    const assetIndex = widgetAssets.findIndex(
      ({ source, type }) =>
        type === 'inlineStyle' &&
        source === document.styleSheets[i].ownerNode.innerHTML
    );

    if (~assetIndex) {
      widgetCssRules.push(...processCssRuleGroup(document.styleSheets[i]));

      // asset is processed exclude it from next search
      widgetAssets.splice(assetIndex, 1);
    } else {
      cssRules.push(...processCssRuleGroup(document.styleSheets[i]));
    }
  }

  // filter out specific css selectors
  const genericCssRules = cssRules.filter((rule) =>
    GENERIC_SELECTOR_REGEX.test(rule.selectorText)
  );

  const descendants = rootElement.getElementsByTagName('*');

  for (let i = 0; i < descendants.length; i++) {
    const affectingCssRules = genericCssRules.filter((rule) =>
      elementMatchesSelector(descendants[i], rule.selectorText)
    );

    if (affectingCssRules.length > 0) {
      const definedCssRules = widgetCssRules.filter((rule) =>
        elementMatchesSelector(descendants[i], rule.selectorText)
      );

      counterAffectingCssRules(
        descendants[i],
        affectingCssRules,
        definedCssRules
      );
    }
  }
}

/**
 * Appplies css rules thta counteract to css rules inherited from outside of
 * root element
 *
 * @param {HTMLElement} element
 * @param {Array<CSSRule>} affectingCssRules
 * @param {Array<CSSRule>} definedCssRules
 */
function counterAffectingCssRules(element, affectingCssRules, definedCssRules) {
  const affectingCssDeclarations = cssRulesToDeclarations(affectingCssRules);
  const definedCssDeclarations = cssRulesToDeclarations(definedCssRules);

  const cssProperties = Object.keys(affectingCssDeclarations);

  for (let i = 0; i < cssProperties.length; i++) {
    const property = cssProperties[i];
    const counterValue =
      definedCssDeclarations[property] || defaultCssDeclaration[property];

    element.style[property] = counterValue;
  }
}

/**
 * Recursively extracts css rules from stylesheet, grouping rule or import rule
 *
 * @param {CSSStyleSheet|CSSGroupingRule|CSSImportRule|CSSStyleRule} cssRuleGroup
 * @returns {Array<CSSRule>}
 */
function processCssRuleGroup(cssRuleGroup) {
  let cssRules = [];

  try {
    // possible cors security error
    cssRules = cssRuleGroup.cssRules;
  } catch (error) {
    return [];
  }

  const result = [];

  for (let i = 0; i < cssRules.length; i++) {
    if (cssRules[i] instanceof CSSImportRule) {
      result.push(...processCssRuleGroup(cssRules[i].styleSheet));
    } else if (cssRules[i] instanceof CSSGroupingRule) {
      result.push(...processCssRuleGroup(cssRules[i]));
    } else if (cssRules[i] instanceof CSSStyleRule) {
      result.push(cssRules[i]);
    }
  }

  return result;
}

/**
 * Converts given list of css rules to map of css declarations.
 *
 * @param {Array<CSSRule>} cssRules
 * @returns {Object<string, string>}
 */
function cssRulesToDeclarations(cssRules) {
  const cssDeclarationMap = {};

  for (let i = 0; i < cssRules.length; i++) {
    const cssDeclaration = cssRules[i].style;

    for (let x = 0; x < cssDeclaration.length; x++) {
      const propertyName = cssDeclaration[x];
      cssDeclarationMap[propertyName] =
        cssDeclaration.getPropertyValue(propertyName);
    }
  }

  return cssDeclarationMap;
}

/**
 * Returns true/false whether given {@param element} matches given
 * {@param selector} with fallback for unsupported selectors.
 *
 * @param {HTMLElement} element
 * @param {String} selector
 * @returns {Boolean}
 */
function elementMatchesSelector(element, selector) {
  try {
    return element.matches(selector);
  } catch (error) {
    return false;
  }
}
