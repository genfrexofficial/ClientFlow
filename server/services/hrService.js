const HRSettings = require('../models/HRSettings');
const HRAuditLog = require('../models/HRAuditLog');
const LetterTemplate = require('../models/LetterTemplate');
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Safely generate atomic reference number (e.g. GFX/HR/2026/0001)
 */
const generateReferenceNumber = async () => {
  let settings = await HRSettings.findOne();
  if (!settings) {
    settings = await HRSettings.create({
      companyName: 'GENFREX',
      referencePrefix: 'GFX/HR',
      referenceYear: new Date().getFullYear(),
      currentSequence: 1
    });
  }

  // Atomically increment sequence
  const updatedSettings = await HRSettings.findByIdAndUpdate(
    settings._id,
    { $inc: { currentSequence: 1 } },
    { new: true }
  );

  const prefix = updatedSettings.referencePrefix || 'GFX/HR';
  const year = updatedSettings.referenceYear || new Date().getFullYear();
  const sequenceNum = updatedSettings.currentSequence - 1; // Current one allocated
  const paddedSeq = String(sequenceNum).padStart(4, '0');

  return `${prefix}/${year}/${paddedSeq}`;
};

/**
 * Record immutable HR Audit Log entry
 */
const recordHRAudit = async ({
  actorId,
  action,
  appointmentLetterId = null,
  candidateId = null,
  previousStatus = '',
  newStatus = '',
  metadata = {}
}) => {
  try {
    const log = await HRAuditLog.create({
      actorId,
      action,
      appointmentLetterId,
      candidateId,
      previousStatus,
      newStatus,
      metadata,
      timestamp: new Date()
    });
    return log;
  } catch (err) {
    console.error(`[HR Audit Error] Failed to log event: ${err.message}`);
    return null;
  }
};

/**
 * Notify all admins of an HR event (e.g. Pending approval, Resubmission, Sent letter)
 */
const notifyAdmins = async ({ title, message, link = '/admin/hr/pending-approvals', type = 'HR' }) => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title,
        message,
        type,
        link
      });
    }
  } catch (err) {
    console.error(`[HR Notification Error] Failed to notify admins: ${err.message}`);
  }
};

/**
 * Notify a specific HR user (e.g. Approved, Rejected, Sent)
 */
const notifyHRUser = async ({ userId, title, message, link = '/hr/appointments', type = 'HR' }) => {
  try {
    if (!userId) return;
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      link
    });
  } catch (err) {
    console.error(`[HR Notification Error] Failed to notify HR user: ${err.message}`);
  }
};

/**
 * Get active default letter template or create one if none exists
 */
const getActiveTemplate = async () => {
  let template = await LetterTemplate.findOne({ active: true }).sort({ version: -1 });
  if (!template) {
    template = await LetterTemplate.create({
      name: 'GENFREX Trainee Appointment Letter',
      appointmentType: 'TRAINEE',
      title: 'TRAINEE APPOINTMENT LETTER',
      subtitle: 'DIGITAL SERVICES & TALENT ECOSYSTEM',
      aboutGenfrex:
        'GENFREX is a next-generation digital services and talent ecosystem committed to empowering enterprises and innovators with cutting-edge engineering, scalable digital products, and high-impact talent solutions. We bridge industry demands with world-class technical capabilities to build robust, modern digital solutions.',
      roleAndResponsibilities: [
        'Execute assigned technical tasks, modules, and software features in alignment with GENFREX quality standards.',
        'Collaborate proactively with technical leads, cross-functional engineering teams, and project stakeholders.',
        'Participate in sprint planning, architecture reviews, daily standups, and codebase documentation.',
        'Continuously enhance technical proficiencies and adhere to best development and security practices.'
      ],
      termsAndConditions: [
        'Appointment Status: This appointment is for training and professional development within the GENFREX ecosystem. Successful completion of the trainee period may lead to performance-based full-time consideration.',
        'Working Hours & Mode: The trainee shall adhere to the agreed schedule and mode of engagement (Remote, Hybrid, or On-site) specified in the appointment details.',
        'Compensation: A monthly stipend/compensation shall be disbursed in accordance with GENFREX payroll schedules, subject to statutory deductions where applicable.',
        'Notice Period: Either party may terminate this trainee engagement by providing a written notice of 15 days or compensation in lieu thereof during the trainee period.'
      ],
      confidentialityClause:
        'The Trainee acknowledges that during the tenure of this appointment, they may have access to confidential, proprietary, trade secret, client data, and intellectual property belonging to GENFREX or its affiliated clients. The Trainee agrees to hold all such information in strict confidence and shall not disclose, replicate, reverse-engineer, or misuse any proprietary data without prior written authorization from GENFREX. This obligation survives the termination or expiration of this appointment.',
      professionalConductClause:
        'The Trainee agrees to maintain the highest standards of professional integrity, diligence, and ethical conduct. Non-compliance with company policies, willful misconduct, breach of client trust, or unauthorized external representation of GENFREX may result in immediate revocation of this appointment.',
      acceptanceTerms:
        'Please signify your acceptance of this Trainee Appointment Letter and its incorporated terms by signing and returning the duplicate copy on or before the acceptance deadline mentioned herein.',
      signatories: [
        { name: 'P.S. Dharshan', designation: 'Founder', title: 'Founder, GENFREX' },
        { name: 'Deepak P', designation: 'Chief Operating Officer', title: 'Chief Operating Officer, GENFREX' }
      ]
    });
  }
  return template;
};

module.exports = {
  generateReferenceNumber,
  recordHRAudit,
  notifyAdmins,
  notifyHRUser,
  getActiveTemplate
};
