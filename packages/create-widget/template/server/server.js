const cluster = require('cluster');
const os = require('os');

const { resolveConfig } = require('@merkur/cli/server');
const { merkurConfig } = resolveConfig();

const { app } = require('./app');

const { widgetServer } = merkurConfig;

process.on('uncaughtException', (error) => {
  console.error(error);
});

process.on('unhandledRejection', (error) => {
  console.error(error);
});

if (!widgetServer.clusters || !cluster.isMaster) {
  const server = app.listen({ port: widgetServer.port });

  const handleExit = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', handleExit);
  process.on('SIGQUIT', handleExit);
  process.on('SIGTERM', handleExit);
} else {
  let cpuCount = widgetServer.clusters || os.cpus().length;

  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.warn(`Worker ${worker.id} died :(`);
    cluster.fork();
  });
}
