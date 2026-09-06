import React from 'react';
import { APPROVAL_STATUS } from '../../utils/constants';
import { formatDate, formatFileSize } from '../../utils/formatters';
import Button from '../common/Button';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCode,
  Image as ImageIcon,
  Archive,
  FileCheck,
  User,
  Trash2
} from 'lucide-react';

const DeliverableReviewCard = ({
  file,
  isAdmin = false,
  isClient = false,
  onApprove,
  onRequestChanges,
  onDelete
}) => {
  const approvalCfg = APPROVAL_STATUS[file.approvalStatus] || {
    label: file.approvalStatus,
    color: 'bg-slate-100 text-slate-700'
  };

  const getFileIcon = (mime = '') => {
    if (mime.includes('image')) return <ImageIcon className="w-5 h-5 text-indigo-500" />;
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (mime.includes('zip') || mime.includes('tar') || mime.includes('archive')) {
      return <Archive className="w-5 h-5 text-amber-500" />;
    }
    return <FileText className="w-5 h-5 text-blue-500" />;
  };

  // Build safe download / preview URL
  const fileDownloadUrl = file.fileUrl?.startsWith('http')
    ? file.fileUrl
    : `http://localhost:5000${file.fileUrl}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Header: Icon, Name & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
              {getFileIcon(file.fileType)}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate" title={file.fileName}>
                {file.fileName}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {file.category} • {formatFileSize(file.fileSize)}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${approvalCfg.color}`}
          >
            {approvalCfg.label}
          </span>
        </div>

        {/* Metadata */}
        <div className="bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1 mb-4 border border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-400">Uploaded By:</span>
            <span className="font-medium text-slate-700 truncate max-w-[140px]">
              {file.uploadedBy?.name || 'Team Lead'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Date:</span>
            <span className="font-medium text-slate-700">{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {/* View / Download */}
        <a
          href={fileDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={file.fileName}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </a>

        {/* Client Review Actions */}
        <div className="flex items-center gap-1.5">
          {isClient && file.approvalStatus !== 'APPROVED' && (
            <>
              <Button
                variant="danger"
                size="xs"
                onClick={() => onRequestChanges(file)}
                icon={AlertTriangle}
              >
                Request Changes
              </Button>
              <Button
                variant="success"
                size="xs"
                onClick={() => onApprove(file._id)}
                icon={CheckCircle2}
              >
                Approve
              </Button>
            </>
          )}

          {isClient && file.approvalStatus === 'APPROVED' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
          )}

          {/* Admin delete file button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onDelete(file._id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliverableReviewCard;
