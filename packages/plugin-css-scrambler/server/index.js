const fs = require('fs');

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

function loadClassnameHashtable(path) {
  if (ENV === DEV || !fs.existsSync(path)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

module.exports = {
  loadClassnameHashtable,
};
