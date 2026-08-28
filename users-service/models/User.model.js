/**
 * User.model.js
 *
 * Defines the Mongoose schema and model for the "users" collection.
 * Every user document represents a single person who can own cost items.
 * Note: "id" (a business identifier chosen by the client) is intentionally
 * separate from MongoDB's own "_id" (auto-generated). The two must never
 * be confused with one another.
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true, // enforces "no two documents describing the same user"
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
  },
  {
    // we do not need Mongoose's default versioning field for this project
    versionKey: false,
  }
);

module.exports = mongoose.model('User', userSchema);
