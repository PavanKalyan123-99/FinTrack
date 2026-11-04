import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  Bot,
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
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import { transactionService } from '../services/transactionService';
import { budgetService } from '../services/budgetService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_COLORS } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { CardSkeleton, ChartSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const { refreshKey, openAddTransaction } = useFinance();
  const currency = user?.currency || 'INR';

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [weeklySpending, setWeeklySpending] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        summaryRes,
        monthlyRes,
        categoryRes,
        weeklyRes,
        transactionsRes,
        budgetsRes,
        aiRes,
      ] = await Promise.allSettled([
        analyticsService.getSummary(),
        analyticsService.getMonthlyTrends(6),
        analyticsService.getCategoryBreakdown('month'),
        analyticsService.getWeeklySpending(),
        transactionService.getTransactions({ limit: 5 }),
        budgetService.getBudgets(),
        aiService.getInsights(false),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
        setSummary(summaryRes.value.data);
      }
      if (monthlyRes.status === 'fulfilled' && monthlyRes.value.success) {
        setMonthlyTrends(monthlyRes.value.data);
      }
      if (categoryRes.status === 'fulfilled' && categoryRes.value.success) {
        setCategories(categoryRes.value.data);
      }
      if (weeklyRes.status === 'fulfilled' && weeklyRes.value.success) {
        setWeeklySpending(weeklyRes.value.data);
      }
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value.success) {
        setRecentTransactions(transactionsRes.value.data);
      }
      if (budgetsRes.status === 'fulfilled' && budgetsRes.value.success) {
        setBudgets(budgetsRes.value.data);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value.success) {
        setAiInsights(aiRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Current formatted date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const currentMonthData = summary?.currentMonth || {
    income: 0,
    expenses: 0,
    savings: 0,
    savingsRate: 0,
  };

  const trends = summary?.trends || {
    incomeChangePercent: 0,
    expenseChangePercent: 0,
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondaryText">
            Financial Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primaryText tracking-tight mt-0.5">
            Welcome back, {user?.name || 'FinTrack User'} 👋
          </h1>
          <p className="text-xs text-secondaryText mt-1 flex items-center gap-2">
            <span>{todayFormatted}</span>
            <span>•</span>
            <span className="text-royalBlue font-medium">Real-time Financial Telemetry</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => openAddTransaction('expense')}
            className="shadow-sm shadow-royalBlue/20"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* 2. FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* 1. Total Balance */}
            <Card hoverEffect className="relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
                  Total Balance
                </span>
                <div className="w-9 h-9 rounded-xl bg-royalBlue/10 text-royalBlue flex items-center justify-center">
                  <Wallet className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-primaryText tracking-tight">
                {formatCurrency(summary?.currentBalance || 0, currency)}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-secondaryText">
                <span className="font-medium text-primaryText">Cumulative Cashflow</span>
                <span>•</span>
                <span>All Accounts</span>
              </div>
            </Card>

            {/* 2. Total Income */}
            <Card hoverEffect className="relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
                  Monthly Income
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-incomeGreen flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-incomeGreen tracking-tight">
                {formatCurrency(currentMonthData.income, currency)}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span
                  className={`flex items-center font-semibold ${
                    trends.incomeChangePercent >= 0
                      ? 'text-incomeGreen'
                      : 'text-expenseRed'
                  }`}
                >
                  {trends.incomeChangePercent >= 0 ? '+' : ''}
                  {trends.incomeChangePercent}%
                </span>
                <span className="text-secondaryText">vs last month</span>
              </div>
            </Card>

            {/* 3. Total Expenses */}
            <Card hoverEffect className="relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
                  Monthly Expenses
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-expenseRed flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-expenseRed tracking-tight">
                {formatCurrency(currentMonthData.expenses, currency)}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span
                  className={`flex items-center font-semibold ${
                    trends.expenseChangePercent > 0
                      ? 'text-expenseRed'
                      : 'text-incomeGreen'
                  }`}
                >
                  {trends.expenseChangePercent >= 0 ? '+' : ''}
                  {trends.expenseChangePercent}%
                </span>
                <span className="text-secondaryText">vs last month</span>
              </div>
            </Card>

            {/* 4. Monthly Savings */}
            <Card hoverEffect className="relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-secondaryText uppercase tracking-wider">
                  Monthly Savings
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-skyFocus flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 stroke-[2]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-royalBlue tracking-tight">
                {formatCurrency(currentMonthData.savings, currency)}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-secondaryText">
                <span className="font-bold text-skyFocus bg-softCloud/30 px-2 py-0.5 rounded-full">
                  {currentMonthData.savingsRate}% Rate
                </span>
                <span>of monthly inflow</span>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* 3. AI FINANCIAL INSIGHT BANNER */}
      {aiInsights.length > 0 && (
        <div className="bg-gradient-to-r from-royalBlue/10 via-softCloud/20 to-skyFocus/10 border border-royalBlue/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-royalBlue text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-royalBlue">
                  AI Recommendation
                </span>
                <Badge variant={aiInsights[0]?.severity || 'info'} size="xs">
                  {aiInsights[0]?.category}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm font-medium text-primaryText mt-1 leading-relaxed">
                {aiInsights[0]?.insight}
              </p>
            </div>
          </div>

          <Link
            to="/ai-assistant"
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-royalBlue hover:text-skyFocus transition-colors bg-white px-3.5 py-2 rounded-xl shadow-sm border border-royalBlue/10"
          >
            <span>Ask Advisor</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4. PRIMARY CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expenses (Bar Chart) - 2 Columns */}
        <div className="lg:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card
              title="Income vs Expenses Cashflow"
              subtitle="6-Month historical comparison (Inflows & Outflows)"
              className="h-full"
            >
              <div className="h-72 w-full pt-2">
                {monthlyTrends.length === 0 ? (
                  <EmptyState
                    title="No cashflow history"
                    description="Add income or expense transactions to view comparative cashflow graphs."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
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
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="expenses"
                        fill="#DC2626"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs font-medium text-secondaryText">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-royalBlue" />
                  <span>Income Inflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-expenseRed" />
                  <span>Expenses Outflow</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Category Expense Distribution (Pie / Donut) - 1 Column */}
        <div className="lg:col-span-1">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Card
              title="Category Distribution"
              subtitle="Current month expense allocation"
              className="h-full flex flex-col justify-between"
            >
              <div className="h-56 w-full flex items-center justify-center">
                {categories.length === 0 ? (
                  <EmptyState
                    icon={PieIcon}
                    title="No category data"
                    description="Record expenses to view spending breakdown."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={55}
                        outerRadius={80}
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

              {/* Top Categories Legend List */}
              <div className="space-y-2 mt-2 pt-2 border-t border-borderColor max-h-36 overflow-y-auto">
                {categories.slice(0, 4).map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: CATEGORY_COLORS[cat.category] || '#3282B8',
                        }}
                      />
                      <span className="font-medium text-primaryText truncate">
                        {cat.category}
                      </span>
                    </div>
                    <span className="font-semibold text-secondaryText">
                      {cat.percentage}% ({formatCurrency(cat.amount, currency)})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 5. SECONDARY CHARTS & BUDGET STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending Trends (Area Chart) */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card
            title="Weekly Spending Trajectory"
            subtitle="Daily expense pattern over the past 7 days"
          >
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklySpending}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="weeklyExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3282B8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3282B8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="day"
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
                    formatter={(val) => [formatCurrency(val, currency), 'Spending']}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3282B8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#weeklyExpenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Monthly Savings Trend (Line Chart) */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card
            title="Savings Accumulation Trend"
            subtitle="Net monthly capital saved over time"
          >
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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
                    formatter={(val) => [formatCurrency(val, currency), 'Net Savings']}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#16A34A"
                    strokeWidth={2.5}
                    dot={{ fill: '#16A34A', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* 6. BOTTOM ROW: RECENT TRANSACTIONS & BUDGET UTILIZATION PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List - 2 Columns */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Transactions"
            subtitle="Latest financial entries"
            action={
              <Link
                to="/transactions"
                className="text-xs font-semibold text-royalBlue hover:text-skyFocus flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
            noPadding
          >
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
                      <div className="space-y-1">
                        <div className="w-32 h-3.5 bg-slate-200 animate-pulse rounded" />
                        <div className="w-16 h-2.5 bg-slate-200 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="w-20 h-4 bg-slate-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No recent transactions"
                  description="Start by adding your daily income or expenses."
                  actionLabel="Add Transaction"
                  onAction={() => openAddTransaction('expense')}
                />
              </div>
            ) : (
              <div className="divide-y divide-borderColor/60">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-incomeGreen'
                              : 'bg-rose-50 text-expenseRed'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-primaryText truncate">
                            {tx.title}
                          </p>
                          <p className="text-[11px] text-secondaryText truncate mt-0.5">
                            {formatDate(tx.date)} • {tx.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold ${
                            isIncome ? 'text-incomeGreen' : 'text-expenseRed'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Budget Progress Overview - 1 Column */}
        <div className="lg:col-span-1">
          <Card
            title="Budget Utilization"
            subtitle="Monthly category ceilings"
            action={
              <Link
                to="/budgets"
                className="text-xs font-semibold text-royalBlue hover:text-skyFocus flex items-center gap-1 transition-colors"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="w-full h-3 bg-slate-200 animate-pulse rounded" />
                    <div className="w-full h-2 bg-slate-200 animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <EmptyState
                title="No active budgets"
                description="Set monthly spending limits for categories like Food, Bills, or Travel."
                actionLabel="Create Budget"
                onAction={() => openAddTransaction('expense')}
              />
            ) : (
              <div className="space-y-4">
                {budgets.slice(0, 4).map((b) => {
                  const isOver = b.isExceeded;
                  const isWarning = b.utilization >= 80 && !isOver;
                  const barColor = isOver
                    ? 'bg-expenseRed'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-royalBlue';

                  return (
                    <div key={b._id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primaryText">
                          {b.category}
                        </span>
                        <span className="font-bold text-slate-700">
                          {formatCurrency(b.spent, currency)} /{' '}
                          <span className="text-secondaryText font-medium">
                            {formatCurrency(b.amount, currency)}
                          </span>
                        </span>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.min(100, b.utilization)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-secondaryText">
                        <span>{b.utilization}% spent</span>
                        {isOver ? (
                          <span className="text-expenseRed font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Exceeded
                          </span>
                        ) : (
                          <span>{formatCurrency(b.remaining, currency)} left</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
