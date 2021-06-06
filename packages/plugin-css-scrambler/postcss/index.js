'use strict';

const fs = require('fs');
const path = require('path');

const selectorParser = require('postcss-selector-parser');
const { numberToCssClass } = require('../lib/index.cjs');

function postCssScrambler(options) {
  return {
    postcssPlugin: 'css-scrambler',
    Once(root) {
      let prefixesTable;
      let mainPartsTable;

      if (options.generateHashTable) {
        const tableData = generateHashTable(root);
        [prefixesTable, mainPartsTable] = tableData;
        fs.writeFileSync(options.hashTable, JSON.stringify(tableData));
      } else {
        [prefixesTable, mainPartsTable] = JSON.parse(
          fs.readFileSync(options.hashTable)
        );
      }

      const scramblingParser = selectorParser((selector) => {
        selector.walkClasses((classNameNode) => {
          const className = classNameNode.value;
          if (/^\d+%/.test(className)) {
            // the selector parser does not handle decimal numbers in
            // selectors (used in keyframes), so we need to handle
            // those ourselves.
            return;
          }

          const parts = className.split('-');
          const prefix = parts[0];
          const mainPart = parts.slice(1).join('-');
          const prefixIndex = prefixesTable.indexOf(prefix);
          const mainPartIndex = mainPartsTable.indexOf(mainPart);
          if (prefixIndex === -1 || mainPartIndex === -1) {
            throw new Error(
              `The ${className} CSS class in not in the hash table`
            );
          }

          const scrambledPrefix = numberToCssClass(prefixIndex);
          const scrambledMainPart = numberToCssClass(mainPartIndex);
          classNameNode.value = `${scrambledPrefix}_${scrambledMainPart}`;
        });
      });
      root.walkRules((rule) => {
        let result = scramblingParser.process(rule.selector).result;

        // postcss-selector-parser +3.0.0 compatibility
        if (result === undefined) {
          result = scramblingParser.processSync(rule.selector);
        }

        rule.selector = result;
      });
    },
  };
}

postCssScrambler.postcss = true;

function generateHashTable(css) {
  const prefixes = new Set();
  const mainParts = new Set();

  const populatingParser = selectorParser((selector) => {
    selector.walkClasses((classNameNode) => {
      const className = classNameNode.value;
      if (/^\d+%/.test(className)) {
        // the selector parser does not handle decimal numbers in
        // selectors (used in keyframes), so we need to handle
        // those ourselves.
        return;
      }

      const parts = className.split('-');
      const prefix = parts[0];
      const mainPart = parts.slice(1).join('-');

      prefixes.add(prefix);
      mainParts.add(mainPart);
    });
  });
  css.walkRules((rule) => {
    populatingParser.process(rule.selector);
  });

  return [[...prefixes], [...mainParts]];
}

function applyPostCssScramblePlugin(config) {
  if (process.env.NODE_ENV === 'development') {
    return config;
  }

  const postCssScramblePlugin = postCssScrambler({
    generateHashTable: true,
    hashTable: path.resolve(
      process.env.WIDGET_DIRNAME,
      './build/static/hashtable.json'
    ),
  });

  // try to find existing postcss loader
  for (const rule of config.module.rules) {
    if (!rule.use) {
      continue;
    }

    const postCssUseEntryIndex = rule.use.findIndex(
      (useEntry) =>
        useEntry === 'postcss-loader' || useEntry.loader === 'postcss-loader'
    );

    if (~postCssUseEntryIndex) {
      const postCssLoader = rule.use[postCssUseEntryIndex];

      if (typeof postCssLoader === 'string') {
        // convert string loader to object definition
        rule.use[postCssUseEntryIndex] = {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [postCssScramblePlugin],
            },
          },
        };
      } else {
        // extend options of object defined loader
        rule.use[postCssUseEntryIndex].options = {
          ...postCssLoader.options,
          postcssOptions: {
            ...postCssLoader.options.postcssOptions,
            plugins: [
              ...postCssLoader.options.postcssOptions.plugins,
              postCssScramblePlugin,
            ],
          },
        };
      }

      return config;
    }
  }

  // add postcss loader to rule matching css files
  const cssRuleIndex = config.module.rules.findIndex((rule) =>
    rule.test.test('.css')
  );

  if (~cssRuleIndex) {
    config.module.rules[cssRuleIndex].use.push({
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [postCssScramblePlugin],
        },
      },
    });
  }

  return config;
}

module.exports = {
  applyPostCssScramblePlugin,
  postCssScrambler,
};
