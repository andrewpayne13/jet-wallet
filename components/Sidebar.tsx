import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

const WalletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2-2H4"/><path d="M14 12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v0Z"/></svg>
);
const PortfolioIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
);
const BuySellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const ExchangeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
);
const EarnIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M12 22v-2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M22 12h-2"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="5"/><path d="M12 8v4l2 2"/></svg>
);
const DepositIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
);
const HistoryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v6l4 2"/><path d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z"/></svg>
);
const AdminIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M16 12v1.5c0 2.2-2.2 4-5 4s-5-1.8-5-4V12"/><path d="M12 12v1.5c0 2.2 2.2 4 5 4s5-1.8 5-4V12"/></svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/><path d="m15.5 3.5-3 3-3-3"/><path d="m15.5 20.5-3-3-3 3"/><path d="M1 12h6m6 0h6"/><path d="m3.5 15.5 3-3 3 3"/><path d="m20.5 8.5-3 3-3-3"/></svg>
);
const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

const navItems = [
  { path: '/wallets', label: 'Wallets', icon: WalletIcon },
  { path: '/portfolio', label: 'Portfolio', icon: PortfolioIcon },
  { path: '/buy-sell', label: 'Buy & Sell', icon: BuySellIcon },
  { path: '/exchange', label: 'Exchange', icon: ExchangeIcon },
  { path: '/earn', label: 'Earn', icon: EarnIcon },
  { path: '/deposit', label: 'Deposit', icon: DepositIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
  { path: '/history', label: 'History', icon: HistoryIcon },
];

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const activeLinkClass = 'bg-white/10 text-white shadow-lg';
  const inactiveLinkClass = 'text-slate-300 hover:bg-white/5 hover:text-white hover:shadow-lg transition-transform duration-300 hover:-translate-y-0.5';
  
  return (
    <aside className="w-64 bg-white/5 backdrop-blur-md border border-white/10 flex flex-col p-4 border-r border-white/10 shadow-lg">
      <div className="px-2 pt-2 pb-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <Icon className="h-5 w-5 mr-3" />
            {label}
          </NavLink>
        ))}
        {(currentUser?.role === 'admin' || currentUser?.email === 'admin@jetwallet.io') && (
             <NavLink to="/admin" className={({ isActive }) => `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                <AdminIcon className="h-5 w-5 mr-3" />
                Admin Panel
            </NavLink>
        )}
      </nav>
      <div className="mt-auto">
         <div className="flex items-center p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 mb-2 transition-transform duration-300 hover:-translate-y-0.5">
            <img className="h-10 w-10 rounded-full object-cover" src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${currentUser?.email}`} alt="User" />
            <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-white truncate" title={currentUser?.email}>{currentUser?.email}</p>
                <p className="text-xs text-slate-400">User ID: {currentUser?.id.substring(0, 8)}...</p>
            </div>
         </div>
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-600/20 text-red-300 hover:bg-red-600/40 hover:text-red-200 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            <LogoutIcon className="h-5 w-5 mr-3" />
            Logout
          </button>
      </div>
    </aside>
  );
};

export default Sidebar;
