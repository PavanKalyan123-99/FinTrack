import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import Button from '../common/Button';

const Topbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { openAddTransaction } = useFinance();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-borderColor px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-secondaryText hover:text-primaryText hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-borderColor rounded-xl text-primaryText placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
          />
        </form>
      </div>

      {/* Right: Quick Add CTA, Notification, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Transaction Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => openAddTransaction('expense')}
          className="hidden sm:inline-flex"
        >
          Add Transaction
        </Button>

        {/* Mobile quick add icon */}
        <button
          onClick={() => openAddTransaction('expense')}
          className="sm:hidden w-9 h-9 rounded-xl bg-royalBlue text-white flex items-center justify-center shadow-sm"
          title="Add Transaction"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 rounded-xl text-secondaryText hover:text-primaryText hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-skyFocus ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-borderColor p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-borderColor">
                <h4 className="text-sm font-semibold text-primaryText flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-royalBlue" />
                  Financial Alerts
                </h4>
                <span className="text-[11px] font-medium text-skyFocus bg-softCloud/30 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <div className="py-3 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                  <p className="text-xs font-semibold text-primaryText">
                    Monthly Budget Synced
                  </p>
                  <p className="text-[11px] text-secondaryText mt-0.5">
                    Your current month spending is being actively monitored against your configured limits.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 hover:bg-sky-50 transition-colors">
                  <p className="text-xs font-semibold text-royalBlue">
                    AI Advisor Ready
                  </p>
                  <p className="text-[11px] text-secondaryText mt-0.5">
                    Visit the AI Assistant page for personalized savings advice.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-royalBlue text-white font-semibold flex items-center justify-center text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-semibold text-primaryText leading-none">
                {user?.name || 'FinTrack User'}
              </p>
              <p className="text-[10px] text-secondaryText font-medium mt-0.5">
                {user?.currency || 'INR'} Account
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-borderColor py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-borderColor">
                <p className="text-xs font-bold text-primaryText truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-secondaryText truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-royalBlue transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-royalBlue transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings & Currency
                </button>
              </div>

              <div className="pt-1 border-t border-borderColor">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
