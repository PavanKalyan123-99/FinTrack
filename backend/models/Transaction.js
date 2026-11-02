const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Healthcare',
  'Bills',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Scholarship',
  'Freelancing',
  'Business',
  'Investments',
  'Other',
];

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Bank Transfer',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} is not a valid transaction type (income or expense)',
      },
      required: [true, 'Please specify transaction type'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      validate: {
        validator: function (val) {
          if (this.type === 'income') {
            return INCOME_CATEGORIES.includes(val);
          }
          return EXPENSE_CATEGORIES.includes(val);
        },
        message: 'Invalid category for transaction type',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'UPI',
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user transactions by date efficiently
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

module.exports = {
  Transaction: mongoose.model('Transaction', transactionSchema),
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
};
