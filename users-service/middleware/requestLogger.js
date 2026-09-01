/**
 * requestLogger.js
 *
 * Express middleware that writes a Log document to MongoDB for every
 * single HTTP request the server receives, as required by the project.
 * It also prints the same information to the console via Pino, so that
 * developers can follow what is happening while the server runs.
 *
 * SERVICE_NAME must be set (per microservice) so that log entries can be
 * traced back to the process (logs / users / costs / about) that created them.
 */
const Log = require('../models/Log.model');
const logger = require('./logger');

function requestLogger(serviceName) {
  return async (req, res, next) => {
    const message = `${req.method} ${req.originalUrl}`;
    const entry = {
      method: req.method,
      endpoint: req.originalUrl,
      message,
      service: serviceName,
    };

    // Create the structured message with Pino and persist the same data.
    logger.info(entry, message);

    // persist the log entry to the "logs" collection
    try {
      await Log.create(entry);
      // no further action needed on success - the document is now saved
    } catch (err) {
      // logging failures should never break the actual request handling
      logger.error({ err }, 'Failed to write log entry to MongoDB');
    }

    next();
  };
}

module.exports = requestLogger;
