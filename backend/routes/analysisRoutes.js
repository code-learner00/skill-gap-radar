// routes/analysisRoutes.js
'use strict';

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/analysisController');
const auth     = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { analyzeLimiter } = require('../middleware/rateLimiter');

// ALL analysis routes require authentication
router.use(auth);

// POST /api/analysis          – run new analysis (or return cache)
router.post('/',    analyzeLimiter, validate('analyze'), ctrl.analyze);

// GET  /api/analysis          – list user's analysis history
router.get('/',                                           ctrl.getHistory);

// GET  /api/analysis/:id      – fetch single analysis by id
router.get('/:id',                                        ctrl.getById);

module.exports = router;