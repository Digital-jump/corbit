import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    subdomain: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await register(formData);
      } else {
        await login({ email: formData.email, password: formData.password });
      }
      navigate('/app');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="border-b border-emerald-900/50 bg-emerald-950/50 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="font-bold text-xl tracking-tight">CORBIT</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsRegistering(false)} className="text-sm font-medium text-emerald-300 hover:text-emerald-100">
              Sign In
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold rounded-lg text-sm transition-colors"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-800 text-emerald-400 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Enterprise-Grade Workforce OS
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-emerald-400 bg-clip-text text-transparent">
            One Platform.<br/>Infinite Workspaces.
          </h1>
          <p className="text-xl text-emerald-400/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            The secure operational core for multi-company workforce management. 
            Your company. Your data. Your control.
          </p>
          
          {/* Auth Card */}
          <div className="max-w-md mx-auto bg-emerald-900/20 border border-emerald-800/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 text-center">
              {isRegistering ? 'Create Your Workspace' : 'Access Your Workspace'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegistering && (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="w-full bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-3 focus-within:border-emerald-500 transition-colors">
                      <input
                        type="text"
                        placeholder="subdomain"
                        className="bg-transparent w-full text-sm focus:outline-none"
                        value={formData.subdomain}
                        onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        required
                      />
                      <span className="text-emerald-600 text-sm select-none">.corbit.com</span>
                    </div>
                  </div>
                </>
              )}
              <div>
                <input
                  type="email"
                  placeholder="Work Email"
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isRegistering ? 'Start 3-Day Free Trial' : 'Enter Workspace'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-emerald-500 hover:text-emerald-400"
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-emerald-950/50 border-t border-emerald-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Isolated Database', desc: 'Each tenant gets a dedicated database file. Zero data leakage.', icon: ShieldCheck },
              { title: 'Role-Based Access', desc: 'Granular permissions for Admins, HR, Managers, and Employees.', icon: CheckCircle2 },
              { title: 'Enterprise Ready', desc: 'Audit logs, encrypted payroll, and scalable infrastructure.', icon: Building2 },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-800/30 hover:border-emerald-700/50 transition-colors">
                <feature.icon className="w-8 h-8 text-emerald-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-emerald-400/60 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
