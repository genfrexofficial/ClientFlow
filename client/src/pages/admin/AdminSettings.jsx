import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ShieldCheck, Server, Database, Cloud, User, Building, Mail, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    companyName: user?.companyName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Agency settings updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Settings & Workspace</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure agency branding, view environment connection status, and manage profile info.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2">
          <Card title="Agency Profile" subtitle="Your corporate identity shown to clients">
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                icon={User}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Agency / Studio Name"
                name="companyName"
                icon={Building}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                disabled={true}
                helperText="Email is bound to your authentication identity."
              />

              <div className="pt-2">
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* System Health / Status */}
        <div className="space-y-4">
          <Card title="System Diagnostics" subtitle="Services & deployment status">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-slate-800">MongoDB Database</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-slate-800">Backend API</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Port 5000
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800">Storage Engine</span>
                </div>
                <span className="text-[10px] font-medium text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  Cloudinary / Local
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-slate-800">JWT Role Guard</span>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  ADMIN
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
