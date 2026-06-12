import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const nav = [
  { to: '/dashboard',    label: 'Dashboard',    icon: '📊' },
  { to: '/transactions', label: 'Transactions',  icon: '💳' },
  { to: '/budget',       label: 'Budget',        icon: '📋' },
  { to: '/goals',        label: 'Goals',         icon: '🎯' },
  { to: '/debts',        label: 'Debts',         icon: '🏦' },
  { to: '/investments',  label: 'Investments',   icon: '📈' },
  { to: '/insurance',    label: 'Insurance',     icon: '🛡️' },
  { to: '/ai-assistant', label: 'AI Assistant',  icon: '🤖' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 flex flex-col border-r border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">💼 WealthPilot AI</h1>
          <p className="text-xs text-slate-400 mt-1">Personal Financial OS</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-sm text-slate-300 truncate mb-2">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate mb-3">{user?.email}</p>
          <button
            onClick={logout}
            className="w-full text-sm bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
