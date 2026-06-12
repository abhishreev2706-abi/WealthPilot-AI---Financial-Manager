import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';

const GOAL_TYPES = ['EMERGENCY_FUND','HOUSE','VEHICLE','EDUCATION','MARRIAGE','RETIREMENT','VACATION','CUSTOM'];
const inp = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500';
const fmt = n => `$${Number(n || 0).toLocaleString()}`;
const empty = { name: '', type: 'EMERGENCY_FUND', targetAmount: '', currentAmount: '0', targetDate: '', status: 'ACTIVE' };

const ICONS = { EMERGENCY_FUND:'🛡️', HOUSE:'🏠', VEHICLE:'🚗', EDUCATION:'🎓', MARRIAGE:'💍', RETIREMENT:'🏖️', VACATION:'✈️', CUSTOM:'⭐' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/api/goals').then(r => setGoals(r.data.data || []));
  useEffect(load, []);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = g => {
    setForm({ ...g, targetAmount: g.targetAmount, currentAmount: g.currentAmount, targetDate: g.targetDate });
    setEditing(g.id);
    setShowModal(true);
  };

  const save = async e => {
    e.preventDefault();
    const payload = { ...form, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) };
    if (editing) await api.put(`/api/goals/${editing}`, payload);
    else await api.post('/api/goals', payload);
    setShowModal(false);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this goal?')) return;
    await api.delete(`/api/goals/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <p className="text-slate-400 text-sm">Track your savings targets and milestones</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <Card><p className="text-slate-500 text-center py-8">No goals yet. Create your first financial goal!</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => {
            const target = Number(g.targetAmount);
            const current = Number(g.currentAmount);
            const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
            const remaining = target - current;
            return (
              <Card key={g.id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{ICONS[g.type] || '⭐'}</span>
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-slate-500">{g.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    g.status === 'COMPLETED' ? 'bg-emerald-900/50 text-emerald-400' :
                    g.status === 'PAUSED' ? 'bg-amber-900/50 text-amber-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {g.status}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="font-medium">{fmt(current)} / {fmt(target)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">{pct.toFixed(1)}% complete · {fmt(remaining)} remaining</p>
                </div>

                {g.monthlyTarget && (
                  <p className="text-xs text-slate-400 mb-3">Monthly target: <span className="text-blue-400">{fmt(g.monthlyTarget)}</span></p>
                )}

                <p className="text-xs text-slate-500 mb-3">Target date: {g.targetDate}</p>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(g)} className="flex-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-lg transition-colors">
                    Update
                  </button>
                  <button onClick={() => remove(g.id)} className="flex-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 py-1.5 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Update Goal' : 'New Goal'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Goal Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="e.g. Buy a house" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Goal Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                {GOAL_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Amount ($)</label>
                <input type="number" min="1" required value={form.targetAmount}
                  onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} className={inp} placeholder="10000" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Saved So Far ($)</label>
                <input type="number" min="0" value={form.currentAmount}
                  onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} className={inp} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target Date</label>
              <input type="date" required value={form.targetDate}
                onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className={inp} />
            </div>
            {editing && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium">
              {editing ? 'Update Goal' : 'Create Goal'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
