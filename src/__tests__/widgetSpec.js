import { createCustomWidget } from '../index';

describe('createCustomWidget method', () => {
  fit('should create empty widget', async () => {
    const widget = await createCustomWidget();

    expect(widget).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {},
        "$in": Object {},
        "$plugins": Array [],
        "$setEmptyObjectForUndefined": [Function],
        "create": [Function],
        "setup": [Function],
      }
    `);
  });
});
