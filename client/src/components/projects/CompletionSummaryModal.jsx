import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { projectService } from '../../services/projectService';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, Award, Printer, Calendar, CheckSquare, Layers, FileCheck } from 'lucide-react';

const CompletionSummaryModal = ({ isOpen, onClose, projectId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      const fetchSummary = async () => {
        try {
          setLoading(true);
          const res = await projectService.getProjectSummary(projectId);
          if (res.success) {
            setSummary(res.summary);
          }
        } catch (err) {
          console.error('Failed to load project summary:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSummary();
    }
  }, [isOpen, projectId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title="Project Completion Report"
    >
      {loading || !summary ? (
        <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
          Generating completion summary...
        </div>
      ) : (
        <div className="space-y-6" id="printable-summary">
          {/* Header Banner */}
          <div className="text-center py-5 px-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Official Project Milestone
            </span>
            <h2 className="text-xl font-extrabold text-emerald-950 mt-0.5">
              🎉 PROJECT COMPLETED
            </h2>
            <p className="text-sm font-semibold text-emerald-800 mt-1">
              {summary.projectName}
            </p>
            <p className="text-xs text-emerald-600 mt-1 max-w-md mx-auto">
              {summary.description || 'All milestone phases, tasks, and client deliverable reviews have successfully concluded.'}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 font-medium">Progress</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{summary.progress}%</p>
              <p className="text-[10px] text-slate-400">Target reached</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 font-medium">Tasks</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {summary.tasks.completed} / {summary.tasks.total}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">100% finished</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 font-medium">Milestones</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {summary.milestones.completed} / {summary.milestones.total}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">All achieved</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 font-medium">Approvals</p>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                {summary.deliverables.approved}
              </p>
              <p className="text-[10px] text-slate-400">Signed off</p>
            </div>
          </div>

          {/* Project Details List */}
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs text-slate-700 bg-white">
            <div className="flex justify-between py-2.5 px-4">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
              </span>
              <span className="font-semibold">{formatDate(summary.startDate)}</span>
            </div>

            <div className="flex justify-between py-2.5 px-4">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Completion Date
              </span>
              <span className="font-semibold text-emerald-700">{formatDate(summary.endDate)}</span>
            </div>

            <div className="flex justify-between py-2.5 px-4">
              <span className="text-slate-500">Client Partner</span>
              <span className="font-semibold">{summary.client?.name} ({summary.client?.companyName || 'Client'})</span>
            </div>

            <div className="flex justify-between py-2.5 px-4">
              <span className="text-slate-500">Agency Lead</span>
              <span className="font-semibold">{summary.createdBy?.name}</span>
            </div>

            <div className="flex justify-between py-2.5 px-4">
              <span className="text-slate-500">Deliverables Count</span>
              <span className="font-semibold">{summary.deliverables.total} uploaded files</span>
            </div>

            <div className="flex justify-between py-2.5 px-4">
              <span className="text-slate-500">Final Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 no-print">
            <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer}>
              Print Summary
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CompletionSummaryModal;
