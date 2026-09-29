const Notification = require('../models/Notification');

/**
 * Dispatch an in-app notification
 */
const sendNotification = async ({ userId, projectId, title = '', message, type = 'GENERAL', link = '' }) => {
  try {
    if (!userId || !message) return null;
    const notification = await Notification.create({
      user: userId,
      project: projectId,
      title,
      message,
      type,
      link
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
