// utils/hashUtils.js – SHA-256 deterministic JD-set fingerprint
'use strict';
const crypto = require('crypto');

/**
 * Produces a SHA-256 hash of the sorted, joined JD texts.
 * Identical JD sets always produce the same hash → cache hit.
 * @param {string[]} jdTexts
 * @returns {string} hex string
 */
function hashJDSet(jdTexts) {
  const normalized = jdTexts
    .map(t => t.trim().toLowerCase())
    .sort()                    // order-independent
    .join('||');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

module.exports = { hashJDSet };
