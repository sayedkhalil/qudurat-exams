import { sessionFromRequest, makeCookie, json, PACKAGES, PACK_SIZE } from './_auth.js';
import { levelFor } from './_levels.js';

// Returns the student's code and current package access; refreshes the cookie if the admin changed it.
export async function GET(request) {
  const s = await sessionFromRequest(request);
  if (!s) return json({ ok: false }, 401);
  const level = await levelFor(s.code);
  const headers = level !== s.level ? { 'set-cookie': await makeCookie(s.code, level) } : {};
  return json({ ok: true, code: s.code, level, packages: PACKAGES, packSize: PACK_SIZE }, 200, headers);
}
