import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import ProjectCard from '../../components/projects/ProjectCard';
import EmptyState from '../../components/common/EmptyState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjects();
        if (res.success) {
          setProjects(res.projects || []);
        }
      } catch (err) {
        toast.error('Failed to load projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Projects</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Projects currently being managed and delivered for your organization.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <EmptyState
            icon={FolderKanban}
            title="No projects assigned"
            description="You do not have any active client projects right now."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              basePath="/client/projects"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProjects;
