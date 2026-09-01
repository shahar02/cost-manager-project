/**
 * endpointLogger.js
 *
 * Writes the additional log entry required whenever a real endpoint is
 * accessed. The generic request logger remains responsible for every request,
 * including requests that eventually receive a 404 response.
 */
const Log = require('../models/Log.model');
const logger = require('./logger');

function endpointLogger(serviceName) {
  return async (req, res, next) => {
    const message = `endpoint accessed: ${req.method} ${req.originalUrl}`;
    const entry = {
      method: req.method,
      endpoint: req.originalUrl,
      message,
      service: serviceName,
    };

    logger.info(entry, message);
    try {
      await Log.create(entry);
    } catch (err) {
      logger.error({ err }, 'Failed to write endpoint log entry to MongoDB');
    }

    next();
  };
}

module.exports = endpointLogger;
