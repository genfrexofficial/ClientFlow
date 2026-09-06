const Activity = require('../models/Activity');
const Project = require('../models/Project');

// @desc    Get activities for a project
// @route   GET /api/activities/project/:projectId
// @access  Private
const getProjectActivities = async (req, res, next) => {
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
        message: 'Unauthorized to view activities for this project.'
      });
    }

    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities across all projects (Admin dashboard)
// @route   GET /api/activities/recent
// @access  Private
const getRecentActivities = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'CLIENT') {
      const clientProjects = await Project.find({ client: req.user._id }).select('_id');
      query = { project: { $in: clientProjects.map((p) => p._id) } };
    }

    const activities = await Activity.find(query)
      .populate('user', 'name email role avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectActivities,
  getRecentActivities
};
