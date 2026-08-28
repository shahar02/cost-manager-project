/**
 * Log.model.js
 *
 * Defines the Mongoose schema and model for the "logs" collection.
 * A log document is written for every HTTP request the server receives,
 * and additionally whenever a specific endpoint is accessed
 * (so an endpoint hit typically produces two related log entries:
 * one generic "request received" entry and one "endpoint accessed" entry).
 */
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    // which process (microservice) produced this log entry
    service: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Log', logSchema);
