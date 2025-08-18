import { Router } from 'express';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Mock payment endpoint
router.post('/pay', requireAuth, async (req, res, next) => {
  try {
    const { bookingId, method } = req.body;
    const booking = await Booking.findOne({ _id: bookingId, user: req.user.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const amount = booking.tickets.length *  (booking.session?.price || 0); // may be 0 if not populated
    const p = await Payment.create({ booking: booking._id, amount, method: method || 'mock', status: 'success' });
    booking.paymentStatus = 'paid';
    booking.tickets.forEach(t => t.status = 'paid');
    await booking.save();
    res.json({ payment: p, status: 'paid' });
  } catch (e) { next(e); }
});

export default router;
