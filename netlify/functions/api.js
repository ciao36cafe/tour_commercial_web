import 'dotenv/config';
import serverless from 'serverless-http';

// ✅ Use a simpler approach - load the app on first request
let cachedApp = null;
let cachedHandler = null;

export const handler = async (event, context) => {
  try {
    // Load app on first request (cold start)
    if (!cachedApp) {
      console.log('🔧 Loading app for the first time...');
      
      // Import the app
      const appModule = await import('../../server/index.js');
      
      // Try different export formats
      let app = appModule.default || appModule;
      
      // If app is an object with a default property that's a function
      if (app && typeof app === 'object' && app.default && typeof app.default === 'function') {
        app = app.default;
      }
      
      console.log('📊 app type:', typeof app);
      
      if (typeof app !== 'function') {
        throw new Error(`App is not a function, it's a ${typeof app}`);
      }
      
      cachedApp = app;
      cachedHandler = serverless(app);
      console.log('✅ App loaded and handler created');
    }
    
    return cachedHandler(event, context);
  } catch (error) {
    console.error('❌ Handler error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};