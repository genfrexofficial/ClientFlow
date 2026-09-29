const mongoose = require('mongoose');

const appointmentLetterSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      unique: true,
      trim: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate reference is required']
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appointmentType: {
      type: String,
      enum: ['TRAINEE', 'INTERNSHIP', 'FULL_TIME'],
      default: 'TRAINEE',
      required: true
    },
    title: {
      type: String,
      default: 'TRAINEE APPOINTMENT LETTER'
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    appointmentDate: {
      type: Date,
      default: Date.now
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required']
    },
    workLocation: {
      type: String,
      default: 'Remote / Bengaluru'
    },
    reportingManager: {
      type: String,
      default: 'Technical Lead'
    },
    compensation: {
      type: Number,
      required: [true, 'Compensation / stipend is required']
    },
    compensationFrequency: {
      type: String,
      enum: ['MONTHLY', 'ANNUAL', 'STIPEND_MONTHLY'],
      default: 'STIPEND_MONTHLY'
    },
    responsibilities: {
      type: [String],
      default: []
    },
    terms: {
      type: [String],
      default: []
    },
    confidentialityTerms: {
      type: String,
      default: ''
    },
    professionalConductTerms: {
      type: String,
      default: ''
    },
    acceptanceDeadline: {
      type: Date,
      required: [true, 'Acceptance deadline is required']
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'REJECTED',
        'SENT',
        'ACCEPTED',
        'DECLINED',
        'EXPIRED'
      ],
      default: 'DRAFT',
      required: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LetterTemplate'
    },
    templateVersion: {
      type: Number,
      default: 1
    },
    letterContentSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    approvalComment: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    rejectedAt: {
      type: Date
    },
    pdfFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File'
    },
    pdfUrl: {
      type: String,
      default: ''
    },
    pdfGeneratedAt: {
      type: Date
    },
    sentAt: {
      type: Date
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emailStatus: {
      type: String,
      enum: ['NOT_SENT', 'PENDING', 'SENT', 'FAILED'],
      default: 'NOT_SENT'
    },
    emailHistory: [
      {
        sentAt: { type: Date, default: Date.now },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        recipient: String,
        subject: String,
        status: { type: String, enum: ['SENT', 'FAILED'] },
        providerMessageId: String,
        error: String
      }
    ],
    acceptanceStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING'
    },
    acceptedAt: {
      type: Date
    },
    declinedAt: {
      type: Date
    },
    declineReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

appointmentLetterSchema.index({ candidateId: 1 });
appointmentLetterSchema.index({ status: 1 });
appointmentLetterSchema.index({ createdBy: 1 });
appointmentLetterSchema.index({ joiningDate: 1 });

module.exports = mongoose.model('AppointmentLetter', appointmentLetterSchema);
