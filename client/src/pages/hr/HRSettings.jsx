import React, { useState, useEffect } from 'react';
import { hrService } from '../../services/hrService';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Building,
  Mail,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const HRSettings = () => {
  const { isAdmin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await hrService.getHRSettings();
      if (res.success) {
        setSettings(res.settings);
        setTemplate(res.template);
      }
    } catch (err) {
      toast.error('Failed to load HR settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only Admins are authorized to update company and template settings.');
      return;
    }
    try {
      setSaving(true);
      await hrService.updateHRSettings(settings);
      toast.success('Settings updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          HR & OfferFlow Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure branding, official email dispatchers, authorized signatories, and numbering formats
        </p>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            You are viewing settings in read-only mode. Organizational and signatory adjustments require Admin clearance.
          </span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company Branding & Sender Info */}
        <Card className="space-y-4 text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Company Branding & Email Dispatcher</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                disabled={!isAdmin}
                value={settings?.companyName || 'GENFREX'}
                onChange={handleSettingsChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                name="tagline"
                disabled={!isAdmin}
                value={settings?.tagline || 'Build. Grow. Connect.'}
                onChange={handleSettingsChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Sender Email</label>
              <input
                type="email"
                name="officialEmail"
                disabled={!isAdmin}
                value={settings?.officialEmail || 'genfrexofficial@gmail.com'}
                onChange={handleSettingsChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reference Prefix</label>
              <input
                type="text"
                name="referencePrefix"
                disabled={!isAdmin}
                value={settings?.referencePrefix || 'GFX/HR'}
                onChange={handleSettingsChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Company Address</label>
              <input
                type="text"
                name="companyAddress"
                disabled={!isAdmin}
                value={settings?.companyAddress || 'GENFREX Digital Services HQ, Tech Park, Bengaluru, India'}
                onChange={handleSettingsChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-900 disabled:bg-slate-50"
              />
            </div>
          </div>
        </Card>

        {/* Authorized Signatories */}
        <Card className="space-y-4 text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Authorized Letter Signatories</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Signatory</p>
              <p className="text-sm font-bold text-slate-900">P.S. Dharshan</p>
              <p className="text-slate-600 text-xs">Founder, GENFREX</p>
              <p className="text-[11px] text-slate-400">Authorized for all trainee and employment agreements.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary Signatory</p>
              <p className="text-sm font-bold text-slate-900">Deepak P</p>
              <p className="text-slate-600 text-xs">Chief Operating Officer, GENFREX</p>
              <p className="text-[11px] text-slate-400">Authorized for operational and contractual sign-offs.</p>
            </div>
          </div>
        </Card>

        {/* Master Template Clauses Preview */}
        <Card className="space-y-4 text-xs">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Active Master Letter Template</span>
          </h2>

          <div className="space-y-3 text-slate-700">
            <div>
              <span className="font-semibold text-slate-900 block mb-1">About GENFREX:</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                {template?.aboutGenfrex}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block mb-1">Confidentiality Clause:</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                {template?.confidentialityClause}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-900 block mb-1">Professional Conduct & Compliance:</span>
              <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                {template?.professionalConductClause}
              </p>
            </div>
          </div>
        </Card>

        {isAdmin && (
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" type="submit" loading={saving}>
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Configuration</span>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default HRSettings;
