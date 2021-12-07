const fs = require('fs')

const version = process.argv[2];

const packageJson = require('./package.json');

packageJson.version = version;

fs.writeFileSync('./package.json', JSON.stringify(packageJson, undefined, 2));

// chore: bump version to 2.0.0
