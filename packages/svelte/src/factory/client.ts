import {
  WidgetParams,
  createMerkur,
  createMerkurWidget,
  defineWidget,
} from '@merkur/core';
import { ViewType } from '@merkur/plugin-component';
import { ComponentType, SvelteComponentTyped } from 'svelte';
import { RenderParams } from '../types';
import { mapViews } from '@merkur/plugin-component/helpers';

declare module '@merkur/core' {
  interface WidgetExternal {
    app: Record<string, any>;
  }
}

declare module '@merkur/plugin-component' {
  interface ViewType
    extends ComponentType<SvelteComponentTyped<RenderParams>> {}
}

/**
 *
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
      shouldHydrate(widget, { container }) {
        return !!container?.children?.length;
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

            const hydrate = widget.shouldHydrate({
              View,
              ErrorView,
              container,
              containerSelector,
              ...rest,
            });

            const renderView = (RenderedView: ViewType) => {
              widget.$external.app[containerSelector] = new RenderedView({
                target: container,
                props: {
                  widget,
                  state: widget.state,
                  props: widget.props,
                },
                hydrate,
              });
            };

            // @ts-expect-error the @merkur/plugin-error is optional
            if (widget?.error?.status && ErrorView) {
              return renderView(ErrorView);
            }

            return renderView(View);
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
