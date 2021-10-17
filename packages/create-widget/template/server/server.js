const cluster = require('cluster');
const os = require('os');

const config = require('config');

const { app } = require('./app');

const serverConfig = config.get('server');

process.on('uncaughtException', (error) => {
  console.error(error);
});

process.on('unhandledRejection', (error) => {
  console.error(error);
});

if (!serverConfig.clusters || !cluster.isMaster) {
  const server = app.listen(config.get('server.port'), () => {
    console.log(`listen on localhost:${config.get('server.port')}`); // eslint-disable-line no-console
  });

  const handleExit = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', handleExit);
  process.on('SIGQUIT', handleExit);
  process.on('SIGTERM', handleExit);
} else {
  let cpuCount = serverConfig.clusters || os.cpus().length;

  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.warn(`Worker ${worker.id} died :(`);
    cluster.fork();
  });
}
