const logger = {
  info: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  debug: (...args) => console.debug(...args),
  warn: (...args) => console.warn(...args)
};

module.exports = logger;
