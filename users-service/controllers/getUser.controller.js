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
  const userid = Number(req.params.id);

  if (Number.isNaN(userid)) {
    return res.status(400).json(buildErrorResponse('id must be a number'));
  }

  try {
    const user = await User.findOne({ id: userid });
    if (!user) {
      return res.status(404).json(buildErrorResponse(`no user exists with id ${userid}`));
    }

    // total is computed on the fly via a MongoDB aggregation (sum of "sum")
    const aggregationResult = await Cost.aggregate([
      { $match: { userid } },
      { $group: { _id: '$userid', total: { $sum: '$sum' } } },
    ]);
    const total = aggregationResult.length > 0 ? aggregationResult[0].total : 0;

    return res.status(200).json({
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
      total,
    });
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = getUser;
