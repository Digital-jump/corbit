import React, { useEffect, useState } from 'react';
import { Clock, Calendar, MapPin, LogIn, LogOut } from 'lucide-react';

export default function Attendance() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    const res = await fetch('/api/attendance');
    if (res.ok) setLogs(await res.json());
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/checkin', { method: 'POST' });
      if (res.ok) {
        await fetchLogs();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance/checkout', { method: 'POST' });
      if (res.ok) {
        await fetchLogs();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Attendance Tracker</h2>
          <p className="text-emerald-400/60 text-sm mt-1">Monitor team presence and working hours.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCheckIn}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            Check In
          </button>
          <button 
            onClick={handleCheckOut}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300 font-semibold rounded-lg border border-emerald-700 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            Check Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Status Card */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6 text-center">
             <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
               <Clock className="w-10 h-10 text-emerald-400" />
             </div>
             <h3 className="text-xl font-bold text-emerald-50">09:41 AM</h3>
             <p className="text-emerald-400/60 text-sm">Thursday, Feb 26</p>
             <div className="mt-6 flex justify-center gap-2">
               <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                 On Time
               </span>
               <span className="px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400/60 text-xs font-medium border border-emerald-800">
                 Office
               </span>
             </div>
           </div>
        </div>

        {/* Logs Table */}
        <div className="lg:col-span-2 bg-emerald-900/20 border border-emerald-800/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-emerald-800/50 bg-emerald-900/30">
            <h3 className="font-semibold text-emerald-100">Recent Activity</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-emerald-900/40 text-emerald-400/70 uppercase tracking-wider font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-800/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-emerald-900/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-emerald-100">{log.full_name}</td>
                  <td className="px-6 py-4 text-emerald-400/80">{log.date}</td>
                  <td className="px-6 py-4 font-mono text-emerald-300">
                    {log.check_in ? new Date(log.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-emerald-300">
                    {log.check_out ? new Date(log.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-emerald-500/40">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
