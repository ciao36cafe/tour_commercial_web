import 'dotenv/config';
import serverless from 'serverless-http';

let app = null;
let isLoaded = false;

// Load the app
const loadApp = async () => {
  try {
    console.log('🔄 Loading app...');
    const appModule = await import('../../server/index.js');
    app = appModule.default || appModule;
    
    if (app && typeof app === 'object' && app.default && typeof app.default === 'function') {
      app = app.default;
    }
    
    console.log('📊 app type:', typeof app);
    isLoaded = true;
    
    if (typeof app !== 'function') {
      console.error('❌ App is not a function');
      throw new Error('App is not a valid Express application');
    }
    
    console.log('✅ App loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load app:', error.message);
    app = null;
    isLoaded = true;
  }
};

// Start loading the app (no await at top level)
loadApp();

// Export the handler
export const handler = async (event, context) => {
  // Wait for app to load if not ready
  if (!isLoaded) {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!isLoaded) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  if (!app || typeof app !== 'function') {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'App not available' })
    };
  }
  
  // Create handler only when needed
  const handler = serverless(app);
  return handler(event, context);
};