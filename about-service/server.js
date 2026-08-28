/**
 * server.js
 *
 * Entry point for the about microservice.
 */
require('dotenv').config();
const app = require('./app');
const connectDB = require('./middleware/db');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3004;

connectDB(logger).then(() => {
  app.listen(PORT, () => {
    logger.info(`about-service listening on port ${PORT}`);
  });
});
