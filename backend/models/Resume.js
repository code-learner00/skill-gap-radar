// models/Resume.js
'use strict';

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    rawText: {
      type:      String,
      required:  true,
      maxlength: 50000,
    },
    extractedSkills: [{ type: String }],
    sectionConfidenceMap: {
      type: Map,
      of:   Number,
      default: {},
    },
    filename: {
      type:    String,
      default: 'pasted',
    },
  },
  { timestamps: true }
);

// Compound index: fast paginated queries for a user's resumes
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);