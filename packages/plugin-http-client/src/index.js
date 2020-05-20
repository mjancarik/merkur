import fetch from 'node-fetch';

export function setDefaultConfig(widget, newDefaultConfig) {
  widget.$in.httpClient.defaultConfig = {
    ...widget.$in.httpClient.defaultConfig,
    ...newDefaultConfig,
  };
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
          transformers: [transformBody(), transformQuery()],
          headers: {
            'Content-Type': 'application/json',
          },
          query: {},
        },
      };

      widget.$dependencies.fetch = getFetchAPI();

      return widget;
    },
  };
}

function httpClientAPI() {
  return {
    async request(widget, requestConfig) {
      let request = {
        ...widget.$in.httpClient.defaultConfig,
        ...requestConfig,
      };
      const transformers = request.transformers;

      [request] = await runTransformers(
        transformers,
        'transformRequest',
        request
      );
      let response = await widget.$dependencies.fetch(request.url, request);

      [request, response] = await runTransformers(
        transformers,
        'transformResponse',
        request,
        response
      );

      return { request, response };
    },
  };
}

async function runTransformers(transformers, method, ...rest) {
  for (const transformer of transformers) {
    if (typeof transformer[method] === 'function') {
      rest = await transformer[method](...rest);
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

function transformQuery() {
  return {
    async transformRequest(request) {
      let newRequest = { ...request };
      newRequest.url = request.url || request.baseUrl + request.path;

      const queryString = Object.keys(request.query)
        .map((key) =>
          [key, request.query[key]].map(encodeURIComponent).join('=')
        )
        .join('&');
      const hasQuestionMark = newRequest.url.indexOf('?') !== -1;

      if (hasQuestionMark) {
        newRequest.url += `&${queryString}`;
      } else {
        newRequest.url += `?${queryString}`;
      }

      return [newRequest];
    },
  };
}

function transformBody() {
  return {
    async transformResponse(request, response) {
      const contentType = response.headers.get('content-type');
      let body = null;

      if (response.status !== 204) {
        if (contentType && contentType.includes('application/json')) {
          body = await response.json();
        } else {
          body = await response.text();
        }
      }

      let newResponse = { ...response, body };
      return [request, newResponse];
    },
    async transformRequest(request) {
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
