import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FileUploadModal = ({ isOpen, onClose, projectId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('DELIVERABLE');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!fileName) {
        setFileName(file.name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please choose a file to upload.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId);
      formData.append('category', category);
      formData.append('fileName', fileName || selectedFile.name);

      await onUploadSuccess(formData);
      setSelectedFile(null);
      setFileName('');
      setCategory('DELIVERABLE');
      onClose();
    } catch (err) {
      // Handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload File or Deliverable"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50'
              : selectedFile
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-xs font-semibold text-slate-900">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Click to replace
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-indigo-600 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Drag and drop file here, or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDFs, Images, ZIPs, Documents up to 25MB
              </p>
            </div>
          )}
        </div>

        <Input
          label="Display Name (Optional)"
          name="fileName"
          placeholder="e.g. Homepage-Design-V2.png"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="DELIVERABLE">Deliverable (Requires Client Review)</option>
            <option value="DESIGN">Design Asset</option>
            <option value="DOCUMENT">Project Document / Brief</option>
            <option value="OTHER">Other Resource</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Upload File
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FileUploadModal;
