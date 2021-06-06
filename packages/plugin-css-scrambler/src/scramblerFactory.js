import classnames from 'classnames';
import numberToCssClass from './numberToCssClass';

/**
 * @param {Array<Array<string>, Array<string>>=} hashingTable
 * @return {function(...?(string|Object<string, boolean>))}
 */
export default function scramblerFactory(hashingTable) {
  const prefixTable = hashingTable && new Map();
  const mainPartTable = hashingTable && new Map();

  if (hashingTable) {
    const [prefixes, mainParts] = hashingTable;
    for (let i = 0; i < prefixes.length; i++) {
      prefixTable.set(prefixes[i], numberToCssClass(i));
    }
    for (let i = 0; i < mainParts.length; i++) {
      mainPartTable.set(mainParts[i], numberToCssClass(i));
    }
  }

  return (widget, ...args) => {
    const classNamesSource = classnames(...args);
    if (!hashingTable) {
      return {
        className: classNamesSource,
      };
    }

    const processedClasses = classNamesSource
      .split(/\s+/)
      .map((className) => {
        const parts = className.split('-');
        const prefix = parts[0];
        const mainPart = parts.slice(1).join('-');
        if (!prefixTable.has(prefix) || !mainPartTable.has(mainPart)) {
          return className;
        }

        return `${prefixTable.get(prefix)}_${mainPartTable.get(mainPart)}`;
      })
      .join(' ');

    return {
      className: processedClasses,
      'data-class': classNamesSource,
    };
  };
}
