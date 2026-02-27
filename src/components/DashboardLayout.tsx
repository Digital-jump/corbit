import React from 'react';
import { useAuth } from '../lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  CalendarCheck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Building2,
  CheckSquare,
  Bell,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, tenant, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Sparkles, label: 'Corbit AI', path: '/app/ai' },
    { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
    { icon: Users, label: 'Employees', path: '/app/employees' },
    { icon: CalendarCheck, label: 'Attendance', path: '/app/attendance' },
    { icon: CreditCard, label: 'Payroll', path: '/app/payroll' },
    { icon: MessageSquare, label: 'Chat', path: '/app/chat' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  return (
    <div className="min-h-screen bg-emerald-950 text-emerald-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-emerald-900/50 bg-emerald-950/50 backdrop-blur-xl flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-emerald-900/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="font-bold text-xl tracking-tight">CORBIT</span>
          </div>
          <div className="text-xs text-emerald-400/60 uppercase tracking-wider font-mono mt-2">
            {tenant?.name}
          </div>
          <div className="text-[10px] text-emerald-600 font-mono">
            ID: {tenant?.id.slice(0, 8)}...
          </div>
          {tenant?.plan === 'enterprise' && (
            <div className="mt-4 px-2 py-1.5 bg-emerald-900/40 rounded border border-emerald-800/50 flex items-center justify-between cursor-pointer hover:bg-emerald-900/60 transition-colors">
              <span className="text-xs font-medium text-emerald-300">Engineering</span>
              <span className="text-[10px] text-emerald-500">▼</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm" 
                    : "text-emerald-400/60 hover:text-emerald-200 hover:bg-emerald-900/30"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "opacity-70")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-900/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-900/20 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-emerald-500/60 truncate">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-emerald-950 relative">
        {/* Header */}
        <header className="h-16 border-b border-emerald-900/50 flex items-center justify-between px-8 sticky top-0 bg-emerald-950/80 backdrop-blur-md z-10">
          <h1 className="text-lg font-medium text-emerald-100">
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            {tenant?.plan === 'trial' && (
              <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                Trial Active ({new Date(tenant.trialEndsAt).toLocaleDateString()})
              </div>
            )}
            <button className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 hover:bg-emerald-800/50 transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
