import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function listDatabases() {
  const uri = process.env.MONGODB_URI;
  
  console.log('🔍 Connecting to MongoDB Atlas to list databases...');
  
  // Remove any database name from URI for admin connection
  const baseUri = uri.split('?')[0];
  const cleanUri = baseUri.endsWith('/') ? baseUri : baseUri + '/';
  
  const client = new MongoClient(cleanUri, {
    // No deprecated options needed
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\n📚 Available Databases:');
    console.log('=========================');
    databases.databases.forEach(db => {
      console.log(`📁 ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    console.log('=========================');
    console.log(`\n💡 Your DB_NAME should be one of the above`);
    
    // Check if we can see collections in each database
    for (const dbInfo of databases.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local') {
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        if (collections.length > 0) {
          console.log(`\n📊 Database "${dbInfo.name}" has collections:`);
          collections.forEach(col => console.log(`   - ${col.name}`));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

listDatabases();