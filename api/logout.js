import { clearCookie } from './_auth.js';

export function GET(request) {
  return new Response(null, { status: 302, headers: { location: '/login', 'set-cookie': clearCookie() } });
}
