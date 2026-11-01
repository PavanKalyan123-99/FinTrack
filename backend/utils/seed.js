require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');
const AIInsight = require('../models/AIInsight');

const populateDemoData = async (shouldDisconnect = true) => {
  try {
    console.log('[Seed] Checking demo data...');
    const demoEmail = 'demo@fintrack.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (demoUser) {
      await Transaction.deleteMany({ userId: demoUser._id });
      await Budget.deleteMany({ userId: demoUser._id });
      await AIInsight.deleteMany({ userId: demoUser._id });
      await User.deleteOne({ _id: demoUser._id });
    }

    console.log('[Seed] Creating demo user...');
    demoUser = await User.create({
      name: 'Alex Morgan',
      email: demoEmail,
      password: 'password123',
      currency: 'INR',
      theme: 'minimalist-tech',
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    console.log('[Seed] Creating realistic demo transactions...');
    const transactions = [
      // Current Month Income
      {
        userId: demoUser._id,
        title: 'Monthly Tech Salary',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        description: 'Primary monthly employment direct deposit',
        paymentMethod: 'Bank Transfer',
        date: new Date(currentYear, currentMonth, 1),
      },
      {
        userId: demoUser._id,
        title: 'Web Dev Freelance Gig',
        amount: 22000,
        type: 'income',
        category: 'Freelancing',
        description: 'Fintech landing page redesign for client',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth, 12),
      },
      {
        userId: demoUser._id,
        title: 'Mutual Fund Dividend',
        amount: 4500,
        type: 'income',
        category: 'Investments',
        description: 'Quarterly index fund dividend payout',
        paymentMethod: 'Net Banking',
        date: new Date(currentYear, currentMonth, 18),
      },

      // Current Month Expenses
      {
        userId: demoUser._id,
        title: 'Apartment Rent & Maintenance',
        amount: 24000,
        type: 'expense',
        category: 'Bills',
        description: 'Monthly flat rent and society charges',
        paymentMethod: 'Net Banking',
        date: new Date(currentYear, currentMonth, 2),
      },
      {
        userId: demoUser._id,
        title: 'High-speed Fiber Internet',
        amount: 1499,
        type: 'expense',
        category: 'Bills',
        description: 'Monthly 300Mbps fiber broadband',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth, 4),
      },
      {
        userId: demoUser._id,
        title: 'Gourmet Grocery Restock',
        amount: 6850,
        type: 'expense',
        category: 'Food',
        description: 'Weekly organic groceries & pantry essentials',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth, 5),
      },
      {
        userId: demoUser._id,
        title: 'Dining Out with Team',
        amount: 3200,
        type: 'expense',
        category: 'Food',
        description: 'Italian dinner and drinks celebration',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth, 9),
      },
      {
        userId: demoUser._id,
        title: 'Metro & Cab Rides',
        amount: 2800,
        type: 'expense',
        category: 'Travel',
        description: 'Work commute metro card recharge & Uber rides',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth, 11),
      },
      {
        userId: demoUser._id,
        title: 'Ergonomic Desk Accessories',
        amount: 5400,
        type: 'expense',
        category: 'Shopping',
        description: 'Monitor arm and mechanical keyboard rest',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth, 14),
      },
      {
        userId: demoUser._id,
        title: 'Streaming & Cloud Subscriptions',
        amount: 1899,
        type: 'expense',
        category: 'Entertainment',
        description: 'Netflix, Spotify & GitHub Copilot',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth, 16),
      },
      {
        userId: demoUser._id,
        title: 'Quarterly Health Checkup & Vitamins',
        amount: 3500,
        type: 'expense',
        category: 'Healthcare',
        description: 'Routine blood panel and multivitamin refills',
        paymentMethod: 'Debit Card',
        date: new Date(currentYear, currentMonth, 20),
      },
      {
        userId: demoUser._id,
        title: 'Cloud Architecture Certification Exam',
        amount: 12500,
        type: 'expense',
        category: 'Education',
        description: 'AWS Solutions Architect professional exam voucher',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth, 22),
      },
      {
        userId: demoUser._id,
        title: 'Weekend Coffee & Brunch',
        amount: 1250,
        type: 'expense',
        category: 'Food',
        description: 'Artisan bakery coffee with friends',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth, 25),
      },

      // Previous Month Sample Data for Trend Analysis
      {
        userId: demoUser._id,
        title: 'Monthly Tech Salary (Previous Month)',
        amount: 85000,
        type: 'income',
        category: 'Salary',
        description: 'Previous month salary',
        paymentMethod: 'Bank Transfer',
        date: new Date(currentYear, currentMonth - 1, 1),
      },
      {
        userId: demoUser._id,
        title: 'Freelance UI Design',
        amount: 18000,
        type: 'income',
        category: 'Freelancing',
        description: 'Design consulting',
        paymentMethod: 'UPI',
        date: new Date(currentYear, currentMonth - 1, 15),
      },
      {
        userId: demoUser._id,
        title: 'Rent & Maintenance',
        amount: 24000,
        type: 'expense',
        category: 'Bills',
        paymentMethod: 'Net Banking',
        date: new Date(currentYear, currentMonth - 1, 3),
      },
      {
        userId: demoUser._id,
        title: 'Groceries & Supplies',
        amount: 9800,
        type: 'expense',
        category: 'Food',
        paymentMethod: 'Debit Card',
        date: new Date(currentYear, currentMonth - 1, 7),
      },
      {
        userId: demoUser._id,
        title: 'Weekend Getaway Train & Stay',
        amount: 8400,
        type: 'expense',
        category: 'Travel',
        paymentMethod: 'Credit Card',
        date: new Date(currentYear, currentMonth - 1, 19),
      },
    ];

    await Transaction.insertMany(transactions);

    console.log('[Seed] Creating demo budgets...');
    const budgets = [
      {
        userId: demoUser._id,
        category: 'Food',
        amount: 15000,
        month: currentMonth + 1,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: 'Bills',
        amount: 28000,
        month: currentMonth + 1,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: 'Travel',
        amount: 6000,
        month: currentMonth + 1,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: 'Shopping',
        amount: 10000,
        month: currentMonth + 1,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: 'Entertainment',
        amount: 4000,
        month: currentMonth + 1,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: 'Education',
        amount: 15000,
        month: currentMonth + 1,
        year: currentYear,
      },
      {
        userId: demoUser._id,
        category: 'Healthcare',
        amount: 5000,
        month: currentMonth + 1,
        year: currentYear,
      },
    ];

    await Budget.insertMany(budgets);

    console.log('==================================================');
    console.log('✅ Demo Seed Data successfully ready!');
    console.log(`Demo Credentials:`);
    console.log(`Email:    demo@fintrack.com`);
    console.log(`Password: password123`);
    console.log('==================================================');

    if (shouldDisconnect) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed Error]:', err);
    if (shouldDisconnect) {
      process.exit(1);
    }
  }
};

const seedDemoData = async () => {
  await connectDB();
  await populateDemoData(true);
};

const autoSeedIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('[AutoSeed] No users found in database. Initializing demo dataset...');
    await populateDemoData(false);
  }
};

if (require.main === module) {
  seedDemoData();
}

module.exports = { seedDemoData, populateDemoData, autoSeedIfEmpty };
