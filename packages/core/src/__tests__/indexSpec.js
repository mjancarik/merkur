import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interace', () => {
    expect(merkur).toMatchInlineSnapshot(`
      Object {
        "createMerkur": [Function],
        "createMerkurWidget": [Function],
        "getMerkur": [Function],
        "removeMerkur": [Function],
        "setDefaultValueForUndefined": [Function],
      }
    `);
  });
});
