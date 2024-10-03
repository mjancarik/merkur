import { Widget } from '@merkur/core';
import {
  ViewFactory,
  ViewFactorySlotType,
  ViewType,
} from '@merkur/plugin-component';
export type MapViewArgs = {
  View: ViewType;
  ErrorView?: ViewType;
  containerSelector: string;
  container: Element | null;
  isSlot: boolean;
  slot?: Record<
    string,
    {
      isSlot: boolean;
      containerSelector?: string;
      container?: Element;
    } & ViewFactorySlotType
  >;
};
/**
 * Utility function to iterate thorugh views returned from
 * view factory and call callback function with view arguments
 * on each them.
 */
export declare function mapViews<T>(
  widget: Widget,
  viewFactory: ViewFactory,
  callback: (viewArgs: MapViewArgs) => T,
): Promise<void[]>;
