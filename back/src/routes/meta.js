import { Router } from 'express';
import { config, googleEnabled } from '../config.js';
import { sequelize } from '../db.js';
import { getSettings, syncState } from '../lib/settings.js';

export const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ status: 'ok', version: config.version, sync: syncState });
  } catch {
    res.status(503).json({ status: 'degraded', version: config.version });
  }
});

router.get('/config', async (_req, res) => {
  const settings = await getSettings();
  res.json({
    version: config.version,
    google: googleEnabled(),
    guestCryptoLimit: settings.guestCryptoLimit,
    guestNewsLimit: settings.guestNewsLimit,
    signupsOpen: settings.signupsOpen,
  });
});
