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
    // "id" is the business identifier chosen by the client (Number),
    // not to be confused with Mongoose's own "_id".
    id: {
      type: Number,
      required: true,
      unique: true, // enforces "no two documents describing the same user"
    },
    // the user's given name
    first_name: {
      type: String,
      required: true,
    },
    // the user's family name
    last_name: {
      type: String,
      required: true,
    },
    // date of birth, stored as a proper Date so it can be queried/sorted
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
