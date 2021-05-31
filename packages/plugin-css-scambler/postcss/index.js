'use strict';

const fs = require('fs');

const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const { numberToCssClass } = require('../lib/index.cjs');

module.exports = postcss.plugin('scrambler', function scrambler(options) {
  return (css) => {
    let prefixesTable;
    let mainPartsTable;

    if (options.generateHashTable) {
      const tableData = generateHashTable(css);
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
    css.walkRules((rule) => {
      let result = scramblingParser.process(rule.selector).result;

      // postcss-selector-parser +3.0.0 compatibility
      if (result === undefined) {
        result = scramblingParser.processSync(rule.selector);
      }

      rule.selector = result;
    });
  };
});

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
