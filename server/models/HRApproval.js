const mongoose = require('mongoose');

const hrApprovalSchema = new mongoose.Schema(
  {
    appointmentLetterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentLetter',
      required: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['SUBMIT', 'APPROVE', 'REJECT', 'RESUBMIT'],
      required: true
    },
    comments: {
      type: String,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

hrApprovalSchema.index({ appointmentLetterId: 1, timestamp: -1 });

module.exports = mongoose.model('HRApproval', hrApprovalSchema);
