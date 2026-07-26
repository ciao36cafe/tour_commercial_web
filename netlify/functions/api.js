import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

// ✅ Create app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check - works immediately
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: 'connected' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// ✅ ALL async code inside this function - NO top-level await
async function initializeApp() {
  console.log('🔄 Initializing app...');
  
  // Connect to MongoDB
  let db;
  try {
    const dbModule = await import('../../server/db.js');
    db = dbModule.default || dbModule;
    if (typeof db.connect === 'function') {
      console.log('🔄 Connecting to MongoDB...');
      await db.connect();
      console.log('✅ MongoDB connected');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }

  // Load routes
  console.log('🔄 Loading routes...');
  
  try {
    const module = await import('../../server/routes/tour.routes.js');
    const tourRoutes = module.default || module;
    if (typeof tourRoutes === 'function') {
      app.use('/api/tours', tourRoutes);
      console.log('✅ Tour routes loaded');
    }
  } catch (e) {
    console.error('❌ Tour routes failed:', e.message);
  }

  try {
    const module = await import('../../server/routes/tourTemplate.routes.js');
    const tourTemplateRoutes = module.default || module;
    if (typeof tourTemplateRoutes === 'function') {
      app.use('/api/tour-templates', tourTemplateRoutes);
      console.log('✅ Tour template routes loaded');
    }
  } catch (e) {
    console.error('❌ Tour template routes failed:', e.message);
  }

  try {
    const module = await import('../../server/routes/tourStop.routes.js');
    const tourStopRoutes = module.default || module;
    if (typeof tourStopRoutes === 'function') {
      app.use('/api/tour-stops', tourStopRoutes);
      console.log('✅ Tour stop routes loaded');
    }
  } catch (e) {
    console.error('❌ Tour stop routes failed:', e.message);
  }

  try {
    const module = await import('../../server/routes/booking.routes.js');
    const bookingRoutes = module.default || module;
    if (typeof bookingRoutes === 'function') {
      app.use('/api/bookings', bookingRoutes);
      console.log('✅ Booking routes loaded');
    }
  } catch (e) {
    console.error('❌ Booking routes failed:', e.message);
  }
  
  console.log('✅ All routes mounted');
}

// ✅ Call WITHOUT await - NO top-level await!
initializeApp();

// ✅ Export the handler
export const handler = serverless(app);