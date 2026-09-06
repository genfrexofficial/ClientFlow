import React from 'react';
import { MILESTONE_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { Check, Clock, Circle, Calendar, Edit2, Trash2 } from 'lucide-react';

const MilestoneTimeline = ({
  milestones = [],
  isAdmin = false,
  onStatusChange,
  onEditMilestone,
  onDeleteMilestone
}) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
        No milestones established for this project yet.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-500 shadow-sm">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-blue-500 animate-pulse shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border-2 border-slate-300">
            <Circle className="w-3.5 h-3.5 fill-slate-300" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-card">
      <div className="relative pl-6 sm:pl-8">
        {/* Continuous timeline vertical line */}
        <div
          className="absolute left-10 sm:left-12 top-4 bottom-4 w-0.5 bg-slate-200"
          aria-hidden="true"
        />

        <div className="space-y-8 relative">
          {milestones.map((milestone) => {
            const statusCfg = MILESTONE_STATUS[milestone.status] || {
              label: milestone.status,
              color: 'bg-slate-100 text-slate-700'
            };

            return (
              <div key={milestone._id} className="relative flex items-start gap-4">
                {/* Milestone Status Marker */}
                <div className="shrink-0 z-10 bg-white">
                  {getStatusIcon(milestone.status)}
                </div>

                {/* Milestone Content Card */}
                <div className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <h4
                      className={`text-sm font-bold ${
                        milestone.status === 'COMPLETED' ? 'text-slate-800' : 'text-slate-900'
                      }`}
                    >
                      {milestone.title}
                    </h4>

                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <select
                          value={milestone.status}
                          onChange={(e) => onStatusChange(milestone._id, e.target.value)}
                          className="text-[11px] font-semibold rounded-md px-2 py-0.5 border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      )}

                      {isAdmin && (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => onEditMilestone(milestone)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Edit Milestone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteMilestone(milestone._id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {milestone.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {milestone.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Date: <strong>{formatDate(milestone.dueDate)}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MilestoneTimeline;
