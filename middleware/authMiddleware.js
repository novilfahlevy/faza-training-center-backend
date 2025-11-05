const jwt = require('jsonwebtoken');
const { Pengguna } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Akses ditolak, token tidak ada.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Pengguna.findByPk(decoded.user_id);

    if (!user) {
      return res.status(401).json({ message: 'Token tidak valid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};

// Middleware untuk memeriksa role admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak, hanya untuk admin.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };