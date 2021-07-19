import { createMerkurWidget } from '@merkur/core';
import { styleInhibitorPlugin } from '../index';

describe('createWidget method with styleInhibitor plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [styleInhibitorPlugin],
      name: 'my-widget',
      version: '1.0.0',
      props: {
        param: 1,
      },
      assets: [
        {
          type: 'script',
          source: 'http://www.example.com/static/1.0.0/widget.js',
        },
      ],
    });

    expect(widget).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {},
        "$external": Object {},
        "$in": Object {},
        "$plugins": Array [
          Object {
            "create": [Function],
            "setup": [Function],
          },
        ],
        "create": [Function],
        "mount": [Function],
        "name": "my-widget",
        "setup": [Function],
        "version": "1.0.0",
      }
    `);
  });
});
