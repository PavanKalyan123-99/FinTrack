const { Transaction } = require('../models/Transaction');

// @desc    Get detailed report for a specific period
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyReport = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};
    const incomeByCategory = {};
    const paymentMethodStats = {};

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeByCategory[tx.category] = (incomeByCategory[tx.category] || 0) + tx.amount;
      } else {
        totalExpense += tx.amount;
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      }

      paymentMethodStats[tx.paymentMethod] = (paymentMethodStats[tx.paymentMethod] || 0) + tx.amount;
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

    res.status(200).json({
      success: true,
      report: {
        month,
        year,
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        transactionCount: transactions.length,
        expenseByCategory,
        incomeByCategory,
        paymentMethodStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/reports/export
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, category, startDate, endDate } = req.query;

    const query = { userId };
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    // Generate CSV string
    const headers = ['Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = transactions.map((t) => {
      const formattedDate = new Date(t.date).toISOString().split('T')[0];
      const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const cleanDesc = `"${(t.description || '').replace(/"/g, '""')}"`;
      const cleanCat = `"${(t.category || '').replace(/"/g, '""')}"`;
      const cleanPayment = `"${(t.paymentMethod || '').replace(/"/g, '""')}"`;

      return [
        formattedDate,
        t.type,
        cleanTitle,
        cleanCat,
        t.amount.toFixed(2),
        cleanPayment,
        cleanDesc,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="fintrack-export-${Date.now()}.csv"`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyReport,
  exportTransactionsCSV,
};
