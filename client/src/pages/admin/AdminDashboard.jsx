import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { activityService } from '../../services/activityService';
import StatCard from '../../components/dashboard/StatCard';
import ProjectProgressChart from '../../components/dashboard/ProjectProgressChart';
import RecentProjectsTable from '../../components/dashboard/RecentProjectsTable';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import ProjectModal from '../../components/projects/ProjectModal';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { CardSkeleton } from '../../components/common/Skeleton';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projRes, actRes] = await Promise.all([
        projectService.getProjects(),
        activityService.getRecentActivities()
      ]);

      if (projRes.success) setProjects(projRes.projects || []);
      if (actRes.success) setActivities(actRes.activities || []);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProject = async (formData) => {
    try {
      const res = await projectService.createProject(formData);
      if (res.success) {
        toast.success(`Project "${res.project.name}" created!`);
        fetchDashboardData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create project.';
      toast.error(msg);
      throw err;
    }
  };

  // Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const pendingFeedback = projects.reduce(
    (acc, p) => acc + (p.stats?.pendingApprovals || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agency Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client project progress, deliverables awaiting review, and milestones.
          </p>
        </div>

        <Button onClick={() => setProjectModalOpen(true)} icon={Plus}>
          Create Project
        </Button>
      </div>

      {/* Metric Cards Grid */}
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
            title="Total Projects"
            value={totalProjects}
            subtitle="Across all clients"
            icon={FolderKanban}
            color="indigo"
          />

          <StatCard
            title="Active Projects"
            value={activeProjects}
            subtitle="In active development"
            icon={Clock}
            color="blue"
          />

          <StatCard
            title="Pending Approvals"
            value={pendingFeedback}
            subtitle="Deliverables for client review"
            icon={AlertCircle}
            color="amber"
          />

          <StatCard
            title="Completed Projects"
            value={completedProjects}
            subtitle="Successfully delivered"
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      )}

      {/* Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <Card
            title="Project Completion Progress"
            subtitle="Overall progress percentages based on finished tasks"
          >
            {loading ? (
              <div className="h-64 animate-pulse bg-slate-100 rounded-lg" />
            ) : (
              <ProjectProgressChart projects={projects} />
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card
            title="Recent Activity"
            subtitle="Live updates from your projects"
            noPadding={false}
          >
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
              </div>
            ) : (
              <RecentActivityFeed activities={activities.slice(0, 7)} />
            )}
          </Card>
        </div>
      </div>

      {/* Recent Projects Table */}
      <Card
        title="Active Projects Directory"
        subtitle="Manage assigned clients, deadlines, and delivery milestones"
        noPadding={true}
      >
        {loading ? (
          <div className="p-6">
            <CardSkeleton />
          </div>
        ) : (
          <RecentProjectsTable projects={projects} basePath="/admin/projects" />
        )}
      </Card>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSaved={handleCreateProject}
      />
    </div>
  );
};

export default AdminDashboard;
