import { Widget } from '@merkur/core';
import { WidgetProps, WidgetState } from '@merkur/plugin-component';

export interface RenderParams {
  widget: Widget;
  state: WidgetState;
  props: WidgetProps;
}
