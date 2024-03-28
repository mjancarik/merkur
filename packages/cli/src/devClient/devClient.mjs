import { Observable } from '@esmj/observable';

const MAX_RECONNECTION = 5;

class WebSocketClient extends Observable {
  /**
   * @type {?WebSocket}
   */
  #socket = null;
  #reconnectionAttempt = 0;
  #options = {};

  constructor(options) {
    super();
    /**
     * @type {Object}
     */
    this.#options = options;
  }

  init() {
    this.#connect();

    return this;
  }

  send(data) {
    if (this.#socket) {
      this.#socket.send(data);
    }

    return this;
  }

  destroy() {
    if (this.#socket) {
      this.#socket.close();
      this.#socket = null;
    }

    return this;
  }

  #connect() {
    this.#socket = Reflect.construct(WebSocket, [
      `${this.#options.protocol}//${this.#options.hostname}:${this.#options.port}`,
    ]);

    this.#socket.onopen = () => {
      this.#reconnectionAttempt = 0;
    };

    this.#socket.onmessage = (event) => {
      try {
        let data = JSON.parse(event.data);

        this.next(data);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    };

    this.#socket.onerror = (error) => {
      console.error(error); // eslint-disable-line no-console
    };

    this.#socket.onclose = () => {
      if (this.#reconnectionAttempt >= MAX_RECONNECTION) {
        return;
      }

      this.#reconnectionAttempt += 1;

      setTimeout(() => {
        this.#connect();
      }, this.#reconnectionAttempt * 500);
    };
  }
}

window.__merkur_dev__.widgets = [];
window.__merkur_dev__.webSocket = new WebSocketClient(
  window.__merkur_dev__.merkurConfig.socket,
);
window.__merkur_dev__.webSocket
  .init()
  .subscribe(async ({ to, command, changed }) => {
    if (to === 'browser' && command === 'reload') {
      location.reload();
    }

    if (to === 'browser' && command === 'refresh') {
      await Promise.all(
        changed.map(async (asset) => {
          return new Promise((resolve) => {
            const element = document.querySelector(
              `[data-name="${asset.name}"]`,
            );

            if (!element) {
              location.reload();
              return;
            }

            let newElement = null;
            const searchParams = new URLSearchParams({
              version: Math.random(),
            });

            if (element.nodeName === 'LINK') {
              const url = new URL(element.href);
              newElement = element.cloneNode();

              newElement.onload = () => {
                element.remove();
                resolve();
              };
              newElement.onerror = () => {
                element.remove();
                resolve();
              };
              newElement.href = new URL(
                `${url.origin}${url.pathname}?${searchParams.toString()}`,
              );
            }

            if (element.nodeName === 'SCRIPT') {
              const url = new URL(element.src);
              newElement = document.createElement('script');
              newElement.setAttribute('data-name', asset.name);
              newElement.onload = () => {
                element.remove();
                resolve();
              };
              // TODO check bad scenario
              newElement.onerror = () => {
                element.remove();
                resolve();
              };

              newElement.src = new URL(
                `${url.origin}${url.pathname}?${searchParams.toString()}`,
              );
            }

            element.parentNode.insertBefore(newElement, element.nextSibling);
          });
        }),
      );

      if (!changed.some((asset) => asset.name.endsWith('.js'))) {
        return;
      }

      // HMR JS
      const widgets = window.__merkur_dev__.widgets;
      window.__merkur_dev__.widgets = [];

      widgets.forEach(async (widget) => {
        const {
          props,
          state,
          $external,
          name,
          version,
          containerSelector,
          container,
          slot,
        } = widget;
        const widgetProperties = {
          props,
          state,
          $external,
          name,
          version,
          containerSelector,
          container,
          slot,
        };
        const newWidget = await window.__merkur__.create(widgetProperties);

        await widget.unmount();
        await newWidget.mount();
      });
    }
  });

// TODO error-overlay
// __merkur_dev__.webSocket.subscribe(({ to, errors }) => {
//   if (to === 'browser' && Array.isArray(errors)) {
//     document.getElementById('error').innerHTML = errors[0].source;
//   }
// });

addEventListener('load', function () {
  const originalMerkurCreate = window.__merkur__.create;
  window.__merkur__.create = async function devClientHook(...rest) {
    const widget = await originalMerkurCreate(...rest);

    window.__merkur_dev__.widgets.push(widget);

    return widget;
  };
});
