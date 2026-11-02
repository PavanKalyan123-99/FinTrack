const Budget = require('../models/Budget');
const { Transaction } = require('../models/Transaction');

// @desc    Get user budgets with current spending utilization
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Find budgets configured for this month/year
    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    }).lean();

    // Calculate start and end date for that month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate user expenses for that month by category
    const expenseAggregation = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendingByCategory = {};
    let totalMonthlyExpenses = 0;
    expenseAggregation.forEach((item) => {
      spendingByCategory[item._id] = item.totalSpent;
      totalMonthlyExpenses += item.totalSpent;
    });

    let totalBudgetedAmount = 0;
    let totalBudgetSpent = 0;

    const enrichedBudgets = budgets.map((b) => {
      const spent = b.category === 'Total'
        ? totalMonthlyExpenses
        : (spendingByCategory[b.category] || 0);

      const remaining = Math.max(0, b.amount - spent);
      const isExceeded = spent > b.amount;
      const utilization = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

      if (b.category !== 'Total') {
        totalBudgetedAmount += b.amount;
        totalBudgetSpent += spent;
      }

      return {
        ...b,
        spent,
        remaining,
        isExceeded,
        utilization,
        status: utilization >= 100 ? 'exceeded' : utilization >= 80 ? 'warning' : 'good',
      };
    });

    res.status(200).json({
      success: true,
      data: enrichedBudgets,
      summary: {
        month,
        year,
        totalBudget: totalBudgetedAmount,
        totalSpent: totalMonthlyExpenses,
        totalRemaining: Math.max(0, totalBudgetedAmount - totalMonthlyExpenses),
        overallUtilization:
          totalBudgetedAmount > 0
            ? Math.round((totalMonthlyExpenses / totalBudgetedAmount) * 100)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, amount, month, and year.',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be at least 1.',
      });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    // Upsert budget for category + month + year
    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user._id,
        category: category.trim(),
        month: m,
        year: y,
      },
      {
        amount: numAmount,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Budget saved successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget by ID
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be at least 1.',
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { amount: numAmount },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
      message: 'Budget updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget by ID
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
