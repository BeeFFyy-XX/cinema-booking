import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';

const router = Router();

router.post('/register',
    body('name').notEmpty().withMessage('Імʼя обовʼязкове'),
    body('email').isEmail().withMessage('Некоректний email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль має бути не менше 6 символів'),
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
          return res.status(400).json({ error: 'Email вже використовується' });
        }

        user = new User({ name, email, passwordHash: '' });
        await user.setPassword(password);
        await user.save();

        const token = signJwt(user);
        res.json({
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      } catch (e) {
        next(e);
      }
    }
);

router.post(
    '/login',
    body('email').isEmail().withMessage('Некоректний email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль має бути не менше 6 символів'),
    async (req, res, next) => {
      try {
        // Валідація
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            error: 'Помилка валідації',
            details: errors.array().map(e => e.msg)
          });
        }

        const { email, password } = req.body;

        // Чи існує користувач
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({
            error: 'Помилка авторизації',
            details: ['Користувача з таким email не знайдено']
          });
        }

        // Валідність паролю
        const ok = await user.validatePassword(password);
        if (!ok) {
          return res.status(400).json({
            error: 'Помилка авторизації',
            details: ['Невірний пароль']
          });
        }

        const token = signJwt(user);
        res.json({
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      } catch (e) {
        next(e);
      }
    }
);

export default router;
