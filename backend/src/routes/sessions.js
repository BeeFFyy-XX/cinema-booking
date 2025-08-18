import { Router } from 'express';
import Session from '../models/Session.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Session.find().populate('movie').populate('hall').sort({ dateTime: 1 });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Session.create({ ...req.body, takenSeats: [] });
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await Session.findById(req.params.id).populate('movie').populate('hall');
    res.json(item);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
