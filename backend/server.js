require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { autoSeedIfEmpty } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database (with automatic in-memory fallback for local dev if needed)
  await connectDB();

  // Populate realistic demo dataset if DB is empty
  await autoSeedIfEmpty();

  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 FinTrack Backend Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
};

startServer();
