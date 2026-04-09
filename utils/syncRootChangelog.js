const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_CHANGELOG = path.join(__dirname, '../CHANGELOG.md');
const PACKAGES_DIR = path.join(__dirname, '../packages');

function getRepoUrl() {
  try {
    const remote = execSync('git remote get-url origin', { cwd: path.join(__dirname, '..'), encoding: 'utf-8' }).trim();
    // Convert SSH (git@github.com:owner/repo.git) to HTTPS
    return remote
      .replace(/^git@([^:]+):/, 'https://$1/')
      .replace(/\.git$/, '');
  } catch {
    return null;
  }
}

function getPreviousVersion(existingContent) {
  const match = existingContent.match(/^## \[?(\d+\.\d+\.\d+)/m);
  return match ? match[1] : null;
}

/**
 * Collects all commit hashes already present in any previous release block
 * so we can skip package entries whose changes were already recorded.
 */
function getAlreadyRecordedHashes(existingContent) {
  const hashes = new Set();
  // Match lines like "- abc1234: Some message"
  const hashRegex = /^- ([0-9a-f]{7,}): /gm;
  let m;

  while ((m = hashRegex.exec(existingContent)) !== null) {
    hashes.add(m[1]);
  }

  return hashes;
}

const SECTION_ORDER = ['Major Changes', 'Minor Changes', 'Patch Changes'];

function compareVersions(a, b) {
  const toNum = (s) => s.split('.').map(Number);
  const [aMa, aMi, aPa] = toNum(a);
  const [bMa, bMi, bPa] = toNum(b);

  if (aMa !== bMa) {
    return aMa - bMa;
  }

  if (aMi !== bMi) {
    return aMi - bMi;
  }

  return aPa - bPa;
}

function syncChangelog() {
  const packageDirs = fs.readdirSync(PACKAGES_DIR);
  const sections = {};
  const versions = [];

  const existingContent = fs.existsSync(ROOT_CHANGELOG)
    ? fs.readFileSync(ROOT_CHANGELOG, 'utf-8')
    : '';

  const alreadyRecorded = getAlreadyRecordedHashes(existingContent);

  packageDirs.forEach((dir) => {
    const pkgLogPath = path.join(PACKAGES_DIR, dir, 'CHANGELOG.md');

    if (!fs.existsSync(pkgLogPath)) {
      return;
    }

    const content = fs.readFileSync(pkgLogPath, 'utf-8');
    // Matches the most recent version block in the package changelog
    const match = content.match(/## (\d+\.\d+\.\d+)([\s\S]*?)(?=\n## |$)/);

    if (!match) {
      return;
    }

    versions.push(match[1]);
    const block = match[0];
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
          // Skip items whose commit hash was already recorded in a prior release
          const hashMatch = item.match(/^- ([0-9a-f]{7,}): /);
          if (hashMatch && alreadyRecorded.has(hashMatch[1])) {
            return;
          }
          // Skip "Updated dependencies [hash]" items whose hash was already recorded
          const depsMatch = item.match(/^- Updated dependencies \[([0-9a-f]{7,})\]/);
          if (depsMatch && alreadyRecorded.has(depsMatch[1])) {
            return;
          }
          sections[heading].add(item.trim());
        });
      }
    }
  });

  if (versions.length === 0) {
    return;
  }

  const maxVersion = versions.reduce((max, v) => (compareVersions(v, max) > 0 ? v : max));

  const repoUrl = getRepoUrl();
  const prevVersion = getPreviousVersion(existingContent);
  const date = new Date().toISOString().split('T')[0];

  const releaseHeading = (repoUrl && prevVersion)
    ? `## [${maxVersion}](${repoUrl}/compare/v${prevVersion}...v${maxVersion}) (${date})`
    : `## ${maxVersion} (${date})`;

  const orderedKeys = [
    ...SECTION_ORDER.filter((k) => sections[k] && sections[k].size > 0),
    ...Object.keys(sections).filter((k) => !SECTION_ORDER.includes(k) && sections[k].size > 0),
  ];

  let aggregatedUpdates = `${releaseHeading}\n\n`;

  for (const sectionHeading of orderedKeys) {
    aggregatedUpdates += `### ${sectionHeading}\n\n${[...sections[sectionHeading]].join('\n')}\n\n`;
  }

  // Prevent duplicate entries if the script is run twice
  if (existingContent.includes(aggregatedUpdates.trim())) {
    console.info('Root changelog already up to date.');
    return;
  }

  fs.writeFileSync(ROOT_CHANGELOG, aggregatedUpdates + '\n' + existingContent);
  console.info('Root CHANGELOG.md updated.');
}

syncChangelog();
