import React, { useState, useEffect } from 'react';
import { taskRequestService } from '../../services/taskRequestService';
import { projectService } from '../../services/projectService';
import {
  Inbox,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const ClientTaskRequests = () => {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [requestedDeadline, setRequestedDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes] = await Promise.all([
        taskRequestService.getTaskRequests(),
        projectService.getProjects()
      ]);

      if (rRes.success) setRequests(rRes.taskRequests || []);
      if (pRes.success && pRes.projects?.length > 0) {
        setProjects(pRes.projects);
        setProjectId(pRes.projects[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load task requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !projectId) {
      toast.error('Please fill in title, description, and target project.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await taskRequestService.createTaskRequest({
        title: title.trim(),
        description: description.trim(),
        project: projectId,
        priority,
        requestedDeadline: requestedDeadline || null
      });

      if (res.success) {
        toast.success('Request submitted successfully! Status: Pending Admin Approval.');
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setRequestedDeadline('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Task & Requirement Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit new feature requests, modifications, and requirements directly to the agency management team
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} disabled={projects.length === 0}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Request New Work
        </Button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-800">No requests submitted yet</h3>
          <p className="text-xs text-slate-500 mt-1">Need a new feature or change? Click "Request New Work" to submit one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-500">
                      {req.project?.name}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <Badge variant={req.priority?.toLowerCase() || 'default'}>
                      {req.priority} Priority
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={req.status?.toLowerCase() || 'default'}>
                    {req.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {req.description}
              </p>

              {/* Status Feedback Banners */}
              {req.status === 'PENDING_APPROVAL' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Request submitted successfully. Status: <strong>Pending Admin Approval & Assignment</strong>.</span>
                </div>
              )}

              {req.status === 'APPROVED' && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <span>Approved by management! Assigned to engineering team for implementation.</span>
                    {req.adminNotes && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">Note: {req.adminNotes}</p>
                    )}
                  </div>
                </div>
              )}

              {req.status === 'REJECTED' && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <div>
                    <span>Request was not approved.</span>
                    {req.rejectionReason && (
                      <p className="text-[11px] text-rose-700 mt-0.5"><strong>Reason:</strong> {req.rejectionReason}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Submitted on {new Date(req.createdAt).toLocaleDateString()}</span>
                {req.requestedDeadline && (
                  <span>Requested Target: {new Date(req.requestedDeadline).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Request Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Submit New Task Request"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Target Project *</label>
            <select
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Task / Requirement Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Add WhatsApp Notification on order dispatch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the feature requirement, acceptance criteria, or desired outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Requested Deadline</label>
              <input
                type="date"
                value={requestedDeadline}
                onChange={(e) => setRequestedDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button size="sm" variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientTaskRequests;
