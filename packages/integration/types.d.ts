import { WidgetAsset, SourceAsset } from '@merkur/core';

export const isLoadedSymbol: symbol;
export const loadingPromiseSymbol: symbol;

export interface LoadedAsset extends SourceAsset {
  element: HTMLElement | null;
}

export interface TestScript {
  isES9Supported(): boolean;
  isES11Supported(): boolean;
  isES13Supported(): boolean;
}

export const testScript: TestScript;

export function loadAssets(
  assets: (WidgetAsset | SourceAsset)[],
  root?: HTMLElement,
): Promise<LoadedAsset[]>;

export function loadStyleAssets(
  assets: (WidgetAsset | SourceAsset)[],
  root?: HTMLElement,
): Promise<LoadedAsset[]>;

export function loadScriptAssets(
  assets: (WidgetAsset | SourceAsset)[],
  root?: HTMLElement,
): Promise<LoadedAsset[]>;

export function loadJsonAssets(
  assets: (WidgetAsset | SourceAsset)[],
  root?: HTMLElement,
): Promise<LoadedAsset[]>;
