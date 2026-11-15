import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { Favorite, User } from '../db.js';
import { publicUser } from '../lib/dto.js';
import { HttpError, parse } from '../lib/errors.js';
import { changePasswordSchema, deleteAccountSchema, profileSchema } from '../lib/schemas.js';
import { clearSessionCookie, forbidGuest, requireAuth, setSessionCookie } from '../middleware/auth.js';
import { sensitiveLimiter } from '../middleware/security.js';
import { assertAvailable } from './auth.js';

export const router = Router();
// Every route here reads or changes a real account: closed to the demo session.
router.use(requireAuth, forbidGuest);

router.patch('/me', async (req, res) => {
  const body = parse(profileSchema, req.body);
  await assertAvailable(body, req.user.id);
  await req.user.update(body);
  res.json({ user: publicUser(req.user) });
});

router.put('/me/password', sensitiveLimiter, async (req, res) => {
  const { currentPassword, newPassword } = parse(changePasswordSchema, req.body);
  if (req.user.passwordHash) {
    const valid = currentPassword && (await bcrypt.compare(currentPassword, req.user.passwordHash));
    if (!valid) throw new HttpError(403, 'wrong_password');
  }
  // Bumping the token version signs out every other session.
  await req.user.update({
    passwordHash: await bcrypt.hash(newPassword, 12),
    tokenVersion: req.user.tokenVersion + 1,
    mustChangePassword: false,
  });
  setSessionCookie(res, req.user);
  res.status(204).end();
});

router.get('/me/export', async (req, res) => {
  const favorites = await Favorite.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
  res.setHeader('content-disposition', `attachment; filename="kryptonews-export-${req.user.id}.json"`);
  res.json({
    service: 'Kryptonews',
    exportedAt: new Date().toISOString(),
    account: {
      ...publicUser(req.user),
      lastLoginAt: req.user.lastLoginAt,
      updatedAt: req.user.updatedAt,
    },
    favorites: favorites.map((f) => ({
      kind: f.kind,
      refId: f.refId,
      title: f.title,
      url: f.url,
      source: f.source,
      savedAt: f.createdAt,
    })),
  });
});

router.delete('/me', sensitiveLimiter, async (req, res) => {
  const { password, confirm } = parse(deleteAccountSchema, req.body);
  if (req.user.passwordHash) {
    const valid = password && (await bcrypt.compare(password, req.user.passwordHash));
    if (!valid) throw new HttpError(403, 'wrong_password');
  } else if (confirm !== req.user.username) {
    throw new HttpError(400, 'validation', { fields: { confirm: 'mismatch' } });
  }
  if (req.user.role === 'admin' && (await User.count({ where: { role: 'admin' } })) <= 1) {
    throw new HttpError(409, 'last_admin');
  }
  await req.user.destroy();
  clearSessionCookie(res);
  res.status(204).end();
});
