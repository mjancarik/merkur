import { bindWidgetToFunctions, hookMethod } from '@merkur/core';
import { setDefaultConfig, copyResponse } from '@merkur/plugin-http-client';

import CacheEntry from './CacheEntry';

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

export function getCacheKey({ method, url, body, query }) {
  const data = ~['GET', 'HEAD'].indexOf(method) ? query : body;
  let dataQuery = '';

  if (data) {
    try {
      dataQuery = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
    } catch (error) {
      console.warn('The provided data does not have valid JSON format', data);
    }
  }
  return `${method}:${url}?${dataQuery}`;
}

export function httpCachePlugin() {
  return {
    async setup(widget) {
      if (ENV === DEV && !widget.$in.httpClient) {
        throw new Error(
          'You must setup plugin @merkur/plugin-http-client before @merkur/plugin-http-cache'
        );
      }

      widget = {
        ...httpCacheAPI(),
        ...widget,
      };

      widget.$in.httpClient.cache = new Map();

      return widget;
    },
    async create(widget) {
      bindWidgetToFunctions(widget, widget.httpCache);

      if (widget.$httpCache) {
        widget.httpCache.deserialize(widget.$httpCache);
      }

      setDefaultConfig(widget, {
        useCache: true,
        ttl: 60000,
      });

      hookMethod(widget, 'info', infoHook);

      return widget;
    },
  };
}

export function cacheInTransformer() {
  return {
    async transformResponse(widget, request, response) {
      if (request.useCache && !response.cached) {
        const { cache } = widget.$in.httpClient;
        const cacheEntry = new CacheEntry(copyResponse(response), request.ttl);

        cache.set(getCacheKey(request), cacheEntry);
      }

      return [request, response];
    },
  };
}

export function cacheOutTransformer() {
  return {
    async transformRequest(widget, request, response) {
      if (request.useCache) {
        const cacheEntry = widget.httpCache.get(getCacheKey(request));

        if (cacheEntry) {
          return [request, { ...cacheEntry, cached: true }];
        }
      }

      return [request, response];
    },
  };
}

function httpCacheAPI() {
  return {
    httpCache: {
      get(widget, key) {
        const { cache } = widget.$in.httpClient;
        const cacheEntry = cache.get(key);

        return cacheEntry && !cacheEntry.isExpired() ? cacheEntry.value : null;
      },
      serialize(widget) {
        const { cache } = widget.$in.httpClient;
        const serializedData = {};

        for (const key of cache.keys()) {
          const entry = cache.get(key);

          if (entry instanceof CacheEntry) {
            serializedData[key] = entry.serialize();
          }
        }

        return JSON.stringify(serializedData).replace(
          /<\/script/gi,
          '<\\/script'
        );
      },

      deserialize(widget, serializedData) {
        const { cache } = widget.$in.httpClient;
        let parsedData = {};

        try {
          parsedData = JSON.parse(serializedData);
        } catch (error) {
          console.warn('Failed to parse http cache data', error);
        }

        for (const key of Object.keys(parsedData)) {
          let { value, ttl } = parsedData[key];

          if (ttl === 'Infinity') {
            ttl = Infinity;
          }

          cache.set(key, new CacheEntry(value, ttl));
        }
      },
    },
  };
}

async function infoHook(widget, originalInfoFn, ...rest) {
  const originalInfo = await originalInfoFn(...rest);

  return { ...originalInfo, $httpCache: widget.httpCache.serialize() };
}
