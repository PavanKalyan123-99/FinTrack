const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must belong to a user'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category for the budget'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide budget amount'],
      min: [1, 'Budget amount must be at least 1'],
    },
    month: {
      type: Number,
      required: [true, 'Please specify budget month (1-12)'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please specify budget year'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budgets for the same category in the same month/year
budgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
