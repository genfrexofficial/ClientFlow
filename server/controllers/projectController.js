const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const File = require('../models/File');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { logActivity } = require('../services/activityService');
const { sendNotification } = require('../services/notificationService');

// @desc    Get all projects (admin: all, client: assigned)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'CLIENT') {
      query = { client: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('client', 'name email companyName avatar')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    // Attach quick stats to each project
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({ project: project._id, status: 'COMPLETED' });
        const totalMilestones = await Milestone.countDocuments({ project: project._id });
        const completedMilestones = await Milestone.countDocuments({ project: project._id, status: 'COMPLETED' });
        const pendingApprovals = await File.countDocuments({ project: project._id, approvalStatus: 'PENDING_REVIEW' });

        const pObj = project.toObject();
        pObj.stats = {
          totalTasks,
          completedTasks,
          totalMilestones,
          completedMilestones,
          pendingApprovals
        };
        return pObj;
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedProjects.length,
      projects: enrichedProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email companyName phone avatar')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Role check: client can only access assigned project
    if (req.user.role === 'CLIENT' && project.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this project.'
      });
    }

    // Summary statistics
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'COMPLETED' });
    const totalMilestones = await Milestone.countDocuments({ project: project._id });
    const completedMilestones = await Milestone.countDocuments({ project: project._id, status: 'COMPLETED' });
    const pendingApprovals = await File.countDocuments({ project: project._id, approvalStatus: 'PENDING_REVIEW' });
    const totalDeliverables = await File.countDocuments({ project: project._id, category: 'DELIVERABLE' });
    const approvedDeliverables = await File.countDocuments({ project: project._id, approvalStatus: 'APPROVED' });

    const pObj = project.toObject();
    pObj.stats = {
      totalTasks,
      completedTasks,
      totalMilestones,
      completedMilestones,
      pendingApprovals,
      totalDeliverables,
      approvedDeliverables
    };

    res.status(200).json({
      success: true,
      project: pObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin only)
const createProject = async (req, res, next) => {
  try {
    const { name, description, client, startDate, endDate, budget, status } = req.body;

    if (!name || !client) {
      return res.status(400).json({
        success: false,
        message: 'Project name and assigned client are required.'
      });
    }

    const project = await Project.create({
      name,
      description: description || '',
      client,
      createdBy: req.user._id,
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      budget: budget || 0,
      status: status || 'PLANNING',
      progress: 0
    });

    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name email companyName')
      .populate('createdBy', 'name email');

    // Log activity
    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'PROJECT_CREATED',
      description: `${req.user.name} created project "${project.name}".`
    });

    // Notify client
    await sendNotification({
      userId: client,
      projectId: project._id,
      message: `You have been invited to collaborate on project "${project.name}".`,
      type: 'PROJECT'
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: populatedProject
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const { name, description, client, startDate, endDate, budget, status } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (client) project.client = client;
    if (startDate) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (budget !== undefined) project.budget = budget;
    if (status) project.status = status;

    await project.save();

    const updated = await Project.findById(project._id)
      .populate('client', 'name email companyName')
      .populate('createdBy', 'name email');

    await logActivity({
      projectId: project._id,
      userId: req.user._id,
      action: 'PROJECT_UPDATED',
      description: `${req.user.name} updated project details.`
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Cascade delete related records
    await Task.deleteMany({ project: project._id });
    await Milestone.deleteMany({ project: project._id });
    await File.deleteMany({ project: project._id });
    await Comment.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await Notification.deleteMany({ project: project._id });
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project and all associated records deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project completion summary
// @route   GET /api/projects/:id/summary
// @access  Private
const getProjectSummary = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email companyName phone')
      .populate('createdBy', 'name email companyName');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    if (req.user.role === 'CLIENT' && project.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view project summary.'
      });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'COMPLETED' });
    const totalMilestones = await Milestone.countDocuments({ project: project._id });
    const completedMilestones = await Milestone.countDocuments({ project: project._id, status: 'COMPLETED' });
    const totalDeliverables = await File.countDocuments({ project: project._id, category: 'DELIVERABLE' });
    const approvedDeliverables = await File.countDocuments({ project: project._id, approvalStatus: 'APPROVED' });
    const changesRequested = await File.countDocuments({ project: project._id, approvalStatus: 'CHANGES_REQUESTED' });

    res.status(200).json({
      success: true,
      summary: {
        projectName: project.name,
        description: project.description,
        status: project.status,
        progress: project.progress,
        client: project.client,
        createdBy: project.createdBy,
        startDate: project.startDate,
        endDate: project.endDate || project.updatedAt,
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks
        },
        milestones: {
          total: totalMilestones,
          completed: completedMilestones
        },
        deliverables: {
          total: totalDeliverables,
          approved: approvedDeliverables,
          changesRequested
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectSummary
};
