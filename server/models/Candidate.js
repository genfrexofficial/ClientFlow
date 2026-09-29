const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'Engineering'
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Trainee'],
      default: 'Trainee',
      required: true
    },
    candidateStatus: {
      type: String,
      enum: ['ACTIVE', 'APPOINTED', 'ONBOARDED', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    joiningDate: {
      type: Date
    },
    workLocation: {
      type: String,
      trim: true,
      default: 'Remote / Bengaluru'
    },
    reportingManager: {
      type: String,
      trim: true,
      default: 'Technical Lead'
    },
    compensation: {
      type: Number,
      default: 0
    },
    compensationFrequency: {
      type: String,
      enum: ['MONTHLY', 'ANNUAL', 'STIPEND_MONTHLY'],
      default: 'STIPEND_MONTHLY'
    },
    probationPeriod: {
      type: String,
      default: '3 Months'
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

candidateSchema.index({ designation: 1 });
candidateSchema.index({ candidateStatus: 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
