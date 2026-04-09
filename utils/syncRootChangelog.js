const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_CHANGELOG = path.join(__dirname, '../CHANGELOG.md');
const PACKAGES_DIR = path.join(__dirname, '../packages');

function getRepoUrl() {
  try {
    const remote = execSync('git remote get-url origin', {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
    }).trim();
    // Convert SSH (git@github.com:owner/repo.git) to HTTPS
    return remote.replace(/^git@([^:]+):/, 'https://$1/').replace(/\.git$/, '');
  } catch {
    return null;
  }
}

function getPreviousVersion(existingContent) {
  const match = existingContent.match(/^## \[?(\d+\.\d+\.\d+)/m);
  return match ? match[1] : null;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) {
      return pb[i] - pa[i];
    }
  }
  return 0;
}

const SECTION_ORDER = ['Major Changes', 'Minor Changes', 'Patch Changes'];

function syncChangelog() {
  const packageDirs = fs.readdirSync(PACKAGES_DIR);
  const sections = {};

  const existingContent = fs.existsSync(ROOT_CHANGELOG)
    ? fs.readFileSync(ROOT_CHANGELOG, 'utf-8')
    : '';

  // First pass: read the latest version block from each package changelog
  const packageData = [];

  packageDirs.forEach((dir) => {
    const pkgLogPath = path.join(PACKAGES_DIR, dir, 'CHANGELOG.md');

    if (!fs.existsSync(pkgLogPath)) {
      return;
    }

    const content = fs.readFileSync(pkgLogPath, 'utf-8');
    const match = content.match(/## (\d+\.\d+\.\d+)([\s\S]*?)(?=\n## |$)/);

    if (!match) {
      return;
    }

    packageData.push({ version: match[1], block: match[0] });
  });

  if (packageData.length === 0) {
    return;
  }

  // Determine the version that was just released (highest semver across all packages)
  const latestVersion = packageData
    .map((p) => p.version)
    .sort(compareVersions)[0];

  // Second pass: collect sections only from packages released at the latest version
  packageData
    .filter((p) => p.version === latestVersion)
    .forEach(({ block }) => {
      const sectionRegex = /### (.+)\n([\s\S]*?)(?=\n### |\n## |$)/g;
      let sectionMatch;

      while ((sectionMatch = sectionRegex.exec(block)) !== null) {
        const heading = sectionMatch[1].trim();
        const body = sectionMatch[2].trim();

        if (body) {
          if (!sections[heading]) {
            sections[heading] = new Set();
          }
          // Split into individual items (each starting with "- ") to deduplicate
          const items = body.split(/\n(?=- )/);
          items.forEach((item) => {
            sections[heading].add(item.trim());
          });
        }
      }
    });

  const repoUrl = getRepoUrl();
  const prevVersion = getPreviousVersion(existingContent);
  const date = new Date().toISOString().split('T')[0];

  const releaseHeading =
    repoUrl && prevVersion
      ? `## [${latestVersion}](${repoUrl}/compare/v${prevVersion}...v${latestVersion}) (${date})`
      : `## ${latestVersion} (${date})`;

  const orderedKeys = [
    ...SECTION_ORDER.filter((k) => sections[k] && sections[k].size > 0),
    ...Object.keys(sections).filter(
      (k) => !SECTION_ORDER.includes(k) && sections[k].size > 0,
    ),
  ];

  let aggregatedUpdates = `${releaseHeading}\n\n`;

  for (const sectionHeading of orderedKeys) {
    aggregatedUpdates += `### ${sectionHeading}\n\n${[...sections[sectionHeading]].join('\n')}\n\n`;
  }

  // Prevent duplicate entries if the script is run twice
  if (existingContent.includes(aggregatedUpdates.trim())) {
    console.info('Root changelog already up to date.'); //eslint-disable-line no-console
    return;
  }

  fs.writeFileSync(ROOT_CHANGELOG, aggregatedUpdates + '\n' + existingContent);
  console.info('Root CHANGELOG.md updated.'); //eslint-disable-line no-console
}

syncChangelog();
