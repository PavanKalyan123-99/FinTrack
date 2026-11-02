const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');
const AIInsight = require('../models/AIInsight');

/**
 * Perform algorithmic financial diagnostic on user's real data
 */
const analyzeFinancialData = async (userId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Fetch current month transactions
  const transactions = await Transaction.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).lean();

  const budgets = await Budget.find({
    userId,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }).lean();

  let incomeTotal = 0;
  let expenseTotal = 0;
  const categoryExpenses = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      incomeTotal += tx.amount;
    } else {
      expenseTotal += tx.amount;
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
    }
  });

  const savings = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? Math.max(0, Math.round((savings / incomeTotal) * 100)) : 0;

  // Check budget overruns
  const budgetAlerts = [];
  budgets.forEach((b) => {
    const spent = b.category === 'Total' ? expenseTotal : (categoryExpenses[b.category] || 0);
    if (spent > b.amount) {
      budgetAlerts.push({
        category: b.category,
        budget: b.amount,
        spent,
        overrun: spent - b.amount,
      });
    }
  });

  // Calculate Financial Health Score (0 - 100)
  let score = 50; // base

  // Savings rate contribution (up to +30 points)
  if (savingsRate >= 30) score += 30;
  else if (savingsRate >= 20) score += 20;
  else if (savingsRate >= 10) score += 10;
  else if (savingsRate > 0) score += 5;
  else score -= 15; // spending exceeds income

  // Budget discipline (up to +20 points)
  if (budgetAlerts.length === 0 && budgets.length > 0) {
    score += 20;
  } else if (budgetAlerts.length > 0) {
    score -= budgetAlerts.length * 10;
  }

  score = Math.max(10, Math.min(98, score));

  return {
    incomeTotal,
    expenseTotal,
    savings,
    savingsRate,
    categoryExpenses,
    budgetAlerts,
    score,
    transactionCount: transactions.length,
  };
};

/**
 * Generate AI Insights using Gemini API or rule-based fallback
 */
const generateInsights = async (userId) => {
  const stats = await analyzeFinancialData(userId);
  const insights = [];

  const apiKey = process.env.GEMINI_API_KEY;
  let geminiUsed = false;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
You are FinTrack's Chief Financial Advisor AI. Analyze the following user monthly financial metrics:
- Total Income: ₹${stats.incomeTotal}
- Total Expenses: ₹${stats.expenseTotal}
- Monthly Savings: ₹${stats.savings} (${stats.savingsRate}% savings rate)
- Category Expenses: ${JSON.stringify(stats.categoryExpenses)}
- Budget Overruns: ${JSON.stringify(stats.budgetAlerts)}
- Financial Health Score: ${stats.score}/100

Generate 3 to 4 concise, high-value, actionable bullet points (under 30 words each) categorized into:
- Category (Spending, Savings, Budget, or Recommendation)
- Severity (info, warning, success, or tip)
- Insight text

Format your output strictly as a JSON array of objects with keys: "insight", "category", "severity".
Do not include markdown codeblocks or extra text.
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        geminiUsed = true;
        for (const item of parsed) {
          insights.push({
            userId,
            insight: item.insight,
            category: item.category || 'General',
            severity: item.severity || 'info',
            period: 'monthly',
          });
        }
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, falling back to intelligent rule engine:', err.message);
    }
  }

  // Fallback intelligent analytical heuristics if Gemini is not configured or failed
  if (!geminiUsed || insights.length === 0) {
    if (stats.transactionCount === 0) {
      insights.push({
        userId,
        insight: 'Welcome to FinTrack! Add your first income and expenses to unlock personalized AI financial recommendations.',
        category: 'General',
        severity: 'info',
        period: 'monthly',
      });
    } else {
      // 1. Savings rate insight
      if (stats.savingsRate >= 20) {
        insights.push({
          userId,
          insight: `Exceptional savings discipline! You are saving ${stats.savingsRate}% of your income this month, outperforming the standard 20% benchmark.`,
          category: 'Savings',
          severity: 'success',
          period: 'monthly',
        });
      } else if (stats.savingsRate > 0) {
        insights.push({
          userId,
          insight: `You are currently saving ${stats.savingsRate}% of your income. Aiming for 20% savings would boost your emergency buffer by ₹${Math.round(stats.incomeTotal * 0.2 - stats.savings)}.`,
          category: 'Savings',
          severity: 'tip',
          period: 'monthly',
        });
      } else if (stats.incomeTotal > 0 && stats.savings < 0) {
        insights.push({
          userId,
          insight: `Alert: Current expenses exceed income by ₹${Math.abs(stats.savings)}. Consider trimming discretionary categories to stop deficit.`,
          category: 'Spending',
          severity: 'warning',
          period: 'monthly',
        });
      }

      // 2. Highest expense category
      const categoriesSorted = Object.entries(stats.categoryExpenses).sort((a, b) => b[1] - a[1]);
      if (categoriesSorted.length > 0) {
        const [topCat, topAmount] = categoriesSorted[0];
        const topPercent = stats.expenseTotal > 0 ? Math.round((topAmount / stats.expenseTotal) * 100) : 0;
        if (topPercent >= 35) {
          insights.push({
            userId,
            insight: `High Category Concentration: ${topCat} represents ${topPercent}% (₹${topAmount.toLocaleString()}) of your total expenses. Look for quick reduction opportunities here.`,
            category: 'Spending',
            severity: 'warning',
            period: 'monthly',
          });
        }
      }

      // 3. Budget alerts
      if (stats.budgetAlerts.length > 0) {
        const topOverrun = stats.budgetAlerts[0];
        insights.push({
          userId,
          insight: `Budget Exceeded in ${topOverrun.category} by ₹${topOverrun.overrun.toLocaleString()}. Total spent: ₹${topOverrun.spent.toLocaleString()} vs limit of ₹${topOverrun.budget.toLocaleString()}.`,
          category: 'Budget',
          severity: 'warning',
          period: 'monthly',
        });
      } else {
        insights.push({
          userId,
          insight: `All category budgets are well under control this month. Excellent adherence to financial discipline!`,
          category: 'Budget',
          severity: 'success',
          period: 'monthly',
        });
      }

      // 4. Recommendation
      insights.push({
        userId,
        insight: `Pro-tip: Allocate income using the 50/30/20 rule (50% Needs, 30% Wants, 20% Savings/Investments) for balanced long-term wealth building.`,
        category: 'Recommendation',
        severity: 'tip',
        period: 'monthly',
      });
    }
  }

  // Persist generated insights in AIInsight collection
  await AIInsight.deleteMany({ userId });
  await AIInsight.insertMany(insights);

  return insights;
};

