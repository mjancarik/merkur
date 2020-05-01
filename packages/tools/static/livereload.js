const MAX_RECONNECTION = 5;

class WebSocketMerkur {
  constructor(options) {
    /**
     * @type {?WebSocket}
     */
    this._socket = null;

    /**
     * @type {Array}
     */
    this._observers = [];

    /**
     * @type {number}
     */
    this._reconnectionAttempt = 0;

    /**
     * @type {Object}
     */
    this._options = Object.assign({ url: 'ws://localhost:4321' }, options);
  }

  init() {
    this._connect();

    return this;
  }

  send(data) {
    if (this._socket) {
      this._socket.send(data);
    }

    return this;
  }

  destroy() {
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }

    return this;
  }

  /**
   * @param  {function} [observer=() => {}]
   */
  subscribe(observer = () => {}) {
    this._observers.push(observer);

    return this;
  }

  /**
   * @param  {function} [observer=() => {}]
   */
  unsubscribe(observer = () => {}) {
    const index = this._observers.indexOf(observer);

    if (index !== -1) {
      this._observers.splice(index, 1);
    }

    return this;
  }

  /**
   * Returns count of observers.
   * @return {number} The number of observers.
   */
  observersCount() {
    return this._observers.length;
  }

  /**
   * The method notify all observers.
   *
   * @param  {*} data
   */
  _notify(data) {
    this._observers.forEach((observer) => observer(data));
  }

  _connect() {
    this._socket = Reflect.construct(WebSocket, [
      this._options.url,
      this._options.protocols,
    ]);

    this._socket.onopen = () => {
      this._reconnectionAttempt = 0;
    };

    this._socket.onmessage = (event) => {
      try {
        let data = JSON.parse(event.data);

        this._notify(data);
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    };

    this._socket.onerror = (error) => {
      console.error(error); // eslint-disable-line no-console
    };

    this._socket.onclose = () => {
      if (this._reconnectionAttempt >= MAX_RECONNECTION) {
        return;
      }

      this._reconnectionAttempt += 1;

      setTimeout(() => {
        this._connect();
      }, this._reconnectionAttempt * 500);
    };
  }
}

window.__merkur_dev__ = window.__merkur_dev__ || {};
window.__merkur_dev__.webSocket = new WebSocketMerkur(
  window.__merkur_dev__.webSocketOptions
)
  .init()
  .subscribe(({ to, command }) => {
    if (to === 'browser' && command === 'reload') {
      location.reload();
    }
  });
