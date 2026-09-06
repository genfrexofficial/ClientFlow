const File = require('../models/File');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const { uploadFile, deleteFile: removeFileStorage } = require('../services/storageService');
const { logActivity } = require('../services/activityService');
const { sendNotification } = require('../services/notificationService');

// @desc    Get all files for a project
// @route   GET /api/files/project/:projectId
// @access  Private
const getProjectFiles = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    if (req.user.role === 'CLIENT' && project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view files for this project.'
      });
    }

    const files = await File.find({ project: projectId })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: files.length,
      files
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload project file / deliverable
// @route   POST /api/files/upload
// @access  Private
const uploadProjectFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a file to upload.'
      });
    }

    const { projectId, category, fileName } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required.'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Process upload via Cloudinary or local disk
    const stored = await uploadFile(req.file);

    const fileDoc = await File.create({
      project: projectId,
      uploadedBy: req.user._id,
      fileName: fileName || req.file.originalname,
      fileUrl: stored.fileUrl,
      publicId: stored.publicId || '',
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'DELIVERABLE',
      approvalStatus: category === 'DELIVERABLE' ? 'PENDING_REVIEW' : 'APPROVED'
    });

    const populatedFile = await File.findById(fileDoc._id).populate('uploadedBy', 'name email avatar');

    // Activity log
    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'FILE_UPLOADED',
      description: `${req.user.name} uploaded ${category === 'DELIVERABLE' ? 'deliverable' : 'file'} "${fileDoc.fileName}".`
    });

    // Notify client if deliverable is uploaded by admin
    if (category === 'DELIVERABLE' && req.user.role === 'ADMIN' && project.client) {
      await sendNotification({
        userId: project.client,
        projectId: project._id,
        type: 'FILE',
        message: `New deliverable "${fileDoc.fileName}" is ready for review.`
      });
    }

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      file: populatedFile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project file
// @route   DELETE /api/files/:id
// @access  Private (Admin only)
const deleteProjectFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    await removeFileStorage(file.publicId, file.fileUrl);
    await file.deleteOne();

    await logActivity({
      projectId: file.project,
      userId: req.user._id,
      action: 'FILE_DELETED',
      description: `${req.user.name} removed file "${file.fileName}".`
    });

    res.status(200).json({
      success: true,
      message: 'File deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review deliverable (Approve or Request Changes)
// @route   PUT /api/files/:id/review
// @access  Private
const reviewDeliverable = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Deliverable not found.'
      });
    }

    const project = await Project.findById(file.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found.'
      });
    }

    // Role check: client can review their project's deliverables
    if (req.user.role === 'CLIENT' && project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to review this deliverable.'
      });
    }

    if (!['APPROVED', 'CHANGES_REQUESTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either APPROVED or CHANGES_REQUESTED.'
      });
    }

    file.approvalStatus = status;
    await file.save();

    if (status === 'APPROVED') {
      // Log activity
      await logActivity({
        projectId: project._id,
        userId: req.user._id,
        action: 'DELIVERABLE_APPROVED',
        description: `${req.user.name} approved deliverable "${file.fileName}".`
      });

      // Notify project creator / admin
      await sendNotification({
        userId: project.createdBy,
        projectId: project._id,
        type: 'APPROVAL',
        message: `Deliverable "${file.fileName}" was approved by ${req.user.name}.`
      });
    } else if (status === 'CHANGES_REQUESTED') {
      // Log activity
      await logActivity({
        projectId: project._id,
        userId: req.user._id,
        action: 'CHANGES_REQUESTED',
        description: `${req.user.name} requested changes on "${file.fileName}": ${reason || 'See comments'}`
      });

      // Automatically post a comment with the change request feedback
      if (reason && reason.trim()) {
        await Comment.create({
          project: project._id,
          file: file._id,
          user: req.user._id,
          message: `[Changes Requested on ${file.fileName}]: ${reason.trim()}`
        });
      }

      // Notify admin
      await sendNotification({
        userId: project.createdBy,
        projectId: project._id,
        type: 'FEEDBACK',
        message: `Changes requested for "${file.fileName}". Client feedback: ${reason ? reason.substring(0, 80) : 'Check deliverable comments'}`
      });
    }

    const updated = await File.findById(file._id).populate('uploadedBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: status === 'APPROVED' ? 'Deliverable approved successfully!' : 'Changes requested successfully.',
      file: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
  reviewDeliverable
};
