/**
 * db.js
 *
 * Opens (and reuses) a single Mongoose connection to MongoDB Atlas.
 * Every microservice calls connectDB() once, on startup, before it
 * starts listening for HTTP requests.
 */
const mongoose = require('mongoose');

async function connectDB(logger) {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in the .env file');
  }

  try {
    await mongoose.connect(uri);
    if (logger) {
      logger.info('Connected to MongoDB Atlas successfully');
    }
  } catch (err) {
    if (logger) {
      logger.error({ err }, 'Failed to connect to MongoDB Atlas');
    }
    // without a database connection the service cannot function, so we exit
    process.exit(1);
  }
}

module.exports = connectDB;
