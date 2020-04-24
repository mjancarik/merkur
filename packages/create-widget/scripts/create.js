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
              'Preact'
            )} - The basic counter example with preact.`,
            value: 'preact',
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
    `Creating new MERKUR widget inside ${chalk.green(
      dirName
    )} directory for ${view}...`
  );

  const projName = dirName.split(path.sep).pop();
  const appRoot = path.resolve(dirName.toString());
  const tplRoot = path.join(__dirname, '../template');
  const viewRoot = path.resolve(__dirname, `../views/${view}`);
  const packageTemplate = {
    hyper: {
      dependencies: {
        hyperhtml: '^2.32.2',
        viperhtml: '^2.17.1',
      },
    },
    preact: {
      dependencies: {
        preact: '^10.3.4',
        'preact-render-to-string': '^5.1.4',
      },
      devDependencies: {
        '@babel/preset-react': '^7.9.4',
        'babel-loader': '^8.1.0',
        'eslint-plugin-react': '7.19.0',
      },
    },
    react: {
      dependencies: {
        react: '^16.13.1',
        'react-dom': '^16.13.1',
      },
      devDependencies: {
        '@babel/preset-react': '^7.9.4',
        'babel-loader': '^8.1.0',
        'eslint-plugin-react': '7.19.0',
      },
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

  Object.keys(packageTemplate[view]).forEach((packageProperty) => {
    Object.entries(packageTemplate[view][packageProperty]).forEach(
      ([module, version]) => {
        pkgJson[packageProperty][module] = version;
      }
    );
  });

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  info(`Creating ${chalk.cyan(view)} merkur files...`);
  fsx.copySync(viewRoot, appRoot);

  // Run npm install
  info(
    `Running ${chalk.cyan(
      'npm install'
    )} inside widget directory, this might take a while...`
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
