const Activity = require('../models/Activity');

/**
 * Log activity for a project
 */
const logActivity = async ({ projectId, userId, action, description }) => {
  try {
    const activity = await Activity.create({
      project: projectId,
      user: userId,
      action,
      description
    });
    return activity;
  } catch (error) {
    console.error(`[Activity Service Error] Failed to log activity: ${error.message}`);
    // Don't crash main operation if activity logging fails
    return null;
  }
};

module.exports = {
  logActivity
};
