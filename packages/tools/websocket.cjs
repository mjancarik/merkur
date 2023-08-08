'use strict';

const WebSocket = require('ws');

function broadcastMessage(server, fromClient, data) {
  server.clients.forEach(function each(toClient) {
    sendMessage(fromClient, toClient, data);
  });
}

function sendMessage(fromClient, toClient, data) {
  if (toClient !== fromClient && toClient.readyState === WebSocket.OPEN) {
    toClient.send(data);
  }
}

function createServer(options = {}) {
  options = Object.assign(
    {},
    { port: process.env.MERKUR_PLAYGROUND_LIVERELOAD_PORT },
    options,
  );

  let server = null;

  try {
    server = new WebSocket.Server(options);
    server.on('connection', function connection(ws) {
      ws.on('message', function incoming(data, isBinary) {
        data = isBinary ? data : data.toString();
        broadcastMessage(server, ws, data);
      });
    });
  } catch (error) {
    console.error(error);
  }

  return server;
}

function createClient(options) {
  options = Object.assign(
    {},
    { port: process.env.MERKUR_PLAYGROUND_LIVERELOAD_PORT },
    options,
  );

  return new WebSocket('ws://localhost:' + options.port);
}

module.exports = {
  createServer,
  createClient,
};
