import { REPO_URL, contactEmail, siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

/** RFC 9116: how to report a vulnerability. */
export function GET() {
  const email = contactEmail();
  const expires = new Date(Date.now() + 365 * 86_400_000).toISOString();
  const lines = [
    ...(email ? [`Contact: mailto:${email}`] : []),
    `Contact: ${REPO_URL}/security/advisories/new`,
    `Expires: ${expires}`,
    'Preferred-Languages: fr, en',
    `Canonical: ${siteUrl()}/.well-known/security.txt`,
    `Policy: ${REPO_URL}/blob/main/SECURITY.md`,
  ];
  return new Response(`${lines.join('\n')}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=86400' } });
}
