import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { fileService } from '../../services/fileService';
import { activityService } from '../../services/activityService';
import StatCard from '../../components/dashboard/StatCard';
import DeliverableReviewCard from '../../components/files/DeliverableReviewCard';
import ChangeRequestModal from '../../components/files/ChangeRequestModal';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import ProgressBar from '../../components/common/ProgressBar';
import Card from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Change request modal
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [projRes, actRes] = await Promise.all([
        projectService.getProjects(),
        activityService.getRecentActivities()
      ]);

      if (projRes.success) {
        const clientProjects = projRes.projects || [];
        setProjects(clientProjects);

        // Fetch deliverables for all assigned projects to collect pending reviews
        let allPending = [];
        for (const p of clientProjects) {
          try {
            const filesRes = await fileService.getProjectFiles(p._id);
            if (filesRes.success) {
              const pending = filesRes.files.filter(
                (f) => f.category === 'DELIVERABLE' && f.approvalStatus === 'PENDING_REVIEW'
              );
              allPending = [...allPending, ...pending];
            }
          } catch (e) {
            console.error(e);
          }
        }
        setPendingFiles(allPending);
      }

      if (actRes.success) {
        setActivities(actRes.activities || []);
      }
    } catch (err) {
      toast.error('Failed to load client portal dashboard.');
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
        toast.success('🎉 Deliverable approved successfully!');
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
        toast.success('Changes requested. The agency has been notified!');
        fetchClientData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback.');
      throw err;
    }
  };

  // Metrics
  const activeProjectsCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const pendingApprovalsCount = pendingFiles.length;
  const totalTasksRemaining = projects.reduce((acc, p) => {
    const total = p.stats?.totalTasks || 0;
    const completed = p.stats?.completedTasks || 0;
    return acc + Math.max(0, total - completed);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client Portal Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Welcome to your collaboration hub. Review project milestones, deliverables, and sign-offs.
        </p>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Projects"
            value={activeProjectsCount}
            subtitle="Currently in development"
            icon={FolderKanban}
            color="indigo"
          />

          <StatCard
            title="Pending Approvals"
            value={pendingApprovalsCount}
            subtitle="Awaiting your sign-off"
            icon={AlertCircle}
            color="amber"
          />

          <StatCard
            title="Tasks In Progress"
            value={totalTasksRemaining}
            subtitle="Remaining sprint deliverables"
            icon={Clock}
            color="blue"
          />

          <StatCard
            title="Completed Projects"
            value={completedProjectsCount}
            subtitle="Delivered successfully"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      )}

      {/* Deliverables Requiring Attention */}
      <Card
        title="Deliverables Requiring Your Review"
        subtitle="Review assets, request revisions, or approve to proceed to the next milestone"
        action={
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {pendingApprovalsCount} Action{pendingApprovalsCount === 1 ? '' : 's'} Required
          </span>
        }
      >
        {loading ? (
          <CardSkeleton />
        ) : pendingFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-slate-100">
            🎉 Great job! You have no pending deliverable reviews at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        )}
      </Card>

      {/* Active Projects Overview & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your Active Projects</h3>
            <Link
              to="/client/projects"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <EmptyState
                icon={Briefcase}
                title="No assigned projects"
                description="You haven't been assigned to any projects yet. Contact your agency partner."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <Link
                        to={`/client/projects/${project._id}`}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {project.description}
                      </p>
                    </div>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <ProgressBar progress={project.progress || 0} size="sm" showLabel={true} />

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs text-slate-500">
                    <span>Deadline: <strong>{formatDate(project.endDate)}</strong></span>
                    <Link
                      to={`/client/projects/${project._id}`}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Project Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card title="Live Project Activity" subtitle="Real-time agency updates">
            <RecentActivityFeed activities={activities.slice(0, 6)} />
          </Card>
        </div>
      </div>

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
