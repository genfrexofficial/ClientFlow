const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const Project = require('../models/Project');
const Task = require('../models/Task');
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
    const { category, taskId } = req.query;

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

    if (req.user.role === 'WORKER') {
      const isAssigned = project.assignedWorkers && project.assignedWorkers.some(
        (w) => w.toString() === req.user._id.toString()
      );
      const hasTask = await Task.exists({ project: project._id, assignedTo: req.user._id });
      if (!isAssigned && !hasTask) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view files for this project.'
        });
      }
    }

    let query = { project: projectId };
    if (category) {
      query.category = category;
    }
    if (taskId) {
      query.task = taskId;
    }

    const files = await File.find(query)
      .populate('uploadedBy', 'name email avatar role title')
      .populate('reviewedBy', 'name email')
      .populate('task', 'title status')
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
// @access  Private (Admin, Worker, Client)
const uploadProjectFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a file to upload.'
      });
    }

    const { projectId, category, fileName, taskId } = req.body;

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

    // Role validation
    if (req.user.role === 'CLIENT' && project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to upload files to this project.'
      });
    }

    // Process upload via Cloudinary or local disk
    const stored = await uploadFile(req.file);

    const isDeliverable = category === 'DELIVERABLE';

    const fileDoc = await File.create({
      project: projectId,
      task: taskId || null,
      uploadedBy: req.user._id,
      fileName: fileName ? fileName.trim() : req.file.originalname,
      fileUrl: stored.fileUrl,
      publicId: stored.publicId || '',
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: category || 'DELIVERABLE',
      isDeliverable,
      approvalStatus: isDeliverable ? 'PENDING_REVIEW' : 'APPROVED'
    });

    const populatedFile = await File.findById(fileDoc._id)
      .populate('uploadedBy', 'name email avatar role title')
      .populate('task', 'title');

    // Activity log
    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'FILE_UPLOADED',
      description: `${req.user.name} uploaded ${isDeliverable ? 'deliverable' : 'file'} "${fileDoc.fileName}".`,
      entityType: 'FILE',
      entityId: fileDoc._id,
      clientVisible: true
    });

    // Notify client if deliverable is uploaded by admin or worker
    if (isDeliverable && req.user.role !== 'CLIENT' && project.client) {
      await sendNotification({
        userId: project.client,
        projectId: project._id,
        title: 'New Deliverable Ready for Review',
        type: 'FILE',
        message: `New deliverable "${fileDoc.fileName}" is ready for your review and sign-off.`,
        link: `/client/files`
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
// @access  Private (Admin or Uploader)
const deleteProjectFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    const isUploader = file.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isUploader && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this file.'
      });
    }

    await removeFileStorage(file.publicId, file.fileUrl);
    await file.deleteOne();

    await logActivity({
      projectId: file.project,
      userId: req.user._id,
      action: 'FILE_DELETED',
      description: `${req.user.name} removed file "${file.fileName}".`,
      entityType: 'FILE',
      entityId: file._id,
      clientVisible: true
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
// @access  Private (Client or Admin)
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

    // Require revision notes when requesting changes
    if (status === 'CHANGES_REQUESTED' && (!reason || !reason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide revision notes explaining what changes are requested.'
      });
    }

    file.approvalStatus = status;
    file.reviewedBy = req.user._id;
    file.reviewedAt = new Date();
    if (status === 'CHANGES_REQUESTED') {
      file.revisionNotes = reason.trim();
    } else {
      file.revisionNotes = '';
    }
    await file.save();

    if (status === 'APPROVED') {
      // Log activity
      await logActivity({
        projectId: project._id,
        userId: req.user._id,
        action: 'DELIVERABLE_APPROVED',
        description: `${req.user.name} approved deliverable "${file.fileName}".`,
        entityType: 'FILE',
        entityId: file._id,
        clientVisible: true
      });

      // Notify project creator / admin
      if (project.createdBy) {
        await sendNotification({
          userId: project.createdBy,
          projectId: project._id,
          title: 'Deliverable Approved',
          type: 'APPROVAL',
          message: `Deliverable "${file.fileName}" was approved by ${req.user.name}.`,
          link: `/admin/projects/${project._id}`
        });
      }

      // If uploaded by worker, also notify the worker
      if (file.uploadedBy && file.uploadedBy.toString() !== project.createdBy.toString()) {
        await sendNotification({
          userId: file.uploadedBy,
          projectId: project._id,
          title: 'Deliverable Approved',
          type: 'APPROVAL',
          message: `Your deliverable "${file.fileName}" was approved by the client!`,
          link: `/worker/files`
        });
      }
    } else if (status === 'CHANGES_REQUESTED') {
      // Log activity
      await logActivity({
        projectId: project._id,
        userId: req.user._id,
        action: 'CHANGES_REQUESTED',
        description: `${req.user.name} requested changes on "${file.fileName}": ${reason.trim()}`,
        entityType: 'FILE',
        entityId: file._id,
        clientVisible: true
      });

      // Automatically post a comment with the change request feedback
      await Comment.create({
        project: project._id,
        file: file._id,
        user: req.user._id,
        message: `[Changes Requested on ${file.fileName}]: ${reason.trim()}`
      });

      // Notify admin
      if (project.createdBy) {
        await sendNotification({
          userId: project.createdBy,
          projectId: project._id,
          title: 'Deliverable Changes Requested',
          type: 'FEEDBACK',
          message: `Client requested changes for "${file.fileName}": "${reason.trim().substring(0, 80)}"`,
          link: `/admin/projects/${project._id}`
        });
      }

      // If uploaded by worker, also notify the worker
      if (file.uploadedBy && file.uploadedBy.toString() !== project.createdBy.toString()) {
        await sendNotification({
          userId: file.uploadedBy,
          projectId: project._id,
          title: 'Deliverable Revision Requested',
          type: 'FEEDBACK',
          message: `Client requested changes on your deliverable "${file.fileName}": "${reason.trim().substring(0, 80)}"`,
          link: `/worker/files`
        });
      }
    }

    const updated = await File.findById(file._id)
      .populate('uploadedBy', 'name email avatar role title')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: status === 'APPROVED' ? 'Deliverable approved successfully!' : 'Changes requested successfully.',
      file: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download or securely view file with permission checks
// @route   GET /api/files/:id/download
// @access  Private (Admin, Worker with project/task access, Client of project if visible)
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id)
      .populate('project')
      .populate('task');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    const project = file.project;
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found.'
      });
    }

    // Role-based security validation
    if (req.user.role === 'CLIENT') {
      if (project.client.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You do not have access to files for this project.'
        });
      }
      if (file.task && file.task.clientVisible === false) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This file belongs to an internal task.'
        });
      }
    } else if (req.user.role === 'WORKER') {
      const isAssigned = project.assignedWorkers && project.assignedWorkers.some(
        (w) => w.toString() === req.user._id.toString()
      );
      const isTaskAssigned = file.task && file.task.assignedTo && file.task.assignedTo.toString() === req.user._id.toString();
      const hasTaskInProject = await Task.exists({ project: project._id, assignedTo: req.user._id });

      if (!isAssigned && !isTaskAssigned && !hasTaskInProject) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You are not assigned to this project or its tasks.'
        });
      }
    }

    // If local disk file, send download
    if (file.fileUrl && file.fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(file.fileUrl);
      const filePath = path.join(__dirname, '../uploads', filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File asset does not exist on disk.'
        });
      }

      return res.download(filePath, file.fileName);
    }

    // Cloudinary or remote storage redirect
    return res.redirect(file.fileUrl);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
  reviewDeliverable,
  downloadFile
};
