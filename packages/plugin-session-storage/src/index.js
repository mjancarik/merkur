import { bindWidgetToFunctions } from '@merkur/core';

const KEY_PREFIX_SEPARATOR = '__';

export function setKeyPrefix(
  widget,
  additionalWords = [],
  defaultWords = ['widget', widget.name, widget.version]
) {
  const words = [...defaultWords, ...additionalWords].filter(Boolean);
  const prefix = `${KEY_PREFIX_SEPARATOR}${words.join(
    KEY_PREFIX_SEPARATOR
  )}${KEY_PREFIX_SEPARATOR}`;

  widget.$in.sessionStorage.keyPrefix = prefix;
}

export function sessionStoragePlugin() {
  return {
    async setup(widget) {
      widget = {
        ...sessionStorageAPI(),
        ...widget,
      };

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
          return JSON.parse(sessionStorage.getItem(keyPrefix + key))?.value;
        } catch (error) {
          throw new Error(
            `merkur.plugin-session-storage.get: Failed to parse a session storage item value identified by the key ${
              keyPrefix + key
            }: ${error.message}`
          );
        }
      },

      /**
       * Saves a value under the key.
       * @param {object} widget A widget object.
       * @param {string} key A key
       * @param {*} value A value
       * @return {boolean} It's `true` when the operation was successful,
       *         otherwise `false`.
       */
      set(widget, key, value) {
        const {
          $dependencies: { sessionStorage },
          $in: {
            sessionStorage: { keyPrefix },
          },
        } = widget;

        if (!sessionStorage) {
          return false;
        }

        try {
          sessionStorage.setItem(
            keyPrefix + key,
            JSON.stringify({
              created: Date.now(),
              value,
            })
          );
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
