const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    action: {
      type: String,
      enum: [
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_COMPLETED',
        'MILESTONE_CREATED',
        'MILESTONE_COMPLETED',
        'FILE_UPLOADED',
        'FILE_DELETED',
        'COMMENT_ADDED',
        'FEEDBACK_RECEIVED',
        'DELIVERABLE_APPROVED',
        'CHANGES_REQUESTED',
        'PROJECT_COMPLETED'
      ],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Activity', activitySchema);
