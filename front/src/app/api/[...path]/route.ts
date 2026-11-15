import type { NextRequest } from 'next/server';

/**
 * Same-origin proxy to the internal API container. The browser only ever talks
 * to this domain (no CORS, httpOnly cookies just work), and the API itself is
 * never exposed publicly.
 */
const API = (process.env.API_INTERNAL_URL || 'http://localhost:8080').replace(/\/+$/, '');

const HOP_BY_HOP = ['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'proxy-connection', 'te', 'trailer'];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const incoming = new URL(request.url);
  const target = `${API}/api/${path.map(encodeURIComponent).join('/')}${incoming.search}`;

  const headers = new Headers(request.headers);
  for (const name of [...HOP_BY_HOP, 'host', 'content-length', 'accept-encoding']) headers.delete(name);
  headers.set('x-forwarded-host', request.headers.get('host') ?? incoming.host);
  headers.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') ?? incoming.protocol.replace(':', ''));

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return Response.json({ error: 'server_error' }, { status: 502 });
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of [...HOP_BY_HOP, 'content-encoding', 'content-length']) responseHeaders.delete(name);
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
}

export const dynamic = 'force-dynamic';
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as HEAD };
