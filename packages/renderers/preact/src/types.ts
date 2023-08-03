import { ViewType, Widget } from '@merkur/core';

export type ViewFactorySlotType = { name: string; View: ViewType };
export type ViewFactory = (widget: Widget) => {
  View: ViewType;
  ErrorView?: ViewType;
  slot?: Record<string, ViewFactorySlotType>;
};
