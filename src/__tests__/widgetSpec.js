import { createCustomWidget } from '../index';

describe('createCustomWidget method', () => {
  fit('should create empty widget', async () => {
    const widget = await createCustomWidget();

    expect(widget).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {},
        "$external": Object {},
        "$in": Object {},
        "$plugins": Array [],
        "create": [Function],
        "setup": [Function],
      }
    `);
  });
});
