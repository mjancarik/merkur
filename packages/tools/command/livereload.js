const { createClient } = require('../websocket.cjs');

function livereload(options) {
  new Promise((resolve) => {
    options = Object.assign({}, options);

    const client = createClient(options);
    client.on('error', () => {
      console.info('Livereload is disabled.'); //eslint-disable-line no-console
      resolve();
    });

    client.on('open', function open() {
      client.send(JSON.stringify({ to: 'browser', command: 'reload' }));
      client.terminate();
      resolve();
    });

    return client;
  });
}

module.exports = livereload;
