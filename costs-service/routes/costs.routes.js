/**
 * costs.routes.js
 *
 * Wires up the two endpoints this microservice is responsible for:
 * POST /api/add    - add a new cost item
 * GET  /api/report - get a computed monthly report
 */
const express = require('express');
const addCost = require('../controllers/addCost.controller');
const getReport = require('../controllers/report.controller');

const router = express.Router();

router.post('/add', addCost);
router.get('/report', getReport);

module.exports = router;
