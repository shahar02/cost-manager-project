/**
 * Cost.model.js
 *
 * Defines the Mongoose schema and model for the "costs" collection.
 * Each document represents a single expense item that belongs to a user
 * (referenced by "userid", matching the business "id" field on User, not _id).
 */
const mongoose = require('mongoose');

// Only these five categories are supported by the application.
const ALLOWED_CATEGORIES = ['food', 'health', 'housing', 'sports', 'education'];

const costSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ALLOWED_CATEGORIES,
    },
    userid: {
      type: Number,
      required: true,
    },
    // Mongoose's Number type is stored by MongoDB as a BSON double,
    // which matches the "sum should be a Double" requirement.
    sum: {
      type: Number,
      required: true,
    },
    // Date/time the cost item was created. If the client does not supply one,
    // the server fills it in with the current date/time when the request is received.
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('Cost', costSchema);
module.exports.ALLOWED_CATEGORIES = ALLOWED_CATEGORIES;
