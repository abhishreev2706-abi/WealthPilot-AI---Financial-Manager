import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';

const INS_TYPES = ['HEALTH','LIFE','VEHICLE','HOME','OTHER'];
const inp = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500';
const fmt = n => `$${Number(n || 0).toLocaleString()}`;
const empty = { policyName: '', type: 'HEALTH', provider: '', premium: '', coverageAmount: '', renewalDate: '', status: 'ACTIVE' };
const ICONS = { HEALTH:'🏥', LIFE:'❤️', VEHICLE:'🚗', HOME:'🏠', OTHER:'🛡️' };

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get('/api/insurance').then(r => setPolicies(r.data.data || []));
  useEffect(load, []);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = p => { setForm({ ...p }); setEditing(p.id); setShowModal(true); };

  const save = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      premium: form.premium ? parseFloat(form.premium) : null,
      coverageAmount: form.coverageAmount ? parseFloat(form.coverageAmount) : null,
    };
    if (editing) await api.put(`/api/insurance/${editing}`, payload);
    else await api.post('/api/insurance', payload);
    setShowModal(false);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this policy?')) return;
    await api.delete(`/api/insurance/${id}`);
    load();
  };

  const isExpiringSoon = renewalDate => {
    if (!renewalDate) return false;
    const diff = (new Date(renewalDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  const totalPremium = policies.filter(p => p.status === 'ACTIVE').reduce((s, p) => s + Number(p.premium || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insurance</h2>
          <p className="text-slate-400 text-sm">Manage your insurance policies and renewals</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
          + Add Policy
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-slate-400 text-sm">Active Policies</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{policies.filter(p => p.status === 'ACTIVE').length}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Total Annual Premium</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{fmt(totalPremium)}</p>
        </Card>
      </div>

      {policies.length === 0 ? (
        <Card><p className="text-slate-500 text-center py-8">No insurance policies tracked. Add a policy.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map(p => (
            <Card key={p.id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ICONS[p.type] || '🛡️'}</span>
                  <div>
                    <p className="font-semibold text-sm">{p.policyName}</p>
                    <p className="text-xs text-slate-500">{p.provider || p.type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  p.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-400' :
                  p.status === 'EXPIRED' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                  {p.status}
                </span>
              </div>

              <div className="space-y-1 text-sm mb-3">
                {p.premium && <div className="flex justify-between">
                  <span className="text-slate-400">Premium</span>
                  <span>{fmt(p.premium)}/yr</span>
                </div>}
                {p.coverageAmount && <div className="flex justify-between">
                  <span className="text-slate-400">Coverage</span>
                  <span className="text-emerald-400">{fmt(p.coverageAmount)}</span>
                </div>}
                {p.renewalDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Renewal</span>
                    <span className={isExpiringSoon(p.renewalDate) ? 'text-amber-400 font-semibold' : ''}>{p.renewalDate}</span>
                  </div>
                )}
              </div>

              {isExpiringSoon(p.renewalDate) && (
                <div className="bg-amber-900/30 border border-amber-700/50 text-amber-400 text-xs rounded-lg px-3 py-2 mb-3">
                  ⚠️ Renewing within 30 days
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-lg">Edit</button>
                <button onClick={() => remove(p.id)} className="flex-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 py-1.5 rounded-lg">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Update Policy' : 'Add Policy'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Policy Name</label>
              <input type="text" required value={form.policyName}
                onChange={e => setForm(f => ({ ...f, policyName: e.target.value }))} className={inp} placeholder="e.g. Star Health Premium" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                  {INS_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Provider</label>
                <input type="text" value={form.provider}
                  onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className={inp} placeholder="Insurer name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Annual Premium ($)</label>
                <input type="number" min="0" step="0.01" value={form.premium}
                  onChange={e => setForm(f => ({ ...f, premium: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Coverage ($)</label>
                <input type="number" min="0" value={form.coverageAmount}
                  onChange={e => setForm(f => ({ ...f, coverageAmount: e.target.value }))} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Renewal Date</label>
              <input type="date" value={form.renewalDate}
                onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} className={inp} />
            </div>
            {editing && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="LAPSED">Lapsed</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium">
              {editing ? 'Update' : 'Add'} Policy
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
