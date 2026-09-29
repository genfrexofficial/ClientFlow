import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { fileService } from '../../services/fileService';
import { taskService } from '../../services/taskService';
import { taskRequestService } from '../../services/taskRequestService';
import { activityService } from '../../services/activityService';
import DeliverableReviewCard from '../../components/files/DeliverableReviewCard';
import ChangeRequestModal from '../../components/files/ChangeRequestModal';
import ProgressBar from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Files,
  Inbox,
  ArrowRight,
  Plus,
  Layers,
  Sparkles,
  Calendar,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGE_ORDER = [
  { key: 'REQUIREMENTS', label: 'Requirements' },
  { key: 'DESIGN', label: 'Design' },
  { key: 'DEVELOPMENT', label: 'Development' },
  { key: 'TESTING', label: 'Testing' },
  { key: 'CLIENT_REVIEW', label: 'Client Review' },
  { key: 'DEPLOYMENT', label: 'Deployment' }
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [taskRequests, setTaskRequests] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deliverable review modal
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [projRes, reqRes, actRes] = await Promise.all([
        projectService.getProjects(),
        taskRequestService.getTaskRequests(),
        activityService.getRecentActivities()
      ]);

      if (projRes.success) {
        const clientProjects = projRes.projects || [];
        setProjects(clientProjects);

        // Fetch deliverables & tasks for the primary project
        if (clientProjects.length > 0) {
          const primaryId = clientProjects[0]._id;
          const [fRes, tRes] = await Promise.all([
            fileService.getProjectFiles(primaryId),
            taskService.getProjectTasks(primaryId)
          ]);

          if (fRes.success) {
            setPendingFiles((fRes.files || []).filter((f) => f.approvalStatus === 'PENDING_REVIEW'));
          }
          if (tRes.success) {
            setRecentTasks((tRes.tasks || []).slice(0, 5));
          }
        }
      }

      if (reqRes.success) setTaskRequests(reqRes.taskRequests || []);
      if (actRes.success) setActivities(actRes.activities || []);
    } catch (err) {
      toast.error('Failed to load client portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleApprove = async (fileId) => {
    try {
      const res = await fileService.reviewDeliverable(fileId, 'APPROVED');
      if (res.success) {
        toast.success('Deliverable approved successfully!');
        fetchClientData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleOpenChangeRequest = (file) => {
    setSelectedDeliverable(file);
    setChangeModalOpen(true);
  };

  const handleSubmitChangeRequest = async (fileId, reason) => {
    try {
      const res = await fileService.reviewDeliverable(fileId, 'CHANGES_REQUESTED', reason);
      if (res.success) {
        toast.success('Revision requested. Team notified with notes.');
        setChangeModalOpen(false);
        fetchClientData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    }
  };

  const activeProjectsCount = projects.filter((p) => p.status !== 'COMPLETED').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const pendingRequestsCount = taskRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;
  const primaryProject = projects[0] || null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Customer Portal
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.companyName || 'Client Organization'} &bull; Real-time project roadmap & approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/client/task-requests">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Submit Task Request
            </Button>
          </Link>
          <Link to="/client/files">
            <Button size="sm" variant="secondary">
              Review Deliverables ({pendingFiles.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Active Projects</span>
            <FolderKanban className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeProjectsCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">In active development</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
            <Inbox className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingRequestsCount}</p>
          <Link to="/client/task-requests" className="text-[10px] text-indigo-600 font-medium mt-1 block">
            View submitted &rarr;
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <Files className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{pendingFiles.length}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Deliverables awaiting sign-off</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Completed Projects</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{completedProjectsCount}</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Delivered & operational</span>
        </div>
      </div>

      {/* Primary Project Spotlight Card */}
      {primaryProject && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Project</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{primaryProject.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{primaryProject.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/client/projects/${primaryProject._id}`}>
                <Button size="sm" variant="secondary">
                  View Project Details
                </Button>
              </Link>
              <Link to="/client/task-requests">
                <Button size="sm">
                  Create Request
                </Button>
              </Link>
            </div>
          </div>

          {/* Progress row */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>Overall Progress</span>
              <span className="font-bold text-indigo-600">{primaryProject.progress}%</span>
            </div>
            <ProgressBar progress={primaryProject.progress} />
          </div>

          {/* Visual Stage Roadmap */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-900 block mb-3">Project Stage Progression</span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {STAGE_ORDER.map((st, idx) => {
                const currentStageIdx = STAGE_ORDER.findIndex((s) => s.key === primaryProject.stage);
                const isCurrent = primaryProject.stage === st.key;
                const isPassed = currentStageIdx > idx || primaryProject.stage === 'COMPLETED';

                return (
                  <div
                    key={st.key}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 shadow-xs'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                      ) : (
                        <span className="w-2 h-2 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold block">{st.label}</span>
                    <span className="text-[9px] uppercase tracking-wider block mt-0.5 opacity-80">
                      {isPassed ? 'Achieved' : isCurrent ? 'Active Stage' : 'Upcoming'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Tasks List */}
          {recentTasks.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-900 block mb-3">Recent Engineering Tasks</span>
              <div className="divide-y divide-slate-100">
                {recentTasks.map((t) => (
                  <div key={t._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-800 block truncate">{t.title}</span>
                      <span className="text-[10px] text-slate-400 block">
                        Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 w-40 shrink-0">
                      <div className="w-full">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>{t.progress}%</span>
                          <span className="font-medium text-slate-700">{t.status?.replace('_', ' ')}</span>
                        </div>
                        <ProgressBar progress={t.progress} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deliverables Requiring Sign-Off */}
      {pendingFiles.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600" /> Deliverables Awaiting Your Approval
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Please review these submitted deliverables and click Approve or Request Changes with notes
              </p>
            </div>
            <Link to="/client/files" className="text-xs font-semibold text-amber-800 hover:text-amber-900">
              View All Files &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingFiles.map((file) => (
              <DeliverableReviewCard
                key={file._id}
                file={file}
                isClient={true}
                onApprove={handleApprove}
                onRequestChanges={handleOpenChangeRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Change Request Modal */}
      <ChangeRequestModal
        isOpen={changeModalOpen}
        onClose={() => setChangeModalOpen(false)}
        deliverable={selectedDeliverable}
        onSubmit={handleSubmitChangeRequest}
      />
    </div>
  );
};

export default ClientDashboard;
