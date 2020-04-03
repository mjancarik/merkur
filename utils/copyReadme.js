const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');
const README = path.resolve(process.cwd(), 'README.md');

const PACKAGES = fs.readdirSync(PACKAGES_DIR);

PACKAGES.forEach((packageName) => {
  let modulePath = path.resolve(PACKAGES_DIR, packageName);

  fs.copyFileSync(README, modulePath + '/README.md');
});
