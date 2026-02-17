// models/SkillAnalysis.js
'use strict';

const mongoose = require('mongoose');

const skillAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    resumeId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Resume',
      required: true,
    },
    jdSetHash: {
      type:     String,
      required: true,
    },

    // ── Scoring maps (stored as Mongoose Map → serializes to plain object) ──
    skillDemandMap: {
      type: Map,
      of:   Number,
      default: {},
    },
    resumeConfidenceMap: {
      type: Map,
      of:   Number,
      default: {},
    },
    gapScores: {
      type: Map,
      of:   Number,
      default: {},
    },

    // ── Derived results ─────────────────────────────────────────────────────
    readinessScore:    { type: Number, required: true },
    prioritySkills:    [{ type: String }],
    overSaturated:     [{ type: String }],
    missingHighDemand: [{ type: String }],
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────
// Unique compound: cache key — same user + same resume + same JD set = cache hit
skillAnalysisSchema.index(
  { userId: 1, resumeId: 1, jdSetHash: 1 },
  { unique: true }
);

// For paginated history list
skillAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SkillAnalysis', skillAnalysisSchema);