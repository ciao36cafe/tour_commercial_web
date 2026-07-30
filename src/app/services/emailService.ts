// src/services/emailService.ts
import emailjs from '@emailjs/browser';
import { generateOrderQRCode, generateQRCodeUrl } from './qrCodeService';

// Your EmailJS credentials
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
const EMAILJS_CUSTOMER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || 'YOUR_CUSTOMER_TEMPLATE_ID';
const EMAILJS_ADMIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID || 'YOUR_ADMIN_TEMPLATE_ID';

// Admin email address
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@siamjourneys.com';

// ============ INTERFACE ============
export interface BookingEmailData {
  // Customer info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  
  // Customer details (for email templates)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  
  // Booking details
  orderId: string;
  bookingReferenceId: string;
  tourName: string;
  tourDate: string;
  packageType: string;
  quantity: string;
  voucherNumber: string;
  totalPrice: string;
  bookingStatus: string;
  paymentStatus: string;
  
  // Accommodation
  hotelName: string;
  hotelAddress: string;
  hotelRoom: string;
  
  // Flight
  flightNumber: string;
  arrivalTime: string;
  
  // Pickup
  pickupLocation: string;
  pickupTime: string;
  
  // Emergency
  emergencyName: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyRelation: string;
  
  // Special requirements
  dietaryNeeds: string;
  accessibilityNeeds: string;
  specialRequests: string;
  
  // QR Code
  qrCodeDataUrl: string;
  qrCodeExternalUrl: string;
  
  // Itinerary
  departureTime: string;
  returnTime: string;
  itineraryStops: Array<{ stop_name: string; stop_duration: string; stop_type: string }>;
  itineraryDisclaimer: string;
  
  // Included/Excluded
  includedItems: string[];
  excludedItems: string[];
  
  // Pickup points (legacy support)
  pickupPoints?: Array<{ time: string; location_name: string; address: string }>;
  pickupLocationName?: string;
  confirmationLocationName?: string;
  confirmationAddress?: string;
  confirmationPickupTime?: string;
  returnLocationName?: string;
  returnAddress?: string;
  eligibilityRules?: string[];
  additionalInfo?: string[];
  
  // Cancellation
  cancellationPolicyText: string;
  cancellationDeadline: string;
  
  // Contact
  operatorName: string;
  operatorPhone: string;
  operatorEmail: string;
  operatorWebsite: string;
  supportNote: string;
  
  // Company
  companyLogoUrl: string;
  companyName: string;
}

// ============ HELPER: FORMAT ORDER DATA ============
const formatOrderDataForEmail = (data: BookingEmailData): string => {
  const orderData = {
    orderId: data.orderId,
    bookingReferenceId: data.bookingReferenceId,
    tourName: data.tourName,
    tourDate: data.tourDate,
    packageType: data.packageType,
    quantity: data.quantity,
    voucherNumber: data.voucherNumber,
    totalPrice: data.totalPrice,
    bookingStatus: data.bookingStatus,
    paymentStatus: data.paymentStatus,
    
    customer: {
      name: data.customerName || `${data.firstName} ${data.lastName}`,
      email: data.customerEmail || data.email,
      phone: data.customerPhone || data.phone,
      country: data.customerCountry || data.country,
    },
    
    accommodation: {
      hotelName: data.hotelName,
      hotelAddress: data.hotelAddress,
      hotelRoom: data.hotelRoom,
    },
    
    flight: {
      flightNumber: data.flightNumber,
      arrivalTime: data.arrivalTime,
    },
    
    pickup: {
      location: data.pickupLocation,
      time: data.pickupTime,
    },
    
    emergencyContact: {
      name: data.emergencyName,
      phone: data.emergencyPhone,
      email: data.emergencyEmail,
      relation: data.emergencyRelation,
    },
    
    specialRequirements: {
      dietaryNeeds: data.dietaryNeeds,
      accessibilityNeeds: data.accessibilityNeeds,
      specialRequests: data.specialRequests,
    },
    
    itinerary: {
      departureTime: data.departureTime,
      returnTime: data.returnTime,
      stops: data.itineraryStops,
      disclaimer: data.itineraryDisclaimer,
    },
    
    included: data.includedItems,
    excluded: data.excludedItems,
    
    cancellation: {
      policy: data.cancellationPolicyText,
      deadline: data.cancellationDeadline,
    },
    
    operator: {
      name: data.operatorName,
      phone: data.operatorPhone,
      email: data.operatorEmail,
      website: data.operatorWebsite,
    },
    
    meta: {
      sentAt: new Date().toISOString(),
    }
  };

  return JSON.stringify(orderData, null, 2);
};

