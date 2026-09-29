const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  getWorkers,
  getWorkerById,
  createWorker
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Client management
router.get('/clients', authorizeRoles('ADMIN'), getClients);
router.post('/clients', authorizeRoles('ADMIN'), createClient);
router.get('/clients/:id', authorizeRoles('ADMIN'), getClientById);

// Worker management (Admin only)
router.get('/workers', authorizeRoles('ADMIN'), getWorkers);
router.post('/workers', authorizeRoles('ADMIN'), createWorker);
router.get('/workers/:id', authorizeRoles('ADMIN'), getWorkerById);

module.exports = router;
