// controllers/analysisController.js
'use strict';

const Resume        = require('../models/Resume');
const SkillAnalysis = require('../models/SkillAnalysis');
const skillEngine   = require('../services/skillEngine');   // module ref, not destructured
const { hashJDSet } = require('../utils/hashUtils');
const logger        = require('../config/logger');

// ── POST /api/analysis ────────────────────────────────────────────────────────
async function analyze(req, res, next) {
  try {
    const { resumeId, jdTexts } = req.body;
    const userId = req.user.userId;

    // Fetch resume – scoped to this user (security: can't query another user's resume)
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // ── Cache check ──────────────────────────────────────────────────────────
    // SHA-256 hash of sorted JD texts → same set of JDs always returns same hash
    const jdSetHash = hashJDSet(jdTexts);
    const cached = await SkillAnalysis.findOne({ userId, resumeId, jdSetHash });

    if (cached) {
      logger.info('Analysis cache hit', { userId, jdSetHash: jdSetHash.slice(0, 8) });
      return res.json({ cached: true, analysis: cached });
    }

    // ── Run deterministic engine ─────────────────────────────────────────────
    const result = skillEngine.runAnalysis(resume.rawText, jdTexts);

    // ── Persist result ────────────────────────────────────────────────────────
    const analysis = await SkillAnalysis.create({
      userId,
      resumeId,
      jdSetHash,
      skillDemandMap:      result.skillDemandMap,
      resumeConfidenceMap: result.resumeConfidenceMap,
      gapScores:           result.gapScores,
      readinessScore:      result.readinessScore,
      prioritySkills:      result.prioritySkills,
      overSaturated:       result.overSaturated,
      missingHighDemand:   result.missingHighDemand,
    });

    logger.info('Analysis created', {
      userId,
      readinessScore:  result.readinessScore,
      demandSkills:    Object.keys(result.skillDemandMap).length,
      jdSetHash:       jdSetHash.slice(0, 8),
    });

    return res.status(201).json({ cached: false, analysis });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analysis ─────────────────────────────────────────────────────────
async function getHistory(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      SkillAnalysis.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('resumeId', 'filename createdAt')
        .select('-skillDemandMap -resumeConfidenceMap -gapScores'), // lean list
      SkillAnalysis.countDocuments({ userId: req.user.userId }),
    ]);

    return res.json({
      analyses,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/analysis/:id ─────────────────────────────────────────────────────
async function getById(req, res, next) {
  try {
    const analysis = await SkillAnalysis.findOne({
      _id:    req.params.id,
      userId: req.user.userId,           // scoped to owner
    }).populate('resumeId', 'filename extractedSkills createdAt');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    return res.json({ analysis });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyze,
  getHistory,
  getById,
};