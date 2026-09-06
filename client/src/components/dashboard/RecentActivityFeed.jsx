import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import {
  CheckCircle2,
  FolderPlus,
  Upload,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Award,
  CircleDot
} from 'lucide-react';

const RecentActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No recent activity logged.
      </div>
    );
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'PROJECT_CREATED':
        return <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />;
      case 'TASK_COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'FILE_UPLOADED':
        return <Upload className="w-3.5 h-3.5 text-blue-600" />;
      case 'DELIVERABLE_APPROVED':
        return <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CHANGES_REQUESTED':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case 'COMMENT_ADDED':
      case 'FEEDBACK_RECEIVED':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
      case 'PROJECT_COMPLETED':
        return <Award className="w-3.5 h-3.5 text-yellow-600" />;
      default:
        return <CircleDot className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const isLast = idx === activities.length - 1;
          return (
            <li key={activity._id || idx}>
              <div className="relative pb-6">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Action Icon Pill */}
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm shrink-0">
                    {getActionIcon(activity.action)}
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-xs text-slate-800 leading-relaxed font-normal">
                      {activity.description}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{formatRelativeTime(activity.createdAt)}</span>
                      {activity.project?.name && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-indigo-600 truncate max-w-[150px]">
                            {activity.project.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentActivityFeed;
