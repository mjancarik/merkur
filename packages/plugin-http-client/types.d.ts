import { Widget, WidgetPlugin } from '@merkur/core';

export interface HttpClientConfig {
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  timeout?: number;
  transformers?: Array<(request: any) => any>;
  [key: string]: any;
}

export interface HttpResponse<T = any> {
  body: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export interface HttpClientWidget extends Widget {
  http: {
    request<T = any>(config: HttpClientConfig): Promise<HttpResponse<T>>;
    get<T = any>(
      url: string,
      config?: HttpClientConfig,
    ): Promise<HttpResponse<T>>;
    post<T = any>(
      url: string,
      data?: any,
      config?: HttpClientConfig,
    ): Promise<HttpResponse<T>>;
    patch<T = any>(
      url: string,
      data?: any,
      config?: HttpClientConfig,
    ): Promise<HttpResponse<T>>;
    put<T = any>(
      url: string,
      data?: any,
      config?: HttpClientConfig,
    ): Promise<HttpResponse<T>>;
    delete<T = any>(
      url: string,
      config?: HttpClientConfig,
    ): Promise<HttpResponse<T>>;
  };
}

export function httpClientPlugin(): WidgetPlugin;

export function setDefaultConfig(
  widget: Widget,
  newDefaultConfig: Partial<HttpClientConfig>,
): void;

export function getDefaultTransformers(
  widget: Widget,
): Array<(request: any) => any>;

export function transformQuery(): (request: any) => any;

export function transformBody(): (request: any) => any;

export function transformTimeout(): (request: any) => any;

export function copyResponse<T = any>(
  response: Response,
): Promise<HttpResponse<T>>;
