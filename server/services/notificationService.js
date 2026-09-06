const Notification = require('../models/Notification');

/**
 * Dispatch an in-app notification
 */
const sendNotification = async ({ userId, projectId, message, type = 'GENERAL' }) => {
  try {
    if (!userId) return null;
    const notification = await Notification.create({
      user: userId,
      project: projectId,
      message,
      type
    });
    return notification;
  } catch (error) {
    console.error(`[Notification Service Error] Failed to create notification: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendNotification
};
