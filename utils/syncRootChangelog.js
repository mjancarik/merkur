const fs = require('fs');
const path = require('path');

const ROOT_CHANGELOG = path.join(__dirname, '../CHANGELOG.md');
const PACKAGES_DIR = path.join(__dirname, '../packages');

function syncChangelog() {
  const packageDirs = fs.readdirSync(PACKAGES_DIR);
  let aggregatedUpdates = `## Release (${new Date().toISOString().split('T')[0]})\n\n`;
  let hasUpdates = false;

  packageDirs.forEach((dir) => {
    const pkgLogPath = path.join(PACKAGES_DIR, dir, 'CHANGELOG.md');

    if (fs.existsSync(pkgLogPath)) {
      const content = fs.readFileSync(pkgLogPath, 'utf-8');
      // Matches the most recent version block in the package changelog
      const match = content.match(/## \d+\.\d+\.\d+[\s\S]*?(?=\n## |$)/);

      if (match) {
        hasUpdates = true;
        aggregatedUpdates += `### ${dir}\n${match[0].replace(/## /g, '#### ')}\n\n`;
      }
    }
  });

  if (!hasUpdates) return;

  const existingContent = fs.existsSync(ROOT_CHANGELOG)
    ? fs.readFileSync(ROOT_CHANGELOG, 'utf-8')
    : '';

  // Prevent duplicate entries if the script is run twice
  if (existingContent.includes(aggregatedUpdates.trim())) {
    console.info('Root changelog already up to date.'); // eslint-disable-line no-console
    return;
  }

  fs.writeFileSync(ROOT_CHANGELOG, aggregatedUpdates + '\n' + existingContent);
  console.info('Root CHANGELOG.md updated.'); // eslint-disable-line no-console
}

syncChangelog();
