import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: db.isConnectedToDB ? 'connected' : 'disconnected' 
  });
});

// Debug endpoint
app.post('/api/debug', (req, res) => {
  console.log('Debug request body:', JSON.stringify(req.body, null, 2));
  res.json({ received: true, data: req.body });
});

// ✅ ALL async code inside this function - NO top-level await
async function initializeApp() {
  console.log('🔄 Initializing app...');
  
  try {
    // Connect to database
    await db.connect();
    console.log('✅ Database connected');
    
    // Load routes using dynamic import
    console.log('🔄 Loading routes...');
    
    try {
      const module = await import('./routes/tour.routes.js');
      const tourRoutes = module.default || module;
      if (typeof tourRoutes === 'function') {
        app.use('/api/tours', tourRoutes);
        console.log('✅ Tour routes loaded');
      } else {
        console.warn('⚠️ Tour routes not a function');
      }
    } catch (e) {
      console.error('❌ Tour routes failed:', e.message);
    }

    try {
      const module = await import('./routes/tourTemplate.routes.js');
      const tourTemplateRoutes = module.default || module;
      if (typeof tourTemplateRoutes === 'function') {
        app.use('/api/tour-templates', tourTemplateRoutes);
        console.log('✅ Tour template routes loaded');
      } else {
        console.warn('⚠️ Tour template routes not a function');
      }
    } catch (e) {
      console.error('❌ Tour template routes failed:', e.message);
    }

    try {
      const module = await import('./routes/tourStop.routes.js');
      const tourStopRoutes = module.default || module;
      if (typeof tourStopRoutes === 'function') {
        app.use('/api/tour-stops', tourStopRoutes);
        console.log('✅ Tour stop routes loaded');
      } else {
        console.warn('⚠️ Tour stop routes not a function');
      }
    } catch (e) {
      console.error('❌ Tour stop routes failed:', e.message);
    }

    try {
      const module = await import('./routes/booking.routes.js');
      const bookingRoutes = module.default || module;
      if (typeof bookingRoutes === 'function') {
        app.use('/api/bookings', bookingRoutes);
        console.log('✅ Booking routes loaded');
      } else {
        console.warn('⚠️ Booking routes not a function');
      }
    } catch (e) {
      console.error('❌ Booking routes failed:', e.message);
    }
    
    console.log('✅ All routes mounted');
    
    // Start server (only in development)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 API server running at http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize app:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// ✅ Call WITHOUT await at top level
initializeApp();

// ✅ Export for Netlify Functions
export default app;