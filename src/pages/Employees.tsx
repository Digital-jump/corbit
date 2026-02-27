import React, { useEffect, useState } from 'react';
import { Plus, Search, Mail, Briefcase, Shield } from 'lucide-react';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  job_title: string;
  status: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    fullName: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    jobTitle: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees');
    if (res.ok) setEmployees(await res.json());
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee)
    });
    
    if (res.ok) {
      setIsModalOpen(false);
      fetchEmployees();
      setNewEmployee({ fullName: '', email: '', role: 'employee', department: 'Engineering', jobTitle: '' });
    } else {
      alert('Failed to add employee');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Team Directory</h2>
          <p className="text-emerald-400/60 text-sm mt-1">Manage your workforce and permissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="w-full bg-emerald-900/20 border border-emerald-800/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-900/40 text-emerald-400/70 uppercase tracking-wider font-medium">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/30">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-emerald-900/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold">
                      {emp.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-emerald-100">{emp.full_name}</div>
                      <div className="text-xs text-emerald-500/60">{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="capitalize">{emp.role.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-emerald-500" />
                    <span>{emp.department}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-emerald-400 hover:text-emerald-200 text-xs font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
                value={newEmployee.fullName}
                onChange={e => setNewEmployee({...newEmployee, fullName: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
                value={newEmployee.email}
                onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Department"
                  className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
                  value={newEmployee.department}
                  onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Job Title"
                  className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
                  value={newEmployee.jobTitle}
                  onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})}
                />
              </div>
              <select
                className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-4 py-2 focus:border-emerald-500 outline-none"
                value={newEmployee.role}
                onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-emerald-400 hover:text-emerald-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
