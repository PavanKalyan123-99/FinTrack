const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    insight: {
      type: String,
      required: [true, 'Insight text is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Spending', 'Budget', 'Savings', 'Anomaly', 'Investment', 'Recommendation'],
    },
    period: {
      type: String,
      default: 'monthly',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'success', 'tip'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

aiInsightSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
