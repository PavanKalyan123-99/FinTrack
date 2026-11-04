import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';

const Budgets = () => {
  const { user } = useAuth();
  const { refreshKey } = useFinance();
  const currency = user?.currency || 'INR';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await budgetService.getBudgets({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.success) {
        setBudgets(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, refreshKey]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setCategory(EXPENSE_CATEGORIES[0]);
    setAmount('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBudget(b);
    setCategory(b.category);
    setAmount(b.amount.toString());
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setModalError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      setModalError('Please enter a valid budget amount of at least 1.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, { amount: numAmount });
      } else {
        await budgetService.createBudget({
          category,
          amount: numAmount,
          month: selectedMonth,
          year: selectedYear,
        });
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget ceiling?')) {
      try {
        await budgetService.deleteBudget(id);
        fetchBudgets();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete budget.');
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-primaryText tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs text-secondaryText mt-0.5">
            Set and track monthly spending targets by category with real-time utilization telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-borderColor rounded-xl px-3 py-1.5 shadow-sm text-xs font-medium text-primaryText">
            <Calendar className="w-3.5 h-3.5 text-royalBlue" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent focus:outline-none text-xs font-semibold"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent focus:outline-none text-xs font-semibold"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Create Budget
          </Button>
        </div>
      </div>

      {/* Monthly Budget Summary Banner */}
      <div className="bg-white border border-borderColor rounded-2xl p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              {monthNames[selectedMonth - 1]} {selectedYear} Overall Budget
            </span>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-extrabold text-primaryText tracking-tight">
                {formatCurrency(summary?.totalSpent || 0, currency)}
              </h2>
              <span className="text-sm font-semibold text-secondaryText">
                spent of {formatCurrency(summary?.totalBudget || 0, currency)} budgeted
              </span>
            </div>
            <p className="text-xs text-secondaryText">
              Remaining buffer:{' '}
              <span className="font-bold text-royalBlue">
                {formatCurrency(summary?.totalRemaining || 0, currency)}
              </span>
            </p>
          </div>

          <div className="lg:w-72 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-primaryText">Overall Utilization</span>
              <span
                className={
                  (summary?.overallUtilization || 0) >= 100
                    ? 'text-expenseRed'
                    : (summary?.overallUtilization || 0) >= 80
                    ? 'text-amber-600'
                    : 'text-incomeGreen'
                }
              >
                {summary?.overallUtilization || 0}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (summary?.overallUtilization || 0) >= 100
                    ? 'bg-expenseRed'
                    : (summary?.overallUtilization || 0) >= 80
                    ? 'bg-amber-500'
                    : 'bg-royalBlue'
                }`}
                style={{
                  width: `${Math.min(100, summary?.overallUtilization || 0)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div>
        <h3 className="text-sm font-bold text-primaryText uppercase tracking-wider mb-3">
          Category Budgets ({budgets.length})
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : budgets.length === 0 ? (
          <EmptyState
            icon={PieChart}
            title="No budgets configured for this month"
            description="Create category budgets to set spending boundaries and avoid unexpected month-end surprises."
            actionLabel="Create Budget"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const isOver = b.isExceeded;
              const isWarning = b.utilization >= 80 && !isOver;
              const barColor = isOver
                ? 'bg-expenseRed'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-royalBlue';

              return (
                <Card
                  key={b._id}
                  hoverEffect
                  className="flex flex-col justify-between relative group"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-primaryText">
                          {b.category}
                        </span>
                        {isOver ? (
                          <Badge variant="danger" size="xs">
                            <AlertTriangle className="w-3 h-3" /> Exceeded
                          </Badge>
                        ) : isWarning ? (
                          <Badge variant="warning" size="xs">
                            Near Limit
                          </Badge>
                        ) : (
                          <Badge variant="success" size="xs">
                            On Track
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 text-secondaryText hover:text-royalBlue rounded-lg transition-colors"
                          title="Edit budget"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBudget(b._id)}
                          className="p-1 text-secondaryText hover:text-expenseRed rounded-lg transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Numbers */}
                    <div className="space-y-1 mb-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-extrabold text-primaryText tracking-tight">
                          {formatCurrency(b.spent, currency)}
                        </span>
                        <span className="text-xs text-secondaryText font-medium">
                          Limit: {formatCurrency(b.amount, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, b.utilization)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-secondaryText">
                        <span className="font-semibold text-slate-700">
                          {b.utilization}% spent
                        </span>
                        <span>
                          {isOver
                            ? `Over by ${formatCurrency(b.spent - b.amount, currency)}`
                            : `${formatCurrency(b.remaining, currency)} remaining`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Edit Budget Cap' : 'Create Monthly Budget'}
        subtitle={`Set expenditure ceiling for ${monthNames[selectedMonth - 1]} ${selectedYear}`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-errorBg text-expenseRed text-xs font-medium border border-red-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Category
            </label>
            <select
              disabled={!!editingBudget}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all disabled:opacity-60"
            >
              <option value="Total">Total Monthly Spending (Overall Cap)</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primaryText mb-1.5">
              Monthly Budget Limit <span className="text-expenseRed">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondaryText font-medium text-sm">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-slate-50 border border-borderColor rounded-xl text-primaryText font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-royalBlue/30 focus:border-royalBlue transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-borderColor">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              {editingBudget ? 'Update Budget' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;
