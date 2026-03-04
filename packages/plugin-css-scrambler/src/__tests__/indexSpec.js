import { createMerkurWidget } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { cssScramblePlugin } from '../index';

describe('createWidget method with cssScramble plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [componentPlugin, cssScramblePlugin],
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

    expect(widget).toMatchObject({
      $in: {
        classNameScrambler: expect.any(Function),
      },
    });
  });
});
