import { log } from './log.js';

/** An error that maps to an HTTP response with a stable, translatable code. */
export class HttpError extends Error {
  constructor(status, code, extra = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

/** Validate `data` against a zod schema or throw a 400 with per-field issue codes. */
export function parse(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      if (!fields[key]) fields[key] = issue.code;
    }
    throw new HttpError(400, 'validation', { fields });
  }
  return result.data;
}

export function notFound(_req, res) {
  res.status(404).json({ error: 'not_found' });
}

// Express recognises error handlers by their arity, so `next` must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, ...err.extra });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid_json' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload_too_large' });
  }
  if (err?.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'conflict' });
  }
  log.error('Unhandled error:', err);
  return res.status(500).json({ error: 'server_error' });
}
