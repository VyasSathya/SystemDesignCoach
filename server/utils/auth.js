const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign({ userId }, secret, {
    expiresIn: '24h'
  });
};

module.exports = { generateToken };
