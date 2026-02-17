// models/User.js
'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type:     String,
      required: true,
      unique:   true,   // ← this already creates the index; don't call schema.index() again
      lowercase: true,
      trim:     true,
    },
    password: {
      type:    String,
      default: null,    // null for Google-only users
    },
    googleId: {
      type:    String,
      default: null,
      unique:  true,    // ← same: unique:true creates the sparse-ish index
      sparse:  true,    // sparse so multiple null values are allowed
    },
    displayName: {
      type:    String,
      default: '',
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type:    String,
      default: null,    // stored as bcrypt hash, not raw token
    },
    failedLogins: {
      type:    Number,
      default: 0,
    },
    lockedUntil: {
      type:    Date,
      default: null,
    },
  },
  { timestamps: true }
);

// ── DO NOT add schema.index() calls for email or googleId here.
// The unique:true / sparse:true options on the field definitions above
// already register those indexes. Calling schema.index() again creates
// duplicates and triggers the Mongoose warning.

// ── Pre-save hook: hash password when it changes ───────────────────────────
// NOTE: async pre-save hooks in Mongoose must NOT call next().
// Just return (or throw to abort). Calling next() causes "next is not a function".
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Instance methods ───────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (plaintext) {
  if (!this.password) return false; // Google-only user has no password
  return bcrypt.compare(plaintext, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > new Date();
};

// ── Serialization: strip sensitive fields from JSON output ─────────────────
userSchema.set('toJSON', {
  transform: function (_doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.failedLogins;
    delete ret.lockedUntil;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);