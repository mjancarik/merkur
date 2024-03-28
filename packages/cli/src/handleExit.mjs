import process from 'node:process';

export async function handleExit({ context }) {
  const handleExit = async () => {
    Object.values(context.process).forEach((childProcess) => {
      childProcess.kill('SIGTERM');
    });

    Object.values(context.task).forEach((task) => {
      task.dispose();
    });

    await Promise.all(
      Object.values(context.server).map((server) => {
        return new Promise((resolve) => {
          const timer = setTimeout(() => {
            resolve();
          }, 100);
          server.close(() => {
            clearTimeout(timer);
            resolve();
          });
        });
      }),
    );

    process.exit(0);
  };

  process.on('SIGINT', handleExit);
  process.on('SIGQUIT', handleExit);
  process.on('SIGTERM', handleExit);
}
