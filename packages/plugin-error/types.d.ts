import { Widget, WidgetPlugin } from '@merkur/core';

export interface ErrorEvents {
  ERROR: string;
}

export const ERROR_EVENTS: ErrorEvents;

export interface ErrorWidgetState {
  error: {
    status: number | null;
    message: string | null;
  };
}

export interface GenericErrorParams {
  status?: number;
  [key: string]: any;
}

export class GenericError extends Error {
  constructor(message: string, params?: GenericErrorParams);
  status: number;
  readonly params: Record<string, any>;
}

export function errorPlugin(): WidgetPlugin;
