/**
 * getUser.controller.js
 *
 * Handles GET /api/users/:id - returns first_name, last_name, id and the
 * total sum of all cost items belonging to that user.
 */
const User = require('../models/User.model');
const Cost = require('../models/Cost.model');
const { buildErrorResponse } = require('../middleware/errorHandler');

async function getUser(req, res) {
  // the :id route param arrives as a string, so convert it to a number
  const userid = Number(req.params.id);

  if (Number.isNaN(userid)) {
    return res.status(400).json(buildErrorResponse('id must be a number'));
  }

  try {
    // look up the user by their business "id", not Mongo's "_id"
    const user = await User.findOne({ id: userid });
    if (!user) {
      return res.status(404).json(buildErrorResponse(`no user exists with id ${userid}`));
    }

    // total is computed on the fly via a MongoDB aggregation (sum of "sum")
    const aggregationResult = await Cost.aggregate([
      { $match: { userid } },
      { $group: { _id: '$userid', total: { $sum: '$sum' } } },
    ]);
    // an aggregate with no matching costs returns an empty array, so default to 0
    const total = aggregationResult.length > 0 ? aggregationResult[0].total : 0;

    // response property names match the project spec exactly
    return res.status(200).json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total,
    });
  } catch (err) {
    // any unexpected DB error is reported as a generic 500
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = getUser;
