/**
 * report.controller.js
 *
 * Handles GET /api/report - returns a monthly report of a user's costs,
 * grouped by category, implementing the Computed Design Pattern.
 */
const Cost = require('../models/Cost.model');
const Report = require('../models/Report.model');
const { ALLOWED_CATEGORIES } = require('../models/Cost.model');
const { buildErrorResponse } = require('../middleware/errorHandler');

/**
 * Builds the "costs" array of the report, always containing every
 * supported category (even when it has no items), matching the exact
 * shape required by the project spec.
 */
function groupCostsByCategory(costDocuments) {
  return ALLOWED_CATEGORIES.map((category) => {
    const itemsInCategory = costDocuments
      .filter((cost) => cost.category === category)
      .map((cost) => ({
        sum: cost.sum,
        description: cost.description,
        day: cost.created_at.getDate(),
      }));

    return { [category]: itemsInCategory };
  });
}

/**
 * Returns true when the requested (year, month) is fully in the past
 * relative to the current server date - i.e. it can never receive new
 * cost items, so its report is safe to cache permanently.
 */
function isPastMonth(year, month) {
  const now = new Date();
  const requestedMonthStart = new Date(year, month - 1, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return requestedMonthStart < currentMonthStart;
}

async function getReport(req, res) {
  const { id, year, month } = req.query;

  if (!id || !year || !month) {
    return res.status(400).json(buildErrorResponse('id, year and month are all required query parameters'));
  }

  const userid = Number(id);
  const numericYear = Number(year);
  const numericMonth = Number(month);

  if (Number.isNaN(userid) || Number.isNaN(numericYear) || Number.isNaN(numericMonth)) {
    return res.status(400).json(buildErrorResponse('id, year and month must all be numbers'));
  }
  if (numericMonth < 1 || numericMonth > 12) {
    return res.status(400).json(buildErrorResponse('month must be between 1 and 12'));
  }

  try {
    /* ------------------------------------------------------------------
     * Computed Design Pattern implementation.
     *
     * Reports for months that have already fully ended can never change
     * again, because new cost items cannot be back-dated into the past.
     * So, the first time such a report is requested we compute it from
     * the "costs" collection and persist the computed result in the
     * "reports" collection. Every subsequent request for the exact same
     * (userid, year, month) is then served directly from "reports"
     * without touching "costs" again, saving repeated aggregation work.
     * Reports for the current or a future month are always computed
     * fresh from "costs", since their underlying data can still change.
     * ------------------------------------------------------------------ */
    if (isPastMonth(numericYear, numericMonth)) {
      const cachedReport = await Report.findOne({ userid, year: numericYear, month: numericMonth });
      if (cachedReport) {
        return res.status(200).json({
          userid: cachedReport.userid,
          year: cachedReport.year,
          month: cachedReport.month,
          costs: cachedReport.costs,
        });
      }
    }

    // no cached version available (or the month is current/future) -> compute it now
    const startOfMonth = new Date(numericYear, numericMonth - 1, 1);
    const startOfNextMonth = new Date(numericYear, numericMonth, 1);

    const costDocuments = await Cost.find({
      userid,
      created_at: { $gte: startOfMonth, $lt: startOfNextMonth },
    });

    const groupedCosts = groupCostsByCategory(costDocuments);

    // persist the computed result only when the month is fully in the past
    if (isPastMonth(numericYear, numericMonth)) {
      await Report.create({ userid, year: numericYear, month: numericMonth, costs: groupedCosts });
    }

    return res.status(200).json({
      userid,
      year: numericYear,
      month: numericMonth,
      costs: groupedCosts,
    });
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = getReport;
