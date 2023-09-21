import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interface', () => {
    expect(merkur).toMatchInlineSnapshot(`
{
  "assignMissingKeys": [Function],
  "bindWidgetToFunctions": [Function],
  "createMerkur": [Function],
  "createMerkurWidget": [Function],
  "createSlotFactory": [Function],
  "createViewFactory": [Function],
  "defineWidget": [Function],
  "getMerkur": [Function],
  "hookMethod": [Function],
  "isFunction": [Function],
  "removeMerkur": [Function],
  "setDefaultValueForUndefined": [Function],
}
`);
  });
});
