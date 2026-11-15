import { Router } from 'express';
import { z } from 'zod';
import { PushSubscription } from '../db.js';
import { HttpError, parse } from '../lib/errors.js';
import { loadUser } from '../middleware/auth.js';
import { guestLimiter } from '../middleware/security.js';
import { TOPICS, endpointHash, getPublicKey, isAllowedEndpoint } from '../services/push.js';

/**
 * Opt-in notifications. Open to everyone (no account needed): a subscription only
 * holds the browser's push endpoint, its encryption keys, the topics and the language.
 */
export const router = Router();

const endpointSchema = z.string().url().max(2000).refine(isAllowedEndpoint, { message: 'push_endpoint' });

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: endpointSchema,
    keys: z.object({ p256dh: z.string().min(20).max(200), auth: z.string().min(8).max(100) }),
  }),
  topics: z.array(z.enum(TOPICS)).min(1).max(TOPICS.length),
  locale: z.enum(['en', 'fr']).default('en'),
});

router.get('/public-key', (_req, res) => {
  const key = getPublicKey();
  if (!key) throw new HttpError(503, 'push_unavailable');
  res.json({ publicKey: key });
});

router.post('/subscribe', guestLimiter, async (req, res) => {
  const { subscription, topics, locale } = parse(subscribeSchema, req.body);
  const user = await loadUser(req);
  const values = {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    topics: [...new Set(topics)],
    locale,
    // Guests have no account: their subscription stays anonymous.
    userId: user && !user.isGuest ? user.id : null,
  };
  const hash = endpointHash(subscription.endpoint);
  const existing = await PushSubscription.findOne({ where: { endpointHash: hash } });
  if (existing) await existing.update(values);
  else await PushSubscription.create({ ...values, endpointHash: hash });
  res.status(existing ? 200 : 201).json({ topics: values.topics });
});

/** Current topics for this browser (the endpoint acts as the identifier). */
router.post('/status', async (req, res) => {
  const { endpoint } = parse(z.object({ endpoint: endpointSchema }), req.body);
  const existing = await PushSubscription.findOne({ where: { endpointHash: endpointHash(endpoint) } });
  res.json({ subscribed: Boolean(existing), topics: existing?.topics ?? [] });
});

router.post('/unsubscribe', async (req, res) => {
  const { endpoint } = parse(z.object({ endpoint: endpointSchema }), req.body);
  await PushSubscription.destroy({ where: { endpointHash: endpointHash(endpoint) } });
  res.status(204).end();
});
