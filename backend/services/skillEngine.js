// services/skillEngine.js – Deterministic Skill Gap Analysis Engine
// Time Complexity: O(W + S)  W=words in texts, S=unique skill count (~100)
// Space Complexity: O(S) for all scoring maps
'use strict';

const MASTER_SKILLS = require('../utils/masterSkillList');
const SKILL_DICT    = require('../utils/skillDictionary');
const logger        = require('../config/logger');

// ─── Section weights ──────────────────────────────────────────────────────────
// Higher weight = stronger signal that you actually know the skill
const SECTION_WEIGHTS = {
  experience: 1.0,   // you used it professionally
  projects:   0.7,   // you built something with it
  skills:     0.4,   // you listed it (could be aspirational)
};

// ─── Section header detection ─────────────────────────────────────────────────
const SECTION_PATTERNS = {
  experience: /\b(experience|work history|employment|professional background|work experience)\b/i,
  projects:   /\b(projects|personal projects|side projects|portfolio|open.?source)\b/i,
  skills:     /\b(skills|technical skills|competencies|technologies|tech stack)\b/i,
};

/**
 * normalizeToken
 * Converts a raw token string to its canonical skill name, or null if not recognized.
 * Steps: lowercase → trim → strip punctuation → alias dict → master set check
 *
 * @param   {string}      token  – raw text token
 * @returns {string|null}        – canonical skill name or null
 */
function normalizeToken(token) {
  if (!token || typeof token !== 'string') return null;

  // 1. lowercase + trim
  let clean = token.toLowerCase().trim();

  // 2. strip punctuation except chars that appear in skill names: # + . -
  clean = clean.replace(/[^a-z0-9#+.\s-]/g, '').trim();

  if (!clean) return null;

  // 3. alias dictionary lookup (e.g. "reactjs" → "react")
  const mapped = SKILL_DICT[clean] !== undefined ? SKILL_DICT[clean] : clean;

  // 4. master skill set check (O(1) Set lookup)
  return MASTER_SKILLS.has(mapped) ? mapped : null;
}

/**
 * extractSkillsFromText
 * Scans text for recognized skill tokens using a sliding n-gram window (1–3 words).
 * Returns a Set of canonical skill names for O(1) membership checks later.
 *
 * @param   {string}      text
 * @returns {Set<string>}
 */
function extractSkillsFromText(text) {
  if (!text || typeof text !== 'string') return new Set();

  const found = new Set();

  // Tokenize: lowercase, strip non-skill chars, split on whitespace
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // Sliding n-gram window: 1, 2, 3 words
  for (let i = 0; i < words.length; i++) {
    for (let n = 1; n <= 3 && i + n <= words.length; n++) {
      const gram  = words.slice(i, i + n).join(' ');
      const skill = normalizeToken(gram);
      if (skill) found.add(skill);
    }
  }

  return found;
}

/**
 * detectSection
 * Returns which resume section a line belongs to, or null.
 *
 * @param   {string}      line
 * @returns {string|null}
 */
function detectSection(line) {
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(line)) return section;
  }
  return null;
}

/**
 * buildResumeConfidence
 * Builds a confidence score map for each skill found in the resume.
 *
 * Algorithm:
 *   1. Split resume into lines
 *   2. Detect section headers (experience / projects / skills)
 *   3. For each line: extract skills, apply section weight
 *   4. Use max() so Experience (1.0) always beats Skills (0.4)
 *
 * Formula:  confidenceMap[skill] = max(existing, SECTION_WEIGHTS[section])
 *
 * @param   {string} resumeText
 * @returns {{ confidenceMap: Object<string,number>, allSkills: string[] }}
 */
