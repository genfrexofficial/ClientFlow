const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStage,
  deleteProject,
  getAdminOverviewAnalytics,
  getProjectSummary
} = require('../controllers/projectController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Admin analytics overview
router.get('/analytics/overview', authorizeRoles('ADMIN'), getAdminOverviewAnalytics);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/summary', getProjectSummary);

// Admin-only mutations
router.post('/', authorizeRoles('ADMIN'), createProject);
router.put('/:id', authorizeRoles('ADMIN'), updateProject);
router.put('/:id/stage', authorizeRoles('ADMIN'), updateProjectStage);
router.delete('/:id', authorizeRoles('ADMIN'), deleteProject);

module.exports = router;
