import express from 'express';
import cors from 'cors';
import db from './db.js';
import dotenv from 'dotenv';

// Import routes
import tourRoutes from './routes/tour.routes.js';
import tourTemplateRoutes from './routes/tourTemplate.routes.js';
import tourStopRoutes from './routes/tourStop.routes.js';
import bookingRoutes from './routes/booking.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// REMOVED: app.options('*', cors()); // This was causing the error

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware - Make sure this has (req, res, next) and calls next()
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }
  next(); // ← IMPORTANT: Make sure next() is called
});

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    if (!db.isConnectedToDB()) {
      await db.connect();
    }
    next(); // ← IMPORTANT: Make sure next() is called
  } catch (error) {
    console.error('Database connection error:', error);
    next(error); // Pass error to error handler
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Siam Journeys API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tours: '/api/tours',
      bookings: '/api/bookings'
    },
    database: db.isConnectedToDB() ? 'connected' : 'disconnected'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: db.isConnectedToDB() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/tours', tourRoutes);
app.use('/api/tour-templates', tourTemplateRoutes);
app.use('/api/tour-stops', tourStopRoutes);
app.use('/api/bookings', bookingRoutes);

console.log('\n📋 Registered Routes:');
console.log('  ✓ /api/tours');
console.log('  ✓ /api/tour-templates');
console.log('  ✓ /api/tour-stops');
console.log('  ✓ /api/bookings');
console.log('');

// 404 handler
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler - Make sure this has (err, req, res, next)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    await db.connect();
    
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: ${db.isConnectedToDB() ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
      console.log('\n📌 Available Endpoints:');
      console.log(`   GET  /api/tours              - List all tours`);
      console.log(`   GET  /api/tours/:id          - Get single tour`);
      console.log(`   GET  /api/tour-templates     - List all templates`);
      console.log(`   GET  /api/tour-stops         - List all stops`);
      console.log(`   POST /api/bookings           - Create booking`);
      console.log(`   GET  /api/bookings           - List bookings`);
      console.log(`   GET  /api/bookings/:orderId  - Get booking`);
      console.log(`   POST /api/bookings/:orderId/verify-payment - Verify payment`);
      console.log('=================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;