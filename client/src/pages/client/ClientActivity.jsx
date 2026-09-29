import React, { useState, useEffect } from 'react';
import { activityService } from '../../services/activityService';
import { History, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await activityService.getRecentActivities();
        if (res.success) {
          setActivities(res.activities || []);
        }
      } catch (err) {
        toast.error('Failed to load project activity.');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Project Activity Stream</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit history of deliverables, milestone achievements, and progress updates on your projects
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <History className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-800">No recent activity</h3>
          <p className="text-xs text-slate-500 mt-1">Actions on your projects will be logged here.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activities.map((item) => (
              <div key={item._id} className="relative text-xs">
                <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-900">{item.user?.name}</span>
                    {item.project && (
                      <span className="text-[10px] text-slate-400">
                        in <strong className="text-slate-600">{item.project.name}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{item.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientActivity;
