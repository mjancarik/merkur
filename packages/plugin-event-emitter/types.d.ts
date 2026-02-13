import { Widget, WidgetPlugin } from '@merkur/core';

export interface EventEmitterWidget extends Widget {
  on(eventName: string, callback: (widget: Widget, ...args: any[]) => void): Widget;
  off(eventName: string, callback: (widget: Widget, ...args: any[]) => void): Widget;
  emit(eventName: string, ...args: any[]): Widget;
}

export function eventEmitterPlugin(): WidgetPlugin;
