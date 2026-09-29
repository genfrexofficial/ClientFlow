const Activity = require('../models/Activity');

/**
 * Log activity for a project or global audit trail
 */
const logActivity = async ({
  projectId,
  userId,
  action,
  description,
  entityType = 'PROJECT',
  entityId = null,
  clientVisible = true,
  metadata = {}
}) => {
  try {
    if (!projectId || !userId || !action || !description) return null;
    const activity = await Activity.create({
      project: projectId,
      user: userId,
      action,
      description,
      entityType,
      entityId,
      clientVisible,
      metadata
    });
    return activity;
  } catch (error) {
    console.error(`[Activity Service Error] Failed to log activity: ${error.message}`);
    return null;
  }
};

module.exports = {
  logActivity
};
