import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { hrService } from '../../services/hrService';
import {
  FileText,
  User,
  Briefcase,
  ShieldCheck,
  Eye,
  Save,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

const CreateAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedCandidateId = searchParams.get('candidateId');
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    candidateId: '',
    appointmentType: 'TRAINEE',
    title: 'TRAINEE APPOINTMENT LETTER',
    designation: '',
    department: 'Engineering',
    appointmentDate: new Date().toISOString().substring(0, 10),
    joiningDate: '',
    workLocation: 'Remote / Bengaluru HQ',
    reportingManager: 'Technical Lead',
    compensation: 25000,
    compensationFrequency: 'STIPEND_MONTHLY',
    responsibilities: [],
    terms: [],
    confidentialityTerms: '',
    professionalConductTerms: '',
    acceptanceDeadline: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [candRes, settingsRes] = await Promise.all([
        hrService.getCandidates({ limit: 100 }),
        hrService.getHRSettings()
      ]);

      if (candRes.success) {
        setCandidates(candRes.candidates);

        if (preselectedCandidateId) {
          const found = candRes.candidates.find((c) => c._id === preselectedCandidateId);
          if (found) {
            selectCandidate(found);
          }
        }
      }

      if (settingsRes.success && settingsRes.template) {
        const tmpl = settingsRes.template;
        setTemplate(tmpl);
        setFormData((prev) => ({
          ...prev,
          responsibilities: tmpl.roleAndResponsibilities || [],
          terms: tmpl.termsAndConditions || [],
          confidentialityTerms: tmpl.confidentialityClause || '',
          professionalConductTerms: tmpl.professionalConductClause || ''
        }));
      }
    } catch (err) {
      toast.error('Failed to load initial form data.');
    } finally {
      setLoading(false);
    }
  };

  const selectCandidate = (cand) => {
    setSelectedCandidate(cand);
    // Auto-calculate default acceptance deadline (7 days from now)
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    setFormData((prev) => ({
      ...prev,
      candidateId: cand._id,
      designation: cand.designation || prev.designation,
      department: cand.department || prev.department,
      employmentType: cand.employmentType?.toUpperCase() === 'FULL-TIME' ? 'FULL_TIME' :
                      cand.employmentType?.toUpperCase() === 'INTERNSHIP' ? 'INTERNSHIP' : 'TRAINEE',
      joiningDate: cand.joiningDate ? cand.joiningDate.substring(0, 10) : prev.joiningDate,
      workLocation: cand.workLocation || prev.workLocation,
      reportingManager: cand.reportingManager || prev.reportingManager,
      compensation: cand.compensation || prev.compensation,
      compensationFrequency: cand.compensationFrequency || prev.compensationFrequency,
      acceptanceDeadline: deadline
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResponsibilityChange = (index, value) => {
    const updated = [...formData.responsibilities];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, responsibilities: updated }));
  };

  const addResponsibility = () => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const removeResponsibility = (index) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleTermChange = (index, value) => {
    const updated = [...formData.terms];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, terms: updated }));
  };

  const handleSave = async (submitNow = false) => {
    if (!formData.candidateId) {
      toast.error('Please select a candidate.');
      setStep(1);
      return;
    }
    if (!formData.designation || !formData.joiningDate || !formData.compensation || !formData.acceptanceDeadline) {
      toast.error('Please complete all required appointment details in Step 2.');
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      const res = await hrService.createAppointment({
        ...formData,
        submitNow
      });

      if (res.success) {
        toast.success(
          submitNow
            ? 'Appointment letter submitted for Admin approval!'
            : 'Appointment draft saved successfully!'
        );
        navigate(`/hr/appointments/${res.appointment._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save appointment letter.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            GENFREX HR OfferFlow
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Create Appointment Letter
          </h1>
          <p className="text-xs text-slate-500">
            Multi-step guided appointment workflow with automatic reference generation
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => navigate('/hr/appointments')}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Letters</span>
        </Button>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-xs">
        {[
          { num: 1, title: 'Candidate', icon: User },
          { num: 2, title: 'Appointment Details', icon: Briefcase },
          { num: 3, title: 'Terms & Clauses', icon: ShieldCheck },
          { num: 4, title: 'Preview & Submit', icon: Eye }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = step === item.num;
          const isDone = step > item.num;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => setStep(item.num)}
              className={`flex items-center justify-center sm:justify-start gap-2 py-2.5 px-3 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : isDone
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-white text-blue-600' : isDone ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {isDone ? '✓' : item.num}
              </div>
              <span className="hidden sm:inline truncate">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: CANDIDATE SELECTION */}
      {step === 1 && (
        <Card className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 1: Select Candidate</h2>
            <p className="text-xs text-slate-500">
              Choose an existing candidate from the talent pool to prefill appointment terms
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Candidate <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              {candidates.map((cand) => {
                const isSelected = selectedCandidate?._id === cand._id;
                return (
                  <div
                    key={cand._id}
                    onClick={() => selectCandidate(cand)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 text-xs">{cand.name}</p>
                      <span className="text-[10px] font-semibold text-blue-700 uppercase">
                        {cand.employmentType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{cand.designation}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{cand.email} • {cand.phone}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCandidate && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {selectedCandidate.name} ({selectedCandidate.designation})</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Candidate details successfully loaded. Proceed to configure appointment terms.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">Step 1 of 4</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!selectedCandidate) {
                  toast.error('Please select a candidate first.');
                  return;
                }
                setStep(2);
              }}
            >
              <span>Next: Appointment Details</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: APPOINTMENT DETAILS */}
      {step === 2 && (
        <Card className="space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 2: Appointment Details</h2>
            <p className="text-xs text-slate-500">
              Configure official role, joining date, reporting structure, and compensation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designation / Position Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                required
                value={formData.designation}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employment Track <span className="text-rose-500">*</span>
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="TRAINEE">Trainee</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full-time</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Joining <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                required
                value={formData.joiningDate}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Work Mode / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reporting Manager / Mentor
              </label>
              <input
                type="text"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Stipend / Compensation (INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="compensation"
                required
                value={formData.compensation}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Compensation Frequency
              </label>
              <select
                name="compensationFrequency"
                value={formData.compensationFrequency}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="STIPEND_MONTHLY">Monthly Stipend</option>
                <option value="MONTHLY">Monthly Salary</option>
                <option value="ANNUAL">Annual CTC</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Offer Acceptance Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="acceptanceDeadline"
                required
                value={formData.acceptanceDeadline}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Appointment Issuance Date
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setStep(3)}>
              <span>Next: Terms & Clauses</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: RESPONSIBILITIES & TERMS */}
      {step === 3 && (
        <Card className="space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 3: Role Responsibilities & Legal Clauses</h2>
            <p className="text-xs text-slate-500">
              Review and customize duties, terms of engagement, and confidentiality commitments
            </p>
          </div>

          {/* Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-700">
                Key Responsibilities & Deliverables:
              </label>
              <button
                type="button"
                onClick={addResponsibility}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bullet Point
              </button>
            </div>
            <div className="space-y-2">
              {formData.responsibilities.map((resp, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="font-bold text-slate-400">•</span>
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleResponsibilityChange(idx, e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResponsibility(idx)}
                      className="text-slate-400 hover:text-rose-600 text-xs px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              Terms & Conditions:
            </label>
            <div className="space-y-2">
              {formData.terms.map((term, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <span className="font-bold text-slate-500 text-[11px] mt-2">{idx + 1}.</span>
                  <textarea
                    rows={2}
                    value={term}
                    onChange={(e) => handleTermChange(idx, e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Confidentiality */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confidentiality & Data Protection:
            </label>
            <textarea
              rows={3}
              name="confidentialityTerms"
              value={formData.confidentialityTerms}
              onChange={handleInputChange}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Professional Conduct */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Professional Conduct & Compliance:
            </label>
            <textarea
              rows={2}
              name="professionalConductTerms"
              value={formData.professionalConductTerms}
              onChange={handleInputChange}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setStep(4)}>
              <span>Next: Preview & Submit</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: PREVIEW & SUBMISSION */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Step 4: Final Review & Submission</h2>
                <p className="text-xs text-slate-500">
                  Inspect the rendered GENFREX letter before saving draft or submitting for Admin review
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSave(false)}
                  disabled={submitting}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Save Draft</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave(true)}
                  loading={submitting}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Submit for Admin Approval</span>
                </Button>
              </div>
            </div>

            {/* Live A4 Document Container */}
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
              <div className="mx-auto max-w-[720px] bg-white rounded-lg shadow p-10 border border-slate-200 text-slate-800 text-xs space-y-4">
                <div className="w-full h-1 bg-blue-600 mb-4" />

                <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                  <div>
                    <h1 className="text-xl font-black text-blue-600 tracking-tight">GENFREX</h1>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      DIGITAL SERVICES & TALENT ECOSYSTEM
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500">
                    <p className="font-semibold text-slate-700">genfrexofficial@gmail.com</p>
                    <p className="text-blue-600">Build. Grow. Connect.</p>
                  </div>
                </div>

                <div className="bg-slate-50 py-2 text-center rounded border border-slate-200 font-bold text-slate-900 uppercase">
                  {formData.title}
                </div>

                <div className="flex justify-between text-slate-600 font-semibold text-[11px]">
                  <span>Ref: (Auto-generated on save e.g. GFX/HR/2026/XXXX)</span>
                  <span>Date: {formData.appointmentDate}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                  <p className="font-bold text-slate-900">{selectedCandidate?.name}</p>
                  <p className="text-slate-500">{selectedCandidate?.email} • {selectedCandidate?.phone}</p>
                  <p className="text-slate-500">{selectedCandidate?.address}</p>
                </div>

                <p className="font-bold text-slate-900">Dear {selectedCandidate?.name},</p>
                <p className="text-justify text-slate-700">
                  On behalf of GENFREX, we are pleased to offer you an appointment as{' '}
                  <strong>{formData.designation}</strong> in our <strong>{formData.department}</strong> department.
                </p>

                {/* Details Summary */}
                <div className="border border-slate-200 rounded overflow-hidden">
                  <div className="grid grid-cols-2 p-2 bg-slate-50 border-b border-slate-200">
                    <span className="font-semibold text-slate-600">Designation:</span>
                    <span className="font-bold text-slate-900">{formData.designation}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-600">Joining Date:</span>
                    <span className="font-bold text-blue-700">{formData.joiningDate}</span>
                  </div>
                  <div className="grid grid-cols-2 p-2 bg-slate-50 border-b border-slate-200">
                    <span className="font-semibold text-slate-600">Compensation / Stipend:</span>
                    <span className="font-bold text-emerald-700">
                      INR {Number(formData.compensation).toLocaleString('en-IN')} / {formData.compensationFrequency}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-2">
                    <span className="font-semibold text-slate-600">Acceptance Deadline:</span>
                    <span className="font-bold text-rose-600">{formData.acceptanceDeadline}</span>
                  </div>
                </div>

                {/* Signatories */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                  <div className="p-2 border rounded bg-slate-50 text-[11px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Authorized Signatory</p>
                    <p className="font-bold text-slate-900 mt-4">P.S. Dharshan</p>
                    <p className="text-slate-600">Founder, GENFREX</p>
                  </div>
                  <div className="p-2 border rounded bg-slate-50 text-[11px]">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Authorized Signatory</p>
                    <p className="font-bold text-slate-900 mt-4">Deepak P</p>
                    <p className="text-slate-600">Chief Operating Officer, GENFREX</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setStep(3)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back to Clauses</span>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSave(false)}
                  disabled={submitting}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Save Draft</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSave(true)}
                  loading={submitting}
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Submit for Admin Approval</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateAppointment;
