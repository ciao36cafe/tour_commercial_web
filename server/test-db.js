import db from './db.js';

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await db.connect();
    
    const isConnected = db.isConnectedToDB();
    console.log(`📊 Connection status: ${isConnected ? '✅ Connected' : '❌ Disconnected'}`);
    
    if (isConnected) {
      const connection = db.getConnection();
      console.log(`📁 Database name: ${connection.db.databaseName}`);
      console.log(`📊 Collections: ${connection.collections ? Object.keys(connection.collections).length : 0}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();