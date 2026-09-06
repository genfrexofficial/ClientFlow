import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Layers, User, Mail, Lock, Building, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register({ ...formData, role: 'ADMIN' });
      navigate('/admin/dashboard');
    } catch (err) {
      // Error handled in context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ClientFlow</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Register Agency Account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Full Name"
              name="name"
              icon={User}
              placeholder="e.g. Alex Rivera"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Agency / Studio Name"
              name="companyName"
              icon={Building}
              placeholder="e.g. Apex Digital Studio"
              value={formData.companyName}
              onChange={handleChange}
            />

            <Input
              label="Work Email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="alex@apexdigital.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="pt-2">
              <Button type="submit" size="md" className="w-full" loading={loading}>
                Create Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