function buildResumeConfidence(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    return { confidenceMap: {}, allSkills: [] };
  }

  const confidenceMap  = {};
  const lines          = resumeText.split(/\r?\n/);
  let   currentSection = 'skills'; // default if no header found

  for (const line of lines) {
    if (!line.trim()) continue;

    const detected = detectSection(line);
    if (detected) {
      currentSection = detected;
      continue; // header line itself doesn't carry skill content
    }

    const weight = SECTION_WEIGHTS[currentSection] !== undefined
      ? SECTION_WEIGHTS[currentSection]
      : 0.4;

    const skills = extractSkillsFromText(line);

    for (const skill of skills) {
      // max() prevents skill stuffing: listing "React" in Skills can't override
      // "React" found in Experience
      confidenceMap[skill] = Math.max(
        confidenceMap[skill] !== undefined ? confidenceMap[skill] : 0,
        weight
      );
    }
  }

  return {
    confidenceMap,
    allSkills: Object.keys(confidenceMap),
  };
}

/**
 * buildJDDemandMap
 * Builds a demand frequency map from an array of job description strings.
 *
 * Formula: JDWeight(skill) = (# of JDs containing skill) / (total JDs)
 * Range: [0.0, 1.0]  — 1.0 means every single JD mentions the skill.
 *
 * Uses a Set per JD so one skill counts once per JD, no matter how many times
 * it appears in that JD's text.
 *
 * @param   {string[]} jdTexts  – array of 1–20 JD strings
 * @returns {{ demandMap: Object<string,number>, skillsPerJD: string[][] }}
 */
function buildJDDemandMap(jdTexts) {
  const jdCount    = jdTexts.length;
  const skillFreq  = {};     // skill → count of JDs that contain it
  const skillsPerJD = [];

  for (const jdText of jdTexts) {
    const skills = extractSkillsFromText(jdText);
    skillsPerJD.push(Array.from(skills));

    for (const skill of skills) {
      skillFreq[skill] = (skillFreq[skill] || 0) + 1;
    }
  }

  // Normalize to frequency weight [0, 1]
  const demandMap = {};
  for (const [skill, count] of Object.entries(skillFreq)) {
    demandMap[skill] = parseFloat((count / jdCount).toFixed(4));
  }

  return { demandMap, skillsPerJD };
}

/**
 * computeGapScores
 * Gap(skill) = JDWeight(skill) - ResumeConfidence(skill)
 * Range: [-1, +1]
 *   > 0 → skill demanded more than resume demonstrates (needs work)
 *   < 0 → resume exceeds market demand for this skill (over-indexed)
 *   = 0 → perfect alignment
 */
function computeGapScores(demandMap, confidenceMap) {
  const gapScores = {};
  for (const [skill, demand] of Object.entries(demandMap)) {
    const confidence = confidenceMap[skill] !== undefined ? confidenceMap[skill] : 0;
    gapScores[skill] = parseFloat((demand - confidence).toFixed(4));
  }
  return gapScores;
}

/**
 * computeReadinessScore
 * Demand-weighted average of your confidence scores.
 *
 * Formula:
 *   readiness = Σ(confidence[s] × demand[s]) / Σ(demand[s]) × 100
 *
 * A skill you're great at (1.0) but rarely demanded (0.1) contributes little.
 * A skill you're weak at (0.2) but universally demanded (0.9) drags the score down.
 *
 * @returns {number}  Integer 0–100
 */
