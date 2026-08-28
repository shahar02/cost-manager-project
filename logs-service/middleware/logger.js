/**
 * logger.js
 *
 * Creates a single shared Pino logger instance. This logger prints to
 * the console (useful during development / when reading server output),
 * while the request-logging middleware (see requestLogger.js) is
 * responsible for additionally persisting log entries into MongoDB,
 * as required by the project.
 */
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

module.exports = logger;
