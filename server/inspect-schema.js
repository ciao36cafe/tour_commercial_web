import mongoose from 'mongoose';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

async function inspectSchema() {
  try {
    await db.connect();
    
    const connection = db.getConnection();
    const collections = ['tours', 'candidates', 'tourstops', 'tourtemplates'];
    
    console.log('\n🔍 Inspecting Collection Schemas:');
    console.log('═══════════════════════════════════');
    
    for (const collectionName of collections) {
      const collection = connection.collection(collectionName);
      const sample = await collection.findOne();
      
      console.log(`\n📁 Collection: ${collectionName}`);
      console.log(`   Total documents: ${await collection.countDocuments()}`);
      
      if (sample) {
        console.log('   Sample document structure:');
        const keys = Object.keys(sample);
        keys.forEach(key => {
          const value = sample[key];
          let type = typeof value;
          if (value instanceof Date) type = 'Date';
          else if (value instanceof mongoose.Types.ObjectId) type = 'ObjectId';
          else if (Array.isArray(value)) type = 'Array';
          console.log(`      - ${key}: ${type}`);
        });
      } else {
        console.log('   (Collection is empty)');
      }
    }
    
    console.log('\n═══════════════════════════════════');
    
    await db.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

inspectSchema();