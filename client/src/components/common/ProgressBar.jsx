import React from 'react';

const ProgressBar = ({
  progress = 0,
  showLabel = true,
  size = 'md',
  color = 'indigo',
  className = ''
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  const activeColor =
    clampedProgress === 100
      ? colors.emerald
      : colors[color] || colors.indigo;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-medium">
          <span>Progress</span>
          <span className="font-semibold text-slate-800">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <div
          className={`${activeColor} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
