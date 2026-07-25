import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../../server/index.js';

// ✅ Ensure the app is properly exported
const expressApp = app.default || app;

console.log('📊 app type:', typeof expressApp);

if (typeof expressApp !== 'function') {
  console.error('❌ App is not a function');
  throw new Error('App is not a valid Express application');
}

// ✅ Export the handler - this is what Netlify looks for
export const handler = serverless(expressApp);