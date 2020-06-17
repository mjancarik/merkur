const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');
const README = path.resolve(process.cwd(), 'README.md');

const PACKAGES = fs.readdirSync(PACKAGES_DIR);
const IGNORED_PACKAGES = [
  'plugin-component',
  'plugin-event-emitter',
  'plugin-http-client',
];

PACKAGES.forEach((packageName) => {
  if (packageName[0] === '.' || IGNORED_PACKAGES.includes(packageName)) {
    return;
  }

  let modulePath = path.resolve(PACKAGES_DIR, packageName);

  fs.copyFileSync(README, modulePath + '/README.md');
});
