const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
  reviewDeliverable
} = require('../controllers/fileController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/project/:projectId', getProjectFiles);
router.post('/upload', upload.single('file'), uploadProjectFile);
router.delete('/:id', authorizeRoles('ADMIN'), deleteProjectFile);
router.put('/:id/review', reviewDeliverable);

module.exports = router;
