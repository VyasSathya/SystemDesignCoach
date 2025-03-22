const jwt = require('jsonwebtoken');

const generateTestToken = (userId) => {
  return jwt.sign({ userId }, 'test-secret', { expiresIn: '1h' });
};

module.exports = { generateTestToken };