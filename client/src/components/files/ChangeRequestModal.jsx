import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangeRequestModal = ({ isOpen, onClose, deliverable, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please describe the changes or revisions required.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(deliverable._id, reason.trim());
      setReason('');
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
      title="Request Changes on Deliverable"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Revision Notice</p>
            <p className="mt-0.5">
              Reviewing: <strong>{deliverable?.fileName}</strong>. Your feedback will be instantly notified to the agency team and logged in the project activity.
            </p>
          </div>
        </div>

        <Input
          label="Please describe the changes required:"
          name="reason"
          type="textarea"
          rows={4}
          placeholder="e.g. Please change the header background to #1E1B4B and enlarge the client logo on tablet breakpoints..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Submit Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeRequestModal;
