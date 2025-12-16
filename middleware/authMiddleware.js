// /home/novilfahlevy/Projects/faza-training-center-backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { Pengguna } = require('../models');
const Env = require('../config/env');

// Middleware untuk autentikasi
exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        message: 'Akses ditolak. Token tidak disediakan.',
        state: 'NOT_AUTHORIZED'
      });
    }

    const decoded = jwt.verify(token, Env.JWT_SECRET);
    
    const pengguna = await Pengguna.findByPk(decoded.user_id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!pengguna) {
      return res.status(401).json({
        message: 'Token tidak valid.',
        state: 'NOT_AUTHORIZED'
      });
    }

    req.user = pengguna;
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Token tidak valid.',
      state: 'NOT_AUTHORIZED'
    });
  }
};

// Middleware untuk admin
exports.adminMiddleware = (req, res, next) => {
  if (!['admin', 'mitra'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Akses ditolak. Hanya admin yang diizinkan.',
      state: 'NOT_AUTHORIZED'
    });
  }
  next();
};