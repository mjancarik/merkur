import { createMerkurWidget } from '../index';

describe('createCustomWidget method', () => {
  fit('should create empty widget', async () => {
    const widget = await createMerkurWidget();

    expect(widget).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {},
        "$external": Object {},
        "$in": Object {},
        "$plugins": Array [],
        "create": [Function],
        "name": undefined,
        "setup": [Function],
        "version": undefined,
      }
    `);
  });
});
