/**
 * server.js
 *
 * Entry point for the about microservice.
 */
// load MONGO_URI / PORT / etc. from the .env file into process.env
require('dotenv').config();
const app = require('./app');
const connectDB = require('./middleware/db');
const logger = require('./middleware/logger');

// fall back to 3004 locally if PORT is not set in the environment
const PORT = process.env.PORT || 3004;

// only start accepting HTTP requests once the database connection is ready
connectDB(logger).then(() => {
  app.listen(PORT, () => {
    logger.info(`about-service listening on port ${PORT}`);
  });
});
