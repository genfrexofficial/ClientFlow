const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    publicId: {
      type: String,
      default: ''
    },
    fileType: {
      type: String,
      default: 'application/octet-stream'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: ['DOCUMENT', 'DESIGN', 'DELIVERABLE', 'OTHER'],
      default: 'DELIVERABLE'
    },
    isDeliverable: {
      type: Boolean,
      default: true
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
      default: 'PENDING_REVIEW'
    },
    revisionNotes: {
      type: String,
      trim: true,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

fileSchema.index({ project: 1, category: 1 });
fileSchema.index({ task: 1 });
fileSchema.index({ isDeliverable: 1, approvalStatus: 1 });

module.exports = mongoose.model('File', fileSchema);
