'use strict';

const WebSocket = require('ws');

const DEFAULT_OPTIONS = {
  port: 4321,
};

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
  options = Object.assign({}, DEFAULT_OPTIONS, options);
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
  options = Object.assign({}, DEFAULT_OPTIONS, options);
  const client = new WebSocket('ws://localhost:' + options.port);

  return client;
}

module.exports = {
  DEFAULT_OPTIONS,
  createServer,
  createClient,
};
