const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const changelog = fs.readFileSync(
  path.join(__dirname, '../CHANGELOG.md'),
  'utf-8',
);

// Scope the search to only the latest release block (everything before the
// second "## Release" heading) so we never re-read a version from a prior
// release and can't accidentally try to create a tag that already exists.
const latestBlockMatch = changelog.match(
  /^## Release[\s\S]*?(?=\n## Release|$)/,
);
const latestBlock = latestBlockMatch ? latestBlockMatch[0] : changelog;

// Find the highest version across all packages in the latest release block.
// syncRootChangelog writes package versions as "#### X.X.X" under "### <pkg>".
const versionMatches = [...latestBlock.matchAll(/^#### (\d+\.\d+\.\d+)/gm)].map(
  (m) => m[1],
);

if (versionMatches.length === 0) {
  console.error('Could not find any package version in root CHANGELOG.md');
  process.exit(1);
}

const version = versionMatches.reduce((max, v) => {
  const toNum = (s) => s.split('.').map(Number);
  const [ma, mb, mc] = toNum(max);
  const [va, vb, vc] = toNum(v);

  if (va !== ma) {
    return va > ma ? v : max;
  }

  if (vb !== mb) {
    return vb > mb ? v : max;
  }

  return vc > mc ? v : max;
});

execSync(`git tag -a "release-v${version}" -m "Release v${version}"`, {
  stdio: 'inherit',
});
