import { next } from '@vercel/functions';
import { sessionFromRequest, packageOf } from './api/_auth.js';

// Everything requires a valid student code except the login page, the admin page, APIs and static assets.
export const config = {
  matcher: ['/((?!login|admin|api/|assets/|favicon).*)'],
};

export default async function middleware(request) {
  const s = await sessionFromRequest(request);
  const url = new URL(request.url);
  if (!s) return Response.redirect(new URL('/login', request.url), 302);

  // Package gate for test pages and question images.
  const m = url.pathname.match(/^\/(?:exams\/exam-|q\/v)(\d+)/);
  if (m && packageOf(m[1]) > s.level) {
    if (url.pathname.startsWith('/q/')) return new Response('Forbidden', { status: 403 });
    return Response.redirect(new URL(`/?locked=${packageOf(m[1])}`, request.url), 302);
  }
  return next();
}
