// server.js – HTTP server entrypoint with graceful shutdown
'use strict';
require('dotenv').config();
const http = require('http');
const app  = require('./app');
const { connectDB } = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received – graceful shutdown`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });
})()
