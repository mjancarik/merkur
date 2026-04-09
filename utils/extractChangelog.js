const fs = require('fs');
const path = require('path');

const RELEASE_HEADER_RE = /^## Release \(\d{4}-\d{2}-\d{2}\)/m;
const CHANGELOG = path.resolve(process.cwd(), 'CHANGELOG.md');

const changelogContents = fs.readFileSync(CHANGELOG, 'utf-8');

// Split into blocks by "## Release (date)" headers, keep the latest one
const parts = changelogContents.split(/(?=^## Release \(\d{4}-\d{2}-\d{2}\))/m);
const latestBlock = parts.find((p) => RELEASE_HEADER_RE.test(p)) ?? '';

fs.writeFileSync(
  path.resolve(process.cwd(), 'current-changelog.txt'),
  latestBlock.trim(),
);
