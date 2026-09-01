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
  // category must be exactly one of the five supported values
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res
      .status(400)
      .json(buildErrorResponse(`category is required and must be one of: ${ALLOWED_CATEGORIES.join(', ')}`));
  }
  // userid and sum must both be present and numeric
  const numericUserid = Number(userid);
  const numericSum = Number(sum);

  if (userid === undefined || !Number.isFinite(numericUserid)) {
    return res.status(400).json(buildErrorResponse('userid is required and must be a number'));
  }
  if (sum === undefined || !Number.isFinite(numericSum) || numericSum <= 0) {
    return res.status(400).json(buildErrorResponse('sum is required and must be a positive number'));
  }

  // Validate an explicitly supplied date and reject dates before today.
  let parsedCreatedAt;
  if (created_at !== undefined) {
    parsedCreatedAt = new Date(created_at);
    if (Number.isNaN(parsedCreatedAt.getTime())) {
      return res.status(400).json(buildErrorResponse('created_at must be a valid date'));
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (parsedCreatedAt < startOfToday) {
      return res.status(400).json(buildErrorResponse('cost items cannot be added with a past date'));
    }
  }

  try {
    // a cost item may only be attached to a user that actually exists
    const userExists = await User.findOne({ id: numericUserid });
    if (!userExists) {
      return res.status(404).json(buildErrorResponse(`no user exists with id ${userid}`));
    }

    // if the client did not supply a date/time, the server uses "now"
    const costData = {
      description,
      category,
      userid: numericUserid,
      sum: numericSum,
    };
    // only override the default (current time) when a date was explicitly sent
    if (parsedCreatedAt) {
      costData.created_at = parsedCreatedAt;
    }

    // persist the new cost item and return it exactly as it was stored
    const newCost = await Cost.create(costData);
    return res.status(201).json(newCost);
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = addCost;
