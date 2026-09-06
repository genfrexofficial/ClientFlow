import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Layers, Mail, Lock, ShieldCheck, Briefcase, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password);
      const target = from || (user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      // Error toasted in context
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'ADMIN') {
      setEmail('admin@clientportal.com');
      setPassword('Admin@123');
    } else {
      setEmail('client@clientportal.com');
      setPassword('Client@123');
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
        <h2 className="mt-4 text-2xl font-bold text-slate-900">Sign in to your portal</h2>
        <p className="mt-1 text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            create a new agency account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-10">
          {/* Quick Demo Credentials Box */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2 text-center">
              ⚡ Quick Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('ADMIN')}
                className="p-2 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Agency Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('CLIENT')}
                className="p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" /> Demo Client
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button type="submit" size="md" className="w-full" loading={loading}>
                Sign In <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
