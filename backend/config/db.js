const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/[^@]+@/, '//***:***@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[Database] MongoDB Connected successfully via MONGODB_URI.');
      return;
    }
  } catch (err) {
    console.warn(`[Database] Warning: Could not connect to primary MONGODB_URI (${err.message}).`);
  }

  // Fallback to MongoMemoryServer for effortless local testing / development
  try {
    console.log('[Database] Initializing in-memory MongoDB fallback for local development...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'fintrack'
      }
    });
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[Database] In-memory MongoDB connected successfully at ${memUri}`);
    console.log('[Database] Tip: Configure MONGODB_URI in backend/.env to persist data across server restarts.');
  } catch (fallbackErr) {
    console.error('[Database] Failed to connect to any MongoDB instance:', fallbackErr.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
