'use strict';

const WebSocket = require('ws');
const path = require('path');

const express = require('express');

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
      ws.on('message', function incoming(data) {
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

function liveReloadFactory(app, options) {
  options = Object.assign({}, DEFAULT_OPTIONS, options);

  const client = createClient(options);
  client.on('error', () => {
    console.info('Livereload is disabled.'); //eslint-disable-line no-console
  });

  app.use(
    '/@merkur/tools/static/',
    express.static(path.join(__dirname, '../node_modules/@merkur/tools/static'))
  );

  client.on('open', function open() {
    client.send(JSON.stringify({ to: 'browser', command: 'reload' }));
  });

  return {
    client,
  };
}

module.exports = {
  liveReloadFactory,
  createServer,
  createClient,
};
