import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';

// Import the actual route files you have
import tourRoutes from './routes/tour.routes.js';
import tourTemplateRoutes from './routes/tourTemplate.routes.js';
import tourStopRoutes from './routes/tourStop.routes.js';
import bookingRoutes from './routes/booking.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/tours', tourRoutes);
app.use('/api/tour-templates', tourTemplateRoutes);
app.use('/api/tour-stops', tourStopRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: db.isConnectedToDB() ? 'connected' : 'disconnected' });
});

// Debug endpoint - log incoming data
app.post('/api/debug', (req, res) => {
  console.log('Debug request body:', JSON.stringify(req.body, null, 2));
  res.json({ received: true, data: req.body });
});

// Connect to database and start server
async function start() {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`API server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  start();
}

// Export for Netlify Functions
export default app;