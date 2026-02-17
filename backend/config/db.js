// config/db.js – Mongoose connect with exponential back-off retry
'use strict';
const mongoose = require('mongoose');
const logger   = require('./logger');

const MAX_RETRIES   = 5;
const RETRY_DELAY   = 3000;

async function connectDB(retries = 0) {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected');

    mongoose.connection.on('error', (err) =>
      logger.error('MongoDB runtime error', { err }));

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected – reconnecting...');
      setTimeout(connectDB, RETRY_DELAY);
    });
  } catch (err) {
    if (retries < MAX_RETRIES) {
      logger.warn(`MongoDB connect failed – retry ${retries + 1}/${MAX_RETRIES}`);
      await new Promise(r => setTimeout(r, RETRY_DELAY * (retries + 1)));
      return connectDB(retries + 1);
    }
    logger.error('MongoDB connect: max retries exceeded', { err });
    process.exit(1);
  }
}

module.exports = { connectDB };
