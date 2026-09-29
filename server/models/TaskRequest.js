const mongoose = require('mongoose');

const taskRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task request title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester reference is required']
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, default: 0 },
        fileType: { type: String, default: 'application/octet-stream' }
      }
    ],
    requestedDeadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
      default: 'PENDING_APPROVAL'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    },
    createdTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  },
  {
    timestamps: true
  }
);

taskRequestSchema.index({ project: 1, status: 1 });
taskRequestSchema.index({ requestedBy: 1 });
taskRequestSchema.index({ status: 1 });

module.exports = mongoose.model('TaskRequest', taskRequestSchema);
