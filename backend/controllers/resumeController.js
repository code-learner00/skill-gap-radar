// controllers/resumeController.js
'use strict';

const Resume      = require('../models/Resume');
const pdfSvc      = require('../services/pdfService');
const skillEngine = require('../services/skillEngine');
const logger      = require('../config/logger');

// ── Upload PDF ─────────────────────────────────────────────────────────────
async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const text = await pdfSvc.extractTextFromPDF(
      req.file.buffer,
      req.file.mimetype
    );

    return await saveResume(req.user.userId, text, req.file.originalname, res);
  } catch (err) {
    next(err);
  }
}

// ── Paste Text ─────────────────────────────────────────────────────────────
async function pasteResume(req, res, next) {
  try {
    return await saveResume(req.user.userId, req.body.text, 'pasted', res);
  } catch (err) {
    next(err);
  }
}

// ── Internal: save + extract skills ───────────────────────────────────────
async function saveResume(userId, text, filename, res) {
  // Use the module reference, not destructured, to be safe
  const result = skillEngine.buildResumeConfidence(text);
  const confidenceMap = result.confidenceMap;
  const allSkills     = result.allSkills;

  const resume = await Resume.create({
    userId,
    rawText:             text,
    extractedSkills:     allSkills,
    sectionConfidenceMap: confidenceMap,
    filename,
  });

  logger.info('Resume saved', { userId, skillCount: allSkills.length });

  return res.status(201).json({
    message: 'Resume saved',
    resume: {
      _id:            resume._id,
      filename:       resume.filename,
      extractedSkills: resume.extractedSkills,
      createdAt:      resume.createdAt,
    },
  });
}

// ── Get User Resumes (paginated) ────────────────────────────────────────────
async function getResumes(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [resumes, total] = await Promise.all([
      Resume.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-rawText -sectionConfidenceMap'), // omit heavy fields from list
      Resume.countDocuments({ userId: req.user.userId }),
    ]);

    return res.json({
      resumes,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ── Exports ─────────────────────────────────────────────────────────────────
module.exports = {
  uploadResume,
  pasteResume,
  getResumes,
};