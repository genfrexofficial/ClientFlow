const express = require('express');
const router = express.Router();
const {
  getProjectTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  startTask,
  updateTaskProgress,
  submitTaskForReview,
  completeTask,
  blockTask,
  deleteTask
} = require('../controllers/taskController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Worker: Get my tasks
router.get('/my-tasks', authorizeRoles('WORKER', 'ADMIN'), getMyTasks);

// Get tasks for a project
router.get('/project/:projectId', getProjectTasks);

// Single task details
router.get('/:id', getTaskById);

// Admin task creation
router.post('/', authorizeRoles('ADMIN'), createTask);

// Update task (Admin or Worker with transition validation)
router.put('/:id', authorizeRoles('ADMIN', 'WORKER'), updateTask);

// Dedicated action endpoints
router.post('/:id/start', authorizeRoles('WORKER', 'ADMIN'), startTask);
router.post('/:id/progress', authorizeRoles('WORKER', 'ADMIN'), updateTaskProgress);
router.post('/:id/submit-review', authorizeRoles('WORKER', 'ADMIN'), submitTaskForReview);
router.post('/:id/block', authorizeRoles('WORKER', 'ADMIN'), blockTask);
router.post('/:id/complete', authorizeRoles('ADMIN'), completeTask);

// Delete task (Admin only)
router.delete('/:id', authorizeRoles('ADMIN'), deleteTask);

module.exports = router;
