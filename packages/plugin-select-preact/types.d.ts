import { WidgetState } from '@merkur/plugin-component';
import { Widget, WidgetPlugin } from '@merkur/core';
import { ComponentChildren } from 'preact';

import { WidgetPlugin } from '@merkur/core';
type Selector<
  D = null,
  R extends Record<string, unknown> = Record<string, unknown>,
> = (state: WidgetState, data: D) => R;
type Intersection<
  T extends {
    [K in keyof T]: T[K];
  },
> = T extends [infer Head, ...infer Tail] ? Head & Intersection<Tail> : unknown;

export declare function selectPlugin(): WidgetPlugin;

export declare function useSelect<
  D,
  R extends Record<string, any>[],
  S extends {
    [I in keyof R]: Selector<D, R[I]>;
  },
>(
  widget: any,
  data: D,
  ...selectors: S
): [
  Intersection<{
    [K in keyof S]: ReturnType<S[K]>;
  }>,
];
export declare function createStateSelector<
  D,
  R extends Record<string, any>[],
  S extends {
    [I in keyof R]: Selector<D, R[I]>;
  },
>(
  ...selectors: S
): ((state: WidgetState, data: any) => any) &
  import('reselect').OutputSelectorFields<
    (args_0: any) => any,
    {
      clearCache: () => void;
    }
  > & {
    clearCache: () => void;
  };

export interface SelectProviderProps {
  widget: Widget;
  children?: ComponentChildren;
}

export declare function SelectProvider(props: SelectProviderProps): any;

export declare const SelectContext: any;
export declare function selectPlugin(): WidgetPlugin;
