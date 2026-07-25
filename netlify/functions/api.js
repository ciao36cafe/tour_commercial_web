import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../../server/index.js';

// Export the handler for Netlify
export const handler = serverless(app);