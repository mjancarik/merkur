const fs = require('fs');
const path = require('path');

const RELEASE_HEADER_RE = /^## \[?\d+\.\d+\.\d+/m;
const CHANGELOG = path.resolve(process.cwd(), 'CHANGELOG.md');

const changelogContents = fs.readFileSync(CHANGELOG, 'utf-8');

// Split into blocks by "## [X.X.X]" or "## X.X.X" headers, keep the latest one
const parts = changelogContents.split(/(?=^## \[?\d+\.\d+\.\d+)/m);
const latestBlock = parts.find((p) => RELEASE_HEADER_RE.test(p)) ?? '';

fs.writeFileSync(
  path.resolve(process.cwd(), 'current-changelog.txt'),
  latestBlock.trim(),
);
