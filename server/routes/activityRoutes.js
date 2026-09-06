const express = require('express');
const router = express.Router();
const {
  getProjectActivities,
  getRecentActivities
} = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/recent', getRecentActivities);
router.get('/project/:projectId', getProjectActivities);

module.exports = router;
