/**
 * addUser.controller.js
 *
 * Handles POST /api/add - creates a new user.
 * Note this is a DIFFERENT /api/add endpoint than the one in the costs
 * microservice - it lives on a different process/port and is
 * distinguished by its own request body shape (id/first_name/last_name/birthday).
 */
const User = require('../models/User.model');
const { buildErrorResponse } = require('../middleware/errorHandler');

async function addUser(req, res) {
  const { id, first_name, last_name, birthday } = req.body;

  // --- validation ---------------------------------------------------
  if (id === undefined || Number.isNaN(Number(id))) {
    return res.status(400).json(buildErrorResponse('id is required and must be a number'));
  }
  // first_name and last_name must both be non-empty strings
  if (!first_name || typeof first_name !== 'string') {
    return res.status(400).json(buildErrorResponse('first_name is required and must be a string'));
  }
  if (!last_name || typeof last_name !== 'string') {
    return res.status(400).json(buildErrorResponse('last_name is required and must be a string'));
  }
  // birthday must parse into a real, valid date
  if (!birthday || Number.isNaN(Date.parse(birthday))) {
    return res.status(400).json(buildErrorResponse('birthday is required and must be a valid date'));
  }

  try {
    // the database cannot hold two documents describing the same user
    const existingUser = await User.findOne({ id: Number(id) });
    if (existingUser) {
      return res.status(409).json(buildErrorResponse(`a user with id ${id} already exists`));
    }

    // all validation passed and the id is free, so persist the new user
    const newUser = await User.create({
      id: Number(id),
      first_name,
      last_name,
      birthday: new Date(birthday),
    });

    // respond with the exact document that was added, per the project spec
    return res.status(201).json(newUser);
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = addUser;
