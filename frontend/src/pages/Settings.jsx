import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { CURRENCY_SYMBOLS } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  User,
  Mail,
  Coins,
  Lock,
  Palette,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setProfileLoading(true);
      const res = await userService.updateProfile({ name, email, currency });
      if (res.success) {
        updateUser(res.data);
        setProfileSuccess('Profile updated successfully!');
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message || 'Failed to update profile.'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authService.updatePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Failed to update password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primaryText tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs text-secondaryText mt-0.5">
          Manage your personal profile, display currency, theme and security credentials
        </p>
      </div>

      {/* Profile & Currency Form */}
      <Card title="Profile & Preferences" subtitle="Your personal financial identification">
        {profileSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-successBg text-incomeGreen text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3 rounded-xl bg-errorBg text-expenseRed text-xs font-medium flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Preferred Currency Symbol
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all font-medium"
                >
                  {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                    <option key={code} value={code}>
                      {code} ({sym})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-secondaryText mt-1">
                Default: INR (₹)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Design System Theme
              </label>
              <div className="relative">
                <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  disabled
                  value="Minimalist Tech (#1B262C / #0F4C75)"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-100 border border-borderColor rounded-xl text-secondaryText font-medium cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-secondaryText mt-1">
                FinTech Corporate Standard
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={profileLoading}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Security & Password Form */}
      <Card title="Security & Authentication" subtitle="Change account master password">
        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-successBg text-incomeGreen text-xs font-semibold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-errorBg text-expenseRed text-xs font-medium flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={passwordLoading}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;
