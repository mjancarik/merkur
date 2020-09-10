const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

export const ERROR_EVENTS = {
  ERROR: '@merkur/plugin-error.error',
};

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
        if (!widget.$in.eventEmitter) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-event-emitter'
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
    emitError(widget, error);
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

export function setErrorInfo(widget, error) {
  widget.error.status = error.status;
  widget.error.message = error.message;

  if (ENV === DEV) {
    widget.error.stack = error.stack;
  }
}

function emitError(widget, thrownError) {
  widget.emit(ERROR_EVENTS.ERROR, { thrownError });
}

export async function renderContent(widget, methodName = 'mount', properties) {
  const method = widget.$in.error.originalFunctions[methodName];
  let result = null;

  if (widget.error.status) {
    // error was captured in an earlier lifecycle method
    try {
      // try rendering content, in case the method can handle the error state on its own
      result = await method(widget, ...properties);
      return result;
    } catch (err) {
      // content rendering failed
      // do not save the new error info, it would overwrite the previous error
      result = '';
      return result;
    }
  }

  try {
    // no earlier error captured
    result = await method(widget, ...properties);
    return result;
  } catch (err) {
    // save error info
    err.status = err.status || 500;
    setErrorInfo(widget, err);
    emitError(widget, err);

    // try rendering again
    return renderContent(widget, methodName, properties);
  }
}

function isFunction(value) {
  return typeof value === 'function';
}
