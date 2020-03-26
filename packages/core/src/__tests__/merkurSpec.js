import { getMerkur, createMerkur, removeMerkur } from '../merkur';
import { createCustomWidget } from '../index';

describe('merkur shell', () => {
  beforeEach(() => {
    removeMerkur();
  });

  it('should create merkur shell', () => {
    const merkur = createMerkur();

    expect(merkur).toMatchInlineSnapshot(`
      Object {
        "$dependencies": Object {},
        "$external": Object {},
        "$in": Object {
          "widgetFactory": Object {},
          "widgets": Array [],
        },
        "connect": [Function],
        "create": [Function],
        "disconnect": [Function],
        "register": [Function],
      }
    `);
  });

  it('should return merkur instance', () => {
    const merkur = createMerkur();
    const sameMerkur = getMerkur();

    expect(sameMerkur).toEqual(merkur);
  });

  it('should connect merkur widget', () => {
    const merkur = createMerkur();
    const widget = createCustomWidget();

    merkur.connect(widget);

    expect(merkur.$in.widgets.length).toEqual(1);
  });

  it('should disconnect merkur widget', () => {
    const merkur = createMerkur();
    const widget = createCustomWidget();

    merkur.connect(widget);
    merkur.disconnect(widget);

    expect(merkur.$in.widgets.length).toEqual(0);
  });

  it('should register merkur widget', () => {
    const merkur = createMerkur();
    const widgetProperties = {
      name: 'package',
      version: '1.0.0',
    };
    const widgetFactory = () => createCustomWidget(widgetProperties);

    merkur.register(
      widgetProperties.name,
      widgetProperties.version,
      widgetFactory
    );

    expect(
      merkur.$in.widgetFactory[widgetProperties.name + widgetProperties.version]
    ).toEqual(widgetFactory);
  });

  it('should create merkur widget', async () => {
    const merkur = createMerkur();
    const widgetProperties = {
      name: 'package',
      version: '1.0.0',
    };
    const widgetFactory = () => createCustomWidget(widgetProperties);

    merkur.register(
      widgetProperties.name,
      widgetProperties.version,
      widgetFactory
    );

    const widget = await merkur.create(
      widgetProperties.name,
      widgetProperties.version,
      widgetProperties
    );

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
