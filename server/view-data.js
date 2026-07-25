import mongoose from 'mongoose';
import dotenv from 'dotenv';
import db from './db.js';
import { Tour, Candidate, TourStop, TourTemplate } from './models/index.js';

dotenv.config();

async function viewData() {
  try {
    await db.connect();
    
    console.log('\n📊 Database Contents:');
    console.log('═══════════════════════════════════');
    
    // Tours
    const tours = await Tour.find().limit(5);
    console.log(`\n📁 Tours (${await Tour.countDocuments()} total):`);
    if (tours.length > 0) {
      tours.forEach((tour, i) => {
        console.log(`   ${i + 1}. ${tour.name || 'Unnamed'} - ${tour.location || 'No location'}`);
        console.log(`      Price: ${tour.price || 'N/A'}, Duration: ${tour.duration || 'N/A'}`);
      });
    } else {
      console.log('   No tours found');
    }
    
    // Candidates
    const candidates = await Candidate.find().limit(5);
    console.log(`\n📁 Candidates (${await Candidate.countDocuments()} total):`);
    if (candidates.length > 0) {
      candidates.forEach((candidate, i) => {
        console.log(`   ${i + 1}. ${candidate.name || 'Unnamed'} - ${candidate.email || 'No email'}`);
      });
    } else {
      console.log('   No candidates found');
    }
    
    // Tour Stops
    const tourStops = await TourStop.find().limit(5);
    console.log(`\n📁 Tour Stops (${await TourStop.countDocuments()} total):`);
    if (tourStops.length > 0) {
      tourStops.forEach((stop, i) => {
        console.log(`   ${i + 1}. ${stop.name || 'Unnamed'} - ${stop.location || 'No location'}`);
      });
    } else {
      console.log('   No tour stops found');
    }
    
    // Tour Templates
    const templates = await TourTemplate.find().limit(5);
    console.log(`\n📁 Tour Templates (${await TourTemplate.countDocuments()} total):`);
    if (templates.length > 0) {
      templates.forEach((template, i) => {
        console.log(`   ${i + 1}. ${template.name || 'Unnamed'}`);
      });
    } else {
      console.log('   No tour templates found');
    }
    
    console.log('\n═══════════════════════════════════');
    
    await db.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

viewData();