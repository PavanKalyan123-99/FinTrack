const AIInsight = require('../models/AIInsight');
const { generateInsights, chatWithAdvisor, analyzeFinancialData } = require('../services/aiService');

// @desc    Get AI insights for the current user
// @route   GET /api/ai/insights
// @access  Private
const getAIInsights = async (req, res, next) => {
  try {
    const refresh = req.query.refresh === 'true';

    let insights = [];
    if (!refresh) {
      insights = await AIInsight.find({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (insights.length === 0 || refresh) {
      insights = await generateInsights(req.user._id);
    }

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask AI Financial Advisor a question
// @route   POST /api/ai/ask
// @access  Private
const askAIAdvisor = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question or topic for the AI advisor.',
      });
    }

    const reply = await chatWithAdvisor(req.user._id, message.trim());

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Financial Health Score and diagnostics
// @route   GET /api/ai/health-score
// @access  Private
const getHealthScore = async (req, res, next) => {
  try {
    const analysis = await analyzeFinancialData(req.user._id);

    let status = 'Fair';
    if (analysis.score >= 85) status = 'Excellent';
    else if (analysis.score >= 70) status = 'Good';
    else if (analysis.score < 50) status = 'Needs Immediate Attention';

    res.status(200).json({
      success: true,
      data: {
        score: analysis.score,
        status,
        savingsRate: analysis.savingsRate,
        overrunsCount: analysis.budgetAlerts.length,
        budgetAlerts: analysis.budgetAlerts,
        monthlySavings: analysis.savings,
        incomeTotal: analysis.incomeTotal,
        expenseTotal: analysis.expenseTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIInsights,
  askAIAdvisor,
  getHealthScore,
};
