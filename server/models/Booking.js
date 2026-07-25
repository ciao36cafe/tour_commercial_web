import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING_PAYMENT', 'PAYMENT_VERIFIED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING_PAYMENT',
    index: true
  },
  bookingDetails: {
    tourId: { type: String, required: true },
    tourName: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    pricePerPerson: { type: Number, required: true },
    isFamilyTrip: { type: Boolean, default: false },
    numberOfFamilies: Number,
    adultsPerFamily: Number,
    childrenPerFamily: Number,
    totalAdults: Number,
    totalChildren: Number,
    priceFam: Number,
    isGroup: { type: Boolean, default: false },
    groupMin: Number
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    country: { type: String, required: true }
  },
  tripDetails: {
    dietaryNeeds: { type: String, default: '' },
    accessibilityNeeds: { type: String, default: '' },
    specialRequests: { type: String, default: '' },
    hotelName: { type: String, required: true },
    hotelAddress: { type: String, required: true },
    roomNumber: { type: String, default: '' },
    flightNumber: { type: String, default: '' },
    arrivalTime: { type: String, default: '' }
  },
  emergencyContact: {
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, required: true },
    relation: { type: String, required: true }
  },
  paymentDetails: {
    amount: Number,
    paymentMethod: String,
    transactionId: String,
    paidAt: Date,
    verifiedAt: Date
  }
}, {
  timestamps: true // This automatically handles createdAt and updatedAt
});

// REMOVED: pre-save hook - not needed because timestamps: true handles it

// Method to generate order ID
bookingSchema.statics.generateOrderId = function() {
  const prefix = 'TUK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;