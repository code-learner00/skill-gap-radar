// middleware/validate.js
'use strict';

const Joi = require('joi');

// ── Schemas ────────────────────────────────────────────────────────────────
const schemas = {
  register: Joi.object({
    email:       Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password:    Joi.string().min(8).max(128).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required',
    }),
    displayName: Joi.string().max(80).optional().allow(''),
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  analyze: Joi.object({
    resumeId: Joi.string().hex().length(24).required().messages({
      'string.hex':    'resumeId must be a valid MongoDB ObjectId',
      'string.length': 'resumeId must be 24 characters',
      'any.required':  'resumeId is required',
    }),
    jdTexts: Joi.array()
      .items(Joi.string().min(10).max(20000))
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'Provide at least 1 job description',
        'array.max': 'Maximum 20 job descriptions allowed',
      }),
  }),

  pasteResume: Joi.object({
    text: Joi.string().min(50).max(50000).required().messages({
      'string.min': 'Resume text must be at least 50 characters',
      'any.required': 'text is required',
    }),
  }),
};

// ── Middleware factory ─────────────────────────────────────────────────────
function validate(schemaKey) {
  return function (req, res, next) {
    const schema = schemas[schemaKey];
    if (!schema) {
      // No schema defined → pass through
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly:   false,  // collect all errors, not just the first
      stripUnknown: true,   // remove fields not in schema
    });

    if (error) {
      const errors = error.details.map(function (d) { return d.message; });
      return res.status(400).json({
        message: 'Validation error',
        errors,
      });
    }

    // Replace req.body with sanitized + stripped value
    req.body = value;
    return next();
  };
}

module.exports = validate;