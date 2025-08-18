import { Router } from 'express';
import Movie from '../models/Movie.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Movie.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Movie.create(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
