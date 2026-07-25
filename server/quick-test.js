import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'ciao36cafe_db'; // Change this to your actual DB name

console.log('🔌 Testing connection...');
console.log(`📊 Database: ${dbName}`);
console.log(`🔗 URI: ${uri.split('?')[0]}...`); // Hide full URI for security

// Remove deprecated options - just use simple connection
mongoose.connect(uri, {
  dbName: dbName
})
.then(() => {
  console.log('✅ Connected successfully!');
  console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
  console.log(`🔗 Host: ${mongoose.connection.host}`);
  
  // List collections
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log(`📚 Collections: ${collections.map(c => c.name).join(', ')}`);
      process.exit(0);
    })
    .catch(err => {
      console.log('📚 No collections found or error listing:', err.message);
      process.exit(0);
    });
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  
  // Helpful error messages
  if (err.message.includes('bad auth')) {
    console.error('💡 Username or password is incorrect');
    console.error('   Check your credentials in the connection string');
  }
  if (err.message.includes('ENOTFOUND')) {
    console.error('💡 Cannot reach MongoDB cluster');
    console.error('   Check your internet connection and cluster URL');
  }
  if (err.message.includes('queryTxt')) {
    console.error('💡 DNS resolution failed');
    console.error('   Make sure your connection string is correct');
  }
  if (err.message.includes('Authentication failed')) {
    console.error('💡 Authentication failed - check username and password');
  }
  
  process.exit(1);
});