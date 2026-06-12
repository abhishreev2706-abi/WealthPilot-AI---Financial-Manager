import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/shared/Card';
import Modal from '../components/shared/Modal';

const CATEGORIES = ['Food','Travel','Shopping','Education','Healthcare','Utilities','Entertainment','Insurance','Investments','Other'];
const inp = 'w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500';
const fmt = n => `$${Number(n || 0).toLocaleString()}`;
const now = new Date();

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Food', monthlyLimit: '', month: now.getMonth() + 1, year: now.getFullYear() });

  const load = () => {
    Promise.all([api.get('/api/budgets'), api.get('/api/transactions')]).then(([b, t]) => {
      setBudgets(b.data.data || []);
      setTransactions(t.data.data || []);
    });
  };

  useEffect(load, []);

  const getSpent = category => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && t.category === category &&
        new Date(t.transactionDate).getMonth() + 1 === now.getMonth() + 1 &&
        new Date(t.transactionDate).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const save = async e => {
    e.preventDefault();
    await api.post('/api/budgets', { ...form, monthlyLimit: parseFloat(form.monthlyLimit) });
    setShowModal(false);
    load();
  };

  const remove = async id => {
    await api.delete(`/api/budgets/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Planner</h2>
          <p className="text-slate-400 text-sm">Set and track monthly spending limits</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
          + Set Budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <Card><p className="text-slate-500 text-center py-8">No budgets set. Add a budget to start tracking.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => {
            const spent = getSpent(b.category);
            const limit = Number(b.monthlyLimit);
            const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const over = spent > limit;
            return (
              <Card key={b.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold capitalize">{b.category}</p>
                    <p className="text-xs text-slate-500">{b.month}/{b.year}</p>
                  </div>
                  <button onClick={() => remove(b.id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={over ? 'text-red-400' : 'text-slate-300'}>Spent: {fmt(spent)}</span>
                  <span className="text-slate-400">Limit: {fmt(limit)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${over ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mt-1 ${over ? 'text-red-400' : 'text-slate-500'}`}>
                  {over ? `Over by ${fmt(spent - limit)}` : `${fmt(limit - spent)} remaining`}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title="Set Budget" onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Monthly Limit ($)</label>
              <input type="number" min="1" step="1" required value={form.monthlyLimit}
                onChange={e => setForm(f => ({ ...f, monthlyLimit: e.target.value }))} className={inp} placeholder="500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Month</label>
                <input type="number" min="1" max="12" value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: parseInt(e.target.value) }))} className={inp} />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Year</label>
                <input type="number" min="2020" value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))} className={inp} />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium">
              Save Budget
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
