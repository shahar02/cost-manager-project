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
    // HTTP method of the request, e.g. "GET" or "POST"
    method: {
      type: String,
      required: true,
    },
    // the path that was requested, e.g. "/api/users"
    endpoint: {
      type: String,
      required: true,
    },
    // free-text description of the event being logged
    message: {
      type: String,
      required: false,
    },
    // which process (microservice) produced this log entry
    service: {
      type: String,
      required: true,
    },
    // when the event was logged; defaults to "now" if not supplied
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    // we do not need Mongoose's default versioning field for this project
    versionKey: false,
  }
);

module.exports = mongoose.model('Log', logSchema);