// ============ HELPER: FORMAT ORDER SUMMARY ============
const formatOrderSummary = (data: BookingEmailData): string => {
  return `
┌─────────────────────────────────────────────────────┐
│  ORDER SUMMARY - ${data.orderId}
└─────────────────────────────────────────────────────┘

📋 BOOKING DETAILS
──────────────────────────────────────────────────────
Order ID:      ${data.orderId}
Tour:          ${data.tourName}
Date:          ${data.tourDate}
Package:       ${data.packageType}
Guests:        ${data.quantity}
Voucher:       ${data.voucherNumber}
Total:         ${data.totalPrice}
Status:        ${data.bookingStatus}

👤 CUSTOMER
──────────────────────────────────────────────────────
Name:          ${data.customerName || `${data.firstName} ${data.lastName}`}
Email:         ${data.customerEmail || data.email}
Phone:         ${data.customerPhone || data.phone || 'Not provided'}
Country:       ${data.customerCountry || data.country || 'Not specified'}

🏨 ACCOMMODATION
──────────────────────────────────────────────────────
Hotel:         ${data.hotelName || 'Not provided'}
Address:       ${data.hotelAddress || 'Not provided'}
Room:          ${data.hotelRoom || 'Not provided'}

✈️ FLIGHT
──────────────────────────────────────────────────────
Flight:        ${data.flightNumber || 'Not provided'}
Arrival:       ${data.arrivalTime || 'Not provided'}

📍 PICKUP
──────────────────────────────────────────────────────
Location:      ${data.pickupLocation || 'Not provided'}
Time:          ${data.pickupTime || 'Not provided'}

🚨 EMERGENCY CONTACT
──────────────────────────────────────────────────────
Name:          ${data.emergencyName || 'Not provided'}
Phone:         ${data.emergencyPhone || 'Not provided'}
Email:         ${data.emergencyEmail || 'Not provided'}
Relation:      ${data.emergencyRelation || 'Not provided'}

🍽️ SPECIAL REQUIREMENTS
──────────────────────────────────────────────────────
Dietary:       ${data.dietaryNeeds || 'None'}
Accessibility: ${data.accessibilityNeeds || 'None'}
Requests:      ${data.specialRequests || 'None'}

📋 ITINERARY
──────────────────────────────────────────────────────
Departure:     ${data.departureTime || '08:00 AM'}
Return:        ${data.returnTime || '04:00 PM'}
Stops:
${data.itineraryStops?.map((stop, i) => `  ${i+1}. ${stop.stop_name} (${stop.stop_duration})`).join('\n') || '  No stops listed'}

✅ INCLUDED
──────────────────────────────────────────────────────
${data.includedItems?.map(item => `  • ${item}`).join('\n') || '  None listed'}

❌ NOT INCLUDED
──────────────────────────────────────────────────────
${data.excludedItems?.map(item => `  • ${item}`).join('\n') || '  None listed'}

📄 CANCELLATION POLICY
──────────────────────────────────────────────────────
${data.cancellationPolicyText || 'Free cancellation up to 14 days before the tour.'}
Deadline: ${data.cancellationDeadline || '14 days before the tour'}

📞 CONTACT
──────────────────────────────────────────────────────
Operator:      ${data.operatorName || 'Siam Journeys Bangkok'}
Phone:         ${data.operatorPhone || '+6692 475 9669'}
Email:         ${data.operatorEmail || 'hello@siamjourneys.com'}
Website:       ${data.operatorWebsite || 'https://siamjourneys.com'}

${new Date().toISOString()}
`;
};

