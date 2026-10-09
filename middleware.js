import { next } from '@vercel/functions';
import { codeFromRequest } from './api/_auth.js';

// Everything requires a valid student code except the login page, the admin page, APIs and static assets.
export const config = {
  matcher: ['/((?!login|admin|api/|assets/|favicon).*)'],
};

export default async function middleware(request) {
  const code = await codeFromRequest(request);
  if (code) return next();
  const url = new URL('/login', request.url);
  return Response.redirect(url, 302);
}
