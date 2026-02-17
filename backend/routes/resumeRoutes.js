// routes/resumeRoutes.js
'use strict';

const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const ctrl      = require('../controllers/resumeController');
const auth      = require('../middleware/authenticate');
const validate  = require('../middleware/validate');

// ── Multer configuration ─────────────────────────────────────────────────────
// memoryStorage keeps file in buffer – never written to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: function (_req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    const err = new Error('Only PDF files are allowed');
    err.status = 400;
    return cb(err, false);
  },
});

// ── Guard: ALL resume routes require auth ────────────────────────────────────
router.use(auth);

// ── Routes ───────────────────────────────────────────────────────────────────
// POST /api/resume/upload  – upload a PDF
router.post('/upload', upload.single('resume'), ctrl.uploadResume);

// POST /api/resume/paste   – paste raw resume text
router.post('/paste', validate('pasteResume'), ctrl.pasteResume);

// GET  /api/resume/        – list user's resumes (paginated)
router.get('/', ctrl.getResumes);

module.exports = router;