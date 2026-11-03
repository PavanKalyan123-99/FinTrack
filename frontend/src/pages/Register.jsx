import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { User, Mail, Lock, Coins, ArrowRight, AlertCircle } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../utils/constants';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({ name, email, password, currency });
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainBg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-deepSpace text-white flex items-center justify-center mx-auto shadow-lg shadow-deepSpace/20 border border-royalBlue/30">
          <span className="font-extrabold text-xl tracking-wider text-softCloud">FT</span>
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-primaryText tracking-tight">
          Create your FinTrack Account
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-secondaryText">
          Start your journey towards intelligent wealth management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-borderColor shadow-card">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-errorBg text-expenseRed text-xs font-medium flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
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
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primaryText mb-1.5">
                Primary Currency
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                >
                  {Object.entries(CURRENCY_SYMBOLS).map(([code, sym]) => (
                    <option key={code} value={code}>
                      {code} ({sym})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-secondaryText">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-royalBlue hover:text-skyFocus transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
