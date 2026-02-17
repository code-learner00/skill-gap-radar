// models/JobDescription.js
'use strict';
const mongoose = require('mongoose');
const jdSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rawTexts:  [{ type: String, maxlength: 20000 }],   // array of JD strings
  extractedSkillsPerJD: [[String]],                   // parallel array
  jdCount:   { type: Number, default: 0 },
}, { timestamps: true });

jdSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JobDescription', jdSchema);
