import { createMerkurWidget } from '@merkur/core';
import { httpClientPlugin } from '../index';

describe('createWidget method with component plugin', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget({
      $plugins: [httpClientPlugin],
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

    expect(widget).toMatchInlineSnapshot();
  });
});
