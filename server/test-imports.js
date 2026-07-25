// server/test-imports.js
import dbModule from './db.js';

console.log('=== Testing Imports ===');
console.log('dbModule type:', typeof dbModule);
console.log('dbModule keys:', Object.keys(dbModule));
console.log('dbModule.default:', dbModule.default);

const db = dbModule.default || dbModule;
console.log('db type:', typeof db);
console.log('db.connect exists:', typeof db.connect === 'function');

if (typeof db.connect === 'function') {
  console.log('✅ db.connect is a function');
} else {
  console.log('❌ db.connect is NOT a function');
}