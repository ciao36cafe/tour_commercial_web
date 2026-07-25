import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: 'connecting...' 
  });
});

// Debug endpoint
app.post('/api/debug', (req, res) => {
  console.log('Debug request body:', JSON.stringify(req.body, null, 2));
  res.json({ received: true, data: req.body });
});

// ✅ ALL async code inside this function
async function initializeApp() {
  console.log('🔄 Initializing app...');
  
  // ✅ Load db with proper handling
  let db;
  try {
    // Try different import methods
    let dbModule;
    try {
      dbModule = await import('./db.js');
    } catch (e) {
      console.error('❌ Import failed:', e.message);
      dbModule = { default: null };
    }
    
    // Handle different export formats
    if (dbModule.default && typeof dbModule.default === 'object') {
      db = dbModule.default;
    } else if (dbModule.default && typeof dbModule.default === 'function') {
      db = new dbModule.default();
    } else if (typeof dbModule === 'object') {
      db = dbModule;
    } else {
      throw new Error('Unknown db export format');
    }
    
    console.log('✅ Database module loaded');
    console.log('📊 db type:', typeof db);
    console.log('📊 db.connect exists:', typeof db.connect === 'function');
    console.log('📊 db methods:', Object.keys(db).join(', '));
  } catch (e) {
    console.error('❌ Failed to load db.js:', e.message);
    // Create a mock db
    db = {
      connect: async () => console.log('⚠️ Mock database connect'),
      isConnectedToDB: () => false,
      disconnect: async () => {},
      getConnection: () => null
    };
  }

  // Update health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      mongodb: db.isConnectedToDB ? 'connected' : 'disconnected' 
    });
  });

  // Connect to database
  try {
    if (typeof db.connect === 'function') {
      await db.connect();
      console.log('✅ Database connected');
    } else {
      console.warn('⚠️ db.connect is not a function, skipping database connection');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }

  // Load routes
  console.log('🔄 Loading routes...');
  
  let tourRoutes, tourTemplateRoutes, tourStopRoutes, bookingRoutes;
  let hasError = false;

  try {
    const module = await import('./routes/tour.routes.js');
    tourRoutes = module.default || module;
    if (typeof tourRoutes === 'function') {
      console.log('✅ Tour routes loaded');
    } else {
      console.warn('⚠️ Tour routes not a function');
      tourRoutes = (req, res) => res.status(404).json({ error: 'Tour routes not available' });
    }
  } catch (e) {
    console.error('❌ Tour routes failed:', e.message);
    tourRoutes = (req, res) => res.status(404).json({ error: 'Tour routes not available' });
    hasError = true;
  }

  try {
    const module = await import('./routes/tourTemplate.routes.js');
    tourTemplateRoutes = module.default || module;
    if (typeof tourTemplateRoutes === 'function') {
      console.log('✅ Tour template routes loaded');
    } else {
      console.warn('⚠️ Tour template routes not a function');
      tourTemplateRoutes = (req, res) => res.status(404).json({ error: 'Tour template routes not available' });
    }
  } catch (e) {
    console.error('❌ Tour template routes failed:', e.message);
    tourTemplateRoutes = (req, res) => res.status(404).json({ error: 'Tour template routes not available' });
    hasError = true;
  }

  try {
    const module = await import('./routes/tourStop.routes.js');
    tourStopRoutes = module.default || module;
    if (typeof tourStopRoutes === 'function') {
      console.log('✅ Tour stop routes loaded');
    } else {
      console.warn('⚠️ Tour stop routes not a function');
      tourStopRoutes = (req, res) => res.status(404).json({ error: 'Tour stop routes not available' });
    }
  } catch (e) {
    console.error('❌ Tour stop routes failed:', e.message);
    tourStopRoutes = (req, res) => res.status(404).json({ error: 'Tour stop routes not available' });
    hasError = true;
  }

  try {
    const module = await import('./routes/booking.routes.js');
    bookingRoutes = module.default || module;
    if (typeof bookingRoutes === 'function') {
      console.log('✅ Booking routes loaded');
    } else {
      console.warn('⚠️ Booking routes not a function');
      bookingRoutes = (req, res) => res.status(404).json({ error: 'Booking routes not available' });
    }
  } catch (e) {
    console.error('❌ Booking routes failed:', e.message);
    bookingRoutes = (req, res) => res.status(404).json({ error: 'Booking routes not available' });
    hasError = true;
  }

  // Mount routers - only if they're functions
  if (typeof tourRoutes === 'function') {
    app.use('/api/tours', tourRoutes);
  }
  if (typeof tourTemplateRoutes === 'function') {
    app.use('/api/tour-templates', tourTemplateRoutes);
  }
  if (typeof tourStopRoutes === 'function') {
    app.use('/api/tour-stops', tourStopRoutes);
  }
  if (typeof bookingRoutes === 'function') {
    app.use('/api/bookings', bookingRoutes);
  }
  
  console.log('✅ All routes mounted');

  // Start server (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`🚀 API server running at http://localhost:${PORT}`);
    });
  }
}

// Call WITHOUT await at top level
initializeApp();

// Export for Netlify Functions
export default app;