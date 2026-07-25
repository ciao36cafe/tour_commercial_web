import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Sync middleware (no async)
app.use(cors());
app.use(express.json());

// ✅ Sync routes (no async)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: 'initializing...' 
  });
});

app.post('/api/debug', (req, res) => {
  console.log('Debug request body:', JSON.stringify(req.body, null, 2));
  res.json({ received: true, data: req.body });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// ✅ ALL async code INSIDE this ONE function
async function initializeApp() {
  console.log('🔄 Initializing app...');
  
  // 1. Load db
  let db;
  try {
    const dbModule = await import('./db.js');
    db = dbModule.default || dbModule;
    console.log('📊 db type:', typeof db);
    console.log('📊 db.connect exists:', typeof db.connect === 'function');
  } catch (error) {
    console.error('❌ Failed to load db:', error.message);
    db = {
      connect: async () => console.log('⚠️ Fallback connect'),
      isConnectedToDB: () => false,
    };
  }

  // 2. Update health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mongodb: typeof db.isConnectedToDB === 'function' ? (db.isConnectedToDB() ? 'connected' : 'disconnected') : 'unknown'
    });
  });

  // 3. Connect to database
  try {
    if (typeof db.connect === 'function') {
      console.log('🔄 Connecting to database...');
      await db.connect();
      console.log('✅ Database connected');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  
  // 4. Load routes using require
  console.log('🔄 Loading routes...');
  
  // Use import() for routes (inside async function)
  try {
    const module = await import('./routes/tour.routes.js');
    const tourRoutes = module.default || module;
    if (typeof tourRoutes === 'function') {
      app.use('/api/tours', tourRoutes);
      console.log('✅ Tour routes loaded');
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
    }
  } catch (e) {
    console.error('❌ Booking routes failed:', e.message);
  }
  
  console.log('✅ All routes mounted');
  
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 API server running at http://localhost:${PORT}`);
    });
  }
}

// ✅ Call WITHOUT await - NO top-level await!
initializeApp();

export default app;