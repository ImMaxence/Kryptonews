/** Container health check for the web front (does not depend on the API). */
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ status: 'ok' });
}
