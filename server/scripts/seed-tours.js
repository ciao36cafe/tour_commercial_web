import mongoose from 'mongoose';
import dotenv from 'dotenv';
import db from '../db.js';
import { Tour } from '../models/index.js';

// Import the tours data
import { TOURS } from '../../src/apps/data/tours.js';

dotenv.config();

async function seedTours() {
  try {
    await db.connect();
    
    console.log('🌱 Seeding tours data...');
    
    let inserted = 0;
    let skipped = 0;

    for (const tourData of TOURS) {
      // Check if tour already exists
      const existingTour = await Tour.findOne({ id: tourData.id });
      
      if (existingTour) {
        console.log(`⏭️ Skipping ${tourData.id} - already exists`);
        skipped++;
        continue;
      }

      // Create the tour
      const tour = new Tour(tourData);
      await tour.save();
      inserted++;
      console.log(`✅ Inserted: ${tourData.name}`);
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Inserted: ${inserted} tours`);
    console.log(`   ⏭️ Skipped: ${skipped} tours`);
    console.log(`   📚 Total: ${await Tour.countDocuments()} tours in database`);
    
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedTours();