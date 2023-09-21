import * as merkur from '../index';

describe('merkur module', () => {
  it('should keep module interface', () => {
    expect(merkur).toMatchInlineSnapshot(`
{
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
