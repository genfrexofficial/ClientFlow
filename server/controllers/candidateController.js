const Candidate = require('../models/Candidate');
const { recordHRAudit } = require('../services/hrService');

/**
 * Get all candidates with search, filtering, and pagination
 */
const getCandidates = async (req, res, next) => {
  try {
    const { search, status, employmentType, department, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.candidateStatus = status;
    if (employmentType) query.employmentType = employmentType;
    if (department) query.department = department;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      count: candidates.length,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      candidates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single candidate by ID
 */
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('createdBy', 'name email role');
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    res.status(200).json({
      success: true,
      candidate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new candidate
 */
const createCandidate = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      designation,
      department,
      employmentType,
      joiningDate,
      workLocation,
      reportingManager,
      compensation,
      compensationFrequency,
      probationPeriod,
      notes
    } = req.body;

    if (!name || !email || !phone || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and designation are required.'
      });
    }

    // Check for duplicate active candidate with same email
    const existing = await Candidate.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Candidate with email ${email} already exists.`
      });
    }

    const candidate = await Candidate.create({
      name,
      email,
      phone,
      address: address || '',
      designation,
      department: department || 'Engineering',
      employmentType: employmentType || 'Trainee',
      joiningDate: joiningDate || null,
      workLocation: workLocation || 'Remote / Bengaluru',
      reportingManager: reportingManager || 'Technical Lead',
      compensation: compensation || 0,
      compensationFrequency: compensationFrequency || 'STIPEND_MONTHLY',
      probationPeriod: probationPeriod || '3 Months',
      notes: notes || '',
      createdBy: req.user._id
    });

    await recordHRAudit({
      actorId: req.user._id,
      action: 'CANDIDATE_CREATED',
      candidateId: candidate._id,
      metadata: { candidateName: candidate.name, email: candidate.email, designation: candidate.designation }
    });

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully.',
      candidate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update candidate
 */
const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // If changing email, check for duplicate
    if (req.body.email && req.body.email.toLowerCase().trim() !== candidate.email) {
      const duplicate = await Candidate.findOne({ email: req.body.email.toLowerCase().trim() });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Another candidate with email ${req.body.email} already exists.`
        });
      }
    }

    const updated = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    await recordHRAudit({
      actorId: req.user._id,
      action: 'CANDIDATE_UPDATED',
      candidateId: updated._id,
      metadata: { changes: Object.keys(req.body) }
    });

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully.',
      candidate: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete candidate
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    await recordHRAudit({
      actorId: req.user._id,
      action: 'CANDIDATE_DELETED',
      candidateId: candidate._id,
      metadata: { candidateName: candidate.name, email: candidate.email }
    });

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
};
