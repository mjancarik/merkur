import path from 'node:path';
import fs from 'node:fs';

let userDefinedCommandsPaths = [];

/**
 * Extend the commands from a directory
 * @param {string} commandsDir - The directory containing the commands
 * @returns {Promise<void>}
 */
const extendCommandsFromDir = async (commandsDir) => {
  userDefinedCommandsPaths = userDefinedCommandsPaths.concat(
    fs
      .readdirSync(commandsDir)
      .map((command) => ({ dir: commandsDir, command }))
      .filter(({ command, dir }) => {
        return (
          fs.statSync(path.join(dir, command)).isFile() &&
          (command.endsWith('.js') ||
            command.endsWith('.mjs') ||
            command.endsWith('.cjs'))
        );
      }),
  );
};

const existsMerkurConfig = fs
  .readdirSync(process.cwd())
  .includes('merkur.config.mjs');

if (existsMerkurConfig) {
  const merkurDir = path.resolve(process.cwd(), 'node_modules/@merkur');
  if (fs.existsSync(merkurDir)) {
    let dirs = fs.readdirSync(merkurDir);

    for (const dir of dirs) {
      const fullPath = path.join(merkurDir, `${dir}/commands`);
      if (fs.existsSync(fullPath)) {
        await extendCommandsFromDir(fullPath);
      }
    }
  }
}

export { userDefinedCommandsPaths };
