const execa = require('execa');
const fs = require('fs');
const fsx = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const argv = require('yargs').argv;
const { info, error } = console;

const dir = argv._[0];

let exampleResolver = argv.example
  ? Promise.resolve({ example: argv.example })
  : inquirer.prompt([
      {
        type: 'list',
        name: 'view',
        message: 'Choose a view configuration:',
        choices: [
          {
            name: `${chalk.bold.blue(
              'Hyper'
            )} - The basic counter example with hyper.`,
            value: 'hyper',
          },
          {
            name: `${chalk.bold.blue(
              'React'
            )} - The basic counter example with react.`,
            value: 'react',
          },
        ],
      },
    ]);

exampleResolver.then(({ view }) => {
  createMerkurApp(dir, view);
});

function createMerkurApp(dirName, view) {
  info(
    `Creating new MERKUR app inside ${chalk.green(
      dirName
    )} directory for ${view}...`
  );

  const projName = dirName.split(path.sep).pop();
  const appRoot = path.resolve(dirName.toString());
  const tplRoot = path.join(__dirname, '../template');
  const viewRoot = path.resolve(__dirname, `../views/${view}`);
  const dependencies = {
    hyper: {
      hyperhtml: '^2.32.2',
      viperhtml: '^2.17.1',
    },
  };

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
        'already exists'
      )}.\n`
    );
    process.exit(0);
  }

  // Overwrite package.json with new name
  const pkgJsonPath = path.join(appRoot, 'package.json');
  const pkgJson = require(pkgJsonPath);

  pkgJson.name = projName;

  Object.entries(dependencies[view]).forEach(([module, version]) => {
    pkgJson.dependencies[module] = version;
  });

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  info(`Creating ${chalk.cyan(view)} merkur files...`);
  fsx.copySync(viewRoot, appRoot);

  // Run npm install
  info(
    `Running ${chalk.cyan(
      'npm install'
    )} inside app directory, this might take a while...`
  );
  // eslint-disable-next-line no-console
  console.log(chalk.dim('      Press CTRL+C to cancel.\n'));

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execa.sync(npm, ['install'], {
    stdio: 'inherit',
    cwd: appRoot,
  });

  // Show final info
  info(`${chalk.bold('Success!')} Created ${chalk.cyan(
    projName
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
