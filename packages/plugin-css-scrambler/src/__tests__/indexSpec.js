import { createMerkurWidget } from '@merkur/core';
import { cssScramblePlugin } from '../index';

describe('createWidget method with cssScramble plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [cssScramblePlugin],
      name: 'my-widget',
      version: '1.0.0',
      classnameHashtable: ['gfgfg', ['szn'], ['view', 'component']],
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
      {
        "$dependencies": {},
        "$external": {},
        "$in": {
          "classNameScrambler": [Function],
        },
        "$plugins": [
          {
            "create": [Function],
            "setup": [Function],
          },
        ],
        "cn": [Function],
        "create": [Function],
        "info": [Function],
        "name": "my-widget",
        "setup": [Function],
        "version": "1.0.0",
      }
    `);
  });
});