// ============ SEND CUSTOMER CONFIRMATION ============
export async function sendCustomerConfirmation(data: BookingEmailData) {
  try {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    console.log('🔲 Preparing customer email with QR code for order:', data.orderId);
    
    // Generate QR code if not provided
    let qrCodeDataUrl = data.qrCodeDataUrl;
    let qrCodeExternalUrl = data.qrCodeExternalUrl;
    
    if (!qrCodeDataUrl) {
      try {
        const qrResult = await generateOrderQRCode(data.orderId);
        qrCodeDataUrl = qrResult.dataUrl;
        qrCodeExternalUrl = qrResult.externalUrl;
        console.log('✅ QR code generated successfully');
      } catch (error) {
        console.error('❌ QR generation failed, using fallback:', error);
        qrCodeExternalUrl = generateQRCodeUrl(data.orderId);
        qrCodeDataUrl = qrCodeExternalUrl;
      }
    }

    // Prepare template parameters
    const templateParams = {
      // ===== EMAIL HEADERS =====
      to_email: data.email,
      to_name: `${data.firstName} ${data.lastName}`,
      from_name: 'Siam Journeys Bangkok',
      reply_to: 'hello@siamjourneys.com',
      
      // ===== COMPANY INFO =====
      company_logo_url: data.companyLogoUrl || 'https://siamjourneys.com/logo.png',
      company_name: data.companyName || 'Siam Journeys Bangkok',
      
      // ===== BOOKING SUMMARY =====
      booking_reference_id: data.bookingReferenceId || data.orderId,
      tour_name: data.tourName,
      tour_date: data.tourDate,
      package_type: data.packageType || 'Standard Tour',
      lead_participant: `${data.firstName} ${data.lastName}`,
      quantity: data.quantity || '1',
      voucher_number: data.voucherNumber || data.bookingReferenceId,
      booking_status: data.bookingStatus || 'Confirmed',
      payment_status: data.paymentStatus || 'Paid',
      
      // ===== CUSTOMER INFORMATION =====
      customer_name: data.customerName || `${data.firstName} ${data.lastName}`,
      customer_email: data.customerEmail || data.email,
      customer_phone: data.customerPhone || data.phone || 'Not provided',
      customer_country: data.customerCountry || data.country || 'Not specified',
      
      // ===== ACCOMMODATION =====
      hotel_name: data.hotelName || 'Not provided',
      hotel_address: data.hotelAddress || 'Not provided',
      hotel_room: data.hotelRoom || 'Not provided',
      
      // ===== FLIGHT DETAILS =====
      flight_number: data.flightNumber || 'Not provided',
      arrival_time: data.arrivalTime || 'Not provided',
      
      // ===== PICKUP =====
      pickup_location: data.pickupLocation || data.pickupLocationName || 'Siam Journeys Meeting Point',
      pickup_time: data.pickupTime || data.confirmationPickupTime || '08:30 AM',
      
      // ===== EMERGENCY CONTACT =====
      emergency_name: data.emergencyName || 'Not provided',
      emergency_phone: data.emergencyPhone || 'Not provided',
      emergency_email: data.emergencyEmail || 'Not provided',
      emergency_relation: data.emergencyRelation || 'Not provided',
      
      // ===== SPECIAL REQUIREMENTS =====
      dietary_needs: data.dietaryNeeds || 'None',
      accessibility_needs: data.accessibilityNeeds || 'None',
      special_requests: data.specialRequests || 'None',
      
      // ===== QR CODE =====
      qr_code_url: qrCodeDataUrl,
      qr_code_external_url: qrCodeExternalUrl,
      
      // ===== ITINERARY =====
      departure_time: data.departureTime || '08:00 AM',
      return_time: data.returnTime || '04:00 PM',
      itinerary_stops: data.itineraryStops || [],
      itinerary_disclaimer: data.itineraryDisclaimer || 'Times are approximate and may vary based on traffic and weather conditions.',
      
      // ===== INCLUDED / EXCLUDED =====
      included_items: data.includedItems || [],
      excluded_items: data.excludedItems || [],
      
      // ===== PICKUP POINTS =====
      pickup_points: data.pickupPoints || [
        { 
          time: data.pickupTime || '08:00 AM', 
          location_name: data.pickupLocation || data.pickupLocationName || 'Meeting Point', 
          address: data.hotelAddress || 'Phra Nakhon, Bangkok 10200' 
        }
      ],
      return_location_name: data.returnLocationName || data.pickupLocation || 'Siam Journeys Meeting Point',
      return_address: data.returnAddress || data.hotelAddress || 'Phra Nakhon, Bangkok 10200',
      
      // ===== BEFORE YOU BOOK =====
      eligibility_rules: data.eligibilityRules || [
        'Minimum age: 5 years',
        'Children under 12 must be accompanied by an adult',
        'Comfortable walking shoes recommended',
      ],
      additional_info: data.additionalInfo || [
        'Bring sunscreen and a hat for sun protection',
        'Temple dress code: shoulders and knees must be covered',
        'We provide sarongs if needed',
        'Please inform us of any mobility concerns',
      ],
      
      // ===== CANCELLATION =====
      cancellation_policy_text: data.cancellationPolicyText || 'Free cancellation up to 14 days before the tour date. Cancellations within 14 days will receive a credit voucher valid for 12 months. No-shows will be charged in full.',
      cancellation_deadline: data.cancellationDeadline || '14 days before the tour date',
      
      // ===== CONTACT =====
      operator_name: data.operatorName || 'Siam Journeys Bangkok',
      operator_phone: data.operatorPhone || '+6692 475 9669',
      operator_email: data.operatorEmail || 'hello@siamjourneys.com',
      operator_website: data.operatorWebsite || 'https://siamjourneys.com',
      support_note: data.supportNote || 'We\'re here to help! Contact us anytime at hello@siamjourneys.com or call +6692 475 9669',
      
      // ===== ORDER ID =====
      order_id: data.orderId,
    };

    // Send to customer
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CUSTOMER_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Customer email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending customer email:', error);
    return { success: false, error };
  }
}

