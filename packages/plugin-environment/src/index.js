export function environmentPlugin(config) {
  return () => {
    return {
      async setup(widget, widgetDefinition) {
        widget = {
          ...environmentAPI(),
          ...widget,
        };

        if (isClient()) {
          widget.$in.environment = { ...widget.environment };

          delete widgetDefinition.environment;
          delete widget.environment;
        } else {
          widget.$in.environment = {
            ...resolveEnvironment(process.env.NODE_ENV, config),
            ...process.env,
          };
        }

        return widget;
      },
    };
  };
}

function environmentAPI() {
  return {
    getEnv(widget, key = '') {
      return getEntry(widget.$in.environment, key);
    },
    hasEnv(widget, key = '') {
      try {
        getEntry(widget.$in.environment, key);

        return true;
      } catch (_) {
        return false;
      }
    },
    environment(widget) {
      return widget.$in.environment;
    },
  };
}

function getEntry(entries, key) {
  if (typeof key !== 'string') {
    throw new Error(`The key param: '${key}', must be a string.`);
  }

  if (Object.keys(entries).length <= 0) {
    throw new Error(`The input object is empty.`);
  }

  const getValueRecursively = (obj, keys) => {
    let key = keys.pop();

    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return keys.length > 0 ? getValueRecursively(obj[key], keys) : obj[key];
    } else {
      throw new Error(`Object does not contain property '${key}'.`);
    }
  };

  return getValueRecursively(entries, key.split('.').reverse());
}

function resolveEnvironment(env = 'production', config = {}) {
  if (env === 'development') {
    return config.dev || {};
  } else if (env === 'production') {
    return config.prod || {};
  }

  return config[env] || {};
}

function isClient() {
  return typeof window !== 'undefined';
}
