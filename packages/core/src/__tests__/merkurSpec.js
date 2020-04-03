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
        "create": [Function],
        "register": [Function],
      }
    `);
  });

  it('should return merkur instance', () => {
    const merkur = createMerkur();
    const sameMerkur = getMerkur();

    expect(sameMerkur).toEqual(merkur);
  });

  it('should register merkur widget', () => {
    const merkur = createMerkur();
    const widgetProperties = {
      name: 'package',
      version: '1.0.0',
    };
    const createWidget = () => createCustomWidget(widgetProperties);

    merkur.register({
      ...widgetProperties,
      createWidget,
    });

    expect(
      merkur.$in.widgetFactory[widgetProperties.name + widgetProperties.version]
    ).toEqual(createWidget);
  });

  it('should create merkur widget', async () => {
    const merkur = createMerkur();
    const widgetProperties = {
      name: 'package',
      version: '1.0.0',
    };
    const createWidget = () => createCustomWidget(widgetProperties);

    merkur.register({
      ...widgetProperties,
      createWidget,
    });

    const widget = await merkur.create(widgetProperties);

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
