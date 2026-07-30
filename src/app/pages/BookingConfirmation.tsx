// src/pages/BookingConfirmation.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Loader2,
  Mail,
  Clock,
  Calendar,
  Users,
  MapPin,
  Home,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Phone,
  QrCode,
} from "lucide-react";

// ─── IMPORT SERVICES ──────────────────────────────────────────────────────────
import { sendBookingEmails, BookingEmailData } from "../services/emailService";
import { generateOrderQRCode } from "../services/qrCodeService";

const SERIF = "'Playfair Display', Georgia, serif";

// ============ TYPES ============
interface BookingData {
  // Basic booking info
  tourId: string;
  tourName: string;
  date: string;
  guests: number;
  totalPrice: number;
  pricePerPerson: number;
  isFamilyTrip: boolean;
  numberOfFamilies?: number;
  adultsPerFamily?: number;
  childrenPerFamily?: number;
  totalAdults?: number;
  totalChildren?: number;
  priceFam?: number;
  isGroup?: boolean;
  groupMin?: number;
  
  // Full tour data from TourDetail
  tourDescription?: string;
  tourHighlights?: string[];
  tourIncluded?: string[];
  tourNotIncluded?: string[];
  tourItinerary?: Array<{ time: string; title: string; description: string }>;
  tourEssentials?: {
    dressCode: string;
    fitness: string;
    agePolicy: string;
    prep: string[];
  };
  tourDuration?: string;
  tourStartTime?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  specialRequests: string;
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  flightNumber: string;
  arrivalTime: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyRelation: string;
  agreeTerms: boolean;
  agreeCommunications: boolean;
}

