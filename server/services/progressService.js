const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

/**
 * Automatically recalculates progress for a project based on completed tasks
 * Progress = (completedTasks / totalTasks) * 100
 */
const recalculateProjectProgress = async (projectId, actingUserId = null) => {
  try {
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({ project: projectId, status: 'COMPLETED' });

    let progress = 0;
    if (totalTasks > 0) {
      progress = Math.min(100, Math.max(0, Math.round((completedTasks / totalTasks) * 100)));
    }

    const project = await Project.findById(projectId);
    if (!project) return null;

    const previousStatus = project.status;
    let newStatus = project.status;

    // If all tasks are completed and totalTasks > 0, complete project
    if (totalTasks > 0 && completedTasks === totalTasks) {
      newStatus = 'COMPLETED';
    } else if (project.status === 'COMPLETED' && completedTasks < totalTasks) {
      // Revert back to IN_PROGRESS if tasks were reopened
      newStatus = 'IN_PROGRESS';
    } else if (project.status === 'PLANNING' && (completedTasks > 0 || totalTasks > 0)) {
      newStatus = 'IN_PROGRESS';
    }

    project.progress = progress;
    project.status = newStatus;
    await project.save();

    // If transitioned to COMPLETED, log activity and notify both parties
    if (previousStatus !== 'COMPLETED' && newStatus === 'COMPLETED') {
      if (actingUserId) {
        await Activity.create({
          project: projectId,
          user: actingUserId,
          action: 'PROJECT_COMPLETED',
          description: `Project "${project.name}" reached 100% completion.`
        });

        // Notify client
        if (project.client && project.client.toString() !== actingUserId.toString()) {
          await Notification.create({
            user: project.client,
            project: projectId,
            type: 'PROJECT',
            message: `Project "${project.name}" has been completed! All tasks are done.`
          });
        }
        // Notify admin
        if (project.createdBy && project.createdBy.toString() !== actingUserId.toString()) {
          await Notification.create({
            user: project.createdBy,
            project: projectId,
            type: 'PROJECT',
            message: `Project "${project.name}" has reached 100% completion.`
          });
        }
      }
    }

    return { progress, totalTasks, completedTasks, project };
  } catch (error) {
    console.error(`[Progress Service Error] ${error.message}`);
    throw error;
  }
};

module.exports = {
  recalculateProjectProgress
};
