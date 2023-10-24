import { hookMethod } from '@merkur/core';
export { default as GenericError } from './GenericError';

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

      return widget;
    },
    async create(widget) {
      if (ENV === DEV) {
        if (!widget.$in.component) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-component',
          );
        }
        if (!widget.$in.eventEmitter) {
          throw new Error(
            'You must install missing plugin: npm i @merkur/plugin-event-emitter',
          );
        }
      }

      hookMethod(widget, 'info', infoHook);
      hookMethod(widget, 'load', loadHook);
      hookMethod(widget, 'mount', mountHook);
      hookMethod(widget, 'update', updateHook);

      return widget;
    },
  };
}

// LIFECYCLE HOOKS

async function loadHook(widget, originalLoad, ...rest) {
  let result = {};
  if (widget.error.status) {
    return result;
  }

  try {
    result = await originalLoad(...rest);
  } catch (error) {
    error.status = error.status || 500;

    setErrorInfo(widget, error);
    emitError(widget, error);
  }

  return result;
}

async function infoHook(widget, originalInfo, ...rest) {
  const result = await originalInfo(...rest);

  return {
    error: widget.error,
    ...result,
  };
}

async function mountHook(widget, originalMount, ...rest) {
  return renderContent(widget, originalMount, rest);
}

async function updateHook(widget, originalUpdate, ...rest) {
  return renderContent(widget, originalUpdate, rest);
}

// HELPER FUNCTIONS

export function setErrorInfo(widget, error) {
  widget.error.status = error.status;
  widget.error.message = error.message;
  widget.error.url = error.params?.url;

  if (ENV === DEV) {
    widget.error.stack = error.stack;
  }
}

function emitError(widget, error) {
  widget.emit(ERROR_EVENTS.ERROR, { error });
}

export async function renderContent(widget, method, properties) {
  let result = null;

  if (widget.error.status) {
    // error was captured in an earlier lifecycle method
    try {
      // try rendering content, in case the method can handle the error state on its own
      result = await method(...properties);
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
    result = await method(...properties);
    return result;
  } catch (err) {
    // save error info
    err.status = err.status || 500;
    setErrorInfo(widget, err);
    emitError(widget, err);

    // try rendering again
    return renderContent(widget, method, properties);
  }
}
