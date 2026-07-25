import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('Already connected to database');
      return;
    }

    try {
      const dbName = process.env.DB_NAME || 'test';
      const uri = process.env.MONGODB_URI;

      console.log(`🔌 Connecting to database: ${dbName}...`);

      await mongoose.connect(uri, {
        dbName: dbName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      this.isConnected = true;
      
      console.log(`✅ MongoDB connected to: ${mongoose.connection.db.databaseName}`);
      console.log(`📊 Host: ${mongoose.connection.host}`);
      
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    await mongoose.connection.close();
    this.isConnected = false;
    console.log('MongoDB disconnected');
  }

  getConnection() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return mongoose.connection;
  }

  isConnectedToDB() {
    return this.isConnected;
  }
}

export default new Database();