import 'dotenv/config';
import serverless from 'serverless-http';
import app from '../../server/index.js';

console.log('✅ App imported successfully');
console.log('📊 app type:', typeof app);

// Verify app is valid
if (typeof app !== 'function') {
  console.error('❌ App is not a function:', app);
  throw new Error('App is not a valid Express application');
}

// Export the handler
export const handler = serverless(app);