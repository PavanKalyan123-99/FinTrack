const { Transaction } = require('../models/Transaction');

// @desc    Get financial summary (balance, income, expenses, savings, changes)
// @route   GET /api/analytics/summary
// @access  Private
const getFinancialSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Current month boundaries
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Previous month boundaries
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. All-time income & expense
    const allTimeAgg = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    allTimeAgg.forEach((item) => {
      if (item._id === 'income') totalIncome = item.total;
      if (item._id === 'expense') totalExpenses = item.total;
    });

    const currentBalance = totalIncome - totalExpenses;

    // 2. Current Month Aggregation
    const currentMonthAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    currentMonthAgg.forEach((item) => {
      if (item._id === 'income') currentMonthIncome = item.total;
      if (item._id === 'expense') currentMonthExpenses = item.total;
    });

    const monthlySavings = currentMonthIncome - currentMonthExpenses;
    const savingsRate =
      currentMonthIncome > 0
        ? Math.max(0, Math.round((monthlySavings / currentMonthIncome) * 100))
        : 0;

    // 3. Previous Month Aggregation for trend comparisons
    const prevMonthAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let prevMonthIncome = 0;
    let prevMonthExpenses = 0;
    prevMonthAgg.forEach((item) => {
      if (item._id === 'income') prevMonthIncome = item.total;
      if (item._id === 'expense') prevMonthExpenses = item.total;
    });

    const incomeChangePercent =
      prevMonthIncome > 0
        ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100)
        : currentMonthIncome > 0 ? 100 : 0;

    const expenseChangePercent =
      prevMonthExpenses > 0
        ? Math.round(((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100)
        : currentMonthExpenses > 0 ? 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        currentBalance,
        totalIncome,
        totalExpenses,
        currentMonth: {
          income: currentMonthIncome,
          expenses: currentMonthExpenses,
          savings: monthlySavings,
          savingsRate,
        },
        trends: {
          incomeChangePercent,
          expenseChangePercent,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly income, expenses, and savings breakdown for charts (last 6 or 12 months)
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const monthsCount = parseInt(req.query.months, 10) || 6;

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);

    const agg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Build continuous array for the last N months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const results = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = `${monthNames[month - 1]} ${year.toString().slice(-2)}`;

      const inc = agg.find(
        (a) => a._id.year === year && a._id.month === month && a._id.type === 'income'
      );
      const exp = agg.find(
        (a) => a._id.year === year && a._id.month === month && a._id.type === 'expense'
      );

      const income = inc ? inc.total : 0;
      const expenses = exp ? exp.total : 0;
      const savings = income - expenses;

      results.push({
        label,
        year,
        month,
        income,
        expenses,
        savings,
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise expense distribution
// @route   GET /api/analytics/categories
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query; // 'month', 'year', 'all'

    const matchQuery = {
      userId,
      type: 'expense',
    };

    const now = new Date();
    if (period === 'month') {
      matchQuery.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    } else if (period === 'year') {
      matchQuery.date = {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    }

    const categoriesAgg = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalExpense = categoriesAgg.reduce((acc, curr) => acc + curr.total, 0);

    const data = categoriesAgg.map((item) => ({
      category: item._id,
      amount: item.total,
      count: item.count,
      percentage: totalExpense > 0 ? Math.round((item.total / totalExpense) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      totalExpense,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending trends for the last 7 days
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklySpending = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const agg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          date: { $gte: sevenDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dayNum = d.getDate();
      const dayName = days[d.getDay()];

      const match = agg.find(
        (a) => a._id.year === y && a._id.month === m && a._id.day === dayNum
      );

      weeklyData.push({
        day: dayName,
        date: `${m}/${dayNum}`,
        amount: match ? match.total : 0,
      });
    }

    res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getWeeklySpending,
};
