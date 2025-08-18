import { Router } from 'express';
import Booking from '../models/Booking.js';
import Session from '../models/Session.js';
import { requireAuth } from '../middleware/auth.js';
import { generateQr } from '../utils/qr.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await Booking.find({ user: req.user.id }).populate({ path: 'session', populate: ['movie', 'hall'] });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { sessionId, tickets } = req.body; // tickets: [{row, seat}]
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    // Check availability
    const taken = new Set((session.takenSeats || []).map(t => `${t.row}-${t.seat}`));
    for (const t of tickets) {
      if (taken.has(`${t.row}-${t.seat}`)) return res.status(400).json({ error: 'Seat already taken' });
    }
    // Reserve
    session.takenSeats.push(...tickets);
    await session.save();
    const booking = await Booking.create({
      user: req.user.id, session: session._id, tickets: tickets.map(t => ({...t, status:'reserved'}))
    });
    const qr = await generateQr(`BOOKING:${booking._id.toString()}`);
    res.status(201).json({ booking, qr });
  } catch (e) { next(e); }
});

router.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id }).populate('session');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    // free seats
    const sess = await Session.findById(booking.session._id);
    const toFree = new Set(booking.tickets.map(t => `${t.row}-${t.seat}`));
    sess.takenSeats = sess.takenSeats.filter(t => !toFree.has(`${t.row}-${t.seat}`));
    await sess.save();
    booking.tickets.forEach(t => t.status = 'cancelled');
    booking.paymentStatus = 'failed';
    await booking.save();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
