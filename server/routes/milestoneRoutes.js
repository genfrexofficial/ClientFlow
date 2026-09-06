const express = require('express');
const router = express.Router();
const {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
} = require('../controllers/milestoneController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/project/:projectId', getProjectMilestones);

// Admin only mutations
router.post('/', authorizeRoles('ADMIN'), createMilestone);
router.put('/:id', authorizeRoles('ADMIN'), updateMilestone);
router.delete('/:id', authorizeRoles('ADMIN'), deleteMilestone);

module.exports = router;
