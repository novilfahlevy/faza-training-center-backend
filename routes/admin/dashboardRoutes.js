const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboardController');

// GET /api/admin/dashboard/statistics
router.get('/statistics', dashboardController.getStatistics);

// GET /api/admin/dashboard/charts
router.get('/charts', dashboardController.getChartData);

// GET /api/admin/dashboard/recent-trainings
router.get('/recent-trainings', dashboardController.getRecentTrainings);

// GET /api/admin/dashboard/pending-participants
router.get('/pending-participants', dashboardController.getPendingParticipants);

module.exports = router;