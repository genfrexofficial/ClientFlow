import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import TaskTable from '../../components/tasks/TaskTable';
import TaskModal from '../../components/tasks/TaskModal';
import Button from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTasks = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const projRes = await projectService.getProjects();
      if (projRes.success && projRes.projects?.length > 0) {
        setProjects(projRes.projects);
        const firstId = projRes.projects[0]._id;
        setSelectedProjectId(firstId);
        const tasksRes = await taskService.getProjectTasks(firstId);
        if (tasksRes.success) setTasks(tasksRes.tasks || []);
      }
    } catch (err) {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId);
    try {
      setLoading(true);
      const res = await taskService.getProjectTasks(projectId);
      if (res.success) setTasks(res.tasks || []);
    } catch (err) {
      toast.error('Failed to load project tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      toast.success(`Task status updated to ${newStatus}.`);
      const res = await taskService.getProjectTasks(selectedProjectId);
      if (res.success) setTasks(res.tasks || []);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task deleted.');
        const res = await taskService.getProjectTasks(selectedProjectId);
        if (res.success) setTasks(res.tasks || []);
      } catch (err) {
        toast.error('Failed to delete task.');
      }
    }
  };

  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        await taskService.updateTask(taskId, taskData);
        toast.success('Task updated.');
      } else {
        await taskService.createTask(taskData);
        toast.success('Task created.');
      }
      const res = await taskService.getProjectTasks(selectedProjectId);
      if (res.success) setTasks(res.tasks || []);
    } catch (err) {
      toast.error('Task action failed.');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Task Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, assign, and track tasks across all client projects.
          </p>
        </div>

        {selectedProjectId && (
          <Button
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
            icon={Plus}
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Select Project:</span>
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => handleProjectSelect(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[240px]"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.progress}%)
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <CardSkeleton />
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <EmptyState
            icon={CheckSquare}
            title="No tasks in this project"
            description="Create tasks to break down deliverables and automatically calculate project progress."
            actionLabel="Add First Task"
            onAction={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          />
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          isAdmin={true}
          onStatusChange={handleStatusChange}
          onEditTask={(t) => {
            setEditingTask(t);
            setTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={editingTask}
        projectId={selectedProjectId}
        onSaved={handleSaveTask}
      />
    </div>
  );
};

export default AdminTasks;
