import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interace', () => {
    expect(merkur).toMatchInlineSnapshot(`
      Object {
        "componentPlugin": [Function],
        "createCustomWidget": [Function],
        "createMerkur": [Function],
        "createWidget": [Function],
        "eventEmitterPlugin": [Function],
        "getMerkur": [Function],
        "removeMerkur": [Function],
      }
    `);
  });
});
