const fp = require('find-free-port');
const WebSocket = require('./websocket.cjs');

async function createLiveReloadServer() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const [freePort] = await fp(4321);
      process.env.MERKUR_PLAYGROUND_LIVERELOAD_PORT = freePort;

      WebSocket.createServer({
        port: freePort,
      });
    } catch (error) {
      console.error(error);
      throw new Error('Unable to retrieve free port for livereload server.');
    }
  }
}

module.exports = { createLiveReloadServer };
