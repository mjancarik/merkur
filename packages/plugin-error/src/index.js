const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

export function errorPlugin() {
  return {
    async setup(widget) {
      widget.error = widget.error
        ? widget.error
        : {
            status: null,
            message: null,
          };

      widget.$in.error = {
        originalFunctions: {},
      };

      return widget;
    },
    async create(widget) {
      if (ENV === DEV) {
        if (!widget.$in.component) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-component'
          );
        }
      }

      const { mount, update, info, load } = widget;

      widget.$in.error.originalFunctions = {
        load,
        info,
        mount,
        update,
      };

      widget.load = loadHook;
      widget.info = infoHook;
      widget.mount = mountHook;
      widget.update = updateHook;
      return widget;
    },
  };
}

// LIFECYCLE HOOKS

async function loadHook(widget, ...rest) {
  let result = {};
  if (widget.error.status) {
    return result;
  }

  try {
    result = await widget.$in.error.originalFunctions.load(widget, ...rest);
  } catch (error) {
    error.status = error.status || 500;

    setErrorInfo(widget, error);
    runErrorHandler(widget, error);
    setErrorView(widget);
  }

  return result;
}

async function infoHook(widget, ...rest) {
  const { info } = widget.$in.error.originalFunctions;
  const result = isFunction(info) ? await info(widget, ...rest) : {};

  return {
    error: widget.error,
    ...result,
  };
}

async function mountHook(widget, ...rest) {
  return renderContent(widget, 'mount', rest);
}

async function updateHook(widget, ...rest) {
  return renderContent(widget, 'update', rest);
}

// HELPER FUNCTIONS

function setErrorInfo(widget, error) {
  widget.error.status = error.status;
  widget.error.message = error.message;
}

function runErrorHandler(widget, error) {
  if (isFunction(widget.errorHandler)) {
    widget.errorHandler(error);
  }
}

function setErrorView(widget) {
  if (widget.ErrorView) {
    widget.View = widget.ErrorView;
  }
}

async function renderContent(widget, methodName = 'mount', properties) {
  const method = widget.$in.error.originalFunctions[methodName];
  let result = null;

  if (widget.error.status) {
    setErrorView(widget);
  }

  try {
    result = await method(widget, ...properties);
  } catch (error) {
    error.status = error.status || 500;

    setErrorInfo(widget, error);
    runErrorHandler(widget, error);

    if (widget.ErrorView) {
      widget.View = widget.ErrorView;
      result = await method(widget, ...properties);
    } else {
      result = '';
    }
  }

  return result;
}

function isFunction(value) {
  return typeof value === 'function';
}
