import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Calendar,
  User as UserIcon,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: string;
  assigned_to_name: string;
  assigned_by_name: string;
  created_at: string;
}

interface Employee {
  id: string;
  full_name: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      
      if (res.ok) {
        setShowCreateModal(false);
        setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (newStatus === 'completed') {
      if (!confirm('Are you sure you want to mark this task as completed?')) return;
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <Circle className="w-5 h-5 text-emerald-600" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-50">Task Management</h1>
          <p className="text-emerald-400/60">Track assignments and deadlines</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {['all', 'pending', 'in_progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filterStatus === status 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'text-emerald-400/60 hover:bg-emerald-900/30 hover:text-emerald-200'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-emerald-500/40">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-emerald-900/50 rounded-xl">
            <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
            </div>
            <h3 className="text-emerald-200 font-medium">No tasks found</h3>
            <p className="text-emerald-500/40 text-sm mt-1">Create a new task to get started</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id}
              className="group bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-5 hover:border-emerald-700/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <button 
                    onClick={() => handleStatusUpdate(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                    className="mt-1 hover:scale-110 transition-transform"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  <div>
                    <h3 className={`font-medium text-lg ${task.status === 'completed' ? 'text-emerald-500/50 line-through' : 'text-emerald-100'}`}>
                      {task.title}
                    </h3>
                    <p className="text-emerald-400/60 text-sm mt-1 line-clamp-2">{task.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs">
                      <div className={`px-2 py-1 rounded border ${getPriorityColor(task.priority)} capitalize`}>
                        {task.priority} Priority
                      </div>
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-emerald-400/70">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </div>
                      )}

                      {task.assigned_to_name && (
                        <div className="flex items-center gap-1.5 text-emerald-400/70">
                          <UserIcon className="w-3.5 h-3.5" />
                          {task.assigned_to_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                    className="bg-emerald-950 border border-emerald-800 rounded px-2 py-1 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 hover:bg-red-950/30 text-emerald-500/40 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-emerald-950 border border-emerald-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h2 className="text-xl font-bold text-emerald-50 mb-6">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Update Q1 Report"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                  placeholder="Add details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-emerald-400 mb-1">Assign To</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Unassigned</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-emerald-400 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-emerald-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-emerald-400 hover:bg-emerald-900/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-lg font-medium transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
