import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { milestoneService } from '../../services/milestoneService';
import { fileService } from '../../services/fileService';
import { commentService } from '../../services/commentService';
import { activityService } from '../../services/activityService';
import { PROJECT_STATUS } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import TaskTable from '../../components/tasks/TaskTable';
import TaskModal from '../../components/tasks/TaskModal';
import MilestoneTimeline from '../../components/milestones/MilestoneTimeline';
import MilestoneModal from '../../components/milestones/MilestoneModal';
import DeliverableReviewCard from '../../components/files/DeliverableReviewCard';
import FileUploadModal from '../../components/files/FileUploadModal';
import CommentSection from '../../components/feedback/CommentSection';
import RecentActivityFeed from '../../components/dashboard/RecentActivityFeed';
import ProjectModal from '../../components/projects/ProjectModal';
import CompletionSummaryModal from '../../components/projects/CompletionSummaryModal';
import AIProjectSummaryModal from '../../components/projects/AIProjectSummaryModal';
import {
  FolderKanban,
  CheckSquare,
  Layers,
  Files,
  MessageSquare,
  Clock,
  Sparkles,
  Award,
  Edit2,
  Trash2,
  Plus,
  Upload,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProjectDetails = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, milesRes, filesRes, commsRes, actsRes] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getProjectTasks(projectId),
        milestoneService.getProjectMilestones(projectId),
        fileService.getProjectFiles(projectId),
        commentService.getProjectComments(projectId),
        activityService.getProjectActivities(projectId)
      ]);

      if (projRes.success) setProject(projRes.project);
      if (tasksRes.success) setTasks(tasksRes.tasks || []);
      if (milesRes.success) setMilestones(milesRes.milestones || []);
      if (filesRes.success) setFiles(filesRes.files || []);
      if (commsRes.success) setComments(commsRes.comments || []);
      if (actsRes.success) setActivities(actsRes.activities || []);
    } catch (err) {
      toast.error('Failed to load project details.');
      navigate('/admin/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Project update
  const handleUpdateProject = async (formData) => {
    try {
      const res = await projectService.updateProject(projectId, formData);
      if (res.success) {
        toast.success('Project details updated.');
        setProject(res.project);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project and all associated files, tasks, and data?')) {
      try {
        const res = await projectService.deleteProject(projectId);
        if (res.success) {
          toast.success('Project deleted successfully.');
          navigate('/admin/projects');
        }
      } catch (err) {
        toast.error('Failed to delete project.');
      }
    }
  };

  // Tasks handlers
  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        const res = await taskService.updateTask(taskId, taskData);
        if (res.success) {
          toast.success('Task updated successfully.');
          fetchProjectData();
        }
      } else {
        const res = await taskService.createTask(taskData);
        if (res.success) {
          toast.success('Task created successfully.');
          fetchProjectData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Task action failed.');
      throw err;
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateTask(taskId, { status: newStatus });
      if (res.success) {
        toast.success(`Task marked as ${newStatus.replace('_', ' ')}.`);
        fetchProjectData();
      }
    } catch (err) {
      toast.error('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task removed.');
        fetchProjectData();
      } catch (err) {
        toast.error('Failed to delete task.');
      }
    }
  };

  // Milestones handlers
  const handleSaveMilestone = async (milestoneData, milestoneId) => {
    try {
      if (milestoneId) {
        const res = await milestoneService.updateMilestone(milestoneId, milestoneData);
        if (res.success) {
          toast.success('Milestone updated.');
          fetchProjectData();
        }
      } else {
        const res = await milestoneService.createMilestone(milestoneData);
        if (res.success) {
          toast.success('Milestone added.');
          fetchProjectData();
        }
      }
    } catch (err) {
      toast.error('Failed to save milestone.');
      throw err;
    }
  };

  const handleMilestoneStatusChange = async (milestoneId, newStatus) => {
    try {
      await milestoneService.updateMilestone(milestoneId, { status: newStatus });
      toast.success('Milestone status updated.');
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to update milestone status.');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (window.confirm('Delete this milestone?')) {
      try {
        await milestoneService.deleteMilestone(milestoneId);
        toast.success('Milestone removed.');
        fetchProjectData();
      } catch (err) {
        toast.error('Failed to delete milestone.');
      }
    }
  };

  // File handlers
  const handleUploadFile = async (formData) => {
    try {
      const res = await fileService.uploadFile(formData);
      if (res.success) {
        toast.success('File uploaded successfully!');
        fetchProjectData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
      throw err;
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Delete this file?')) {
      try {
        await fileService.deleteFile(fileId);
        toast.success('File deleted.');
        fetchProjectData();
      } catch (err) {
        toast.error('Failed to delete file.');
      }
    }
  };

  // Comments handlers
  const handleAddComment = async (commentData) => {
    try {
      const res = await commentService.createComment(commentData);
      if (res.success) {
        toast.success('Feedback posted.');
        fetchProjectData();
      }
    } catch (err) {
      toast.error('Failed to post comment.');
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      toast.success('Comment deleted.');
      fetchProjectData();
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  if (loading || !project) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 animate-pulse">
        Loading project workspace...
      </div>
    );
  }

  const statusConfig = PROJECT_STATUS[project.status] || {
    label: project.status,
    color: 'bg-slate-100 text-slate-700'
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
  const pendingApprovals = files.filter((f) => f.approvalStatus === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {project.name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>

            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Client: <strong>{project.client?.name}</strong> {project.client?.companyName && `(${project.client.companyName})`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Target: <strong>{formatDate(project.endDate)}</strong></span>
              </div>

              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Budget: <strong>{formatCurrency(project.budget)}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiModalOpen(true)}
              icon={Sparkles}
              className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50"
            >
              ✨ Generate AI Summary
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCompletionModalOpen(true)}
              icon={Award}
            >
              Completion Summary
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setProjectModalOpen(true)}
              icon={Edit2}
            >
              Edit
            </Button>

            <button
              type="button"
              onClick={handleDeleteProject}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Quick Metrics */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <ProgressBar progress={project.progress || 0} size="md" showLabel={true} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px]">Tasks Completed</span>
              <p className="font-bold text-slate-900 mt-0.5">{completedTasks} / {totalTasks}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px]">Milestones Achieved</span>
              <p className="font-bold text-slate-900 mt-0.5">{completedMilestones} / {totalMilestones}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px]">Pending Reviews</span>
              <p className="font-bold text-amber-600 mt-0.5">{pendingApprovals} deliverable{pendingApprovals === 1 ? '' : 's'}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px]">Client Sign-Offs</span>
              <p className="font-bold text-emerald-600 mt-0.5">
                {files.filter((f) => f.approvalStatus === 'APPROVED').length} approved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview', icon: FolderKanban },
            { id: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
            { id: 'milestones', label: `Milestones (${milestones.length})`, icon: Layers },
            { id: 'files', label: `Files & Deliverables (${files.length})`, icon: Files },
            { id: 'feedback', label: `Feedback (${comments.length})`, icon: MessageSquare },
            { id: 'activity', label: 'Activity Timeline', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Project Summary" subtitle="Scope and delivery specifications">
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description || 'No detailed project brief provided.'}
              </p>
            </Card>

            <Card
              title="Recent Deliverables"
              subtitle="Latest assets uploaded for review"
              action={
                <Button size="xs" onClick={() => setActiveTab('files')}>
                  View All Files
                </Button>
              }
            >
              {files.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No files uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.slice(0, 2).map((file) => (
                    <DeliverableReviewCard
                      key={file._id}
                      file={file}
                      isAdmin={true}
                      onDelete={handleDeleteFile}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Client Stakeholder">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                  {project.client?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{project.client?.name}</h4>
                  <p className="text-[11px] text-slate-500">{project.client?.email}</p>
                  {project.client?.companyName && (
                    <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                      {project.client.companyName}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Live Activity Stream" subtitle="Recent actions on this project">
              <RecentActivityFeed activities={activities.slice(0, 5)} />
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Tasks</h3>
              <p className="text-xs text-slate-500">
                Updating task status automatically recalculates overall project progress.
              </p>
            </div>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            >
              Add Task
            </Button>
          </div>

          <TaskTable
            tasks={tasks}
            isAdmin={true}
            onStatusChange={handleTaskStatusChange}
            onEditTask={(task) => {
              setEditingTask(task);
              setTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      )}

      {/* Tab 3: Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Milestone Roadmap</h3>
              <p className="text-xs text-slate-500">
                Phase-by-phase deliverables and target deadlines.
              </p>
            </div>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingMilestone(null);
                setMilestoneModalOpen(true);
              }}
            >
              Add Milestone
            </Button>
          </div>

          <MilestoneTimeline
            milestones={milestones}
            isAdmin={true}
            onStatusChange={handleMilestoneStatusChange}
            onEditMilestone={(milestone) => {
              setEditingMilestone(milestone);
              setMilestoneModalOpen(true);
            }}
            onDeleteMilestone={handleDeleteMilestone}
          />
        </div>
      )}

      {/* Tab 4: Files & Deliverables */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Files & Deliverables</h3>
              <p className="text-xs text-slate-500">
                Upload files, client design deliverables, and production zip archives.
              </p>
            </div>
            <Button
              size="sm"
              icon={Upload}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Deliverable
            </Button>
          </div>

          {files.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No files or deliverables uploaded yet. Click Upload Deliverable above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <DeliverableReviewCard
                  key={file._id}
                  file={file}
                  isAdmin={true}
                  onDelete={handleDeleteFile}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Feedback & Comments */}
      {activeTab === 'feedback' && (
        <div className="max-w-3xl">
          <CommentSection
            comments={comments}
            projectId={projectId}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      )}

      {/* Tab 6: Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="max-w-2xl bg-white rounded-xl border border-slate-200/80 p-6 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Complete Activity Audit Log</h3>
          <RecentActivityFeed activities={activities} />
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={project}
        onSaved={handleUpdateProject}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={editingTask}
        projectId={projectId}
        onSaved={handleSaveTask}
      />

      <MilestoneModal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        milestone={editingMilestone}
        projectId={projectId}
        onSaved={handleSaveMilestone}
      />

      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        projectId={projectId}
        onUploadSuccess={handleUploadFile}
      />

      <CompletionSummaryModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        projectId={projectId}
      />

      <AIProjectSummaryModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
};

export default AdminProjectDetails;
