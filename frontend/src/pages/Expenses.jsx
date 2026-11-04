import React, { useState, useEffect } from 'react';
import TransactionList from '../components/transactions/TransactionList';
import Card from '../components/common/Card';
import { analyticsService } from '../services/analyticsService';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { TrendingDown, CreditCard, PieChart } from 'lucide-react';

const Expenses = () => {
  const { user } = useAuth();
  const { refreshKey } = useFinance();
  const currency = user?.currency || 'INR';

  const [summary, setSummary] = useState(null);
  const [topCategory, setTopCategory] = useState(null);

  useEffect(() => {
    const fetchExpenseStats = async () => {
      try {
        const [sumRes, catRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getCategoryBreakdown('month'),
        ]);

        if (sumRes.success) {
          setSummary(sumRes.data);
        }
        if (catRes.success && catRes.data.length > 0) {
          setTopCategory(catRes.data[0]);
        }
      } catch (err) {
        console.error('Error fetching expense stats:', err);
      }
    };
    fetchExpenseStats();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Expense Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Monthly Outflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-expenseRed flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-expenseRed tracking-tight">
            {formatCurrency(summary?.currentMonth?.expenses || 0, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Current calendar month</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Cumulative Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-royalBlue/10 text-royalBlue flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primaryText tracking-tight">
            {formatCurrency(summary?.totalExpenses || 0, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">All-time recorded outflow</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Top Expense Category
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-primaryText tracking-tight truncate">
            {topCategory?.category || 'None'}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">
            {topCategory ? `${formatCurrency(topCategory.amount, currency)} (${topCategory.percentage}%)` : 'No expenses yet'}
          </p>
        </Card>
      </div>

      {/* Expenses Table List */}
      <TransactionList
        forcedType="expense"
        title="Expense Management"
        subtitle="Track, categorize, analyze, and optimize your personal spending"
      />
    </div>
  );
};

export default Expenses;
