import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import {
  Layers,
  CheckCircle2,
  FolderKanban,
  Files,
  MessageSquare,
  Clock,
  Bell,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      if (role === 'ADMIN') {
        await login('admin@clientportal.com', 'Admin@123');
        navigate('/admin/dashboard');
      } else {
        await login('client@clientportal.com', 'Client@123');
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900">ClientFlow</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Client Portal Lite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={isAdmin ? '/admin/dashboard' : '/client/dashboard'}>
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Ready Client Collaboration Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
          One Place for Every <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
            Client Project
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Manage projects, share deliverables, collect feedback, and keep clients updated — all from one simple, unified portal designed for agencies, studios, and consultants.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg" className="shadow-lg shadow-indigo-200">
              Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign In to Portal
            </Button>
          </Link>
        </div>

        {/* Hackathon 1-Click Demo Launcher */}
        <div className="mt-10 p-4 rounded-2xl bg-white border border-slate-200 shadow-card max-w-xl mx-auto">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            Instant 1-Click Hackathon Demo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-xs font-semibold text-indigo-900 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Launch as Agency Admin
            </button>
            <button
              onClick={() => handleQuickDemo('CLIENT')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-xs font-semibold text-emerald-900 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Launch as Client
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section className="px-6 py-16 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Seamless Workflow
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight mb-12">
            From Project Kickoff to Final Approval
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              { step: '01', title: 'Create Project', desc: 'Define goals, milestones, and invite your client' },
              { step: '02', title: 'Share Progress', desc: 'Track tasks, log progress, and hit milestones' },
              { step: '03', title: 'Upload Files', desc: 'Post deliverables, mockups, and documents' },
              { step: '04', title: 'Client Feedback', desc: 'Clients review, comment, or request revisions' },
              { step: '05', title: 'Get Approval', desc: 'Official client sign-off and 100% completion summary' }
            ].map((s, idx) => (
              <div
                key={s.step}
                className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left hover:border-indigo-500/60 transition-all"
              >
                <span className="text-xs font-extrabold text-indigo-400">{s.step}</span>
                <h4 className="text-sm font-bold text-white mt-1">{s.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Engineered for Collaboration
          </h2>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            Everything your agency needs in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Project & Milestone Tracking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time progress bars auto-calculated from completed tasks. Keep everyone aligned on deadlines and deliverables.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Files className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Deliverable Review & Approvals</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clients can view files, download assets, approve deliverables with a click, or submit structured revision requests.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Centralized Feedback</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No more scattered WhatsApp messages or lost email threads. Consolidate client notes directly on each project deliverable.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Activity Timeline</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated audit trail recording every task update, file upload, milestone completion, and feedback timestamp.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">In-App Notifications</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant alerts keep both agency leads and clients informed whenever deliverables are ready, approved, or commented on.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">AI Executive Summaries</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              One-click AI synthesis generates comprehensive status briefs, health indicators, and bottleneck highlights autonomously.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-8 px-6 text-center text-xs text-slate-500 bg-white">
        <p>© 2026 ClientFlow • Built for high-velocity agency collaboration</p>
      </footer>
    </div>
  );
};

export default LandingPage;
