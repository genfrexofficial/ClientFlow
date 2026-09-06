import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const ProjectProgressChart = ({ projects = [] }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        No project data available for chart.
      </div>
    );
  }

  const chartData = projects.slice(0, 6).map((project) => ({
    name: project.name.length > 16 ? `${project.name.substring(0, 16)}...` : project.name,
    fullName: project.name,
    progress: project.progress || 0,
    status: project.status
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-800">
          <p className="font-semibold text-slate-100">{data.fullName}</p>
          <p className="text-indigo-300 mt-1">Progress: {data.progress}%</p>
          <p className="text-slate-400 text-[10px] capitalize">Status: {data.status.replace('_', ' ').toLowerCase()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            interval={0}
            angle={-15}
            textAnchor="end"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickFormatter={(val) => `${val}%`}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="progress"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.progress === 100 ? '#10B981' : '#6366F1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectProgressChart;
