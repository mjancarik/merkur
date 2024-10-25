import WebSocket, { WebSocketServer } from 'ws';

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

export async function runSocketServer({ merkurConfig, context }) {
  try {
    const server = new WebSocketServer({
      port: merkurConfig.socketServer.port,
    });

    server.on('connection', function connection(ws) {
      ws.on('message', function incomingMessage(data, isBinary) {
        data = isBinary ? data : data.toString();
        broadcastMessage(server, ws, data);
      });
    });

    context.server.socketServer = server;
  } catch (error) {
    throw new Error(
      `Unable to create socket server on port ${merkurConfig.socketServer.port}.`,
      { cause: error },
    );
  }
}

export function createClient({ merkurConfig }) {
  const { protocol, host } = merkurConfig.socketServer;

  return new WebSocket(`${protocol}//${host}`);
}
