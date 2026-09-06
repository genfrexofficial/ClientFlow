import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const MilestoneModal = ({ isOpen, onClose, milestone = null, projectId, onSaved }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (milestone) {
        setFormData({
          title: milestone.title || '',
          description: milestone.description || '',
          dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().split('T')[0] : '',
          status: milestone.status || 'PENDING'
        });
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          status: 'PENDING'
        });
      }
    }
  }, [isOpen, milestone]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Milestone title is required.');
      return;
    }

    try {
      setLoading(true);
      await onSaved({ ...formData, project: projectId }, milestone?._id);
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
      title={milestone ? 'Edit Milestone' : 'Add Project Milestone'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Milestone Title"
          name="title"
          placeholder="e.g. Phase 2: Frontend Implementation"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Milestone Scope / Description"
          name="description"
          type="textarea"
          rows={3}
          placeholder="Key deliverables and objectives for this milestone..."
          value={formData.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Target Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {milestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MilestoneModal;
