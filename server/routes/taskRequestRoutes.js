const express = require('express');
const router = express.Router();
const {
  getTaskRequests,
  getTaskRequestById,
  createTaskRequest,
  approveTaskRequest,
  rejectTaskRequest
} = require('../controllers/taskRequestController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// List task requests & create request
router
  .route('/')
  .get(authorizeRoles('ADMIN', 'CLIENT'), getTaskRequests)
  .post(authorizeRoles('CLIENT'), createTaskRequest);

// Single request
router.route('/:id').get(authorizeRoles('ADMIN', 'CLIENT'), getTaskRequestById);

// Admin approval & rejection
router.route('/:id/approve').post(authorizeRoles('ADMIN'), approveTaskRequest);
router.route('/:id/reject').post(authorizeRoles('ADMIN'), rejectTaskRequest);

module.exports = router;
