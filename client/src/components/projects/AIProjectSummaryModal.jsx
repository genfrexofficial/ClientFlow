import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { aiService } from '../../services/aiService';
import { Sparkles, CheckCircle, AlertCircle, TrendingUp, Clock, RefreshCw } from 'lucide-react';

const AIProjectSummaryModal = ({ isOpen, onClose, projectId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await aiService.generateProjectSummary(projectId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchSummary();
    }
  }, [isOpen, projectId]);

  const getHealthBadge = (health) => {
    switch (health) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Complete
          </span>
        );
      case 'ATTENTION_NEEDED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5" /> Attention Needed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            <TrendingUp className="w-3.5 h-3.5" /> On Track
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
      title="✨ AI Executive Project Summary"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium text-slate-500">Synthesizing tasks, milestones, and deliverable feedback...</p>
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* Header Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <div>
              <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                Automated Intelligence Brief
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{data.projectName}</h4>
            </div>
            {getHealthBadge(data.healthStatus)}
          </div>

          {/* AI Narrative */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Project Executive Summary</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {data.summary}
            </p>
          </div>

          {/* Key Highlights */}
          {data.keyHighlights && data.keyHighlights.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-900 mb-2">Key Highlights & Target Status</h5>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {data.keyHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Info & Refresh */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Generated just now
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="xs" onClick={fetchSummary} icon={RefreshCw}>
                Regenerate
              </Button>
              <Button variant="secondary" size="xs" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500">
          Failed to generate AI summary.
        </div>
      )}
    </Modal>
  );
};

export default AIProjectSummaryModal;
