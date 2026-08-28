/**
 * Report.model.js
 *
 * Supports the Computed Design Pattern for monthly reports.
 * Once a report is generated for a month that has already fully passed,
 * it is persisted here so future requests for the same (userid, year, month)
 * combination can be served directly from this collection instead of being
 * recomputed from the "costs" collection every time. Reports for the
 * current (still ongoing) month or for future months are always computed
 * fresh and are never read from or written to this collection, since their
 * underlying cost data can still change.
 */
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // which user this cached report belongs to
    userid: {
      type: Number,
      required: true,
    },
    // calendar year of the report, e.g. 2026
    year: {
      type: Number,
      required: true,
    },
    // calendar month of the report, 1-12
    month: {
      type: Number,
      required: true,
    },
    // the full pre-computed report payload, stored exactly as it should be
    // returned to the client (grouped by category)
    costs: {
      type: Array,
      required: true,
    },
  },
  {
    // we do not need Mongoose's default versioning field for this project
    versionKey: false,
  }
);

// A given user can only have one stored (computed) report per year+month.
reportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
