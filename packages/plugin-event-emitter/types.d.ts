import { type WidgetFunction, type WidgetPlugin } from '@merkur/core';

export declare function eventEmitterPlugin(): WidgetPlugin;

declare module '@merkur/core' {
  interface WidgetInternal {
    eventEmitter: {
      event: Record<
        string,
        Array<(widget: WidgetPartial, ...args: any[]) => any>
      >;
    };
  }

  interface WidgetPartial {
    on: (
      widget: WidgetPartial,
      eventName: string,
      callback: (widget: WidgetPartial, ...args: any[]) => any,
    ) => ReturnType<WidgetFunction>;
    off: (
      widget: WidgetPartial,
      eventName: string,
      callback: (widget: WidgetPartial, ...args: any[]) => any,
    ) => ReturnType<WidgetFunction>;
    emit: (
      widget: WidgetPartial,
      eventName: string,
      ...args: any[]
    ) => ReturnType<WidgetFunction>;
  }
}
