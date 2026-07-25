import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// ✅ Use require for db - covers all export cases
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const db = require('./db.js').default || require('./db.js');

console.log('📊 db type:', typeof db);
console.log('📊 db.connect exists:', typeof db.connect === 'function');

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

// Function to load routes
async function loadRoutes() {
  console.log('🔄 Loading routes...');
  
  let tourRoutes, tourTemplateRoutes, tourStopRoutes, bookingRoutes;

  try {
    const module = await import('./routes/tour.routes.js');
    tourRoutes = module.default;
    console.log('✅ Tour routes loaded');
  } catch (e) {
    console.error('❌ Tour routes failed:', e.message);
    tourRoutes = (req, res) => res.status(404).json({ error: 'Tour routes not available' });
  }

  try {
    const module = await import('./routes/tourTemplate.routes.js');
    tourTemplateRoutes = module.default;
    console.log('✅ Tour template routes loaded');
  } catch (e) {
    console.error('❌ Tour template routes failed:', e.message);
    tourTemplateRoutes = (req, res) => res.status(404).json({ error: 'Tour template routes not available' });
  }

  try {
    const module = await import('./routes/tourStop.routes.js');
    tourStopRoutes = module.default;
    console.log('✅ Tour stop routes loaded');
  } catch (e) {
    console.error('❌ Tour stop routes failed:', e.message);
    tourStopRoutes = (req, res) => res.status(404).json({ error: 'Tour stop routes not available' });
  }

  try {
    const module = await import('./routes/booking.routes.js');
    bookingRoutes = module.default;
    console.log('✅ Booking routes loaded');
  } catch (e) {
    console.error('❌ Booking routes failed:', e.message);
    bookingRoutes = (req, res) => res.status(404).json({ error: 'Booking routes not available' });
  }

  // Mount routers
  app.use('/api/tours', tourRoutes);
  app.use('/api/tour-templates', tourTemplateRoutes);
  app.use('/api/tour-stops', tourStopRoutes);
  app.use('/api/bookings', bookingRoutes);
  
  console.log('✅ All routes mounted');
}

// Initialize the app
async function initializeApp() {
  try {
    // Connect to database
    await db.connect();
    console.log('✅ Database connected');
    
    // Load routes
    await loadRoutes();
    
    // Start server (only in development)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 API server running at http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Call WITHOUT await at top level
initializeApp();

// Export for Netlify Functions
export default app;