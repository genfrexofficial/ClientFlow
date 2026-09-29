const mongoose = require('mongoose');

const hrAuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    appointmentLetterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentLetter'
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate'
    },
    previousStatus: {
      type: String,
      default: ''
    },
    newStatus: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

hrAuditLogSchema.index({ appointmentLetterId: 1, timestamp: -1 });
hrAuditLogSchema.index({ actorId: 1, timestamp: -1 });

module.exports = mongoose.model('HRAuditLog', hrAuditLogSchema);
