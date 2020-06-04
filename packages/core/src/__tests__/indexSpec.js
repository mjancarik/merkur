import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interace', () => {
    expect(merkur).toMatchInlineSnapshot(`
      Object {
        "bindWidgetToFunctions": [Function],
        "createMerkur": [Function],
        "createMerkurWidget": [Function],
        "getMerkur": [Function],
        "removeMerkur": [Function],
        "setDefaultValueForUndefined": [Function],
      }
    `);
  });
});
