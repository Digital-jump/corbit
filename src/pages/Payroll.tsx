import React, { useEffect, useState } from 'react';
import { Play, Download, DollarSign, Calendar, CheckCircle } from 'lucide-react';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayroll = async () => {
    const res = await fetch('/api/payroll');
    if (res.ok) setPayrolls(await res.json());
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const runPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payroll/run', { method: 'POST' });
      if (res.ok) {
        await fetchPayroll();
        alert('Payroll processed successfully');
      } else {
        alert('Failed to run payroll');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Payroll Management</h2>
          <p className="text-emerald-400/60 text-sm mt-1">Process salaries and generate payslips.</p>
        </div>
        <button 
          onClick={runPayroll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          {loading ? 'Processing...' : 'Run Payroll'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="text-emerald-400/70 text-xs font-medium uppercase tracking-wider mb-2">Total Disbursed (YTD)</div>
          <div className="text-2xl font-bold text-emerald-50">$1,240,500</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="text-emerald-400/70 text-xs font-medium uppercase tracking-wider mb-2">Next Pay Date</div>
          <div className="text-2xl font-bold text-emerald-50">Feb 28, 2026</div>
        </div>
        <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
          <div className="text-emerald-400/70 text-xs font-medium uppercase tracking-wider mb-2">Pending Approvals</div>
          <div className="text-2xl font-bold text-emerald-50">0</div>
        </div>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-900/40 text-emerald-400/70 uppercase tracking-wider font-medium">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4">Net Pay</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Processed At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-800/30">
            {payrolls.map((item) => (
              <tr key={item.id} className="hover:bg-emerald-900/30 transition-colors">
                <td className="px-6 py-4 font-medium text-emerald-100">{item.full_name}</td>
                <td className="px-6 py-4 text-emerald-400/80">
                  {new Date(item.period_start).toLocaleDateString()} - {new Date(item.period_end).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-mono text-emerald-300">${item.net_pay.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-emerald-400/60 text-xs">
                  {new Date(item.generated_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-emerald-400 hover:text-emerald-200 p-1.5 hover:bg-emerald-900/50 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-emerald-500/40">
                  No payroll records found. Click "Run Payroll" to generate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
