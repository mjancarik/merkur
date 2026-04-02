import { Widget, WidgetPartial, WidgetPlugin } from '@merkur/core';

export interface HttpTransformer {
  transformRequest?: (
    widget: Widget,
    request: HttpRequest,
    response: HttpResponse | null,
  ) => Promise<[HttpRequest, HttpResponse | null]>;
  transformResponse?: (
    widget: Widget,
    request: HttpRequest,
    response: HttpResponse,
  ) => Promise<[HttpRequest, HttpResponse]>;
  transformError?: (
    widget: Widget,
    error: Error,
    request: HttpRequest,
  ) => Promise<[Error, HttpRequest]>;
}

export interface HttpClientConfig {
  method?: string;
  url?: string;
  baseUrl?: string;
  path?: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  timeout?: number;
  transformers?: Array<HttpTransformer>;
  [key: string]: any;
}

/** Internal request object — evolves as it passes through the transformer pipeline. */
export interface HttpRequest extends HttpClientConfig {
  url: string;
  signal?: AbortSignal;
  timeoutTimer?: ReturnType<typeof setTimeout>;
}

export interface HttpResponse<T = any> {
  body: T;
  status: number;
  headers: Headers;
  ok: boolean;
  redirected?: boolean;
  statusText?: string;
  type?: string;
  url?: string;
}

export interface HttpResult<T = any> {
  request: HttpRequest;
  response: HttpResponse<T>;
}

export function httpClientPlugin(): WidgetPlugin;

export function setDefaultConfig(
  widget: WidgetPartial,
  newDefaultConfig: Partial<HttpClientConfig>,
): void;

export function getDefaultTransformers(widget?: Widget): Array<HttpTransformer>;

export function transformQuery(): HttpTransformer;

export function transformBody(): HttpTransformer;

export function transformTimeout(): HttpTransformer;

export function copyResponse<T = any>(response: Response): HttpResponse<T>;

declare module '@merkur/core' {
  interface WidgetPartial {
    http: {
      request<T = any>(config: HttpClientConfig): Promise<HttpResult<T>>;
    };
  }
}
