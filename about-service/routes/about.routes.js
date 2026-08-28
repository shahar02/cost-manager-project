/**
 * about.routes.js
 *
 * Wires up the single endpoint this microservice is responsible for:
 * GET /api/about - developers team details
 */
const express = require('express');
const getAbout = require('../controllers/about.controller');

const router = express.Router();

router.get('/about', getAbout);

module.exports = router;
