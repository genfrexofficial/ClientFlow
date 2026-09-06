const Task = require('../models/Task');
const Project = require('../models/Project');
const { recalculateProjectProgress } = require('../services/progressService');
const { logActivity } = require('../services/activityService');
const { sendNotification } = require('../services/notificationService');

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Authorization check
    if (req.user.role === 'CLIENT' && project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view tasks for this project.'
      });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin only)
const createTask = async (req, res, next) => {
  try {
    const { project: projectId, title, description, assignedTo, status, priority, dueDate } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and task title are required.'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    const task = await Task.create({
      project: projectId,
      title,
      description: description || '',
      assignedTo: assignedTo || req.user._id,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email avatar');

    // Recalculate progress
    await recalculateProjectProgress(projectId, req.user._id);

    // Log activity
    await logActivity({
      projectId,
      userId: req.user._id,
      action: 'TASK_CREATED',
      description: `${req.user.name} created task "${task.title}".`
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status / details
// @route   PUT /api/tasks/:id
// @access  Private (Admin only)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const oldStatus = task.status;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email avatar');

    // Recalculate project progress
    const progressResult = await recalculateProjectProgress(task.project, req.user._id);

    // If completed, trigger activity and notification
    if (oldStatus !== 'COMPLETED' && task.status === 'COMPLETED') {
      await logActivity({
        projectId: task.project,
        userId: req.user._id,
        action: 'TASK_COMPLETED',
        description: `${req.user.name} completed task "${task.title}".`
      });

      const project = await Project.findById(task.project);
      if (project && project.client) {
        await sendNotification({
          userId: project.client,
          projectId: project._id,
          type: 'TASK',
          message: `Task "${task.title}" has been completed.`
        });
      }
    } else if (oldStatus !== task.status) {
      await logActivity({
        projectId: task.project,
        userId: req.user._id,
        action: 'TASK_UPDATED',
        description: `${req.user.name} updated task "${task.title}" status to ${task.status}.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: populatedTask,
      progress: progressResult ? progressResult.progress : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.'
      });
    }

    const projectId = task.project;
    await task.deleteOne();

    // Recalculate progress
    await recalculateProjectProgress(projectId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask
};
