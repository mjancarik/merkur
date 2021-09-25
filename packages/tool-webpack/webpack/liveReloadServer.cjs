const WebSocket = require('@merkur/tools/websocket.cjs');

function createLiveReloadServer() {
  if (process.env.NODE_ENV === 'development') {
    WebSocket.createServer();
  }
}

module.exports = { createLiveReloadServer };
