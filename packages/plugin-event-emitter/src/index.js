export function eventEmitterPlugin() {
  return {
    async setup(widget) {
      widget = {
        ...eventEmitterAPI(),
        ...widget,
      };

      widget.$in.eventEmitter = {
        event: {},
      };

      return widget;
    },
  };
}

function eventEmitterAPI() {
  return {
    on(widget, eventName, callback) {
      const {
        $in: {
          eventEmitter: { event },
        },
      } = widget;

      if (!event[eventName]) {
        event[eventName] = [];
      }

      event[eventName].push(callback);

      return widget;
    },
    off(widget, eventName, callback) {
      const {
        $in: {
          eventEmitter: { event },
        },
      } = widget;

      if (!event[eventName] || event[eventName].indexOf(callback) === -1) {
        return;
      }

      const position = event[eventName].indexOf(callback);
      event[eventName].splice(position, 1);

      return widget;
    },
    emit(widget, eventName, ...rest) {
      const {
        $in: {
          eventEmitter: { event },
        },
      } = widget;

      if (!event[eventName]) {
        return;
      }

      event[eventName].forEach((callback) => {
        callback(widget, ...rest);
      });

      return widget;
    },
  };
}
