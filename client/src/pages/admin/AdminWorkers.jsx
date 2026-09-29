import React, { useState, useEffect } from 'react';
import { workerService } from '../../services/workerService';
import {
  HardHat,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Worker Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // Temporary credentials preview modal
  const [createdCredential, setCreatedCredential] = useState(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await workerService.getWorkers();
      if (res.success) {
        setWorkers(res.workers || []);
      }
    } catch (err) {
      toast.error('Failed to load workers roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and email are required.');
      return;
    }

    try {
      setCreating(true);
      const res = await workerService.createWorker({
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        skills: skills ? skills.split(',').map((s) => s.trim()) : [],
        phone: phone.trim(),
        password: password.trim() || undefined
      });

      if (res.success) {
        toast.success('Worker account created successfully!');
        setCreatedCredential({
          name: res.worker.name,
          email: res.worker.email,
          password: res.temporaryPassword
        });
        setCreateModalOpen(false);
        setName('');
        setEmail('');
        setTitle('');
        setSkills('');
        setPhone('');
        setPassword('');
        fetchWorkers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create worker.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Engineering Team & Workload</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time task capacity, active workload distribution, and provision new engineer accounts
          </p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)}>
          <UserPlus className="h-3.5 w-3.5 mr-1" />
          Add Engineer
        </Button>
      </div>

      {/* Workers Roster Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <HardHat className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-2 text-sm font-semibold text-slate-800">No workers found</h3>
          <p className="text-xs text-slate-500 mt-1">Add your first engineer or team member to begin assigning tasks.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Engineer</th>
                  <th className="px-4 py-3">Specialization & Skills</th>
                  <th className="px-3 py-3 text-center">Assigned</th>
                  <th className="px-3 py-3 text-center">In Progress</th>
                  <th className="px-3 py-3 text-center">In Review</th>
                  <th className="px-3 py-3 text-center">Blocked</th>
                  <th className="px-3 py-3 text-center">Overdue</th>
                  <th className="px-3 py-3 text-center">Completed</th>
                  <th className="px-4 py-3 text-right">Active Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((worker) => {
                  const wl = worker.workload || {};
                  return (
                    <tr key={worker._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {worker.name?.charAt(0) || 'W'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{worker.name}</span>
                            <span className="text-[10px] text-slate-400 block">{worker.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <span className="font-medium text-slate-700 block">{worker.title || 'Engineer'}</span>
                        {worker.skills && worker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {worker.skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {s}
                              </span>
                            ))}
                            {worker.skills.length > 3 && (
                              <span className="text-[9px] text-slate-400">+{worker.skills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3.5 text-center font-semibold text-slate-700">
                        {wl.assigned || 0}
                      </td>

                      <td className="px-3 py-3.5 text-center font-semibold text-amber-600">
                        {wl.inProgress || 0}
                      </td>

                      <td className="px-3 py-3.5 text-center font-semibold text-purple-600">
                        {wl.awaitingReview || 0}
                      </td>

                      <td className="px-3 py-3.5 text-center font-semibold text-rose-600">
                        {wl.blocked || 0}
                      </td>

                      <td className="px-3 py-3.5 text-center font-semibold text-rose-700">
                        {wl.overdue || 0}
                      </td>

                      <td className="px-3 py-3.5 text-center font-semibold text-emerald-600">
                        {wl.completed || 0}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          (wl.totalActive || 0) > 4
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : (wl.totalActive || 0) > 2
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {wl.totalActive || 0} Tasks
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Engineer to Roster"
      >
        <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arun Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="arun@clientportal.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Designation / Role</label>
              <input
                type="text"
                placeholder="e.g. Full-Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              placeholder="Node.js, React, Docker, MongoDB"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Initial Password (leave empty for auto-generated)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={creating}>
              {creating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <UserPlus className="h-3 w-3 mr-1" />}
              Create Worker Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generated Credentials Alert Modal */}
      <Modal
        isOpen={!!createdCredential}
        onClose={() => setCreatedCredential(null)}
        title="Engineer Credentials Provisioned"
      >
        {createdCredential && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Account created for <strong>{createdCredential.name}</strong>. Share these initial credentials with the engineer:
            </p>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{createdCredential.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {createdCredential.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredential.password)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setCreatedCredential(null)}>
                Got It
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminWorkers;
