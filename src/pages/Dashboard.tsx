import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { Users, CreditCard, CheckCircle, TrendingUp, AlertCircle, Briefcase, Clock, Calendar, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { tenant, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  
  // Demo State for Role Switching
  const [demoRole, setDemoRole] = useState<string>(user?.role || 'employee');

  useEffect(() => {
    if (user?.role) {
      setDemoRole(user.role);
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const attendanceData = [
    { name: 'Mon', attendance: 92 },
    { name: 'Tue', attendance: 95 },
    { name: 'Wed', attendance: 88 },
    { name: 'Thu', attendance: 94 },
    { name: 'Fri', attendance: 90 },
  ];

  const taskData = [
    { name: 'Completed', value: 12, color: '#10b981' },
    { name: 'In Progress', value: 8, color: '#f59e0b' },
    { name: 'Pending', value: 5, color: '#64748b' },
  ];

  if (!stats) return <div className="text-emerald-500">Loading dashboard...</div>;

  const RoleSwitcher = () => (
    <div className="bg-emerald-900/40 border border-emerald-800/50 p-4 rounded-xl mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Shield className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-emerald-100">Demo Mode: Role View</h3>
          <p className="text-xs text-emerald-400/60">Switch roles to preview different dashboards</p>
        </div>
      </div>
      <div className="flex gap-2">
        {['super_admin', 'manager', 'employee'].map((role) => (
          <button
            key={role}
            onClick={() => setDemoRole(role)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              demoRole === role 
                ? 'bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20' 
                : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800'
            }`}
          >
            {role.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Total Employees</h3>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">{stats.employees}</div>
          <div className="text-xs text-emerald-500/60 mt-2">+2 this week</div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Payroll (YTD)</h3>
            <CreditCard className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">${stats.payrollTotal.toLocaleString()}</div>
          <div className="text-xs text-emerald-500/60 mt-2">Next run in 4 days</div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Active Tasks</h3>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">{stats.activeTasks}</div>
          <div className="text-xs text-emerald-500/60 mt-2">8 high priority</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Attendance Trends
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                <XAxis dataKey="name" stroke="#34d399" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#34d399" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#022c22', borderColor: '#065f46', color: '#ecfdf5' }}
                  itemStyle={{ color: '#34d399' }}
                  cursor={{ fill: '#064e3b', opacity: 0.4 }}
                />
                <Bar dataKey="attendance" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-500" />
            System Notices
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-900/30 border border-emerald-800/50 flex gap-3">
              <div className="w-1.5 h-full bg-amber-500 rounded-full"></div>
              <div>
                <h4 className="text-sm font-medium text-emerald-100">Trial Expiration Warning</h4>
                <p className="text-xs text-emerald-400/70 mt-1">
                  Your trial ends on {new Date(tenant?.trialEndsAt || '').toLocaleDateString()}. 
                  Upgrade to Enterprise to retain access to advanced payroll features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ManagerView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Team Members</h3>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">12</div>
          <div className="text-xs text-emerald-500/60 mt-2">All present today</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Pending Approvals</h3>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">5</div>
          <div className="text-xs text-emerald-500/60 mt-2">3 Leave requests, 2 Expenses</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Project Status</h3>
            <Briefcase className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">94%</div>
          <div className="text-xs text-emerald-500/60 mt-2">On track for Q1 delivery</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Team Task Distribution
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#022c22', borderColor: '#065f46', color: '#ecfdf5' }}
                   itemStyle={{ color: '#34d399' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {taskData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-emerald-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Upcoming Deadlines
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Q1 Performance Reviews', date: 'Mar 15', priority: 'high' },
              { title: 'Client Presentation', date: 'Mar 18', priority: 'medium' },
              { title: 'Team Building Event', date: 'Mar 25', priority: 'low' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-emerald-900/30 rounded-lg border border-emerald-800/30">
                <div>
                  <div className="text-sm font-medium text-emerald-100">{item.title}</div>
                  <div className="text-xs text-emerald-500/60">Due: {item.date}</div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                  item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const EmployeeView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">My Tasks</h3>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">4</div>
          <div className="text-xs text-emerald-500/60 mt-2">2 due today</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Hours Logged</h3>
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">38.5</div>
          <div className="text-xs text-emerald-500/60 mt-2">This week</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-emerald-400/70 text-sm font-medium uppercase tracking-wider">Next Payday</h3>
            <CreditCard className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-50">Mar 30</div>
          <div className="text-xs text-emerald-500/60 mt-2">Est. $4,200</div>
        </div>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-500" />
          My Assignments
        </h3>
        <div className="space-y-4">
          {[
            { title: 'Update Documentation', status: 'In Progress', progress: 65 },
            { title: 'Fix Navigation Bug', status: 'Pending', progress: 0 },
            { title: 'Submit Expense Report', status: 'Completed', progress: 100 },
          ].map((task, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-100">{task.title}</span>
                <span className="text-emerald-400">{task.progress}%</span>
              </div>
              <div className="h-2 bg-emerald-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <RoleSwitcher />
      
      {demoRole === 'super_admin' || demoRole === 'admin' ? <AdminView /> :
       demoRole === 'manager' ? <ManagerView /> :
       <EmployeeView />}
    </div>
  );
}
