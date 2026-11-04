import React, { useState, useEffect } from 'react';
import TransactionList from '../components/transactions/TransactionList';
import Card from '../components/common/Card';
import { analyticsService } from '../services/analyticsService';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Award, DollarSign } from 'lucide-react';

const Income = () => {
  const { user } = useAuth();
  const { refreshKey } = useFinance();
  const currency = user?.currency || 'INR';

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchIncomeStats = async () => {
      try {
        const res = await analyticsService.getSummary();
        if (res.success) {
          setSummary(res.data);
        }
      } catch (err) {
        console.error('Error fetching income summary:', err);
      }
    };
    fetchIncomeStats();
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      {/* Income Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Monthly Inflow
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-incomeGreen flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-incomeGreen tracking-tight">
            {formatCurrency(summary?.currentMonth?.income || 0, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Current calendar month</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Cumulative All-Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-royalBlue/10 text-royalBlue flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-primaryText tracking-tight">
            {formatCurrency(summary?.totalIncome || 0, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Total recorded earnings</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Monthly Savings Retention
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-skyFocus flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-skyFocus tracking-tight">
            {summary?.currentMonth?.savingsRate || 0}%
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Kept after all expenses</p>
        </Card>
      </div>

      {/* Income Table List */}
      <TransactionList
        forcedType="income"
        title="Income Management"
        subtitle="Manage paychecks, freelancing invoices, investments and stipends"
      />
    </div>
  );
};

export default Income;
