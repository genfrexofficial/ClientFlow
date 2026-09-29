const express = require('express');
const router = express.Router();
const {
  getProjectActivities,
  getRecentActivities,
  getAuditLogs
} = require('../controllers/activityController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/recent', getRecentActivities);
router.get('/audit', authorizeRoles('ADMIN'), getAuditLogs);
router.get('/project/:projectId', getProjectActivities);

module.exports = router;
