import esbuild from 'esbuild';

export async function runTask({ cliConfig, build }) {
  const { watch } = cliConfig;

  //es6 === es2015, es9 === es2018, es11 === es2020 es13 ===es2022
  try {
    const result = await (watch
      ? esbuild.context(build)
      : esbuild.build(build));

    if (watch) {
      await result.watch();
    }

    return result;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
