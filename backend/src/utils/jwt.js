import jwt from 'jsonwebtoken';

export function signJwt(user) {
  const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}
