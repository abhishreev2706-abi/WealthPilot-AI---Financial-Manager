import { useEffect, useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import StatCard from '../components/shared/StatCard';
import Card from '../components/shared/Card';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];
const fmt = n => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
const pct = n => `${Number(n || 0).toFixed(1)}%`;

function HealthGauge({ score }) {
  const s = Math.round(score || 0);
  const color = s >= 70 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444';
  const label = s >= 70 ? 'Excellent' : s >= 40 ? 'Fair' : 'Needs Work';
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${s} 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{s}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      <span className="text-xs text-slate-500">Financial Health Score</span>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const trendData = (data?.monthlyTrend || []).map(m => ({
    name: MONTHS[m.month - 1],
    income: Number(m.income),
    expenses: Number(m.expenses),
  }));

  const pieData = Object.entries(data?.expensesByCategory || {}).map(([name, value]) => ({
    name, value: Number(value),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-slate-400 text-sm">Your financial summary at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net Worth" value={fmt(data?.netWorth)} color="text-blue-400" />
        <StatCard label="Monthly Income" value={fmt(data?.monthlyIncome)} color="text-emerald-400" />
        <StatCard label="Monthly Expenses" value={fmt(data?.monthlyExpenses)} color="text-red-400" />
        <StatCard label="Cash Flow" value={fmt(data?.cashFlow)}
          color={Number(data?.cashFlow) >= 0 ? 'text-emerald-400' : 'text-red-400'} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Savings Rate" value={pct(data?.savingsRate)}
          color={Number(data?.savingsRate) >= 20 ? 'text-emerald-400' : 'text-amber-400'} />
        <StatCard label="Debt Ratio" value={pct(data?.debtRatio)}
          color={Number(data?.debtRatio) <= 36 ? 'text-emerald-400' : 'text-red-400'} />
        <StatCard label="Health Score" value={`${Math.round(data?.healthScore || 0)}/100`} color="text-purple-400" />
        <StatCard label="Total Spent" value={fmt(data?.monthlyExpenses)} sub="This month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Income vs Expenses (This Year)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gIncome)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#gExpense)" strokeWidth={2} name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold text-sm text-slate-300 mb-2">Financial Health</h3>
          <HealthGauge score={data?.healthScore} />
        </Card>
      </div>

      {pieData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Expense Breakdown (This Month)</h3>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width={220} height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-300 capitalize">{item.name}</span>
                  <span className="text-slate-500">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
