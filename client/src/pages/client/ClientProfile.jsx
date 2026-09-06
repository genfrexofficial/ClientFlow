import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, Building, Mail, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientProfile = () => {
  const { user } = useAuth();

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Profile preferences updated.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your client contact details and company organization preferences.
        </p>
      </div>

      <Card title="Account Details" subtitle="Your portal contact information">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Name"
            name="name"
            icon={User}
            value={user?.name || ''}
            disabled={true}
          />

          <Input
            label="Company / Organization"
            name="companyName"
            icon={Building}
            value={user?.companyName || 'Not specified'}
            disabled={true}
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            value={user?.email || ''}
            disabled={true}
          />

          <Input
            label="Phone Number"
            name="phone"
            icon={Phone}
            value={user?.phone || 'Not provided'}
            disabled={true}
          />

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Authorized Stakeholder Account • Managed by your Agency Administrator.
            </span>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientProfile;
