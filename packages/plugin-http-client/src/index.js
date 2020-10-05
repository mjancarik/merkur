import { bindWidgetToFunctions } from '@merkur/core';

import fetch from 'node-fetch';
import AbortController from 'abort-controller';

export function setDefaultConfig(widget, newDefaultConfig) {
  widget.$in.httpClient.defaultConfig = {
    ...widget.$in.httpClient.defaultConfig,
    ...newDefaultConfig,
  };
}

export function getDefaultTransformers() {
  return [transformBody(), transformQuery(), transformTimeout()];
}

export function httpClientPlugin() {
  return {
    async setup(widget) {
      widget = {
        ...httpClientAPI(),
        ...widget,
      };

      widget.$in.httpClient = {
        defaultConfig: {
          method: 'GET',
          transformers: getDefaultTransformers(widget),
          headers: {},
          query: {},
          timeout: 15000,
        },
      };

      widget.$dependencies.fetch = getFetchAPI();
      widget.$dependencies.AbortController = AbortController;

      bindWidgetToFunctions(widget, widget.http);

      return widget;
    },
  };
}

function httpClientAPI() {
  return {
    http: {
      async request(widget, requestConfig) {
        let request = {
          ...widget.$in.httpClient.defaultConfig,
          ...requestConfig,
        };
        const transformers = request.transformers;

        [request] = await runTransformers(
          widget,
          transformers,
          'transformRequest',
          request
        );

        let response = await widget.$dependencies.fetch(request.url, request);

        [request, response] = await runTransformers(
          widget,
          transformers,
          'transformResponse',
          request,
          response
        );

        return { request, response };
      },
    },
  };
}

async function runTransformers(widget, transformers, method, ...rest) {
  for (const transformer of transformers) {
    if (typeof transformer[method] === 'function') {
      rest = await transformer[method](widget, ...rest);
    }
  }

  return rest;
}

function getFetchAPI() {
  if (typeof window === 'undefined' || !window.fetch) {
    return fetch;
  }

  return window.fetch.bind(window);
}

export function transformQuery() {
  return {
    async transformRequest(widget, request) {
      let newRequest = { ...request };
      let { baseUrl = '', path = '/' } = request;

      if (!request.url) {
        newRequest.url = `${
          baseUrl.endsWith('/')
            ? baseUrl.substring(0, baseUrl.length - 1)
            : baseUrl
        }/${path.startsWith('/') ? path.substring(1) : path}`;
      } else {
        newRequest.url = request.url;
      }

      const queryString = Object.keys(request.query)
        .map((key) =>
          [key, request.query[key]].map(encodeURIComponent).join('=')
        )
        .join('&');
      const hasQuestionMark = newRequest.url.indexOf('?') !== -1;

      if (hasQuestionMark) {
        newRequest.url += queryString ? `&${queryString}` : '';
      } else {
        newRequest.url += queryString ? `?${queryString}` : '';
      }

      return [newRequest];
    },
  };
}

export function transformBody() {
  return {
    async transformResponse(widget, request, response) {
      const contentType = response.headers.get('content-type');
      let body = null;

      if (response.status !== 204) {
        if (contentType && contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
      }

      let newResponse = copyResponse(response);
      newResponse.body = body;

      return [request, newResponse];
    },
    async transformRequest(widget, request) {
      if (
        request.body &&
        request.headers['Content-Type'] === 'application/json' &&
        !['GET', 'HEAD'].includes(request.method)
      ) {
        let newRequest = { ...request, body: JSON.stringify(request.body) };

        return [newRequest];
      }

      return [request];
    },
  };
}

export function transformTimeout() {
  return {
    async transformRequest(widget, request) {
      let newRequest = { ...request };

      if ('timeout' in request) {
        const controller = new widget.$dependencies.AbortController();
        newRequest.signal = controller.signal;

        newRequest.timeoutTimer = setTimeout(() => {
          controller.abort();
        }, request.timeout);
      }

      return [newRequest];
    },
    async transformResponse(widget, request, response) {
      if ('timeoutTimer' in request) {
        clearTimeout(request.timeoutTimer);
      }

      return [request, response];
    },
  };
}

function copyResponse(response) {
  const {
    body,
    headers,
    ok,
    redirected,
    status,
    statusText,
    trailers,
    type,
    url,
    useFinalURL,
  } = response;

  return {
    body,
    headers,
    ok,
    redirected,
    status,
    statusText,
    trailers,
    type,
    url,
    useFinalURL,
  };
}
