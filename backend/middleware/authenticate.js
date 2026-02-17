// middleware/authenticate.js
'use strict';

const authSvc = require('../services/authService');
const logger  = require('../config/logger');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.slice(7); // remove "Bearer "

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = authSvc.verifyAccessToken(token);

    // Attach decoded payload to request object
    req.user = {
      userId: decoded.userId,
      email:  decoded.email,
      role:   decoded.role,
    };

    return next();
  } catch (err) {
    logger.warn('JWT verification failed', { error: err.message, ip: req.ip });

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        code:    'TOKEN_EXPIRED',   // frontend interceptor checks this code
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(401).json({ message: 'Authentication failed' });
  }
}

module.exports = authenticate;