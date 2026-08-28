/**
 * server.js
 *
 * Entry point for the costs microservice. Loads environment variables,
 * connects to MongoDB, and then starts listening for HTTP requests.
 */
require('dotenv').config();
const app = require('./app');
const connectDB = require('./middleware/db');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3003;

connectDB(logger).then(() => {
  app.listen(PORT, () => {
    logger.info(`costs-service listening on port ${PORT}`);
  });
});
