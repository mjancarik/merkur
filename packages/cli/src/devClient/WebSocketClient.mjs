import { Observable } from '@esmj/observable';

const MAX_RECONNECTION = 5;

export class WebSocketClient extends Observable {
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
      `${this.#options.protocol}//${this.#options.host}`,
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
