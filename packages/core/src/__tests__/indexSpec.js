import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interface', () => {
    expect(merkur).toMatchInlineSnapshot(`
      Object {
        "bindWidgetToFunctions": [Function],
        "createMerkur": [Function],
        "createMerkurWidget": [Function],
        "getMerkur": [Function],
        "hook": [Function],
        "isFunction": [Function],
        "removeMerkur": [Function],
        "setDefaultValueForUndefined": [Function],
      }
    `);
  });
});
