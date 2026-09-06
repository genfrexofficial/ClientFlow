const Comment = require('../models/Comment');
const Project = require('../models/Project');
const { logActivity } = require('../services/activityService');
const { sendNotification } = require('../services/notificationService');

// @desc    Get all comments for a project (optionally filter by file)
// @route   GET /api/comments/project/:projectId
// @access  Private
const getProjectComments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { fileId } = req.query;

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
        message: 'Unauthorized to view comments for this project.'
      });
    }

    const query = { project: projectId };
    if (fileId) {
      query.file = fileId;
    }

    const comments = await Comment.find(query)
      .populate('user', 'name email role avatar')
      .populate('file', 'fileName')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment / feedback
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { project: projectId, file: fileId, message } = req.body;

    if (!projectId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and message are required.'
      });
    }

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
        message: 'Unauthorized to comment on this project.'
      });
    }

    const comment = await Comment.create({
      project: projectId,
      file: fileId || null,
      user: req.user._id,
      message: message.trim()
    });

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name email role avatar')
      .populate('file', 'fileName');

    const isClient = req.user.role === 'CLIENT';

    // Log activity
    await logActivity({
      projectId,
      userId: req.user._id,
      action: isClient ? 'FEEDBACK_RECEIVED' : 'COMMENT_ADDED',
      description: `${req.user.name} added ${isClient ? 'client feedback' : 'a comment'}.`
    });

    // Notify opposite party
    const targetUserId = isClient ? project.createdBy : project.client;
    if (targetUserId) {
      await sendNotification({
        userId: targetUserId,
        projectId: project._id,
        type: 'FEEDBACK',
        message: `${req.user.name} posted feedback on "${project.name}": "${message.trim().substring(0, 70)}..."`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    // Only owner or admin can delete
    if (req.user.role !== 'ADMIN' && comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this comment.'
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectComments,
  createComment,
  deleteComment
};
