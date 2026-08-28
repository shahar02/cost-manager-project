/**
 * server.js
 *
 * Entry point for the logs microservice.
 */
require('dotenv').config();
const app = require('./app');
const connectDB = require('./middleware/db');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3001;

connectDB(logger).then(() => {
  app.listen(PORT, () => {
    logger.info(`logs-service listening on port ${PORT}`);
  });
});
