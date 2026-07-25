console.log('✅ Booking routes loaded!');

import express from 'express';
import Booking from '../models/Booking.js';

const router = express.Router();

// Create new booking
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new booking...');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const bookingData = req.body;
    
    // Generate order ID if not provided
    if (!bookingData.orderId) {
      bookingData.orderId = Booking.generateOrderId();
    }
    
    // Create new booking
    const booking = new Booking(bookingData);
    await booking.save();
    
    console.log('✅ Booking created successfully:', booking.orderId);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        orderId: booking.orderId,
        status: booking.status,
        booking: booking
      }
    });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    
    // Handle duplicate orderId error
    if (error.code === 11000 && error.keyPattern?.orderId) {
      return res.status(409).json({
        success: false,
        message: 'Order ID already exists. Please try again.',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Get booking by order ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const booking = await Booking.findOne({ orderId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Update booking status
router.patch('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentDetails } = req.body;
    
    const updateData = { status };
    if (paymentDetails) {
      updateData.paymentDetails = paymentDetails;
    }
    
    const booking = await Booking.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

// Verify payment
router.post('/:orderId/verify-payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { transactionId, paymentMethod } = req.body;
    
    const booking = await Booking.findOne({ orderId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Update payment details
    booking.status = 'PAYMENT_VERIFIED';
    booking.paymentDetails = {
      amount: booking.bookingDetails.totalPrice,
      paymentMethod: paymentMethod || 'Bank Transfer',
      transactionId: transactionId || `TXN-${Date.now()}`,
      paidAt: new Date(),
      verifiedAt: new Date()
    };
    
    await booking.save();
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const search = req.query.search;
    
    const filter = {};
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/stats', async (req, res) => {
  try {
    const [total, pending, verified, confirmed, cancelled, completed] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'PENDING_PAYMENT' }),
      Booking.countDocuments({ status: 'PAYMENT_VERIFIED' }),
      Booking.countDocuments({ status: 'CONFIRMED' }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      Booking.countDocuments({ status: 'COMPLETED' })
    ]);
    
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$bookingDetails.totalPrice' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        verified,
        confirmed,
        cancelled,
        completed,
        revenue: revenueResult.length > 0 ? revenueResult[0].total : 0
      }
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
});

// Delete booking
router.delete('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const booking = await Booking.findOneAndDelete({ orderId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

export default router;