// ============ SEND ADMIN NOTIFICATION ============
export async function sendAdminNotification(data: BookingEmailData, dbConnected: boolean = true) {
  try {
    // Validate credentials
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_ADMIN_TEMPLATE_ID) {
      throw new Error('Missing EmailJS credentials for admin email');
    }

    // Validate admin email
    if (!ADMIN_EMAIL || !ADMIN_EMAIL.includes('@')) {
      throw new Error(`Invalid admin email: ${ADMIN_EMAIL}`);
    }

    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    console.log('📧 Sending admin email to:', ADMIN_EMAIL);
    console.log('📧 DB Status:', dbConnected ? 'Connected' : 'Disconnected');

    // ===== GENERATE FULL ORDER DATA =====
    const fullOrderData = formatOrderDataForEmail(data);
    const orderSummary = formatOrderSummary(data);

    // Prepare template parameters for admin
    const templateParams = {
      // ===== CRITICAL: Email fields =====
      to_email: ADMIN_EMAIL,
      to_name: 'Admin Team',
      from_name: 'Siam Journeys Booking System',
      
      // ===== ORDER INFO =====
      order_id: data.orderId,
      booking_status: data.bookingStatus || 'Confirmed',
      
      // ===== CUSTOMER INFO =====
      customer_name: data.customerName || `${data.firstName} ${data.lastName}`,
      customer_email: data.customerEmail || data.email,
      customer_phone: data.customerPhone || data.phone || 'Not provided',
      customer_country: data.customerCountry || data.country || 'Not specified',
      
      // ===== BOOKING DETAILS =====
      tour_name: data.tourName,
      tour_date: data.tourDate,
      package_type: data.packageType || 'Standard Tour',
      quantity: data.quantity || '1',
      voucher_number: data.voucherNumber || data.bookingReferenceId,
      total_price: data.totalPrice,
      
      // ===== ACCOMMODATION =====
      hotel_name: data.hotelName || 'Not provided',
      hotel_address: data.hotelAddress || 'Not provided',
      hotel_room: data.hotelRoom || 'Not provided',
      
      // ===== FLIGHT DETAILS =====
      flight_number: data.flightNumber || 'Not provided',
      arrival_time: data.arrivalTime || 'Not provided',
      
      // ===== PICKUP =====
      pickup_location: data.pickupLocation || data.pickupLocationName || 'Siam Journeys Meeting Point',
      pickup_time: data.pickupTime || data.confirmationPickupTime || '08:30 AM',
      
      // ===== EMERGENCY CONTACT =====
      emergency_name: data.emergencyName || 'Not provided',
      emergency_phone: data.emergencyPhone || 'Not provided',
      emergency_email: data.emergencyEmail || 'Not provided',
      emergency_relation: data.emergencyRelation || 'Not provided',
      
      // ===== SPECIAL REQUIREMENTS =====
      dietary_needs: data.dietaryNeeds || 'None',
      accessibility_needs: data.accessibilityNeeds || 'None',
      special_requests: data.specialRequests || 'None',
      
      // ===== ITINERARY =====
      departure_time: data.departureTime || '08:00 AM',
      return_time: data.returnTime || '04:00 PM',
      itinerary_stops: data.itineraryStops || [],
      itinerary_disclaimer: data.itineraryDisclaimer || 'Times are approximate and may vary based on traffic and weather conditions.',
      
      // ===== INCLUDED / EXCLUDED =====
      included_items: data.includedItems || [],
      excluded_items: data.excludedItems || [],
      
      // ===== CANCELLATION =====
      cancellation_policy_text: data.cancellationPolicyText || 'Free cancellation up to 14 days before the tour date. Cancellations within 14 days will receive a credit voucher valid for 12 months. No-shows will be charged in full.',
      cancellation_deadline: data.cancellationDeadline || '14 days before the tour date',
      
      // ===== CONTACT =====
      operator_name: data.operatorName || 'Siam Journeys Bangkok',
      operator_phone: data.operatorPhone || '+6692 475 9669',
      operator_email: data.operatorEmail || 'hello@siamjourneys.com',
      operator_website: data.operatorWebsite || 'https://siamjourneys.com',
      
      // ===== FULL ORDER DATA (JSON) =====
      full_order_data: fullOrderData,
      
      // ===== ORDER SUMMARY (Human readable) =====
      order_summary: orderSummary,
      
      // ===== DATABASE STATUS =====
      db_warning: !dbConnected ? '⚠️ DATABASE WAS NOT CONNECTED. This order data is included as a fallback attachment. Please save this data manually.' : '',
      
      // ===== SENT TIME =====
      sent_time: new Date().toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }),
    };

    // Send to admin
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ADMIN_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Admin email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending admin email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    return { success: false, error };
  }
}

// ============ SEND BOTH EMAILS ============
export async function sendBookingEmails(data: BookingEmailData, dbConnected: boolean = true) {
  try {
    // Send both emails simultaneously
    const [customerResult, adminResult] = await Promise.all([
      sendCustomerConfirmation(data),
      sendAdminNotification(data, dbConnected),
    ]);

    return {
      customer: customerResult,
      admin: adminResult,
      allSuccess: customerResult.success && adminResult.success,
    };
  } catch (error) {
    console.error('❌ Error sending booking emails:', error);
    return {
      customer: { success: false, error },
      admin: { success: false, error },
      allSuccess: false,
    };
  }
}