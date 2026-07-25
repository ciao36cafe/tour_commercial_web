import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";

const SERIF = "'Playfair Display', Georgia, serif";

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

export function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    orderId: string;
    bookingData: BookingData;
    formData: FormData;
  } | null;

  const [copied, setCopied] = useState(false);
  const [verificationTime, setVerificationTime] = useState(0);

  // If no state, redirect to home
  if (!state) {
    navigate("/");
    return null;
  }

  const { orderId, bookingData, formData } = state;

  // Simulate verification progress
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

  const isVerifying = verificationTime < 100;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Success Header */}
      <div className="bg-[#2D4A3E] text-[#FAF7F2] py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FAF7F2]/10 rounded-full mb-6">
            {isVerifying ? (
              <Loader2 size={40} className="animate-spin text-[#FAF7F2]" />
            ) : (
              <CheckCircle size={40} className="text-[#FAF7F2]" />
            )}
          </div>
          <h1 className="text-[32px]" style={{ fontFamily: SERIF, fontWeight: 400 }}>
            {isVerifying ? "Verifying Your Payment..." : "Payment Successful!"}
          </h1>
          <p className="text-[#FAF7F2]/80 text-[16px] mt-3 max-w-2xl mx-auto">
            {isVerifying 
              ? "Please wait while we verify your payment. This usually takes a few moments."
              : "Your booking is confirmed! We're sending the details to your email."
            }
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Order ID Card */}
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
                <div className={`w-2 h-2 rounded-full ${isVerifying ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className={`text-[14px] font-medium ${isVerifying ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isVerifying ? 'Verifying...' : 'Confirmed'}
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
                Verifying payment... {Math.round(verificationTime)}%
              </p>
            </div>
          )}
        </div>

        {/* Email Confirmation Message */}
        <div className="bg-[#EDE5D0] rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <Mail size={24} className="text-[#2D4A3E] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-[16px] font-medium text-[#2A2824]">
                We'll Confirm via Email
              </h3>
              <p className="text-[13px] text-[#5A5248] mt-1">
                A confirmation email with all your booking details will be sent to:
              </p>
              <p className="text-[14px] font-medium text-[#2A2824] mt-2">
                {formData.email}
              </p>
              <p className="text-[12px] text-[#7A6E60] mt-2 flex items-center gap-1">
                <Clock size={14} />
                You should receive it within the next 5-10 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white border border-border rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-[18px] text-[#2A2824] mb-4" style={{ fontFamily: SERIF, fontWeight: 400 }}>
            Booking Summary
          </h2>
          
          <div className="space-y-3">
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
                  ? `${bookingData.totalAdults} adults${bookingData.totalChildren ? ` + ${bookingData.totalChildren} children` : ''}`
                  : `${bookingData.guests} guests`
                }
              </span>
            </div>
            <div className="flex justify-between text-[14px] py-2 border-b border-border/50">
              <span className="text-[#7A6E60]">Guest Name</span>
              <span className="font-medium text-[#2A2824]">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between text-[14px] py-2">
              <span className="text-[#7A6E60]">Total Paid</span>
              <span className="font-bold text-[20px] text-[#B8952A]" style={{ fontFamily: SERIF }}>
                ฿{bookingData.totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
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
                <p className="text-[14px] font-medium text-[#2A2824]">Check Your Email</p>
                <p className="text-[13px] text-[#7A6E60]">We'll send a confirmation with all tour details</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE5D0] flex items-center justify-center flex-shrink-0">
                <span className="text-[#2A2824] font-bold text-[14px]">2</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#2A2824]">Prepare for Your Tour</p>
                <p className="text-[13px] text-[#7A6E60]">Review the details and contact us if you have questions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE5D0] flex items-center justify-center flex-shrink-0">
                <span className="text-[#2A2824] font-bold text-[14px]">3</span>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#2A2824]">Enjoy Your Experience!</p>
                <p className="text-[13px] text-[#7A6E60]">We look forward to welcoming you on your tour</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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