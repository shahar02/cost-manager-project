/**
 * listUsers.controller.js
 *
 * Handles GET /api/users - returns every user document as-is.
 */
const User = require('../models/User.model');
const { buildErrorResponse } = require('../middleware/errorHandler');

async function listUsers(req, res) {
  try {
    // an empty filter {} matches every document in the "users" collection
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = listUsers;
