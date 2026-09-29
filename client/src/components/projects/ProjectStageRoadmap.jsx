import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  PauseCircle,
  ArrowRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export const STAGES_LIST = [
  { id: 'PLANNING', label: 'Planning' },
  { id: 'REQUIREMENTS', label: 'Requirements' },
  { id: 'DESIGN', label: 'Design' },
  { id: 'DEVELOPMENT', label: 'Development' },
  { id: 'TESTING', label: 'Testing' },
  { id: 'CLIENT_REVIEW', label: 'Client Review' },
  { id: 'DEPLOYMENT', label: 'Deployment' },
  { id: 'COMPLETED', label: 'Completed' }
];

const ProjectStageRoadmap = ({
  currentStage = 'PLANNING',
  projectId,
  isAdmin = false,
  onStageUpdated
}) => {
  const [updating, setUpdating] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isOnHold = currentStage === 'ON_HOLD';
  const activeStageIndex = STAGES_LIST.findIndex((s) => s.id === currentStage);

  const handleStageChange = async (newStage) => {
    if (newStage === currentStage) {
      setDropdownOpen(false);
      return;
    }

    try {
      setUpdating(true);
      if (onStageUpdated) {
        await onStageUpdated(newStage);
        toast.success(`Project stage updated to "${newStage.replace('_', ' ')}"!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stage.');
    } finally {
      setUpdating(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Project Delivery Roadmap
            </h3>
            {isOnHold ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <PauseCircle className="w-3 h-3" /> Project On Hold
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Current: {STAGES_LIST.find((s) => s.id === currentStage)?.label || currentStage}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sequential stages from requirements gathering through production deployment
          </p>
        </div>

        {/* Admin Stage Transition Dropdown */}
        {isAdmin && (
          <div className="relative">
            <button
              type="button"
              disabled={updating}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
            >
              <span>Change Stage</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-floating border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select New Stage
                </div>
                {STAGES_LIST.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => handleStageChange(stage.id)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      currentStage === stage.id
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{stage.label}</span>
                    {currentStage === stage.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => handleStageChange('ON_HOLD')}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      isOnHold
                        ? 'bg-amber-50 text-amber-800 font-bold'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <span>Pause (On Hold)</span>
                    {isOnHold && <PauseCircle className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Roadmap Step Bar */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[680px] justify-between relative">
          {/* Connector Line Background */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0" />

          {STAGES_LIST.map((stage, idx) => {
            const isCompleted = !isOnHold && activeStageIndex > idx;
            const isCurrent = !isOnHold && activeStageIndex === idx;
            const isUpcoming = isOnHold || activeStageIndex < idx;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center relative z-10 flex-1 px-1 text-center"
              >
                {/* Node icon circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : isCurrent
                      ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                  title={`${stage.label}: ${isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Upcoming'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <span className="text-xs">&bull;</span>
                  ) : (
                    <span className="text-[11px] font-normal">{idx + 1}</span>
                  )}
                </div>

                {/* Stage Label */}
                <p
                  className={`text-[11px] mt-2 font-medium truncate max-w-[80px] ${
                    isCurrent
                      ? 'text-indigo-700 font-bold'
                      : isCompleted
                      ? 'text-slate-800 font-semibold'
                      : 'text-slate-400'
                  }`}
                  title={stage.label}
                >
                  {stage.label}
                </p>

                {/* Small indicator */}
                <span className="text-[9px] text-slate-400">
                  {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectStageRoadmap;
