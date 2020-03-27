const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.resolve(process.cwd(), 'packages');
const TEMPLATE_PACKAGE_JSON = path.resolve(
  PACKAGES_DIR,
  'create-widget/template/package.json'
);

if (!fs.existsSync(TEMPLATE_PACKAGE_JSON)) {
  throw Error(
    `Unable to update versions for @merkur/create-widget. File at path ${TEMPLATE_PACKAGE_JSON} does not exist.`
  );
}

let packageJson = require(TEMPLATE_PACKAGE_JSON);

packageJson.devDependencies = resolvePackageVersions(
  packageJson.devDependencies
);
packageJson.dependencies = resolvePackageVersions(packageJson.dependencies);

fs.writeFileSync(
  TEMPLATE_PACKAGE_JSON,
  JSON.stringify(packageJson, null, 2) + '\n'
);

function resolvePackageVersions(dependencies) {
  Object.keys(dependencies).forEach((dependency) => {
    if (dependency.startsWith('@merkur/')) {
      let dependencyPackageJson = path.resolve(
        PACKAGES_DIR,
        dependency.split('@merkur/')[1],
        'package.json'
      );

      if (fs.existsSync(dependencyPackageJson)) {
        let { version } = require(dependencyPackageJson);

        dependencies[dependency] = version;
      }
    }
  });

  return dependencies;
}
