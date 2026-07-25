import 'dotenv/config';
import serverless from 'serverless-http';

let app = null;
let isLoaded = false;

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

// ✅ Call WITHOUT await - NO top-level await!
loadApp();

export const handler = async (event, context) => {
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
  
  const handler = serverless(app);
  return handler(event, context);
};