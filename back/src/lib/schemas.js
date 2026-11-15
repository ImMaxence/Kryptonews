import { z } from 'zod';

export const LOCALES = ['en', 'fr'];

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[\p{L}\p{N}_.-]+$/u);

export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());
export const passwordSchema = z.string().min(10).max(128);
export const localeSchema = z.enum(LOCALES);
export const avatarSchema = z.coerce.number().int().min(1).max(6);

const personNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u);

export const accessRequestSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  email: emailSchema,
  locale: localeSchema.default('en'),
  acceptTerms: z.literal(true),
  // Proof of work solved by the browser, and a honeypot field humans never fill in.
  pow: z.object({
    salt: z.string().length(32),
    bits: z.number().int(),
    expires: z.number().int(),
    signature: z.string().length(64),
    nonce: z.string().max(32),
  }),
  website: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128),
});

export const profileSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    avatar: avatarSchema.optional(),
    locale: localeSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export const changePasswordSchema = z.object({
  currentPassword: z.string().max(128).optional(),
  newPassword: passwordSchema,
});

export const deleteAccountSchema = z.object({
  password: z.string().max(128).optional(),
  confirm: z.string().max(64).optional(),
});

export const favoriteSchema = z.object({
  kind: z.enum(['article', 'crypto']),
  refId: z.union([z.string().trim().min(1).max(100), z.number().int().positive()]).transform(String),
});

export const articleQuerySchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  source: z.string().trim().max(80).optional().catch(undefined),
  lang: localeSchema.optional().catch(undefined),
  coin: z.string().trim().max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(500).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).catch(24).default(24),
});

export const feedSchema = z.object({
  name: z.string().trim().min(2).max(80),
  url: z.url({ protocol: /^https?$/ }).max(500),
  lang: localeSchema.default('en'),
  enabled: z.boolean().default(true),
});

export const feedPatchSchema = feedSchema.partial().refine((value) => Object.keys(value).length > 0);

export const settingsSchema = z.object({
  guestCryptoLimit: z.coerce.number().int().min(0).max(100).optional(),
  guestNewsLimit: z.coerce.number().int().min(0).max(200).optional(),
  signupsOpen: z.boolean().optional(),
});

export const roleSchema = z.object({ role: z.enum(['user', 'admin']) });
