const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const { logActivity } = require('../services/activityService');
const { sendNotification } = require('../services/notificationService');

// @desc    Get all milestones for a project
// @route   GET /api/milestones/project/:projectId
// @access  Private
const getProjectMilestones = async (req, res, next) => {
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
        message: 'Unauthorized to view milestones for this project.'
      });
    }

    const milestones = await Milestone.find({ project: projectId }).sort({ dueDate: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: milestones.length,
      milestones
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a milestone
// @route   POST /api/milestones
// @access  Private (Admin only)
const createMilestone = async (req, res, next) => {
  try {
    const { project: projectId, title, description, dueDate, status } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and milestone title are required.'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const milestone = await Milestone.create({
      project: projectId,
      title,
      description: description || '',
      dueDate: dueDate || null,
      status: status || 'PENDING'
    });

    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'MILESTONE_CREATED',
      description: `${req.user.name} added milestone "${milestone.title}".`
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully.',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (Admin only)
const updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.'
      });
    }

    const { title, description, dueDate, status } = req.body;
    const oldStatus = milestone.status;

    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (dueDate !== undefined) milestone.dueDate = dueDate;
    if (status) milestone.status = status;

    await milestone.save();

    if (oldStatus !== 'COMPLETED' && milestone.status === 'COMPLETED') {
      await logActivity({
        projectId: milestone.project,
        userId: req.user._id,
        action: 'MILESTONE_COMPLETED',
        description: `Milestone "${milestone.title}" was completed.`
      });

      const project = await Project.findById(milestone.project);
      if (project && project.client) {
        await sendNotification({
          userId: project.client,
          projectId: project._id,
          type: 'PROJECT',
          message: `Milestone "${milestone.title}" has been achieved!`
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully.',
      milestone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Admin only)
const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found.'
      });
    }

    await milestone.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone
};
