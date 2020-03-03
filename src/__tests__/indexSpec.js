import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interace', () => {
    expect(merkur).toMatchInlineSnapshot(`
      Object {
        "componentPlugin": [Function],
        "createCustomWidget": [Function],
        "createWidget": [Function],
        "eventEmitterPlugin": [Function],
      }
    `);
  });
});
