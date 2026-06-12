import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';

const CATEGORIES = ['Food','Travel','Shopping','Education','Healthcare','Utilities','Entertainment','Insurance','Investments','Salary','Business','Other'];
const empty = { type: 'EXPENSE', category: 'Food', amount: '', description: '', transactionDate: new Date().toISOString().slice(0,10), recurring: false };

const fmt = n => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState('ALL');

  const load = () => {
    api.get('/api/transactions')
      .then(r => setTransactions(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = t => {
    setForm({ ...t, transactionDate: t.transactionDate });
    setEditing(t.id);
    setShowModal(true);
  };

  const save = async e => {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    if (editing) await api.put(`/api/transactions/${editing}`, payload);
    else await api.post('/api/transactions', payload);
    setShowModal(false);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    await api.delete(`/api/transactions/${id}`);
    load();
  };

  const filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);

  const inp = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-slate-400 text-sm">Track all income and expenses</p>
        </div>
        <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          + Add Transaction
        </button>
      </div>

      <div className="flex gap-2">
        {['ALL','INCOME','EXPENSE'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {f}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No transactions found. Add one to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-3 pr-4">Date</th>
                  <th className="text-left py-3 pr-4">Category</th>
                  <th className="text-left py-3 pr-4">Description</th>
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-right py-3 pr-4">Amount</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 pr-4 text-slate-400">{t.transactionDate}</td>
                    <td className="py-3 pr-4 capitalize">{t.category}</td>
                    <td className="py-3 pr-4 text-slate-400 max-w-xs truncate">{t.description || '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === 'INCOME' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`py-3 pr-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button onClick={() => openEdit(t)} className="text-blue-400 hover:text-blue-300 text-xs">Edit</button>
                      <button onClick={() => remove(t.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <Modal title={editing ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Amount</label>
              <input type="number" min="0.01" step="0.01" required value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inp} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Date</label>
              <input type="date" required value={form.transactionDate}
                onChange={e => setForm(f => ({ ...f, transactionDate: e.target.value }))} className={inp} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Description</label>
              <input type="text" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp} placeholder="Optional" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={form.recurring}
                onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))}
                className="accent-blue-500" />
              Recurring transaction
            </label>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              {editing ? 'Update' : 'Add'} Transaction
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
