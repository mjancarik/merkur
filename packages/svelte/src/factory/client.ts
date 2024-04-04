import {
  WidgetParams,
  createMerkur,
  createMerkurWidget,
  defineWidget,
} from '@merkur/core';
import { mapViews } from './utils';
import { ViewType } from '@merkur/plugin-component';
import { ComponentType, SvelteComponent } from 'svelte';
import { RenderParams } from '../types';

declare module '@merkur/core' {
  interface WidgetExternal {
    app: Record<string, any>;
  }
}

declare module '@merkur/plugin-component' {
  interface ViewType extends ComponentType<SvelteComponent<RenderParams>> {}
}

/**
 * Client Factory for creating merkur widgets with svelte renderer.
 */
export function createSvelteWidget({
  name,
  version,
  viewFactory,
  ...restProps
}: Parameters<typeof defineWidget>[0]) {
  const widgetFactory = async (widgetParams: WidgetParams) =>
    createMerkurWidget({
      ...restProps,
      ...widgetParams,
      shouldHydrate(widget, { container, isSlot }) {
        return Boolean(container?.children?.length && !isSlot);
      },
      async mount(widget) {
        widget.$external.app = {};

        await mapViews(
          widget,
          viewFactory,
          ({ View, ErrorView, container, containerSelector, ...rest }) => {
            if (!container) {
              return;
            }

            const renderView = (RenderedView: ViewType) => {
              widget.$external.app[containerSelector] = new RenderedView({
                target: container,
                props: {
                  widget,
                  state: widget.state,
                  props: widget.props,
                },
                hydrate: widget.shouldHydrate(widget, {
                  View: RenderedView,
                  container,
                  containerSelector,
                  ...rest,
                }),
              });
            };

            // @ts-expect-error the @merkur/plugin-error is optional
            if (widget?.error?.status && ErrorView) {
              return renderView(ErrorView(widget));
            }

            return renderView(View(widget));
          },
        );
      },
      async update(widget) {
        await mapViews(widget, viewFactory, ({ containerSelector }) => {
          if (!widget.$external.app[containerSelector]) {
            return;
          }

          widget.$external.app[containerSelector].$set({
            state: widget.state,
            props: widget.props,
          });
        });
      },
      async unmount(widget) {
        await mapViews(widget, viewFactory, ({ containerSelector }) => {
          if (!widget.$external.app[containerSelector]) {
            return;
          }

          widget.$external.app[containerSelector].$destroy();
        });
      },
    });

  // Register widget factory on client
  createMerkur().register({
    name,
    version,
    createWidget: widgetFactory,
  });

  return widgetFactory;
}
