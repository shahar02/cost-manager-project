/**
 * server.js
 *
 * Entry point for the users microservice.
 */
require('dotenv').config();
const app = require('./app');
const connectDB = require('./middleware/db');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3002;

connectDB(logger).then(() => {
  app.listen(PORT, () => {
    logger.info(`users-service listening on port ${PORT}`);
  });
});
