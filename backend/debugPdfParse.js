// Run from backend/: node debugPdfParse.js
// Shows exact PDFParse class API so we know the right method name
'use strict';
const { PDFParse } = require('pdf-parse');

console.log('PDFParse type:', typeof PDFParse);

// Inspect prototype methods
const proto = PDFParse.prototype;
console.log('PDFParse.prototype methods:', Object.getOwnPropertyNames(proto));

// Also check static methods
console.log('PDFParse static keys:', Object.keys(PDFParse));

// Try instantiating to see instance shape
try {
  const instance = new PDFParse();
  console.log('instance keys:', Object.getOwnPropertyNames(instance));
  console.log('instance methods from proto:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
} catch(e) {
  console.log('constructor error:', e.message);
}