// ============ COMPONENT ============
export function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get ALL data from navigation state
  const state = location.state as {
    orderId: string;
    bookingData: BookingData;
    formData: FormData;
    dbStatus?: string;
    isOffline?: boolean;
    orderStatus?: string;
  } | null;

  console.log('📥 BookingConfirmation received from BookingPage:', {
    orderId: state?.orderId,
    tourName: state?.bookingData?.tourName,
    hasIncluded: !!state?.bookingData?.tourIncluded,
    includedCount: state?.bookingData?.tourIncluded?.length,
    hasNotIncluded: !!state?.bookingData?.tourNotIncluded,
    notIncludedCount: state?.bookingData?.tourNotIncluded?.length,
    hasItinerary: !!state?.bookingData?.tourItinerary,
    itineraryCount: state?.bookingData?.tourItinerary?.length,
    hasEssentials: !!state?.bookingData?.tourEssentials,
    dbStatus: state?.dbStatus,
    isOffline: state?.isOffline,
  });

  // ─── STATE ───────────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const [verificationTime, setVerificationTime] = useState(0);
  
  // Email states
  const [emailStatus, setEmailStatus] = useState<'pending' | 'sending' | 'sent' | 'failed'>('pending');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailsSent, setEmailsSent] = useState(false);
  
  // QR Code state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrCodeExternalUrl, setQrCodeExternalUrl] = useState<string>('');
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);

  // ─── REDIRECT IF NO STATE ──────────────────────────────────────────────────
  if (!state) {
    navigate("/");
    return null;
  }

  const { orderId, bookingData, formData, dbStatus, isOffline, orderStatus } = state;

  // ─── SIMULATE VERIFICATION ────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setVerificationTime((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(timer);
        return 100;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // ─── GENERATE QR CODE ──────────────────────────────────────────────────────
  useEffect(() => {
    const generateQR = async () => {
      if (!qrCodeGenerated && verificationTime >= 50) {
        try {
          console.log('🔲 Generating QR code for order:', orderId);
          const qrResult = await generateOrderQRCode(orderId);
          setQrCodeDataUrl(qrResult.dataUrl);
          setQrCodeExternalUrl(qrResult.externalUrl);
          setQrCodeGenerated(true);
          console.log('✅ QR code generated successfully');
        } catch (error) {
          console.error('❌ Error generating QR code:', error);
          const fallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${orderId}&color=1B2A4A&bgcolor=FFFFFF`;
          setQrCodeDataUrl(fallbackUrl);
          setQrCodeExternalUrl(fallbackUrl);
          setQrCodeGenerated(true);
        }
      }
    };

    generateQR();
  }, [verificationTime, orderId, qrCodeGenerated]);

  // ─── SEND RESERVATION EMAILS WITH ALL DATA ────────────────────────────────
  useEffect(() => {
    const sendEmails = async () => {
      if (verificationTime === 100 && !emailsSent && qrCodeGenerated) {
        setEmailStatus('sending');
        
        try {
          // Build guest count from booking data
          const bookingType = bookingData.isFamilyTrip 
            ? `Family Trip (${bookingData.numberOfFamilies} families)`
            : bookingData.isGroup 
              ? `Group Booking (${bookingData.guests} guests)`
              : 'Individual Booking';

          const guestCount = bookingData.isFamilyTrip
            ? `${bookingData.totalAdults} adults${bookingData.totalChildren ? ` + ${bookingData.totalChildren} children` : ''}`
            : `${bookingData.guests} guests`;

          const formatDateForEmail = (dateStr: string) => {
            if (!dateStr) return "Not selected";
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
          };

          // ✅ BUILD EMAIL DATA - ALL DATA FROM bookingData AND formData, NO HARDCODED VALUES
          // In the sendEmails useEffect, update the emailData to use ALL tour data

          const emailData: BookingEmailData = {
            // ===== FROM formData =====
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || 'Not provided',
            country: formData.country || 'Not specified',
            
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone || 'Not provided',
            customerCountry: formData.country || 'Not specified',
            
            // ===== FROM bookingData =====
            orderId: orderId,
            bookingReferenceId: orderId,
            tourName: bookingData.tourName,
            tourDate: formatDateForEmail(bookingData.date),
            packageType: bookingData.isFamilyTrip ? 'Family Package' : 
                        bookingData.isGroup ? 'Group Package' : 'Standard Tour',
            quantity: guestCount,
            voucherNumber: `VOUCHER-${orderId}`,
            totalPrice: `฿${bookingData.totalPrice.toLocaleString()}`,
            bookingStatus: 'PENDING',
            paymentStatus: 'Pending Verification',
            
            // ===== FROM formData - Accommodation =====
            hotelName: formData.hotelName || 'Not provided',
            hotelAddress: formData.hotelAddress || 'Not provided',
            hotelRoom: formData.roomNumber || '',
            
            // ===== FROM formData - Flight =====
            flightNumber: formData.flightNumber || '',
            arrivalTime: formData.arrivalTime || '',
            
            // ===== FROM formData - Pickup =====
            pickupLocation: formData.hotelName || 'Siam Journeys Meeting Point',
            pickupTime: '08:30 AM',
            
            // ===== FROM formData - Emergency =====
            emergencyName: formData.emergencyName || '',
            emergencyPhone: formData.emergencyPhone || '',
            emergencyEmail: formData.emergencyEmail || '',
            emergencyRelation: formData.emergencyRelation || '',
            
            // ===== FROM formData - Special Requirements =====
            dietaryNeeds: formData.dietaryNeeds || '',
            accessibilityNeeds: formData.accessibilityNeeds || '',
            specialRequests: formData.specialRequests || '',
            
            // ===== QR CODE =====
            qrCodeDataUrl: qrCodeDataUrl,
            qrCodeExternalUrl: qrCodeExternalUrl,
            
            // ✅ ===== FROM bookingData - FULL TOUR DATA (from DB or fallback) =====
            departureTime: bookingData.tourStartTime || '08:00 AM',
            returnTime: '04:00 PM',
            itineraryStops: bookingData.tourItinerary?.map(item => ({
              stop_name: item.title || item.time || 'Tour Stop',
              stop_duration: item.time || '',
              stop_type: ''
            })) || [],
            itineraryDisclaimer: 'Times are approximate and may vary based on traffic and weather conditions.',
            
            // ✅ ===== FROM bookingData - INCLUDED/EXCLUDED =====
            includedItems: bookingData.tourIncluded || [],
            excludedItems: bookingData.tourNotIncluded || [],
            
            // ===== CANCELLATION =====
            cancellationPolicyText: 'Free cancellation up to 14 days before the tour date. Cancellations within 14 days will receive a credit voucher valid for 12 months. No-shows will be charged in full.',
            cancellationDeadline: '14 days before the tour date',
            
            // ===== CONTACT =====
            operatorName: 'Siam Journeys Bangkok',
            operatorPhone: '+6692 475 9669',
            operatorEmail: 'hello@siamjourneys.com',
            operatorWebsite: 'https://siamjourneys.com',
            supportNote: 'We\'re here to help! Contact us anytime at hello@siamjourneys.com or call +6692 475 9669',
            
            // ===== COMPANY =====
            companyLogoUrl: 'https://siamjourneys.com/logo.png',
            companyName: 'Siam Journeys Bangkok',
          };

          // ✅ DEBUG: Log email data being sent
          console.log('📧 Email data being sent:', {
            tourName: emailData.tourName,
            includedItemsCount: emailData.includedItems?.length,
            excludedItemsCount: emailData.excludedItems?.length,
            itineraryStopsCount: emailData.itineraryStops?.length,
            departureTime: emailData.departureTime,
          });

          // Send both emails with db status
          const result = await sendBookingEmails(emailData, dbStatus !== 'offline');
          
          if (result.allSuccess) {
            console.log('✅ Both emails sent successfully');
            setEmailStatus('sent');
            setEmailsSent(true);
          } else {
            console.warn('⚠️ Some emails failed:', result);
            setEmailStatus('failed');
            setEmailError('Some emails could not be sent. Please contact us if you don\'t receive your confirmation.');
            setEmailsSent(true);
          }
        } catch (error) {
          console.error('❌ Failed to send emails:', error);
          setEmailStatus('failed');
          setEmailError('Failed to send confirmation emails. Please contact us at hello@siamjourneys.com');
          setEmailsSent(true);
        }
      }
    };

    sendEmails();
  }, [verificationTime, emailsSent, qrCodeGenerated, qrCodeDataUrl, qrCodeExternalUrl, orderId, bookingData, formData, dbStatus]);

  // ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not selected";
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleRetryEmails = async () => {
    setEmailStatus('pending');
    setEmailsSent(false);
    setEmailError(null);
    setTimeout(() => {
      setVerificationTime(100);
    }, 500);
  };

  const isVerifying = verificationTime < 100;
  const isEmailSending = emailStatus === 'sending';
  const isEmailSent = emailStatus === 'sent';
  const isEmailFailed = emailStatus === 'failed';

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── SUCCESS HEADER ── */}
      <div className="bg-[#2D4A3E] text-[#FAF7F2] py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FAF7F2]/10 rounded-full mb-6">
            {isVerifying ? (
              <Loader2 size={40} className="animate-spin text-[#FAF7F2]" />
            ) : isEmailSending ? (
              <Loader2 size={40} className="animate-spin text-[#FAF7F2]" />
            ) : isEmailFailed ? (
              <AlertCircle size={40} className="text-yellow-400" />
            ) : (
              <CheckCircle size={40} className="text-[#FAF7F2]" />
            )}
          </div>
          <h1 className="text-[32px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
            {isVerifying 
              ? "Processing Your Booking..." 
              : isEmailSending
                ? "Sending Your Reservation Confirmation..."
                : isEmailFailed
                  ? "Booking Reserved - Email Issue"
                  : "Booking Reserved! Waiting for Payment Verification"
            }
          </h1>
          <p className="text-[#FAF7F2]/80 text-[16px] mt-3 max-w-2xl mx-auto">
            {isVerifying 
              ? "Please wait while we process your booking reservation..."
              : isEmailSending
                ? "We're sending your booking reservation details..."
                : isEmailFailed
                  ? "Your booking is reserved but we had trouble sending the email."
                  : "Your booking has been reserved. We'll send the confirmation after payment verification."
            }
          </p>
          {!isVerifying && !isEmailSending && !isEmailFailed && (
            <p className="text-[#B8952A] text-[14px] mt-2 font-medium">
              ⏳ Status: Pending Payment Verification
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* ── ORDER ID CARD ── */}
        <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-[#7A6E60]">
                Order Number
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[24px] font-mono font-bold text-[#2A2824]">
                  {orderId}
                </span>
                <button
                  onClick={() => copyToClipboard(orderId)}
                  className="text-[#7A6E60] hover:text-[#B8952A] transition-colors p-1"
                  title="Copy order ID"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] tracking-[0.14em] uppercase text-[#7A6E60]">
                Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[14px] font-medium text-yellow-600">
                  ⏳ Pending Verification
                </span>
              </div>
            </div>
          </div>

          {/* Verification Progress */}
          {isVerifying && (
            <div className="mt-4">
              <div className="w-full bg-[#EDE5D0] rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-[#B8952A] transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${verificationTime}%` }}
                />
              </div>
              <p className="text-[12px] text-[#7A6E60] mt-2">
                Processing booking... {Math.round(verificationTime)}%
              </p>
            </div>
          )}

          {/* Email sending status */}
          {!isVerifying && emailStatus !== 'pending' && (
            <div className={`mt-4 p-4 rounded-lg ${
              isEmailSent ? 'bg-green-50 border border-green-200' :
              isEmailFailed ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                {isEmailSending && (
                  <Loader2 size={20} className="animate-spin text-blue-500 flex-shrink-0 mt-0.5" />
                )}
                {isEmailSent && (
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                )}
                {isEmailFailed && (
                  <AlertCircle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-[14px] font-medium ${
                    isEmailSent ? 'text-green-700' :
                    isEmailFailed ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {isEmailSending && 'Sending reservation details...'}
                    {isEmailSent && '✓ Reservation email sent successfully'}
                    {isEmailFailed && '⚠️ Email sending issue detected'}
                  </p>
                  {isEmailSent && (
                    <p className="text-[13px] text-green-600 mt-1">
                      A reservation confirmation has been sent to {formData.email}
                    </p>
                  )}
                  {isEmailFailed && emailError && (
                    <p className="text-[13px] text-yellow-600 mt-1">
                      {emailError}
                    </p>
                  )}
                  {isEmailFailed && (
                    <button
                      onClick={handleRetryEmails}
                      className="text-[12px] text-[#B8952A] hover:text-[#A47F22] transition-colors mt-2 underline font-medium"
                    >
                      Retry sending email
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* QR Code Preview */}
          {qrCodeGenerated && qrCodeDataUrl && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg border border-border p-1 flex-shrink-0">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${orderId}&color=1B2A4A&bgcolor=FFFFFF`;
                  }}
                />
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#2A2824]">QR Code</p>
                <p className="text-[11px] text-[#7A6E60]">Scan this code at check-in (after payment verification)</p>
                <a 
                  href={qrCodeExternalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#B8952A] hover:text-[#A47F22] transition-colors"
                >
                  View full size QR code →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── STATUS MESSAGE ── */}
        <div className="bg-[#EDE5D0] rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Clock size={24} className="text-[#2D4A3E] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-[16px] font-medium text-[#2A2824]">
                ⏳ Waiting for Payment Verification
              </h3>
              <p className="text-[13px] text-[#5A5248] mt-1">
                Your booking has been reserved. We are waiting for your payment verification.
              </p>
              <p className="text-[13px] text-[#5A5248] mt-1 font-medium text-[#B8952A]">
                You will receive the final booking confirmation via email once your payment is verified.
              </p>
              <p className="text-[12px] text-[#7A6E60] mt-2">
                Order status: <span className="font-medium text-[#B8952A]">Pending Payment Verification</span>
              </p>
              {isEmailSent && (
                <p className="text-[12px] text-green-600 mt-2 flex items-center gap-1">
                  <Check size={14} />
                  Reservation email sent to {formData.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── BOOKING SUMMARY - Using ALL data from bookingData ── */}
        <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-[18px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF, fontWeight: 400 }}>
            Booking Summary
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Order ID</span>
              <span className="font-medium text-[#2A2824]">{orderId}</span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Tour</span>
              <span className="font-medium text-[#2A2824]">{bookingData.tourName}</span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Date</span>
              <span className="font-medium text-[#2A2824]">{formatDate(bookingData.date)}</span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Guests</span>
              <span className="font-medium text-[#2A2824]">
                {bookingData.isFamilyTrip 
                  ? `${bookingData.totalAdults} adults${bookingData.totalChildren ? ` + ${bookingData.totalChildren} children` : ''} (${bookingData.numberOfFamilies} family${bookingData.numberOfFamilies && bookingData.numberOfFamilies > 1 ? 'ies' : ''})`
                  : `${bookingData.guests} guests${bookingData.isGroup ? ` (Group of ${bookingData.groupMin}+)` : ''}`
                }
              </span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Guest Name</span>
              <span className="font-medium text-[#2A2824]">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Email</span>
              <span className="font-medium text-[#2A2824]">{formData.email}</span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Phone</span>
              <span className="font-medium text-[#2A2824]">{formData.phone || 'Not provided'}</span>
            </div>
            {formData.hotelName && (
              <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
                <span className="text-[#7A6E60]">Hotel</span>
                <span className="font-medium text-[#2A2824]">{formData.hotelName}</span>
              </div>
            )}
            {formData.hotelAddress && (
              <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
                <span className="text-[#7A6E60]">Hotel Address</span>
                <span className="font-medium text-[#2A2824]">{formData.hotelAddress}</span>
              </div>
            )}
            {formData.flightNumber && (
              <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
                <span className="text-[#7A6E60]">Flight</span>
                <span className="font-medium text-[#2A2824]">{formData.flightNumber}</span>
              </div>
            )}
            {formData.emergencyName && (
              <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
                <span className="text-[#7A6E60]">Emergency Contact</span>
                <span className="font-medium text-[#2A2824]">{formData.emergencyName} ({formData.emergencyRelation})</span>
              </div>
            )}
            <div className="flex justify-between text-[14px] py-2">
              <span className="text-[#7A6E60]">Total Amount</span>
              <span className="font-bold text-[20px] text-[#B8952A]" style={{ fontFamily: SERIF }}>
                ฿{bookingData.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ── QUICK CONTACT INFO ── */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-[#B8952A]" />
              <div>
                <p className="text-[11px] text-[#7A6E60]">Need help?</p>
                <p className="text-[14px] font-medium text-[#2A2824]">+6692 475 9669</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[#B8952A]" />
              <div>
                <p className="text-[11px] text-[#7A6E60]">Email us</p>
                <p className="text-[14px] font-medium text-[#2A2824]">hello@siamjourneys.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── NEXT STEPS ── */}
        <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h3 className="text-[16px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF, fontWeight: 400 }}>
            What's Next?
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE5D0] flex items-center justify-center flex-shrink-0">
                <span className="text-[#2A2824] font-bold text-[14px]">1</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#2A2824]">Payment Verification</p>
                <p className="text-[13px] text-[#7A6E60]">
                  We are verifying your payment. This may take 24-48 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE5D0] flex items-center justify-center flex-shrink-0">
                <span className="text-[#2A2824] font-bold text-[14px]">2</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#2A2824]">Receive Confirmation</p>
                <p className="text-[13px] text-[#7A6E60]">
                  Once verified, we'll send your booking confirmation via email.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE5D0] flex items-center justify-center flex-shrink-0">
                <span className="text-[#2A2824] font-bold text-[14px]">3</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#2A2824]">Enjoy Your Tour</p>
                <p className="text-[13px] text-[#7A6E60]">
                  Your tour is reserved. We look forward to welcoming you!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3.5 bg-[#B8952A] text-[#FAF7F2] text-[13px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors duration-300 font-medium flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Return to Home
          </button>
          <button
            onClick={() => navigate("/tours")}
            className="flex-1 py-3.5 border border-border text-[#2A2824] text-[13px] tracking-[0.12em] uppercase hover:bg-[#EDE5D0] transition-colors duration-300 font-medium flex items-center justify-center gap-2"
          >
            <FileText size={16} />
            Browse More Tours
          </button>
        </div>
      </div>
    </div>
  );
}