/**
 * Handle Conversational AI Advisor queries
 */
const chatWithAdvisor = async (userId, userMessage) => {
  const stats = await analyzeFinancialData(userId);
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `
You are FinTrack AI, an elite personal finance strategist and financial coach.
The user is asking a question about their finances.
Context on user's current month finances:
- Total Income: ₹${stats.incomeTotal}
- Total Expenses: ₹${stats.expenseTotal}
- Net Savings: ₹${stats.savings}
- Savings Rate: ${stats.savingsRate}%
- Category Expenses: ${JSON.stringify(stats.categoryExpenses)}
- Budget Overruns: ${JSON.stringify(stats.budgetAlerts)}
- Financial Health Score: ${stats.score}/100

Guidelines:
- Give empathetic, professional, clear, and actionable advice tailored to their real figures.
- Keep answers structured with short paragraphs or bullet points.
- Do not give disclaimer disclaimers like "I am an AI"; be direct, confident, and constructive.
User question: "${userMessage}"
`;

      const result = await model.generateContent(systemPrompt);
      return result.response.text();
    } catch (err) {
      console.warn('[AI Service] Gemini chat failed, using expert financial reasoning fallback:', err.message);
    }
  }

  // Heuristic analytical conversational engine fallback
  const lower = (userMessage || '').toLowerCase();

  if (lower.includes('cut') || lower.includes('save') || lower.includes('reduce')) {
    const cats = Object.entries(stats.categoryExpenses).sort((a, b) => b[1] - a[1]);
    const topCat = cats.length > 0 ? `${cats[0][0]} (₹${cats[0][1].toLocaleString()})` : 'Discretionary items';
    return `Based on your recent financial records, your highest spending category this month is **${topCat}**. 

Here are 3 tailored actions to cut expenses immediately:
1. **Audit ${cats.length > 0 ? cats[0][0] : 'Shopping/Dining'}**: Identify subscriptions or impulse purchases that can be deferred or paused.
2. **Implement a 48-Hour Rule**: Before making non-essential purchases over ₹1,000, wait 48 hours to assess necessity.
3. **Automate Savings First**: Divert at least 15% of your income to a separate savings account the day you receive it, rather than saving what is left over.`;
  }

  if (lower.includes('budget') || lower.includes('limit')) {
    return `Looking at your current monthly budget status:
- Total Income: ₹${stats.incomeTotal.toLocaleString()}
- Total Spent: ₹${stats.expenseTotal.toLocaleString()}
- Current Savings: ₹${stats.savings.toLocaleString()} (${stats.savingsRate}%)

${stats.budgetAlerts.length > 0
  ? `⚠️ You currently have budget overruns in: **${stats.budgetAlerts.map(b => `${b.category} (+₹${b.overrun})`).join(', ')}**. Consider moving funds from surplus categories.`
  : `✅ All your monitored budgets are within target limits so far.`
}

Recommended Framework: Apply the **50/30/20 guideline**:
- **50% Needs**: Essential bills, groceries, housing (~₹${Math.round(stats.incomeTotal * 0.5).toLocaleString()})
- **30% Wants**: Entertainment, dining, hobbies (~₹${Math.round(stats.incomeTotal * 0.3).toLocaleString()})
- **20% Savings & Debt Repayment**: (~₹${Math.round(stats.incomeTotal * 0.2).toLocaleString()})`;
  }

  if (lower.includes('health') || lower.includes('score')) {
    return `Your **FinTrack Financial Health Score is ${stats.score}/100** (${stats.score >= 80 ? 'Excellent' : stats.score >= 60 ? 'Good' : 'Needs Attention'}).

Key Breakdown:
- **Savings Rate**: ${stats.savingsRate}% (${stats.savingsRate >= 20 ? 'Strong' : 'Room to grow'})
- **Budget Discipline**: ${stats.budgetAlerts.length === 0 ? 'No budget overruns' : `${stats.budgetAlerts.length} categories exceeded`}
- **Monthly Net**: ${stats.savings >= 0 ? `+₹${stats.savings.toLocaleString()}` : `-₹${Math.abs(stats.savings).toLocaleString()}`}

To reach a 90+ score, maintain a savings rate above 25% and keep all category expenses strictly within configured budgets for 2 consecutive months.`;
  }

  return `Hello! As your FinTrack Advisor, I have reviewed your current monthly financials:
- **Income**: ₹${stats.incomeTotal.toLocaleString()}
- **Expenses**: ₹${stats.expenseTotal.toLocaleString()}
- **Net Balance**: ₹${stats.savings.toLocaleString()}
- **Savings Rate**: ${stats.savingsRate}%

You can ask me anything about optimizing your spending, creating category budgets, retirement planning, or how to reach specific financial goals!`;
};

module.exports = {
  analyzeFinancialData,
  generateInsights,
  chatWithAdvisor,
};
