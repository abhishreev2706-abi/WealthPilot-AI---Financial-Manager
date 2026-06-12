import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const ROLES = ['USER', 'FAMILY', 'FREELANCER', 'BUSINESS'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        required
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">💼 WealthPilot AI</h1>
          <p className="text-slate-400 text-sm mt-1">Create your free account</p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'Full Name', 'text', 'John Doe')}
          {field('email', 'Email', 'email', 'you@example.com')}
          {field('password', 'Password', 'password', '8+ characters')}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Account Type</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
