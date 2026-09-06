const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
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
    approvalStatus: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'],
      default: 'PENDING_REVIEW'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('File', fileSchema);
