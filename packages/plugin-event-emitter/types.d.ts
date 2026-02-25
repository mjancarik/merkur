import '@merkur/core';

declare module '@merkur/core' {
  interface WidgetPartial {
    on: (
      widget: WidgetPartial,
      event: string,
      callback: (...args: any[]) => any,
    ) => ReturnType<WidgetFunction>;
    off: (
      widget: WidgetPartial,
      event: string,
      callback: (...args: any[]) => any,
    ) => ReturnType<WidgetFunction>;
    emit: (
      widget: WidgetPartial,
      event: string,
      ...args: any[]
    ) => ReturnType<WidgetFunction>;
  }
}
