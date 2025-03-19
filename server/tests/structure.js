const fs = require('fs');
const path = require('path');

const directories = [
  'tests/unit/services',
  'tests/unit/models',
  'tests/integration',
  'tests/e2e'
];

directories.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, '..', dir), { recursive: true });
});