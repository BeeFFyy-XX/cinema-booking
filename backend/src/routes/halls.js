import { Router } from 'express';
import Hall from '../models/Hall.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Hall.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Hall.create(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await Hall.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
