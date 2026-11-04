import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ChartSkeleton, CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const Analytics = () => {
  const { user } = useAuth();
  const { refreshKey } = useFinance();
  const currency = user?.currency || 'INR';

  const [period, setPeriod] = useState('month'); // 'month' | 'year' | 'all'
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, monthRes, catRes, weekRes] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getMonthlyTrends(12),
        analyticsService.getCategoryBreakdown(period),
        analyticsService.getWeeklySpending(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (monthRes.success) setMonthlyData(monthRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (weekRes.success) setWeeklyData(weekRes.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period, refreshKey]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await reportService.downloadCSV();
    } catch (err) {
      alert('Failed to download CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentMonth = summary?.currentMonth || {
    income: 0,
    expenses: 0,
    savings: 0,
    savingsRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-primaryText tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs text-secondaryText mt-0.5">
            Deep financial intelligence, multi-timeframe trajectory and spending breakdowns
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Toggle */}
          <div className="flex items-center bg-white border border-borderColor rounded-xl p-1 shadow-sm text-xs">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                period === 'month'
                  ? 'bg-royalBlue text-white shadow-sm'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                period === 'year'
                  ? 'bg-royalBlue text-white shadow-sm'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                period === 'all'
                  ? 'bg-royalBlue text-white shadow-sm'
                  : 'text-secondaryText hover:text-primaryText'
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            isLoading={isExporting}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Total Inflow
            </span>
            <ArrowUpRight className="w-4 h-4 text-incomeGreen" />
          </div>
          <p className="text-2xl font-bold text-incomeGreen tracking-tight">
            {formatCurrency(currentMonth.income, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Current monthly revenue</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Total Outflow
            </span>
            <ArrowDownRight className="w-4 h-4 text-expenseRed" />
          </div>
          <p className="text-2xl font-bold text-expenseRed tracking-tight">
            {formatCurrency(currentMonth.expenses, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Current monthly expenses</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Net Surplus
            </span>
            <TrendingUp className="w-4 h-4 text-royalBlue" />
          </div>
          <p className="text-2xl font-bold text-royalBlue tracking-tight">
            {formatCurrency(currentMonth.savings, currency)}
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Retained this month</p>
        </Card>

        <Card hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
              Savings Rate
            </span>
            <span className="text-xs font-bold text-skyFocus bg-softCloud/30 px-2 py-0.5 rounded-full">
              KPI
            </span>
          </div>
          <p className="text-2xl font-bold text-skyFocus tracking-tight">
            {currentMonth.savingsRate}%
          </p>
          <p className="text-[11px] text-secondaryText mt-1">Target benchmark: 20%+</p>
        </Card>
      </div>

      {/* 12-Month Inflow vs Outflow Bar Chart */}
      <Card
        title="12-Month Cashflow Trajectory"
        subtitle="Annual comparative trends between earned income and spent capital"
      >
        <div className="h-80 w-full pt-4">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B262C',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [
                    formatCurrency(val, currency),
                    name === 'income' ? 'Income' : 'Expenses',
                  ]}
                />
                <Bar
                  dataKey="income"
                  fill="#0F4C75"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="expenses"
                  fill="#DC2626"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-secondaryText">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-royalBlue" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-expenseRed" />
            <span>Expenses</span>
          </div>
        </div>
      </Card>

      {/* Category Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <Card
          title="Expense Category Breakdown"
          subtitle={`Spending distribution for ${period === 'month' ? 'this month' : period === 'year' ? 'this year' : 'all time'}`}
        >
          <div className="h-72 w-full flex items-center justify-center">
            {categories.length === 0 ? (
              <EmptyState
                icon={PieIcon}
                title="No category data"
                description="Record expense entries to view detailed categorical analysis."
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.category] || '#3282B8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B262C',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    formatter={(val, name) => [
                      formatCurrency(val, currency),
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Detailed Table Breakdown */}
        <Card
          title="Category Expenditure Details"
          subtitle="Ranked in descending order of capital volume"
          noPadding
        >
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-borderColor text-[11px] font-semibold text-secondaryText uppercase">
                <tr>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-4 text-center">Entries</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-6 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderColor/60">
                {categories.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50/70">
                    <td className="py-3 px-6 font-semibold text-primaryText flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[cat.category] || '#3282B8',
                        }}
                      />
                      {cat.category}
                    </td>
                    <td className="py-3 px-4 text-center text-secondaryText">
                      {cat.count}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-primaryText">
                      {formatCurrency(cat.amount, currency)}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <span className="font-semibold text-royalBlue bg-softCloud/30 px-2 py-0.5 rounded-md">
                        {cat.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
