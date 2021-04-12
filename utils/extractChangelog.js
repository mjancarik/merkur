const fs = require('fs');
const path = require('path');

const VERSION_RE = /#+ \[\d+\.\d+\.\d+\].+/gi;
const CHANGELOG = path.resolve(process.cwd(), 'CHANGELOG.md');

const changelogContents = fs.readFileSync(CHANGELOG, 'utf-8');
const versionChangelogs = changelogContents.split(VERSION_RE);
versionChangelogs.shift();

fs.writeFileSync(
  path.resolve(process.cwd(), 'current-changelog.txt'),
  versionChangelogs?.[0].trim() ?? ''
);
