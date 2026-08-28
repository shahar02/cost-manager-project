/**
 * listLogs.controller.js
 *
 * Handles GET /api/logs - returns every log document as-is.
 */
const Log = require('../models/Log.model');
const { buildErrorResponse } = require('../middleware/errorHandler');

async function listLogs(req, res) {
  try {
    // an empty filter {} matches every document in the "logs" collection
    const logs = await Log.find({});
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).json(buildErrorResponse(err.message));
  }
}

module.exports = listLogs;
