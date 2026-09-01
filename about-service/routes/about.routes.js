/**
 * about.routes.js
 *
 * Wires up the single endpoint this microservice is responsible for:
 * GET /api/about - developers team details
 */
const express = require('express');
const getAbout = require('../controllers/about.controller');
const endpointLogger = require('../middleware/endpointLogger');

const router = express.Router();

router.get('/about', endpointLogger('about-service'), getAbout);

module.exports = router;
