/* eslint-disable no-console */
import child_process from 'child_process';
import { promisify } from 'util';

const exec = promisify(child_process.exec);

function isStable(version) {
  return !version.match(/-alpha|-beta|-rc/);
}

(async () => {
  const version = process.env.npm_package_version;
  const packageName = process.env.npm_package_name;
  if (!version || !packageName) {
    return;
  }

  try {
    if (!isStable(version)) {
      console.log('This version is a pre-release.');

      const { stdout } = await exec(`npm info ${packageName} versions --json`);
      const versions = JSON.parse(stdout);

      let lastStable = null;
      let ver = versions.pop();
      while (!isStable(ver) && versions.length) {
        ver = versions.pop();
      }
      lastStable = ver;

      if (!lastStable) {
        console.log('No stable version found to restore.');
        return;
      }

      await exec(`npm dist-tag add ${packageName}@${lastStable} latest`);
      console.log(`Restored latest stable tag to version: ${lastStable}`);
    } else {
      console.log('This is a stable version.');
    }
  } catch (error) {
    console.error('Error restoring latest stable tag:', error);
  }
})();
