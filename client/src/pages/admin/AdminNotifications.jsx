import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileText,
  MessageSquare,
  Check,
  Layers,
  AlertCircle
} from 'lucide-react';

const AdminNotifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'TASK':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'FILE':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'APPROVAL':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'FEEDBACK':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'PROJECT':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stay on top of deliverable reviews, client approvals, and project updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description="You don't have any notifications right now."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
              className={`flex items-start gap-3.5 p-4 transition-colors cursor-pointer ${
                notification.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
              }`}
            >
              <div className="p-2 rounded-xl bg-white shadow-subtle border border-slate-200/80 shrink-0 mt-0.5">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs ${notification.isRead ? 'text-slate-800' : 'text-slate-900 font-bold'}`}>
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {notification.project?.name && (
                    <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {notification.project.name}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {notification.type}
                  </span>
                </div>
              </div>

              {!notification.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
