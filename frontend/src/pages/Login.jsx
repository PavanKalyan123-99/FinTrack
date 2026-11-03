import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@fintrack.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-mainBg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-deepSpace text-white flex items-center justify-center mx-auto shadow-lg shadow-deepSpace/20 border border-royalBlue/30">
          <span className="font-extrabold text-xl tracking-wider text-softCloud">FT</span>
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-primaryText tracking-tight">
          Welcome back to FinTrack
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-secondaryText">
          Intelligent AI-powered personal financial management
        </p>
      </div>

      {/* Card */}
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
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-primaryText">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
                />
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
              Sign In to FinTrack
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-5 pt-5 border-t border-borderColor">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-2.5 px-3 rounded-xl bg-softCloud/30 hover:bg-softCloud/50 text-royalBlue text-xs font-semibold flex items-center justify-center gap-2 border border-royalBlue/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-royalBlue" />
              Fill Demo Account (demo@fintrack.com)
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-secondaryText">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-royalBlue hover:text-skyFocus transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
