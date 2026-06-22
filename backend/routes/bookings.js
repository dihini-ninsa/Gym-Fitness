import express from 'express';
import Booking from '../models/Booking.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new booking (class, slot, coaching)
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  const { hostId, hostName, dateTime, type } = req.body;

  if (!hostId || !hostName || !dateTime) {
    return res.status(400).json({ message: 'Missing booking host, name or time parameters' });
  }

  try {
    // Generate a secure visual representation code token for visual checks
    const qrCodeToken = `AEGIS-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const booking = await Booking.create({
      userId: req.user._id.toString(),
      hostId,
      hostName,
      dateTime,
      type: type || 'slot',
      status: 'pending',
      qrCodeToken
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error processing booking' });
  }
});

// @desc    Get all bookings (filtered based on user role)
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let bookings;
    
    // User sees their own bookings
    // Coaches and Gyms see bookings made with them
    // Admins see all bookings
    if (req.user.role === 'admin') {
      bookings = await Booking.find({});
    } else if (req.user.role === 'coach' || req.user.role === 'gym') {
      bookings = await Booking.find({ hostId: req.user._id.toString() });
    } else {
      bookings = await Booking.find({ userId: req.user._id.toString() });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking schedule' });
  }
});

// @desc    Update booking status (confirm, complete, reject)
// @route   PUT /api/bookings/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: 'Status field is required' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking reservation not found' });
    }

    // Only host (coach/gym) or admin can approve/reject/complete a booking
    const isHost = booking.hostId === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.userId === req.user._id.toString();

    if (!isHost && !isAdmin && !(isOwner && status === 'cancelled')) {
      return res.status(403).json({ message: 'Not authorized to change this booking state' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// @desc    Delete/Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled and removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking record' });
  }
});

export default router;
