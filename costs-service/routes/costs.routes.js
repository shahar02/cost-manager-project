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
const endpointLogger = require('../middleware/endpointLogger');

const router = express.Router();

router.post('/add', endpointLogger('costs-service'), addCost);
router.get('/report', endpointLogger('costs-service'), getReport);

module.exports = router;
