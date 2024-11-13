import { createBuildConfig } from './buildConfig.mjs';
import { createTaskConfig } from './taskConfig.mjs';
import { runBuild } from './runBuild.mjs';

export async function runTask({ cliConfig, merkurConfig, context }) {
  const { runTasks } = cliConfig;
  let task = { ...merkurConfig.task };

  if (runTasks.length !== 0) {
    Object.keys(task)
      .filter((taskName) => !runTasks.includes(taskName))
      .forEach((taskKey) => {
        delete task[taskKey];
      });
  }

  return Object.keys(task).reduce(async (result, key) => {
    const definition = task[key];

    const config = await createTaskConfig({
      definition,
      merkurConfig,
      cliConfig,
      context,
    });
    const build = await createBuildConfig({
      definition,
      config,
      merkurConfig,
      cliConfig,
      context,
    });
    result[definition.name] = await runBuild({
      definition,
      build,
      merkurConfig,
      cliConfig,
      config,
      context,
    });

    return result;
  }, context.task);
}
