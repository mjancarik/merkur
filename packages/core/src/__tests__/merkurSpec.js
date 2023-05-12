import { getMerkur, createMerkur, removeMerkur } from '../merkur';
import { createMerkurWidget } from '../index';

describe('merkur shell', () => {
  beforeEach(() => {
    removeMerkur();
  });

  it('should create merkur shell', () => {
    const merkur = createMerkur();

    expect(merkur).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {
          "widgetFactory": {},
          "widgets": [],
        },
        "create": [Function],
        "isRegistered": [Function],
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
    const createWidget = () => createMerkurWidget(widgetProperties);

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
    const createWidget = () => createMerkurWidget(widgetProperties);

    merkur.register({
      ...widgetProperties,
      createWidget,
    });

    const widget = await merkur.create(widgetProperties);

    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {},
        "$external": {},
        "$in": {},
        "$plugins": [],
        "create": [Function],
        "name": "package",
        "setup": [Function],
        "version": "1.0.0",
      }
    `);
  });

  describe('isRegistered', () => {
    it('should return false, if nothing is registered', () => {
      const merkur = getMerkur();

      expect(merkur.isRegistered('@szn/widget')).toBe(false);
    });

    it('should return true, if widget is registered', () => {
      const merkur = getMerkur();
      merkur.$in.widgetFactory['@szn/widget1.2.3'] = jest.fn();

      expect(merkur.isRegistered('@szn/widget')).toBe(true);
    });

    it('should return false, other widgets are registered', () => {
      const merkur = getMerkur();
      merkur.$in.widgetFactory['@szn/feature3.2.1'] = jest.fn();

      expect(merkur.isRegistered('@szn/widget')).toBe(false);
    });

    it('should return true, if checking with widget version', () => {
      const merkur = getMerkur();
      merkur.$in.widgetFactory['@szn/widget1.2.3'] = jest.fn();

      expect(merkur.isRegistered('@szn/widget1.2.3')).toBe(true);
    });
  });
});
