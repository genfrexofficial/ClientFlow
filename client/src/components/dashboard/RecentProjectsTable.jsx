import React from 'react';
import { Link } from 'react-router-dom';
import { PROJECT_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';
import { ChevronRight } from 'lucide-react';

const RecentProjectsTable = ({ projects = [], basePath = '/admin/projects' }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No projects found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Project
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Client
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-40">
              Progress
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Deadline
            </th>
            <th className="py-3 px-4 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {projects.map((project) => {
            const statusConfig = PROJECT_STATUS[project.status] || {
              label: project.status,
              color: 'bg-slate-100 text-slate-700'
            };

            return (
              <tr key={project._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 whitespace-nowrap">
                  <Link
                    to={`${basePath}/${project._id}`}
                    className="text-xs font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    {project.name}
                  </Link>
                  <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                    {project.description || 'No description'}
                  </p>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-medium shrink-0">
                      {project.client?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{project.client?.name || 'Unassigned'}</p>
                      {project.client?.companyName && (
                        <p className="text-[10px] text-slate-400">{project.client.companyName}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <ProgressBar progress={project.progress || 0} size="sm" showLabel={true} />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500">
                  {formatDate(project.endDate)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-right text-xs">
                  <Link
                    to={`${basePath}/${project._id}`}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecentProjectsTable;
