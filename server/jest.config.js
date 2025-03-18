module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(your-es-module-dependency)/)',
  ],
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: true
  }
};