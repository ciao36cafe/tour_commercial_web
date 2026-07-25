import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create email transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP for testing)
  // Or use your actual email provider (Gmail, SendGrid, etc.)
  
  // Option 1: Ethereal (for testing - creates fake email account)
  // Go to https://ethereal.email to get credentials
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'your-ethereal-email@ethereal.email',
      pass: process.env.EMAIL_PASS || 'your-ethereal-password',
    },
  });

  // Option 2: Gmail (for production)
  // return nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS, // Use App Password, not regular password
  //   },
  // });

  // Option 3: SendGrid
  // return nodemailer.createTransport({
  //   host: 'smtp.sendgrid.net',
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: 'apikey',
  //     pass: process.env.SENDGRID_API_KEY,
  //   },
  // });
};

// Load and compile email template
const getTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../email-templates', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  return handlebars.compile(source);
};

// Send booking confirmation email
export const sendBookingConfirmation = async (bookingData, formData, orderId) => {
  try {
    const transporter = createTransporter();
    const template = getTemplate('booking-confirmation');

    // Format the date
    const formatDate = (dateStr) => {
      if (!dateStr) return 'Not selected';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // Prepare email data
    const emailData = {
      orderId,
      bookingDetails: {
        tourName: bookingData.tourName,
        date: formatDate(bookingData.date),
        guests: bookingData.guests,
        totalPrice: bookingData.totalPrice.toLocaleString(),
        pricePerPerson: bookingData.pricePerPerson.toLocaleString(),
        isFamilyTrip: bookingData.isFamilyTrip,
        numberOfFamilies: bookingData.numberOfFamilies,
        totalAdults: bookingData.totalAdults,
        totalChildren: bookingData.totalChildren,
        isGroup: bookingData.isGroup,
        groupMin: bookingData.groupMin,
      },
      personalInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        country: formData.country,
      },
      tripDetails: {
        hotelName: formData.hotelName,
        hotelAddress: formData.hotelAddress,
        roomNumber: formData.roomNumber || 'Not provided',
        dietaryNeeds: formData.dietaryNeeds || 'None',
        accessibilityNeeds: formData.accessibilityNeeds || 'None',
        specialRequests: formData.specialRequests || 'None',
        flightNumber: formData.flightNumber || 'Not provided',
        arrivalTime: formData.arrivalTime || 'Not provided',
      },
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone || 'Not provided',
        email: formData.emergencyEmail,
        relation: formData.emergencyRelation,
      },
    };

    const html = template(emailData);

    // Send email
    const mailOptions = {
      from: `"Siam Journeys" <${process.env.EMAIL_FROM || 'hello@siamjourneys.com'}>`,
      to: formData.email,
      subject: `Booking Confirmation #${orderId} - Siam Journeys`,
      html,
      // Optional: Add plain text version
      text: `
        Booking Confirmation #${orderId}
        Tour: ${bookingData.tourName}
        Date: ${formatDate(bookingData.date)}
        Guests: ${bookingData.guests}
        Total: ฿${bookingData.totalPrice.toLocaleString()}
        
        Thank you for booking with Siam Journeys!
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    // For Ethereal, log the preview URL
    if (info.messageId && transporter.options.host === 'smtp.ethereal.email') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Send email to admin (optional)
export const sendAdminNotification = async (bookingData, formData, orderId) => {
  try {
    const transporter = createTransporter();
    const template = getTemplate('admin-notification');

    // You would create a separate admin notification template
    // Similar to above but with admin-specific content

    const mailOptions = {
      from: `"Siam Journeys" <${process.env.EMAIL_FROM || 'hello@siamjourneys.com'}>`,
      to: process.env.ADMIN_EMAIL || 'admin@siamjourneys.com',
      subject: `New Booking #${orderId} - Action Required`,
      html: `
        <h2>New Booking Received</h2>
        <p>Order #${orderId}</p>
        <p>Customer: ${formData.firstName} ${formData.lastName}</p>
        <p>Tour: ${bookingData.tourName}</p>
        <p>Total: ฿${bookingData.totalPrice.toLocaleString()}</p>
        <p>View full details in the admin dashboard.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent');
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
};