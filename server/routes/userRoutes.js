const express = require('express');
const router = express.Router();
const { getClients, getClientById, createClient } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All client management endpoints require ADMIN role
router.use(authenticateToken);

router.get('/clients', authorizeRoles('ADMIN'), getClients);
router.post('/clients', authorizeRoles('ADMIN'), createClient);
router.get('/clients/:id', authorizeRoles('ADMIN'), getClientById);

module.exports = router;