function computeReadinessScore(demandMap, confidenceMap) {
  let numerator   = 0;
  let denominator = 0;

  for (const [skill, demand] of Object.entries(demandMap)) {
    const confidence = confidenceMap[skill] !== undefined ? confidenceMap[skill] : 0;
    numerator   += confidence * demand;
    denominator += demand;
  }

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

/**
 * computePrioritySkills
 * PriorityScore(skill) = JDWeight(skill) × (1 - ResumeConfidence(skill))
 *
 * High demand + low confidence → highest learning priority.
 * Returns top N skill names sorted descending by priority score.
 *
 * @param   {Object} demandMap
 * @param   {Object} confidenceMap
 * @param   {number} topN
 * @returns {string[]}
 */
function computePrioritySkills(demandMap, confidenceMap, topN) {
  const n = topN || 5;

  return Object.entries(demandMap)
    .map(function(entry) {
      const skill      = entry[0];
      const demand     = entry[1];
      const confidence = confidenceMap[skill] !== undefined ? confidenceMap[skill] : 0;
      return {
        skill,
        priority: parseFloat((demand * (1 - confidence)).toFixed(4)),
      };
    })
    .sort(function(a, b) { return b.priority - a.priority; })
    .slice(0, n)
    .map(function(s) { return s.skill; });
}

/**
 * findOverSaturated
 * Skills where resume confidence is high but market demand is low.
 * confidence > 0.6 AND demand < 0.2
 */
function findOverSaturated(demandMap, confidenceMap) {
  return Object.entries(confidenceMap)
    .filter(function(entry) {
      const skill  = entry[0];
      const conf   = entry[1];
      const demand = demandMap[skill] !== undefined ? demandMap[skill] : 0;
      return conf > 0.6 && demand < 0.2;
    })
    .map(function(entry) { return entry[0]; });
}

/**
 * findMissingHighDemand
 * Skills demanded in >60% of JDs but completely absent from resume.
 */
function findMissingHighDemand(demandMap, confidenceMap) {
  return Object.entries(demandMap)
    .filter(function(entry) {
      const skill = entry[0];
      const demand = entry[1];
      return demand > 0.6 && !confidenceMap[skill];
    })
    .map(function(entry) { return entry[0]; });
}

/**
 * runAnalysis – main entry point
 * Orchestrates the full deterministic analysis pipeline.
 *
 * @param   {string}   resumeText
 * @param   {string[]} jdTexts    – 1 to 20 job description strings
 * @returns {Object}
 */
function runAnalysis(resumeText, jdTexts) {
  if (!Array.isArray(jdTexts) || jdTexts.length === 0 || jdTexts.length > 20) {
    throw Object.assign(
      new Error('Provide between 1 and 20 job descriptions'),
      { status: 400 }
    );
  }

  logger.debug('runAnalysis start', { jdCount: jdTexts.length });

  const demandResult      = buildJDDemandMap(jdTexts);
  const demandMap         = demandResult.demandMap;
  const skillsPerJD       = demandResult.skillsPerJD;

  const confidenceResult  = buildResumeConfidence(resumeText);
  const confidenceMap     = confidenceResult.confidenceMap;
  const allSkills         = confidenceResult.allSkills;

  const gapScores         = computeGapScores(demandMap, confidenceMap);
  const readinessScore    = computeReadinessScore(demandMap, confidenceMap);
  const prioritySkills    = computePrioritySkills(demandMap, confidenceMap, 5);
  const overSaturated     = findOverSaturated(demandMap, confidenceMap);
  const missingHighDemand = findMissingHighDemand(demandMap, confidenceMap);

  logger.debug('runAnalysis complete', {
    demandSkills:    Object.keys(demandMap).length,
    resumeSkills:    allSkills.length,
    readinessScore,
  });

  return {
    skillDemandMap:      demandMap,
    resumeConfidenceMap: confidenceMap,
    gapScores,
    readinessScore,
    prioritySkills,
    overSaturated,
    missingHighDemand,
    meta: {
      totalJDs:         jdTexts.length,
      demandSkillCount: Object.keys(demandMap).length,
      resumeSkillCount: allSkills.length,
    },
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────
// All functions exported individually AND as properties of module.exports
// so both require('skillEngine').runAnalysis and
//     const { runAnalysis } = require('skillEngine')
// work correctly.
module.exports = {
  runAnalysis,
  extractSkillsFromText,
  normalizeToken,
  buildResumeConfidence,
  buildJDDemandMap,
  computeGapScores,
  computeReadinessScore,
  computePrioritySkills,
  findOverSaturated,
  findMissingHighDemand,
};