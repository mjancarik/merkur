import { createMerkurWidget } from '../index';

describe('createCustomWidget method', () => {
  it('should create empty widget', async () => {
    const widget = await createMerkurWidget();

    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {},
        "$plugins": [],
        "create": [Function],
        "name": undefined,
        "setup": [Function],
        "version": undefined,
      }
    `);
  });

  it('should add x property to widget in setup phase from plugin', async () => {
    const widget = await createMerkurWidget({
      $plugins: [
        () => ({
          setup: (widget) => {
            widget.x = 2;
            return widget;
          },
        }),
      ],
    });

    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {},
        "$plugins": [
          {
            "setup": [Function],
          },
        ],
        "create": [Function],
        "name": undefined,
        "setup": [Function],
        "version": undefined,
        "x": 2,
      }
    `);
  });

  it('should modify x property in create phase from plugin', async () => {
    const widget = await createMerkurWidget({
      $plugins: [
        () => ({
          setup: (widget) => {
            widget.x = 2;

            return widget;
          },
          create: (widget) => {
            widget.x = 3;

            return widget;
          },
        }),
      ],
    });

    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {},
        "$plugins": [
          {
            "create": [Function],
            "setup": [Function],
          },
        ],
        "create": [Function],
        "name": undefined,
        "setup": [Function],
        "version": undefined,
        "x": 3,
      }
    `);
  });

  it('should add method to widget in setup phase', async () => {
    const widget = await createMerkurWidget({
      setup(widget) {
        widget.method = () => {};

        return widget;
      },
    });

    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {},
        "$plugins": [],
        "create": [Function],
        "method": [Function],
        "name": undefined,
        "setup": [Function],
        "version": undefined,
      }
    `);
  });

  it('should modify method widget in create phase', async () => {
    const widget = await createMerkurWidget({
      setup(widget) {
        widget.method = null;

        return widget;
      },
    });

    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {},
        "$plugins": [],
        "create": [Function],
        "method": null,
        "name": undefined,
        "setup": [Function],
        "version": undefined,
      }
    `);
  });
});
