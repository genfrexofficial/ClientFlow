const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const File = require('../models/File');
const Comment = require('../models/Comment');

// @desc    Generate AI project executive summary
// @route   GET /api/ai/project/:id/summary
// @access  Private
const generateProjectSummary = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('client', 'name companyName')
      .populate('createdBy', 'name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Role check
    if (req.user.role === 'CLIENT' && project.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    const tasks = await Task.find({ project: projectId });
    const milestones = await Milestone.find({ project: projectId }).sort({ dueDate: 1 });
    const files = await File.find({ project: projectId });
    const comments = await Comment.find({ project: projectId }).sort({ createdAt: -1 }).limit(5);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
    const highPriorityPending = pendingTasks.filter((t) => t.priority === 'HIGH');

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
    const upcomingMilestone = milestones.find((m) => m.status !== 'COMPLETED');

    const deliverables = files.filter((f) => f.category === 'DELIVERABLE');
    const pendingReviewFiles = deliverables.filter((f) => f.approvalStatus === 'PENDING_REVIEW');
    const changesRequestedFiles = deliverables.filter((f) => f.approvalStatus === 'CHANGES_REQUESTED');
    const approvedFiles = deliverables.filter((f) => f.approvalStatus === 'APPROVED');

    // Synthesize structured narrative
    let healthStatus = 'ON_TRACK';
    if (changesRequestedFiles.length > 0 || highPriorityPending.length > 2) {
      healthStatus = 'ATTENTION_NEEDED';
    }
    if (project.status === 'COMPLETED' || project.progress === 100) {
      healthStatus = 'COMPLETED';
    }

    let summaryText = `The "${project.name}" project is currently at ${project.progress}% progress with status ${project.status.replace('_', ' ')}. `;
    
    if (project.progress === 100) {
      summaryText += `All ${totalTasks} planned development tasks have been fully completed, and ${completedMilestones} milestones have been achieved. Client approvals are complete.`;
    } else {
      if (completedTasks > 0) {
        summaryText += `${completedTasks} out of ${totalTasks} tasks are complete. `;
      }
      if (upcomingMilestone) {
        summaryText += `Current phase focus is on "${upcomingMilestone.title}". `;
      }
      if (pendingReviewFiles.length > 0) {
        summaryText += `There ${pendingReviewFiles.length === 1 ? 'is 1 deliverable' : `are ${pendingReviewFiles.length} deliverables`} awaiting client approval. `;
      }
      if (changesRequestedFiles.length > 0) {
        summaryText += `Action required: ${changesRequestedFiles.length} item(s) have change requests pending revision (${changesRequestedFiles.map((f) => f.fileName).join(', ')}). `;
      }
      if (comments.length > 0) {
        summaryText += `Recent communication focuses on: "${comments[0].message.substring(0, 60)}...".`;
      }
    }

    const keyHighlights = [];
    keyHighlights.push(`Progress: ${project.progress}% (${completedTasks}/${totalTasks} tasks completed)`);
    if (totalMilestones > 0) {
      keyHighlights.push(`Milestones: ${completedMilestones}/${totalMilestones} completed`);
    }
    if (pendingReviewFiles.length > 0) {
      keyHighlights.push(`Awaiting Approval: ${pendingReviewFiles.map((f) => f.fileName).join(', ')}`);
    }
    if (changesRequestedFiles.length > 0) {
      keyHighlights.push(`Revisions Needed: ${changesRequestedFiles.map((f) => f.fileName).join(', ')}`);
    }
    if (upcomingMilestone) {
      keyHighlights.push(`Next Target: ${upcomingMilestone.title} (Due: ${upcomingMilestone.dueDate ? new Date(upcomingMilestone.dueDate).toLocaleDateString() : 'TBD'})`);
    }

    res.status(200).json({
      success: true,
      data: {
        projectName: project.name,
        healthStatus,
        progress: project.progress,
        summary: summaryText,
        keyHighlights,
        pendingActionCount: pendingReviewFiles.length + changesRequestedFiles.length + highPriorityPending.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateProjectSummary
};
