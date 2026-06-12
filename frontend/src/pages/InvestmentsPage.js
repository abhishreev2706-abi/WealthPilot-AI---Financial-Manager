import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';

const INV_TYPES = ['STOCK','MUTUAL_FUND','ETF','FIXED_DEPOSIT','BOND','CRYPTO','OTHER'];
const inp = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500';
const fmt = n => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const empty = { name: '', type: 'STOCK', quantity: '', purchasePrice: '', currentPrice: '', investedAmount: '', currentValue: '', purchaseDate: '' };

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/api/investments').then(r => setInvestments(r.data.data || []));
  useEffect(load, []);

  const totalInvested = investments.reduce((s, i) => s + Number(i.investedAmount || 0), 0);
  const totalCurrent = investments.reduce((s, i) => s + Number(i.currentValue || i.investedAmount || 0), 0);
  const gain = totalCurrent - totalInvested;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  const allocationData = INV_TYPES.map(type => ({
    name: type.replace('_', ' '),
    value: investments.filter(i => i.type === type).reduce((s, i) => s + Number(i.currentValue || i.investedAmount || 0), 0)
  })).filter(d => d.value > 0);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = i => { setForm({ ...i }); setEditing(i.id); setShowModal(true); };

  const save = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      quantity: form.quantity ? parseFloat(form.quantity) : null,
      purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
      currentPrice: form.currentPrice ? parseFloat(form.currentPrice) : null,
      investedAmount: parseFloat(form.investedAmount),
      currentValue: form.currentValue ? parseFloat(form.currentValue) : null,
    };
    if (editing) await api.put(`/api/investments/${editing}`, payload);
    else await api.post('/api/investments', payload);
    setShowModal(false);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this investment?')) return;
    await api.delete(`/api/investments/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investments</h2>
          <p className="text-slate-400 text-sm">Portfolio overview and tracking</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
          + Add Investment
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><p className="text-slate-400 text-sm">Total Invested</p><p className="text-xl font-bold text-blue-400 mt-1">{fmt(totalInvested)}</p></Card>
        <Card><p className="text-slate-400 text-sm">Current Value</p><p className="text-xl font-bold text-emerald-400 mt-1">{fmt(totalCurrent)}</p></Card>
        <Card><p className="text-slate-400 text-sm">Total Gain/Loss</p><p className={`text-xl font-bold mt-1 ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{gain >= 0 ? '+' : ''}{fmt(gain)}</p></Card>
        <Card><p className="text-slate-400 text-sm">Return</p><p className={`text-xl font-bold mt-1 ${gainPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%</p></Card>
      </div>

      {allocationData.length > 0 && (
        <Card>
          <h3 className="font-semibold text-sm text-slate-300 mb-4">Asset Allocation</h3>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width={200} height={180}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {allocationData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} formatter={v => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3">
              {allocationData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-slate-500">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        {investments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No investments tracked. Add your portfolio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-3 pr-4">Name</th>
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-right py-3 pr-4">Invested</th>
                  <th className="text-right py-3 pr-4">Current Value</th>
                  <th className="text-right py-3 pr-4">Gain/Loss</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => {
                  const cv = Number(inv.currentValue || inv.investedAmount);
                  const ia = Number(inv.investedAmount);
                  const g = cv - ia;
                  return (
                    <tr key={inv.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 pr-4 font-medium">{inv.name}</td>
                      <td className="py-3 pr-4 text-slate-400 text-xs">{inv.type.replace('_', ' ')}</td>
                      <td className="py-3 pr-4 text-right">{fmt(ia)}</td>
                      <td className="py-3 pr-4 text-right text-emerald-400">{fmt(cv)}</td>
                      <td className={`py-3 pr-4 text-right font-semibold ${g >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {g >= 0 ? '+' : ''}{fmt(g)}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button onClick={() => openEdit(inv)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                        <button onClick={() => remove(inv.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <Modal title={editing ? 'Update Investment' : 'Add Investment'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. Apple Stock" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                {INV_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Invested Amount ($)</label>
                <input type="number" min="0" step="0.01" required value={form.investedAmount}
                  onChange={e => setForm(f => ({ ...f, investedAmount: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current Value ($)</label>
                <input type="number" min="0" step="0.01" value={form.currentValue}
                  onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quantity</label>
                <input type="number" min="0" step="0.0001" value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className={inp} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Purchase Date</label>
                <input type="date" value={form.purchaseDate}
                  onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} className={inp} />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium">
              {editing ? 'Update' : 'Add'} Investment
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
