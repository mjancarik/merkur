import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fsx from 'fs-extra';
import { execaSync } from 'execa';
import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { argv } = yargs(hideBin(process.argv));

const { info, error } = console;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = argv._[0];

let viewResolver = argv.view
  ? Promise.resolve({ view: argv.view })
  : inquirer.prompt([
      {
        type: 'list',
        name: 'view',
        message: 'Choose a view configuration:',
        choices: [
          // {
          //   name: `${chalk.bold.blue(
          //     'µhtml',
          //   )} - The basic counter example with µhtml.`,
          //   value: 'uhtml',
          // },
          {
            name: `${chalk.bold.blue(
              'Preact',
            )} - The basic counter example with preact.`,
            value: 'preact',
          },
          // {
          //   name: `${chalk.bold.blue(
          //     'Svelte',
          //   )} - The basic counter example with svelte.`,
          //   value: 'svelte',
          // },
          {
            name: `${chalk.bold.blue(
              'Vanilla',
            )} - The basic counter example with vanilla js.`,
            value: 'vanilla',
          },
        ],
      },
    ]);

viewResolver.then(({ view }) => {
  createMerkurApp(dir, view);
});

function createMerkurApp(dirName, view) {
  info(
    `Creating new MERKUR widget inside ${chalk.green(
      dirName,
    )} directory for ${view}...`,
  );

  const projName = dirName.split(path.sep).pop();
  const appRoot = path.resolve(dirName.toString());
  const tplRoot = path.join(__dirname, '../template');
  const viewRoot = path.resolve(__dirname, `../views/${view}`);

  if (!fs.existsSync(viewRoot)) {
    error(`Example '${viewRoot}' is not defiend.`);
    process.exit(1);
  }

  if (!fs.existsSync(dirName)) {
    try {
      info(`Creating basic directory structure...`);
      fsx.copySync(tplRoot, appRoot);
    } catch (err) {
      error(err.message);
      process.exit(1);
    }
  } else {
    error(
      `Aborting... the directory ${dirName} ${chalk.bold.red(
        'already exists',
      )}.\n`,
    );
    process.exit(0);
  }

  // Overwrite package.json with template
  const pkgJsonPath = path.join(appRoot, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));

  const packageTemplatePath = path.join(viewRoot, 'template.json');
  const packageTemplate = JSON.parse(fs.readFileSync(packageTemplatePath));

  pkgJson.name = projName;

  Object.keys(packageTemplate).forEach((packageProperty) => {
    Object.entries(packageTemplate[packageProperty]).forEach(
      ([module, version]) => {
        pkgJson[packageProperty][module] = version;
      },
    );
  });

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  info(`Creating ${chalk.cyan(view)} merkur files...`);
  fsx.copySync(path.join(viewRoot, 'template'), appRoot);

  // Run npm install
  info(
    `Running ${chalk.cyan(
      'npm install',
    )} inside widget directory, this might take a while...`,
  );
  // eslint-disable-next-line no-console
  console.log(chalk.dim('      Press CTRL+C to cancel.\n'));

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execaSync(npm, ['install'], {
    stdio: 'inherit',
    cwd: appRoot,
  });

  // Show final info
  info(`${chalk.bold('Success!')} Created ${chalk.cyan(
    projName,
  )} inside ${chalk.green(appRoot)} directory.
From there you can run several commands:
  ${chalk.cyan('npm run test')}
    To start test runners.
  ${chalk.cyan('npm run lint')}
    To run eslint on your application source files.
  ${chalk.cyan('npm run dev')}
    To start development server.
  ${chalk.cyan('npm run build')}
    To build the application.
  ${chalk.cyan('npm run start')}
    To start express server.
We suggest that you start with:
  ${chalk.cyan('cd')} ${dirName}
  ${chalk.cyan('npm run dev')}
`);
}
