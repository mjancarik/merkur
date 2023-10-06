import { assignMissingKeys, bindWidgetToFunctions } from '@merkur/core';

const KEY_PREFIX_SEPARATOR = '__';

export function setKeyPrefix(
  widget,
  additionalWords = [],
  defaultWords = ['widget', widget.name, widget.version],
) {
  const words = [...defaultWords, ...additionalWords].filter(Boolean);
  const prefix = `${KEY_PREFIX_SEPARATOR}${words.join(
    KEY_PREFIX_SEPARATOR,
  )}${KEY_PREFIX_SEPARATOR}`;

  widget.$in.sessionStorage.keyPrefix = prefix;
}

export function sessionStoragePlugin() {
  return {
    async setup(widget) {
      assignMissingKeys(widget, sessionStorageAPI());

      widget.$in.sessionStorage = {};
      setKeyPrefix(widget);

      widget.$dependencies.sessionStorage = getNativeSessionStorage();

      return widget;
    },
    async create(widget) {
      bindWidgetToFunctions(widget, widget.sessionStorage);

      return widget;
    },
  };
}

function sessionStorageAPI() {
  return {
    sessionStorage: {
      get(widget, key) {
        const {
          $dependencies: { sessionStorage },
          $in: {
            sessionStorage: { keyPrefix },
          },
        } = widget;

        if (!sessionStorage) {
          return null;
        }

        try {
          const item = JSON.parse(sessionStorage.getItem(keyPrefix + key));

          if (shouldDeleteItem(item)) {
            widget.sessionStorage.delete(key);

            return undefined;
          }

          return item && typeof item === 'object' ? item.value : undefined;
        } catch (error) {
          throw new Error(
            `merkur.plugin-session-storage.get: Failed to parse a session storage item value identified by the key ${
              keyPrefix + key
            }: ${error.message}`,
          );
        }
      },

      /**
       * Saves a value under the key.
       * @param {object} widget A widget object.
       * @param {string} key A key
       * @param {*} value A value
       * @param {object} [options] An options object.
       * @param {number} [options.maxAge] Number of seconds after which the
       *        value should be removed.
       * @return {boolean} It's `true` when the operation was successful,
       *         otherwise `false`.
       */
      set(widget, key, value, options) {
        const {
          $dependencies: { sessionStorage },
          $in: {
            sessionStorage: { keyPrefix },
          },
        } = widget;

        if (!sessionStorage) {
          return false;
        }

        const item = {
          created: Date.now(),
          value,
        };

        if (Number.isFinite(Number.parseInt(options?.maxAge))) {
          item.maxAge = Number.parseInt(options.maxAge);
        }

        if (shouldDeleteItem(item)) {
          widget.sessionStorage.delete(key);

          return true;
        }

        try {
          sessionStorage.setItem(keyPrefix + key, JSON.stringify(item));
        } catch (error) {
          console.error(error);

          return false;
        }

        return true;
      },

      delete(widget, key) {
        const {
          $dependencies: { sessionStorage },
          $in: {
            sessionStorage: { keyPrefix },
          },
        } = widget;

        if (!sessionStorage) {
          return false;
        }

        sessionStorage.removeItem(keyPrefix + key);

        return true;
      },
    },
  };
}

function getNativeSessionStorage() {
  return typeof window === 'undefined' ? undefined : window.sessionStorage;
}

function shouldDeleteItem(item) {
  if (!item || !('maxAge' in item) || !item.created) {
    return false;
  }

  if (item.maxAge <= 0) {
    return true;
  }

  const now = Date.now();
  const age = now - item.created;

  return age > item.maxAge * 1000;
}
