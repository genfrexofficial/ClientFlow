const express = require('express');
const router = express.Router();
const {
  getProjectComments,
  createComment,
  deleteComment
} = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/project/:projectId', getProjectComments);
router.post('/', createComment);
router.delete('/:id', deleteComment);

module.exports = router;
