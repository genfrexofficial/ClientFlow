const express = require('express');
const router = express.Router();
const { generateProjectSummary } = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/project/:id/summary', generateProjectSummary);

module.exports = router;
