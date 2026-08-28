/**
 * addCost.controller.js
 *
 * Handles POST /api/add - creates a new cost item.
 */
const Cost = require('../models/Cost.model');
const User = require('../models/User.model');
const { ALLOWED_CATEGORIES } = require('../models/Cost.model');
const { buildErrorResponse } = require('../middleware/errorHandler');

async function addCost(req, res) {
  const { description, category, userid, sum, created_at } = req.body;

  // --- validation ---------------------------------------------------
  if (!description || typeof description !== 'string') {
    return res.status(400).json(buildErrorResponse('description is required and must be a string'));
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res
      .status(400)
      .json(buildErrorResponse(`category is required and must be one of: ${ALLOWED_CATEGORIES.join(', ')}`));
  }
  if (userid === undefined || Number.isNaN(Number(userid))) {
    return res.status(400).json(buildErrorResponse('userid is required and must be a number'));
  }
  if (sum === undefined || Number.isNaN(Number(sum))) {
    return res.status(400).json(buildErrorResponse('sum is required and must be a number'));
  }

  try {
    // a cost item may only be attached to a user that actually exists
    const userExists = await User.findOne({ id: Number(userid) });
    if (!userExists) {
      return res.status(404).json(buildErrorResponse(`no user exists with id ${userid}`));
    }

    // if the client did not supply a date/time, the server uses "now"
    const costData = {
      description,
      category,
      userid: Number(userid),
      sum: Number(sum),
    };
    if (created_at) {
      costData.created_at = new Date(created_at);
    }

    const newCost = await Cost.create(costData);
    return res.status(201).json(newCost);
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = addCost;
