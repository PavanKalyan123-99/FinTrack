const { Transaction } = require('../models/Transaction');

// @desc    Get user transactions with filters, search & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      search,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ];
    }

    const sortOptions = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'amount') {
      sortOptions.amount = order;
    } else if (sortBy === 'title') {
      sortOptions.title = order;
    } else {
      sortOptions.date = order;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * pageLimit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortOptions).skip(skip).limit(pageLimit),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNumber,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, description, paymentMethod, date } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type (income/expense), and category.',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0.',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      description: description ? description.trim() : '',
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access unauthorized.',
      });
    }

    const { title, amount, type, category, description, paymentMethod, date } = req.body;

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than 0.',
        });
      }
      transaction.amount = numAmount;
    }

    if (title) transaction.title = title.trim();
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description.trim();
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (date) transaction.date = new Date(date);

    await transaction.save();

    res.status(200).json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
