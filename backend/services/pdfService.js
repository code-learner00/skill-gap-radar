// services/pdfService.js
// Requires pdf-parse v1.x  (npm install pdf-parse@1.1.1)
// v1 exports a simple async function: pdfParse(buffer) => { text, numpages }
'use strict';

const pdfParse = require('pdf-parse');
const logger   = require('../config/logger');

const MAX_PDF_SIZE  = 5 * 1024 * 1024;
const ALLOWED_MIMES = new Set(['application/pdf']);

async function extractTextFromPDF(buffer, mimetype) {

  if (!ALLOWED_MIMES.has(mimetype)) {
    throw Object.assign(new Error('Only PDF files are accepted'), { status: 400 });
  }

  if (!buffer || buffer.length === 0) {
    throw Object.assign(new Error('Empty file received'), { status: 400 });
  }

  if (buffer.length > MAX_PDF_SIZE) {
    throw Object.assign(new Error('PDF exceeds 5 MB limit'), { status: 400 });
  }

  if (!buffer.slice(0, 5).toString('ascii').startsWith('%PDF')) {
    throw Object.assign(new Error('Not a valid PDF file'), { status: 400 });
  }

  try {
    // pdf-parse v1: pdfParse(buffer) returns { text, numpages, info, metadata }
    const data = await pdfParse(buffer);

    if (!data || typeof data.text !== 'string' || data.text.trim().length < 30) {
      throw Object.assign(
        new Error(
          'Could not extract text from this PDF. ' +
          'It may be scanned/image-based. Please use the "Paste Text" tab instead.'
        ),
        { status: 422 }
      );
    }

    const text = data.text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    logger.info('PDF parsed', { pages: data.numpages, chars: text.length });
    return text;

  } catch (err) {
    if (err.status) throw err;
    logger.error('pdf-parse error', { message: err.message });
    throw Object.assign(
      new Error('PDF parsing failed. Try the "Paste Text" tab instead.'),
      { status: 422 }
    );
  }
}

module.exports = { extractTextFromPDF };