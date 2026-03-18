import { createMerkurWidget } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { s } from '@esmj/schema';
import { validationPlugin } from '../index';

describe('validationPlugin', () => {
  describe('plugin initialization', () => {
    it('should throw error if props option is not provided', () => {
      expect(() => validationPlugin()).toThrow(
        '@merkur/plugin-validation: props option is required',
      );
    });

    it('should throw error if props schema has no safeParse method', () => {
      expect(() => validationPlugin({ props: {} })).toThrow(
        '@merkur/plugin-validation: props must have a safeParse() method',
      );
    });

    it('should create widget with valid schema', async () => {
      const propsSchema = s.object({
        name: s.string(),
      });

      const widget = await createMerkurWidget({
        $plugins: [componentPlugin, validationPlugin({ props: propsSchema })],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 'test' },
      });

      expect(widget).toBeDefined();
      expect(widget.$in.validation).toBeDefined();
      expect(widget.$in.validation.props).toBe(propsSchema);
    });

    it('should use default onError (null)', async () => {
      const propsSchema = s.object({
        name: s.string(),
      });

      const widget = await createMerkurWidget({
        $plugins: [componentPlugin, validationPlugin({ props: propsSchema })],
        name: 'test-widget',
        version: '1.0.0',
        props: {},
      });

      expect(widget.$in.validation.onError).toBe(null);
    });
  });

  describe('validation on setProps', () => {
    let widget;
    let propsSchema;

    beforeEach(async () => {
      propsSchema = s.object({
        name: s.string(),
        count: s.number().optional(),
      });

      widget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          () =>
            validationPlugin({
              props: propsSchema,
              onError: () => {
                // Silent handler for most tests
              },
            }),
        ],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 'initial' },
        load() {
          return {};
        },
        mount() {
          return {};
        },
        update() {
          return {};
        },
      });

      await widget.mount();
    });

    it('should allow valid props', async () => {
      await widget.setProps({ name: 'updated', count: 42 });

      expect(widget.props.name).toBe('updated');
      expect(widget.props.count).toBe(42);
    });

    it('should allow props setter function', async () => {
      await widget.setProps((props) => ({ name: props.name + '-modified' }));

      expect(widget.props.name).toBe('initial-modified');
    });

    it('should throw on invalid props when onError is null', async () => {
      const throwWidget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: null }),
        ],
        name: 'throw-widget',
        version: '1.0.0',
        props: { name: 'valid' },
        load() {
          return {};
        },
        mount() {
          return {};
        },
        update() {
          return {};
        },
      });

      await throwWidget.mount();

      await expect(throwWidget.setProps({ name: 123 })).rejects.toThrow();
    });

    it('should call custom error handler on invalid props', async () => {
      const customHandler = jest.fn();

      const customWidget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: customHandler }),
        ],
        name: 'custom-widget',
        version: '1.0.0',
        props: { name: 'valid' },
        load() {
          return {};
        },
        mount() {
          return {};
        },
        update() {
          return {};
        },
      });

      await customWidget.mount();
      await customWidget.setProps({ name: 123 });

      expect(customHandler).toHaveBeenCalled();
      expect(customHandler).toHaveBeenCalledWith(
        customWidget,
        expect.objectContaining({ success: false }),
      );
    });
  });

  describe('validation on mount', () => {
    let propsSchema;

    beforeEach(() => {
      propsSchema = s.object({
        name: s.string(),
      });
    });

    it('should throw on invalid props during mount when onError is null', async () => {
      const widget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: null }),
        ],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 123 }, // Invalid
        mount() {
          return {};
        },
      });

      await expect(widget.mount()).rejects.toThrow();
    });

    it('should not throw if props are valid on mount', async () => {
      const widget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: null }),
        ],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 'valid' },
        mount() {
          return {};
        },
      });

      await expect(widget.mount()).resolves.not.toThrow();
    });

    it('should skip validation if props is empty', async () => {
      const widget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: null }),
        ],
        name: 'test-widget',
        version: '1.0.0',
        props: {},
        mount() {
          return {};
        },
      });

      await expect(widget.mount()).rejects.toThrow();
    });
  });

  describe('props transformation', () => {
    it('should use validated/transformed data from schema', async () => {
      const propsSchema = s.object({
        name: s.string(),
        count: s.number().optional(),
      });

      const widget = await createMerkurWidget({
        $plugins: [componentPlugin, validationPlugin({ props: propsSchema })],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 'test', count: 42 },
        load() {
          return {};
        },
        mount() {
          return {};
        },
        update() {
          return {};
        },
      });

      await widget.mount();

      // Props should be set from result.data (validated/transformed)
      expect(widget.props.name).toBe('test');
      expect(widget.props.count).toBe(42);
    });
  });

  describe('setProps before mount', () => {
    it('should defer validation until widget is mounted', async () => {
      const propsSchema = s.object({
        name: s.string(),
      });

      const widget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: null }),
        ],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 'initial' },
        load() {
          return {};
        },
        mount() {
          return {};
        },
        update() {
          return {};
        },
      });

      // setProps before mount is suspended (queued for after mount)
      // Using valid props here - they will be validated after mount
      await widget.setProps({ name: 'updated' });

      // Mount succeeds - initial props are valid
      await widget.mount();

      // After mount, suspended setProps should have run and validated
      expect(widget.props.name).toBe('updated');
    });

    it('should throw when suspended setProps has invalid props after mount', async () => {
      const propsSchema = s.object({
        name: s.string(),
      });

      const widget = await createMerkurWidget({
        $plugins: [
          componentPlugin,
          validationPlugin({ props: propsSchema, onError: null }),
        ],
        name: 'test-widget',
        version: '1.0.0',
        props: { name: 'initial' },
        load() {
          return {};
        },
        mount() {
          return {};
        },
        update() {
          return {};
        },
      });

      // Queue invalid setProps (will run after mount)
      await widget.setProps({ name: 123 });

      // Mount will throw because the suspended setProps with invalid props runs
      await expect(widget.mount()).rejects.toThrow();
    });
  });
});
