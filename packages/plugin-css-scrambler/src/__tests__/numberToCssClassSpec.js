import numToClass from '../numberToCssClass';

describe('number-to-css-class', () => {
  it('should convert a non-negative integer to a CSS class name', () => {
    expect(numToClass(0)).toBe('a');
    expect(numToClass(1)).toBe('b');
    expect(numToClass(52)).toBe('-');

    expect(numToClass(53)).toBe('aa');
    expect(numToClass(54)).toBe('ab');
    expect(numToClass(55)).toBe('ac');
    expect(numToClass(56)).toBe('ad');
    expect(numToClass(4085)).toBe('aca');
  });

  it("must not generate a collision for the first 100'000 numbers", () => {
    const classNames = new Set();
    const classNameToNumber = new Map();
    const count = 100000;
    let lastClassName = '';
    for (let i = 0; i < count; i++) {
      const className = numToClass(i);
      if (/undefined/.test(className)) {
        throw new Error(`Invalid class name: ${i} -> ${className}`);
      }
      if (className.length < lastClassName.length) {
        throw new Error(
          'The class names must be in ascending order, but ' +
            `${className} came after ${lastClassName}`,
        );
      }
      if (!/^[-_a-zA-Z]/.test(className)) {
        throw new Error(`Invalid CSS class name: ${className}`);
      }
      if (classNames.has(className)) {
        console.warn(
          'Detected a collision:',
          classNameToNumber.get(className),
          i,
          className,
        );
      }
      lastClassName = className;
      classNames.add(className);
      classNameToNumber.set(className, i);
    }

    expect(classNames.size).toBe(count);
  });
});
