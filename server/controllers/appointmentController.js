const AppointmentLetter = require('../models/AppointmentLetter');
const Candidate = require('../models/Candidate');
const HRApproval = require('../models/HRApproval');
const File = require('../models/File');
const {
  generateReferenceNumber,
  recordHRAudit,
  notifyAdmins,
  notifyHRUser,
  getActiveTemplate
} = require('../services/hrService');
const { generateAppointmentPDF } = require('../services/pdfService');
const { sendAppointmentEmail } = require('../services/emailService');
const path = require('path');
const fs = require('fs');

/**
 * Get all appointment letters with filtering, search, and pagination
 */
const getAppointments = async (req, res, next) => {
  try {
    const {
      status,
      candidateId,
      designation,
      employmentType,
      createdBy,
      search,
      page = 1,
      limit = 20,
      from,
      to
    } = req.query;

    const query = {};
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }
    if (candidateId) query.candidateId = candidateId;
    if (designation) query.designation = { $regex: designation, $options: 'i' };
    if (employmentType) query.appointmentType = employmentType;
    if (createdBy) query.createdBy = createdBy;

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    if (search) {
      // Find candidate IDs matching search
      const matchedCandidates = await Candidate.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      const candIds = matchedCandidates.map((c) => c._id);

      query.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { candidateId: { $in: candIds } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AppointmentLetter.countDocuments(query);
    const appointments = await AppointmentLetter.find(query)
      .populate('candidateId', 'name email phone address designation department employmentType joiningDate')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('sentBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single appointment letter by ID with full details & approvals
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await AppointmentLetter.findById(req.params.id)
      .populate('candidateId')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('sentBy', 'name email role')
      .populate('templateId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    // Fetch approval history & audit logs
    const approvals = await HRApproval.find({ appointmentLetterId: appointment._id })
      .populate('submittedBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      appointment,
      approvals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment letter (Multi-step form)
 */
const createAppointment = async (req, res, next) => {
  try {
    const {
      candidateId,
      newCandidate,
      appointmentType,
      title,
      designation,
      department,
      appointmentDate,
      joiningDate,
      workLocation,
      reportingManager,
      compensation,
      compensationFrequency,
      responsibilities,
      terms,
      confidentialityTerms,
      professionalConductTerms,
      acceptanceDeadline,
      submitNow
    } = req.body;

    let targetCandidateId = candidateId;

    // If new candidate provided inline, create them first
    if (!targetCandidateId && newCandidate) {
      const existing = await Candidate.findOne({ email: newCandidate.email.toLowerCase().trim() });
      if (existing) {
        targetCandidateId = existing._id;
      } else {
        const createdCand = await Candidate.create({
          ...newCandidate,
          createdBy: req.user._id
        });
        targetCandidateId = createdCand._id;
      }
    }

    if (!targetCandidateId) {
      return res.status(400).json({ success: false, message: 'Candidate information is required.' });
    }

    if (!designation || !joiningDate || !compensation || !acceptanceDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Designation, joining date, compensation, and acceptance deadline are required.'
      });
    }

    const candidate = await Candidate.findById(targetCandidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Allocate atomic reference number
    const referenceNumber = await generateReferenceNumber();

    // Get active template for snapshot
    const activeTemplate = await getActiveTemplate();

    const initialStatus = submitNow ? 'PENDING_APPROVAL' : 'DRAFT';

    const appointment = await AppointmentLetter.create({
      referenceNumber,
      candidateId: targetCandidateId,
      appointmentType: appointmentType || 'TRAINEE',
      title: title || activeTemplate.title || 'TRAINEE APPOINTMENT LETTER',
      designation,
      department: department || candidate.department || 'Engineering',
      appointmentDate: appointmentDate || new Date(),
      joiningDate,
      workLocation: workLocation || 'Remote / Bengaluru',
      reportingManager: reportingManager || 'Technical Lead',
      compensation,
      compensationFrequency: compensationFrequency || 'STIPEND_MONTHLY',
      responsibilities: responsibilities && responsibilities.length > 0
        ? responsibilities
        : activeTemplate.roleAndResponsibilities,
      terms: terms && terms.length > 0 ? terms : activeTemplate.termsAndConditions,
      confidentialityTerms: confidentialityTerms || activeTemplate.confidentialityClause,
      professionalConductTerms: professionalConductTerms || activeTemplate.professionalConductClause,
      acceptanceDeadline,
      status: initialStatus,
      templateId: activeTemplate._id,
      templateVersion: activeTemplate.version || 1,
      letterContentSnapshot: {
        title: title || activeTemplate.title,
        subtitle: activeTemplate.subtitle,
        aboutGenfrex: activeTemplate.aboutGenfrex,
        signatories: activeTemplate.signatories
      },
      createdBy: req.user._id,
      submittedAt: submitNow ? new Date() : null
    });

    // Record audit log
    await recordHRAudit({
      actorId: req.user._id,
      action: submitNow ? 'APPOINTMENT_SUBMITTED' : 'APPOINTMENT_DRAFT_CREATED',
      appointmentLetterId: appointment._id,
      candidateId: candidate._id,
      newStatus: initialStatus,
      metadata: { referenceNumber, designation, compensation }
    });

    if (submitNow) {
      await HRApproval.create({
        appointmentLetterId: appointment._id,
        submittedBy: req.user._id,
        action: 'SUBMIT',
        comments: 'Submitted for Admin Approval'
      });

      await notifyAdmins({
        title: 'New Appointment Approval Request',
        message: `${req.user.name} submitted appointment letter ${referenceNumber} for candidate ${candidate.name} (${designation}).`,
        link: '/admin/hr/pending-approvals'
      });
    }

    const populated = await AppointmentLetter.findById(appointment._id)
      .populate('candidateId')
      .populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: submitNow
        ? 'Appointment letter submitted for Admin approval.'
        : 'Appointment draft saved successfully.',
      appointment: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an appointment letter (Only drafts or rejected letters can be edited)
 */
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await AppointmentLetter.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    // Prevent editing if pending approval
    if (appointment.status === 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'This appointment letter is currently under Admin review and locked from modifications.'
      });
    }

    // If already approved, editing it invalidates the approval
    let statusChange = appointment.status;
    if (appointment.status === 'APPROVED' || appointment.status === 'SENT') {
      statusChange = 'DRAFT';
      appointment.approvedBy = null;
      appointment.approvedAt = null;
      appointment.approvalComment = '';
    }

    const allowedFields = [
      'designation',
      'department',
      'appointmentType',
      'title',
      'appointmentDate',
      'joiningDate',
      'workLocation',
      'reportingManager',
      'compensation',
      'compensationFrequency',
      'responsibilities',
      'terms',
      'confidentialityTerms',
      'professionalConductTerms',
      'acceptanceDeadline'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        appointment[field] = req.body[field];
      }
    });

    if (req.body.submitNow) {
      appointment.status = 'PENDING_APPROVAL';
      appointment.submittedAt = new Date();

      await HRApproval.create({
        appointmentLetterId: appointment._id,
        submittedBy: req.user._id,
        action: 'RESUBMIT',
        comments: req.body.resubmitComment || 'Resubmitted after revisions'
      });

      const candidate = await Candidate.findById(appointment.candidateId);
      await notifyAdmins({
        title: 'Appointment Letter Resubmitted',
        message: `${req.user.name} revised and resubmitted letter ${appointment.referenceNumber} for candidate ${candidate?.name || ''}.`,
        link: '/admin/hr/pending-approvals'
      });
    } else {
      appointment.status = statusChange;
    }

    await appointment.save();

    await recordHRAudit({
      actorId: req.user._id,
      action: req.body.submitNow ? 'APPOINTMENT_RESUBMITTED' : 'APPOINTMENT_UPDATED',
      appointmentLetterId: appointment._id,
      previousStatus: appointment.status,
      newStatus: appointment.status,
      metadata: { modifiedFields: Object.keys(req.body) }
    });

    const populated = await AppointmentLetter.findById(appointment._id)
      .populate('candidateId')
      .populate('createdBy', 'name email role')
      .populate('approvedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: req.body.submitNow
        ? 'Appointment letter resubmitted for Admin approval.'
        : 'Appointment letter updated successfully.',
      appointment: populated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit draft for approval
 */
const submitForApproval = async (req, res, next) => {
  try {
    const appointment = await AppointmentLetter.findById(req.params.id).populate('candidateId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    if (appointment.status === 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: 'Letter is already pending approval.' });
    }

    const previousStatus = appointment.status;
    appointment.status = 'PENDING_APPROVAL';
    appointment.submittedAt = new Date();
    await appointment.save();

    await HRApproval.create({
      appointmentLetterId: appointment._id,
      submittedBy: req.user._id,
      action: previousStatus === 'REJECTED' ? 'RESUBMIT' : 'SUBMIT',
      comments: req.body.comment || 'Submitted for Admin approval'
    });

    await recordHRAudit({
      actorId: req.user._id,
      action: 'APPOINTMENT_SUBMITTED',
      appointmentLetterId: appointment._id,
      candidateId: appointment.candidateId._id,
      previousStatus,
      newStatus: 'PENDING_APPROVAL'
    });

    await notifyAdmins({
      title: 'Appointment Approval Request',
      message: `${req.user.name} submitted letter ${appointment.referenceNumber} for candidate ${appointment.candidateId?.name}.`,
      link: '/admin/hr/pending-approvals'
    });

    res.status(200).json({
      success: true,
      message: 'Appointment letter submitted for Admin approval.',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin approves appointment letter (ADMIN ONLY)
 */
const approveAppointment = async (req, res, next) => {
  try {
    // Enforce server-side role check
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only authorized Admins can approve appointment letters.'
      });
    }

    const appointment = await AppointmentLetter.findById(req.params.id).populate('candidateId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    if (appointment.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'This letter is already approved.' });
    }

    const previousStatus = appointment.status;
    appointment.status = 'APPROVED';
    appointment.approvedBy = req.user._id;
    appointment.approvedAt = new Date();
    appointment.approvalComment = req.body.comment || 'Approved by Admin';
    appointment.rejectionReason = '';

    await appointment.save();

    await HRApproval.create({
      appointmentLetterId: appointment._id,
      submittedBy: appointment.createdBy,
      reviewedBy: req.user._id,
      action: 'APPROVE',
      comments: req.body.comment || 'Approved by Admin'
    });

    await recordHRAudit({
      actorId: req.user._id,
      action: 'APPOINTMENT_APPROVED',
      appointmentLetterId: appointment._id,
      candidateId: appointment.candidateId._id,
      previousStatus,
      newStatus: 'APPROVED',
      metadata: { comment: req.body.comment }
    });

    // Notify the HR creator
    await notifyHRUser({
      userId: appointment.createdBy,
      title: 'Appointment Letter Approved',
      message: `Admin ${req.user.name} approved appointment letter ${appointment.referenceNumber} for ${appointment.candidateId?.name}. You can now generate the PDF and send the letter.`,
      link: `/hr/appointments/${appointment._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Appointment letter approved successfully.',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin rejects / returns appointment letter for revision (ADMIN ONLY)
 */
const rejectAppointment = async (req, res, next) => {
  try {
    // Enforce server-side role check
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only authorized Admins can return or reject appointment letters.'
      });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection / revision reason is mandatory.'
      });
    }

    const appointment = await AppointmentLetter.findById(req.params.id).populate('candidateId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    const previousStatus = appointment.status;
    appointment.status = 'REJECTED';
    appointment.rejectionReason = reason;
    appointment.rejectedAt = new Date();
    await appointment.save();

    await HRApproval.create({
      appointmentLetterId: appointment._id,
      submittedBy: appointment.createdBy,
      reviewedBy: req.user._id,
      action: 'REJECT',
      comments: reason
    });

    await recordHRAudit({
      actorId: req.user._id,
      action: 'APPOINTMENT_REJECTED',
      appointmentLetterId: appointment._id,
      candidateId: appointment.candidateId._id,
      previousStatus,
      newStatus: 'REJECTED',
      metadata: { reason }
    });

    // Notify HR creator
    await notifyHRUser({
      userId: appointment.createdBy,
      title: 'Appointment Letter Returned for Revision',
      message: `Admin ${req.user.name} requested changes on letter ${appointment.referenceNumber}: "${reason}".`,
      link: `/hr/appointments/${appointment._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Appointment letter returned for revision.',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate official A4 PDF for appointment letter
 */
const generatePDF = async (req, res, next) => {
  try {
    const appointment = await AppointmentLetter.findById(req.params.id)
      .populate('candidateId')
      .populate('templateId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    const candidate = appointment.candidateId;
    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Candidate details missing.' });
    }

    // Generate PDF
    const { filePath, fileName, fileUrl } = await generateAppointmentPDF(
      appointment,
      candidate,
      appointment.letterContentSnapshot || appointment.templateId
    );

    // Save File record
    const stats = fs.statSync(filePath);
    const fileRecord = await File.create({
      uploadedBy: req.user._id,
      fileName,
      fileUrl,
      fileType: 'application/pdf',
      fileSize: stats.size,
      category: 'OTHER',
      isDeliverable: false
    });

    appointment.pdfFileId = fileRecord._id;
    appointment.pdfUrl = fileUrl;
    appointment.pdfGeneratedAt = new Date();
    await appointment.save();

    await recordHRAudit({
      actorId: req.user._id,
      action: 'PDF_GENERATED',
      appointmentLetterId: appointment._id,
      candidateId: candidate._id,
      metadata: { fileName, fileSize: stats.size }
    });

    res.status(200).json({
      success: true,
      message: 'Official A4 PDF generated successfully.',
      pdfUrl: fileUrl,
      fileName,
      fileId: fileRecord._id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HR sends approved appointment letter to candidate via email
 */
const sendAppointment = async (req, res, next) => {
  try {
    // Only HR and ADMIN can send
    if (req.user.role !== 'HR' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only HR or Admin can send appointment letters.'
      });
    }

    const { confirmResend = false } = req.body;

    const appointment = await AppointmentLetter.findById(req.params.id).populate('candidateId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    // Must be approved before sending
    if (appointment.status !== 'APPROVED' && appointment.status !== 'SENT') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send unapproved appointment letter. Admin approval is required.'
      });
    }

    // Prevent accidental duplicate sends unless confirmed
    if (appointment.status === 'SENT' && !confirmResend) {
      return res.status(400).json({
        success: false,
        isDuplicate: true,
        message: `This appointment letter was already sent on ${new Date(appointment.sentAt).toLocaleString()}. Please confirm if you wish to resend.`
      });
    }

    const candidate = appointment.candidateId;
    if (!candidate || !candidate.email) {
      return res.status(400).json({
        success: false,
        message: 'Candidate does not have a valid email address.'
      });
    }

    // Ensure PDF is generated
    let pdfPath = null;
    let pdfFileName = `GENFREX_Appointment_${appointment.referenceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    if (appointment.pdfUrl && appointment.pdfUrl.startsWith('/uploads/')) {
      const existingPath = path.join(__dirname, '..', appointment.pdfUrl);
      if (fs.existsSync(existingPath)) {
        pdfPath = existingPath;
        pdfFileName = path.basename(existingPath);
      }
    }

    if (!pdfPath) {
      const generated = await generateAppointmentPDF(
        appointment,
        candidate,
        appointment.letterContentSnapshot || appointment.templateId
      );
      pdfPath = generated.filePath;
      pdfFileName = generated.fileName;
      appointment.pdfUrl = generated.fileUrl;
      appointment.pdfGeneratedAt = new Date();
    }

    // Dispatch email
    const emailResult = await sendAppointmentEmail({
      toCandidateEmail: candidate.email,
      candidateName: candidate.name,
      designation: appointment.designation,
      referenceNumber: appointment.referenceNumber,
      joiningDate: appointment.joiningDate,
      pdfPath,
      pdfFileName
    });

    const previousStatus = appointment.status;
    appointment.status = 'SENT';
    appointment.emailStatus = 'SENT';
    appointment.sentAt = new Date();
    appointment.sentBy = req.user._id;

    appointment.emailHistory.push({
      sentAt: new Date(),
      sentBy: req.user._id,
      recipient: candidate.email,
      subject: `GENFREX — Appointment Letter — ${appointment.designation}`,
      status: 'SENT',
      providerMessageId: emailResult.messageId
    });

    await appointment.save();

    // Update candidate status to APPOINTED
    await Candidate.findByIdAndUpdate(candidate._id, { candidateStatus: 'APPOINTED' });

    await recordHRAudit({
      actorId: req.user._id,
      action: confirmResend ? 'APPOINTMENT_RESENT' : 'APPOINTMENT_SENT',
      appointmentLetterId: appointment._id,
      candidateId: candidate._id,
      previousStatus,
      newStatus: 'SENT',
      metadata: {
        recipient: candidate.email,
        messageId: emailResult.messageId,
        simulated: emailResult.simulated
      }
    });

    // Notify Admin of sent letter
    await notifyAdmins({
      title: 'Appointment Letter Sent to Candidate',
      message: `${req.user.name} sent appointment letter ${appointment.referenceNumber} to ${candidate.name} (${candidate.email}).`,
      link: `/admin/hr/appointments`
    });

    res.status(200).json({
      success: true,
      message: `Appointment letter sent successfully to ${candidate.email}.`,
      appointment,
      emailResult
    });
  } catch (error) {
    // Record failed email dispatch
    try {
      const appDoc = await AppointmentLetter.findById(req.params.id);
      if (appDoc) {
        appDoc.emailStatus = 'FAILED';
        appDoc.emailHistory.push({
          sentAt: new Date(),
          sentBy: req.user._id,
          recipient: appDoc.candidateId?.email || 'unknown',
          subject: `GENFREX — Appointment Letter`,
          status: 'FAILED',
          error: error.message
        });
        await appDoc.save();
      }
    } catch (saveErr) {
      console.error('Failed to log email error:', saveErr.message);
    }

    next(error);
  }
};

/**
 * Update candidate acceptance status (e.g. ACCEPTED, DECLINED, EXPIRED)
 */
const updateAcceptanceStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid acceptance status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const appointment = await AppointmentLetter.findById(req.params.id).populate('candidateId');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    const prevAcceptance = appointment.acceptanceStatus;
    appointment.acceptanceStatus = status;

    if (status === 'ACCEPTED') {
      appointment.status = 'ACCEPTED';
      appointment.acceptedAt = new Date();
      await Candidate.findByIdAndUpdate(appointment.candidateId._id, { candidateStatus: 'ONBOARDED' });
    } else if (status === 'DECLINED') {
      appointment.status = 'DECLINED';
      appointment.declinedAt = new Date();
      appointment.declineReason = reason || '';
    } else if (status === 'EXPIRED') {
      appointment.status = 'EXPIRED';
    }

    await appointment.save();

    await recordHRAudit({
      actorId: req.user._id,
      action: `ACCEPTANCE_${status}`,
      appointmentLetterId: appointment._id,
      candidateId: appointment.candidateId._id,
      previousStatus: prevAcceptance,
      newStatus: status,
      metadata: { reason }
    });

    res.status(200).json({
      success: true,
      message: `Appointment acceptance status updated to ${status}.`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete appointment draft
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await AppointmentLetter.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment letter not found.' });
    }

    // Only allow deletion of DRAFT letters
    if (appointment.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft appointment letters can be deleted.'
      });
    }

    await AppointmentLetter.findByIdAndDelete(req.params.id);

    await recordHRAudit({
      actorId: req.user._id,
      action: 'APPOINTMENT_DRAFT_DELETED',
      appointmentLetterId: appointment._id,
      metadata: { referenceNumber: appointment.referenceNumber }
    });

    res.status(200).json({
      success: true,
      message: 'Draft appointment letter deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  submitForApproval,
  approveAppointment,
  rejectAppointment,
  generatePDF,
  sendAppointment,
  updateAcceptanceStatus,
  deleteAppointment
};
