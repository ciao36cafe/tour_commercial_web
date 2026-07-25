import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  MapPin,
  Clock,
  CreditCard,
  Shield,
  Check,
  AlertCircle,
  MessageSquare,
  Plane,
  Hotel,
  Briefcase,
  FileText,
  ChevronRight,
  QrCode,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react";

const SERIF = "'Playfair Display', Georgia, serif";

// ===== FIX: Use import.meta.env for Vite =====
const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');
// ==========================================

interface BookingData {
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
}

interface BookingFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  
  // Special Requirements
  dietaryNeeds: string;
  accessibilityNeeds: string;
  specialRequests: string;
  
  // Accommodation
  hotelName: string;
  hotelAddress: string;
  roomNumber: string;
  
  // Flight Details (optional)
  flightNumber: string;
  arrivalTime: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyEmail: string;
  emergencyRelation: string;
  
  // Terms
  agreeTerms: boolean;
  agreeCommunications: boolean;
}

// Generate order ID
const generateOrderId = () => {
  const prefix = 'TUK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state as BookingData;

  // Form states
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    dietaryNeeds: "",
    accessibilityNeeds: "",
    specialRequests: "",
    hotelName: "",
    hotelAddress: "",
    roomNumber: "",
    flightNumber: "",
    arrivalTime: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyEmail: "",
    emergencyRelation: "",
    agreeTerms: false,
    agreeCommunications: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [copied, setCopied] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // If no booking data, redirect to home
  if (!bookingData) {
    navigate("/");
    return null;
  }

  const {
    tourName,
    date,
    guests,
    totalPrice,
    pricePerPerson,
    isFamilyTrip,
    numberOfFamilies,
    totalAdults,
    totalChildren,
    priceFam,
    isGroup,
    groupMin,
  } = bookingData;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.country) newErrors.country = "Country is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    // Accommodation - REQUIRED
    if (!formData.hotelName.trim()) newErrors.hotelName = "Hotel name is required";
    if (!formData.hotelAddress.trim()) newErrors.hotelAddress = "Hotel address is required";
    
    // Emergency Contact - required fields
    if (!formData.emergencyName.trim()) newErrors.emergencyName = "Emergency contact name is required";
    if (!formData.emergencyEmail.trim()) {
      newErrors.emergencyEmail = "Emergency contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emergencyEmail)) {
      newErrors.emergencyEmail = "Email is invalid";
    }
    if (!formData.emergencyRelation.trim()) newErrors.emergencyRelation = "Relation is required";
    // Emergency phone is optional - no validation
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms and conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2 && validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save booking to MongoDB via API
  const saveBooking = async (data: BookingFormData, bookingData: BookingData, orderId: string) => {
    setDbStatus('saving');
    setErrorMessage('');
    
    const payload = {
      orderId,
      status: 'PENDING_PAYMENT',
      bookingDetails: bookingData,
      personalInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        country: data.country,
      },
      tripDetails: {
        dietaryNeeds: data.dietaryNeeds || '',
        accessibilityNeeds: data.accessibilityNeeds || '',
        specialRequests: data.specialRequests || '',
        hotelName: data.hotelName,
        hotelAddress: data.hotelAddress,
        roomNumber: data.roomNumber || '',
        flightNumber: data.flightNumber || '',
        arrivalTime: data.arrivalTime || '',
      },
      emergencyContact: {
        name: data.emergencyName,
        phone: data.emergencyPhone || '',
        email: data.emergencyEmail,
        relation: data.emergencyRelation,
      },
    };

    console.log('📤 Sending payload to server:', payload);
    console.log('📍 API URL:', `${API_BASE_URL}/api/bookings`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);
      
      // Try to parse the response
      let result;
      const text = await response.text();
      console.log('📥 Raw response:', text);
      
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP error ${response.status}`);
      }
      
      setDbStatus('saved');
      console.log('✅ Booking saved successfully:', result);
      return result.data;
    } catch (error) {
      setDbStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      console.error('❌ Error saving booking:', error);
      throw error;
    }
  };

  // Verify payment
  const verifyPayment = async (orderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${orderId}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'Bank Transfer',
          transactionId: `TXN-${Date.now()}`
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment verification failed');
      }
      
      console.log('✅ Payment verified:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Generate order ID
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);
      
      // Save booking to database with pending status
      await saveBooking(formData, bookingData, newOrderId);
      
      // Move to payment step
      setIsPaymentStep(true);
      setPaymentStatus('pending');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in handleSubmit:', error);
      alert(`There was an error processing your booking: ${errorMsg}\n\nPlease check:\n1. Server is running on port 5000\n2. MongoDB is connected\n3. Check console for more details`);
    } finally {
      setIsSubmitting(false);
    }
  };

    const handlePaymentConfirmation = async () => {
    setPaymentStatus('processing');
    
    try {
        // Verify payment with backend
        await verifyPayment(orderId);
        
        setPaymentStatus('completed');
        console.log('✅ Payment verified successfully');
        
        // Navigate to confirmation page with all data
        setTimeout(() => {
        navigate("/booking-confirmation", { 
            state: { 
            orderId, 
            bookingData,
            formData 
            } 
        });
        }, 2000);
    } catch (error) {
        console.error('❌ Payment verification error:', error);
        setPaymentStatus('pending');
        alert('Payment verification failed. Please try again or contact support.');
    }
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Payment Page
  if (isPaymentStep) {
    const bankAccount = {
      bank: 'Kasikorn Bank',
      accountName: 'Tuk Tuk Tours Thailand',
      accountNumber: '123-4-56789-0',
      amount: totalPrice,
    };

    return (
      <div className="min-h-screen bg-[#FAF7F2]">
        {/* Header */}
        <div className="bg-[#2A2824] text-[#FAF7F2] py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-[28px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
              Complete Your Payment
            </h1>
            <p className="text-[#FAF7F2]/70 text-[14px] mt-1">
              Order #{orderId} · {tourName}
            </p>
            {/* DB Status Indicator */}
            {dbStatus === 'saved' && (
              <p className="text-green-400 text-[12px] mt-2 flex items-center gap-1">
                <CheckCircle size={14} />
                Booking saved successfully
              </p>
            )}
            {dbStatus === 'error' && (
              <p className="text-red-400 text-[12px] mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                Error: {errorMessage}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white border border-border p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EDE5D0] rounded-full mb-4">
                <QrCode size={32} className="text-[#2A2824]" />
              </div>
              <h2 className="text-[24px] text-[#2A2824]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                Pay via Bank Transfer
              </h2>
              <p className="text-[13px] text-[#7A6E60] mt-2">
                Use the QR code or bank details below to complete your payment
              </p>
              <p className="text-[12px] text-[#B8952A] mt-1">
                Your booking is reserved for 30 minutes
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-8">
              <div className="border-2 border-border p-4 bg-white">
                <div className="w-48 h-48 bg-[#2A2824] flex items-center justify-center">
                  <div className="text-[#FAF7F2] text-center">
                    <QrCode size={80} className="mx-auto mb-2" />
                    <p className="text-[10px] opacity-70">Scan to Pay</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-[#EDE5D0] p-6 space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-[#5A5248] text-[13px]">Bank</span>
                <span className="text-[#2A2824] font-medium">{bankAccount.bank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#5A5248] text-[13px]">Account Name</span>
                <span className="text-[#2A2824] font-medium">{bankAccount.accountName}</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[#5A5248] text-[13px]">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#2A2824] font-medium font-mono">{bankAccount.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(bankAccount.accountNumber)}
                    className="text-[#7A6E60] hover:text-[#B8952A] transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-border/50 pt-3">
                <span className="text-[#5A5248] text-[13px]">Amount</span>
                <span className="text-[#2A2824] font-bold text-[20px]" style={{ fontFamily: SERIF }}>
                  ฿{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Reference */}
            <div className="bg-[#FAF7F2] p-4 mb-8 border border-border">
              <p className="text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1">Payment Reference</p>
              <p className="text-[13px] text-[#2A2824] font-mono">
                Please use your order number <span className="font-bold text-[#B8952A]">{orderId}</span> as payment reference
              </p>
            </div>

            {/* Confirm Payment Button */}
            <div className="space-y-4">
              <button
                onClick={handlePaymentConfirmation}
                disabled={paymentStatus === 'processing' || paymentStatus === 'completed'}
                className="w-full py-3.5 bg-[#2D4A3E] text-[#FAF7F2] text-[13px] tracking-[0.12em] uppercase hover:bg-[#1F352C] transition-colors duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentStatus === 'processing' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Verifying Payment...
                  </>
                ) : paymentStatus === 'completed' ? (
                  <>
                    <CheckCircle size={16} />
                    Payment Confirmed!
                  </>
                ) : (
                  'I Have Made the Payment'
                )}
              </button>
              
              {paymentStatus === 'completed' && (
                <p className="text-center text-[13px] text-[#2D4A3E]">
                  Redirecting to confirmation...
                </p>
              )}
              
              <p className="text-center text-[12px] text-[#7A6E60]">
                Your booking will be confirmed upon payment verification
              </p>
            </div>

            <button
              onClick={() => setIsPaymentStep(false)}
              className="mt-6 text-[13px] text-[#7A6E60] hover:text-[#2A2824] transition-colors block mx-auto"
            >
              ← Back to booking details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Booking Form
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-[#2A2824] text-[#FAF7F2] py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#FAF7F2]/70 hover:text-[#FAF7F2] transition-colors text-[13px] mb-4"
          >
            <ArrowLeft size={16} />
            Back to Tour
          </button>
          <h1 className="text-[28px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
            Complete Your Booking
          </h1>
          <p className="text-[#FAF7F2]/70 text-[14px] mt-1">
            Step {step} of 3 · {tourName}
          </p>
          {/* DB Status Indicators */}
          {dbStatus === 'saving' && (
            <p className="text-yellow-400 text-[12px] mt-2 flex items-center gap-1">
              <Loader2 size={14} className="animate-spin" />
              Saving booking...
            </p>
          )}
          {dbStatus === 'saved' && (
            <p className="text-green-400 text-[12px] mt-2 flex items-center gap-1">
              <CheckCircle size={14} />
              Booking saved to database
            </p>
          )}
          {dbStatus === 'error' && (
            <p className="text-red-400 text-[12px] mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              Error: {errorMessage || 'Failed to save booking'}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ${
                    s === step
                      ? "bg-[#B8952A] text-white"
                      : s < step
                      ? "bg-[#2D4A3E] text-white"
                      : "bg-[#EDE5D0] text-[#7A6E60]"
                  }`}
                >
                  {s < step ? <Check size={16} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-[2px] ${s < step ? "bg-[#2D4A3E]" : "bg-[#EDE5D0]"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-8 mt-2 text-[11px] text-[#7A6E60] tracking-[0.1em] uppercase">
            <span className={step === 1 ? "text-[#B8952A] font-medium" : ""}>Personal Info</span>
            <span className={step === 2 ? "text-[#B8952A] font-medium" : ""}>Trip Details</span>
            <span className={step === 3 ? "text-[#B8952A] font-medium" : ""}>Confirm</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Form */}
          <div className="bg-white border border-border p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-[20px] text-[#2A2824]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                    Personal Information
                  </h2>
                  <p className="text-[13px] text-[#7A6E60]">We'll use this information to contact you about your booking.</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full border ${errors.firstName ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-red-400 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full border ${errors.lastName ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-red-400 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full border ${errors.email ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                        Phone Number <span className="text-[#7A6E60]/60">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                        placeholder="+66 92 475 9669"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                        Country *
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className={`w-full border ${errors.country ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                      >
                        <option value="">Select your country</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="Philippines">Philippines</option>
                        <option value="China">China</option>
                        <option value="Japan">Japan</option>
                        <option value="South Korea">South Korea</option>
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.country && (
                        <p className="text-[11px] text-red-400 mt-1">{errors.country}</p>
                      )}
                    </div>
                  </div>

                  {/* API Test Button - Development Only */}
                  {/*import.meta.env.DEV && (
                    <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const response = await fetch(`${API_BASE_URL}/health`);
                            const data = await response.json();
                            console.log('✅ API Health Check:', data);
                            alert(`API is running!\nDatabase: ${data.database}\nStatus: ${data.status}`);
                          } catch (error) {
                            console.error('❌ API Health Check Failed:', error);
                            alert(`API is not reachable.\nMake sure server is running on ${API_BASE_URL}`);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        🔍 Test API Connection
                      </button>
                    </div>
                  )*/}

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3.5 bg-[#B8952A] text-[#FAF7F2] text-[13px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors duration-300 font-medium flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-[20px] text-[#2A2824]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                    Trip Details & Requirements
                  </h2>
                  <p className="text-[13px] text-[#7A6E60]">Help us prepare the best experience for you.</p>

                  {/* Accommodation Section - REQUIRED */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-[15px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF }}>
                      <Hotel size={15} className="inline mr-2 text-[#B8952A]" />
                      Accommodation Details *
                    </h3>
                    <p className="text-[12px] text-[#7A6E60] mb-4">We'll need this for pick-up arrangements.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Hotel Name *
                        </label>
                        <input
                          type="text"
                          value={formData.hotelName}
                          onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                          className={`w-full border ${errors.hotelName ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                          placeholder="e.g., Mandarin Oriental Bangkok"
                        />
                        {errors.hotelName && (
                          <p className="text-[11px] text-red-400 mt-1">{errors.hotelName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Hotel Address *
                        </label>
                        <input
                          type="text"
                          value={formData.hotelAddress}
                          onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                          className={`w-full border ${errors.hotelAddress ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                          placeholder="Full hotel address"
                        />
                        {errors.hotelAddress && (
                          <p className="text-[11px] text-red-400 mt-1">{errors.hotelAddress}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Room Number (optional)
                        </label>
                        <input
                          type="text"
                          value={formData.roomNumber}
                          onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                          placeholder="e.g., 504"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact - with email required, phone optional */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-[15px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF }}>
                      <AlertCircle size={15} className="inline mr-2 text-[#B8952A]" />
                      Emergency Contact *
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyName}
                          onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                          className={`w-full border ${errors.emergencyName ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                          placeholder="Emergency contact name"
                        />
                        {errors.emergencyName && (
                          <p className="text-[11px] text-red-400 mt-1">{errors.emergencyName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Phone Number <span className="text-[#7A6E60]/60">(optional)</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                          placeholder="Emergency contact phone"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={formData.emergencyEmail}
                          onChange={(e) => setFormData({ ...formData, emergencyEmail: e.target.value })}
                          className={`w-full border ${errors.emergencyEmail ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                          placeholder="emergency@example.com"
                        />
                        {errors.emergencyEmail && (
                          <p className="text-[11px] text-red-400 mt-1">{errors.emergencyEmail}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Relationship *
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyRelation}
                          onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                          className={`w-full border ${errors.emergencyRelation ? 'border-red-400' : 'border-border'} px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent`}
                          placeholder="e.g., Spouse, Parent, Sibling"
                        />
                        {errors.emergencyRelation && (
                          <p className="text-[11px] text-red-400 mt-1">{errors.emergencyRelation}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-[15px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF }}>
                      <Plane size={15} className="inline mr-2 text-[#B8952A]" />
                      Flight Details (Optional)
                    </h3>
                    <p className="text-[12px] text-[#7A6E60] mb-4">In case of flight delays affecting your tour.</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Flight Number
                        </label>
                        <input
                          type="text"
                          value={formData.flightNumber}
                          onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                          placeholder="e.g., TG 620"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Arrival Time
                        </label>
                        <input
                          type="time"
                          value={formData.arrivalTime}
                          onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements Section */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-[15px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF }}>
                      <MessageSquare size={15} className="inline mr-2 text-[#B8952A]" />
                      Special Requirements (Optional)
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Dietary Requirements
                        </label>
                        <select
                          value={formData.dietaryNeeds}
                          onChange={(e) => setFormData({ ...formData, dietaryNeeds: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                        >
                          <option value="">No dietary restrictions</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Vegan">Vegan</option>
                          <option value="Gluten-Free">Gluten-Free</option>
                          <option value="Halal">Halal</option>
                          <option value="Kosher">Kosher</option>
                          <option value="Food Allergies">Food Allergies (please specify)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Accessibility Needs
                        </label>
                        <select
                          value={formData.accessibilityNeeds}
                          onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent"
                        >
                          <option value="">No special needs</option>
                          <option value="Wheelchair Accessible">Wheelchair Accessible</option>
                          <option value="Limited Mobility">Limited Mobility</option>
                          <option value="Hearing Impaired">Hearing Impaired</option>
                          <option value="Visually Impaired">Visually Impaired</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] tracking-[0.14em] uppercase text-[#7A6E60] mb-1.5">
                          Special Requests
                        </label>
                        <textarea
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          className="w-full border border-border px-3 py-2.5 text-[14px] text-[#2A2824] focus:outline-none focus:border-[#B8952A] transition-colors bg-transparent resize-y min-h-[80px]"
                          placeholder="Any special requests or notes for your guide..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 py-3.5 border border-border text-[#2A2824] text-[13px] tracking-[0.12em] uppercase hover:bg-[#EDE5D0] transition-colors duration-300 font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3.5 bg-[#B8952A] text-[#FAF7F2] text-[13px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors duration-300 font-medium flex items-center justify-center gap-2"
                    >
                      Continue
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-[20px] text-[#2A2824]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
                    Review & Confirm
                  </h2>
                  <p className="text-[13px] text-[#7A6E60]">Please review your booking details before confirming.</p>

                  {/* Booking Summary */}
                  <div className="bg-[#EDE5D0] p-4 space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#5A5248]">Tour</span>
                      <span className="font-medium text-[#2A2824]">{tourName}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#5A5248]">Date</span>
                      <span className="font-medium text-[#2A2824]">{formatDate(date)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#5A5248]">Guests</span>
                      <span className="font-medium text-[#2A2824]">
                        {isFamilyTrip 
                          ? `${totalAdults} adults${totalChildren ? ` + ${totalChildren} children` : ''} (${numberOfFamilies} family${numberOfFamilies && numberOfFamilies > 1 ? 'ies' : ''})`
                          : `${guests} guests${isGroup ? ` (Group of ${groupMin}+)` : ''}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px] border-t border-border/50 pt-2 mt-2">
                      <span className="text-[#5A5248]">Total Price</span>
                      <span className="font-bold text-[#2A2824] text-[18px]" style={{ fontFamily: SERIF }}>
                        ฿{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Personal Info Summary */}
                  <div className="border border-border p-4 space-y-2">
                    <h4 className="text-[12px] tracking-[0.14em] uppercase text-[#7A6E60] font-medium">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-1 text-[13px]">
                      <span className="text-[#7A6E60]">Name</span>
                      <span className="text-[#2A2824]">{formData.firstName} {formData.lastName}</span>
                      <span className="text-[#7A6E60]">Email</span>
                      <span className="text-[#2A2824]">{formData.email}</span>
                      <span className="text-[#7A6E60]">Phone</span>
                      <span className="text-[#2A2824]">{formData.phone || 'Not provided'}</span>
                      <span className="text-[#7A6E60]">Country</span>
                      <span className="text-[#2A2824]">{formData.country}</span>
                    </div>
                  </div>

                  {/* Accommodation Summary */}
                  <div className="border border-border p-4 space-y-2">
                    <h4 className="text-[12px] tracking-[0.14em] uppercase text-[#7A6E60] font-medium">Accommodation</h4>
                    <div className="space-y-1 text-[13px]">
                      <div><span className="text-[#7A6E60]">Hotel:</span> <span className="text-[#2A2824]">{formData.hotelName}</span></div>
                      <div><span className="text-[#7A6E60]">Address:</span> <span className="text-[#2A2824]">{formData.hotelAddress}</span></div>
                      {formData.roomNumber && (
                        <div><span className="text-[#7A6E60]">Room:</span> <span className="text-[#2A2824]">{formData.roomNumber}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact Summary */}
                  <div className="border border-border p-4 space-y-2">
                    <h4 className="text-[12px] tracking-[0.14em] uppercase text-[#7A6E60] font-medium">Emergency Contact</h4>
                    <div className="space-y-1 text-[13px]">
                      <div><span className="text-[#7A6E60]">Name:</span> <span className="text-[#2A2824]">{formData.emergencyName}</span></div>
                      {formData.emergencyPhone && (
                        <div><span className="text-[#7A6E60]">Phone:</span> <span className="text-[#2A2824]">{formData.emergencyPhone}</span></div>
                      )}
                      <div><span className="text-[#7A6E60]">Email:</span> <span className="text-[#2A2824]">{formData.emergencyEmail}</span></div>
                      <div><span className="text-[#7A6E60]">Relationship:</span> <span className="text-[#2A2824]">{formData.emergencyRelation}</span></div>
                    </div>
                  </div>

                  {/* Flight Summary */}
                  {(formData.flightNumber || formData.arrivalTime) && (
                    <div className="border border-border p-4 space-y-2">
                      <h4 className="text-[12px] tracking-[0.14em] uppercase text-[#7A6E60] font-medium">Flight Details</h4>
                      <div className="space-y-1 text-[13px]">
                        {formData.flightNumber && (
                          <div><span className="text-[#7A6E60]">Flight:</span> <span className="text-[#2A2824]">{formData.flightNumber}</span></div>
                        )}
                        {formData.arrivalTime && (
                          <div><span className="text-[#7A6E60]">Arrival:</span> <span className="text-[#2A2824]">{formData.arrivalTime}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Special Requirements Summary */}
                  {(formData.dietaryNeeds || formData.accessibilityNeeds || formData.specialRequests) && (
                    <div className="border border-border p-4 space-y-2">
                      <h4 className="text-[12px] tracking-[0.14em] uppercase text-[#7A6E60] font-medium">Special Requirements</h4>
                      <div className="space-y-1 text-[13px]">
                        {formData.dietaryNeeds && (
                          <div><span className="text-[#7A6E60]">Dietary:</span> <span className="text-[#2A2824]">{formData.dietaryNeeds}</span></div>
                        )}
                        {formData.accessibilityNeeds && (
                          <div><span className="text-[#7A6E60]">Accessibility:</span> <span className="text-[#2A2824]">{formData.accessibilityNeeds}</span></div>
                        )}
                        {formData.specialRequests && (
                          <div><span className="text-[#7A6E60]">Special Requests:</span> <span className="text-[#2A2824]">{formData.specialRequests}</span></div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                        className="w-4 h-4 mt-0.5 accent-[#B8952A]"
                      />
                      <label htmlFor="terms" className="text-[13px] text-[#5A5248]">
                        I agree to the{" "}
                        <a href="#" className="text-[#B8952A] hover:underline">
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-[#B8952A] hover:underline">
                          Cancellation Policy
                        </a>
                        . I understand that free cancellation is available up to 14 days prior to the tour.
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <p className="text-[11px] text-red-400">{errors.agreeTerms}</p>
                    )}

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="communications"
                        checked={formData.agreeCommunications}
                        onChange={(e) => setFormData({ ...formData, agreeCommunications: e.target.checked })}
                        className="w-4 h-4 mt-0.5 accent-[#B8952A]"
                      />
                      <label htmlFor="communications" className="text-[13px] text-[#5A5248]">
                        I agree to receive booking confirmations and tour updates via email and SMS.
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      className="flex-1 py-3.5 border border-border text-[#2A2824] text-[13px] tracking-[0.12em] uppercase hover:bg-[#EDE5D0] transition-colors duration-300 font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 bg-[#B8952A] text-[#FAF7F2] text-[13px] tracking-[0.12em] uppercase hover:bg-[#A47F22] transition-colors duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm & Proceed to Payment
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="bg-[#FFFDF8] border border-border p-6">
                <h3 className="text-[16px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF }}>
                  Booking Summary
                </h3>
                
                <div className="space-y-3 text-[13px]">
                  <div className="flex items-start gap-3">
                    <Calendar size={15} className="text-[#B8952A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#7A6E60] text-[10px] tracking-[0.14em] uppercase">Date</p>
                      <p className="text-[#2A2824] font-medium">{formatDate(date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users size={15} className="text-[#B8952A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#7A6E60] text-[10px] tracking-[0.14em] uppercase">Guests</p>
                      <p className="text-[#2A2824] font-medium">
                        {isFamilyTrip 
                          ? `${totalAdults} adults${totalChildren ? ` + ${totalChildren} children` : ''}`
                          : `${guests} guests`
                        }
                      </p>
                      {isFamilyTrip && (
                        <p className="text-[11px] text-[#7A6E60]">{numberOfFamilies} family {numberOfFamilies && numberOfFamilies > 1 ? 'tuk-tuks' : 'tuk-tuk'}</p>
                      )}
                      {isGroup && !isFamilyTrip && (
                        <p className="text-[11px] text-[#2D4A3E]">Group rate applied</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-[#B8952A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#7A6E60] text-[10px] tracking-[0.14em] uppercase">Pick-up</p>
                      <p className="text-[#2A2824] font-medium">Hotel pick-up included</p>
                      <p className="text-[11px] text-[#7A6E60]">We'll confirm exact time</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#5A5248]">Subtotal</span>
                    <span className="text-[#2A2824]">฿{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#5A5248]">Taxes & Fees</span>
                    <span className="text-[#2A2824]">Included</span>
                  </div>
                  <div className="flex justify-between text-[18px] mt-3 pt-3 border-t border-border" style={{ fontFamily: SERIF }}>
                    <span className="text-[#2A2824]">Total</span>
                    <span className="text-[#B8952A] font-bold">฿{totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-[#7A6E60] mt-2">No payment today · Free cancellation 14 days prior</p>
                </div>

                <div className="mt-4 p-3 bg-[#EDE5D0] flex items-start gap-2">
                  <Shield size={14} className="text-[#2D4A3E] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#5A5248]">
                    Your booking is protected by our <span className="text-[#2D4A3E] font-medium">Secure Booking Guarantee</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}