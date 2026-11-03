import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Income', path: '/income', icon: TrendingUp },
  { name: 'Expenses', path: '/expenses', icon: TrendingDown },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'AI' },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-deepSpace text-white transition-all duration-300 ease-in-out border-r border-[#263740] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#263740]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-royalBlue flex items-center justify-center shrink-0 shadow-md shadow-royalBlue/30 border border-skyFocus/20">
              <span className="font-bold text-white text-lg tracking-wider">FT</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  FinTrack
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-skyFocus/20 text-softCloud px-1.5 py-0.5 rounded border border-skyFocus/30">
                    Pro
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Intelligent Finance
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-royalBlue text-white shadow-sm shadow-royalBlue/40'
                      : 'text-slate-300 hover:text-white hover:bg-[#23323B]'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Sky Focus active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-skyFocus rounded-r-full" />
                    )}

                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? 'text-softCloud' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 tracking-wide">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-skyFocus/30 text-softCloud border border-skyFocus/40">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip on collapsed desktop view */}
                    {isCollapsed && (
                      <div className="hidden lg:group-hover:block absolute left-full ml-3 px-2.5 py-1 bg-deepSpace text-white text-xs font-medium rounded-md whitespace-nowrap shadow-lg border border-[#263740] z-50">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-[#263740] space-y-2">
          {!isCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#23323B]/60 border border-[#263740]/60">
              <div className="w-8 h-8 rounded-lg bg-royalBlue text-white font-semibold flex items-center justify-center text-xs shrink-0 border border-skyFocus/30">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Log Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>

          {/* Desktop collapse toggle */}
          <div className="hidden lg:flex justify-end pt-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#23323B] transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
