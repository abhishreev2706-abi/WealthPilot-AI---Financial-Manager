import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';

const DEBT_TYPES = ['PERSONAL_LOAN','HOME_LOAN','VEHICLE_LOAN','CREDIT_CARD','OTHER'];
const inp = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500';
const fmt = n => `$${Number(n || 0).toLocaleString()}`;
const empty = { name: '', type: 'PERSONAL_LOAN', principal: '', outstanding: '', interestRate: '', emi: '', dueDate: '', status: 'ACTIVE' };

const ICONS = { PERSONAL_LOAN:'💵', HOME_LOAN:'🏠', VEHICLE_LOAN:'🚗', CREDIT_CARD:'💳', OTHER:'📋' };

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/api/debts').then(r => setDebts(r.data.data || []));
  useEffect(load, []);

  const totalOutstanding = debts.filter(d => d.status === 'ACTIVE').reduce((s, d) => s + Number(d.outstanding), 0);
  const totalEMI = debts.filter(d => d.status === 'ACTIVE' && d.emi).reduce((s, d) => s + Number(d.emi), 0);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = d => { setForm({ ...d }); setEditing(d.id); setShowModal(true); };

  const save = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      principal: parseFloat(form.principal),
      outstanding: parseFloat(form.outstanding),
      interestRate: parseFloat(form.interestRate),
      emi: form.emi ? parseFloat(form.emi) : null,
    };
    if (editing) await api.put(`/api/debts/${editing}`, payload);
    else await api.post('/api/debts', payload);
    setShowModal(false);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this debt?')) return;
    await api.delete(`/api/debts/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Debt Management</h2>
          <p className="text-slate-400 text-sm">Track loans and repayment progress</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
          + Add Debt
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-slate-400 text-sm">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{fmt(totalOutstanding)}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Total Monthly EMI</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{fmt(totalEMI)}</p>
        </Card>
      </div>

      {debts.length === 0 ? (
        <Card><p className="text-slate-500 text-center py-8">No debts tracked. Add a loan to get started.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map(d => {
            const pct = Number(d.principal) > 0 ? ((1 - Number(d.outstanding) / Number(d.principal)) * 100) : 0;
            return (
              <Card key={d.id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ICONS[d.type] || '📋'}</span>
                    <div>
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.status === 'ACTIVE' ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                    {d.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outstanding</span>
                    <span className="font-semibold text-red-400">{fmt(d.outstanding)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest Rate</span>
                    <span>{d.interestRate}% p.a.</span>
                  </div>
                  {d.emi && <div className="flex justify-between">
                    <span className="text-slate-400">Monthly EMI</span>
                    <span className="text-amber-400">{fmt(d.emi)}</span>
                  </div>}
                  {d.dueDate && <div className="flex justify-between">
                    <span className="text-slate-400">Next Due</span>
                    <span>{d.dueDate}</span>
                  </div>}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Repaid</span><span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(d)} className="flex-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-lg">Update</button>
                  <button onClick={() => remove(d.id)} className="flex-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 py-1.5 rounded-lg">Delete</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Update Debt' : 'Add Debt'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Loan Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. Home Loan - SBI" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                {DEBT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Principal ($)</label>
                <input type="number" min="1" required value={form.principal}
                  onChange={e => setForm(f => ({ ...f, principal: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Outstanding ($)</label>
                <input type="number" min="0" required value={form.outstanding}
                  onChange={e => setForm(f => ({ ...f, outstanding: e.target.value }))} className={inp} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Interest Rate (%)</label>
                <input type="number" step="0.01" min="0" required value={form.interestRate}
                  onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">EMI ($/month)</label>
                <input type="number" min="0" value={form.emi}
                  onChange={e => setForm(f => ({ ...f, emi: e.target.value }))} className={inp} placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Due Date</label>
              <input type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className={inp} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium">
              {editing ? 'Update Debt' : 'Add Debt'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
