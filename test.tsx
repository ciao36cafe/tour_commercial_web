// Run this in your browser console to test EmailJS
import emailjs from '@emailjs/browser';

const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const SERVICE_ID = 'YOUR_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

emailjs.init(PUBLIC_KEY);

emailjs.send(SERVICE_ID, TEMPLATE_ID, {
  to_email: 'test@example.com',
  to_name: 'Test User',
  subject: 'Test Email',
  message: 'This is a test email from EmailJS'
}).then(response => {
  console.log('✅ Test email sent:', response);
}).catch(error => {
  console.error('❌ Test email failed:', error);
});