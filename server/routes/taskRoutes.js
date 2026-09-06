const express = require('express');
const router = express.Router();
const {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Both Admin & Client can view tasks for project
router.get('/project/:projectId', getProjectTasks);

// Admin-only management
router.post('/', authorizeRoles('ADMIN'), createTask);
router.put('/:id', authorizeRoles('ADMIN'), updateTask);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTask);

module.exports = router;
