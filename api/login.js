import { validCodes, makeCookie, json } from './_auth.js';
import { levelFor } from './_levels.js';

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch {}
  const code = String(body.code || '').replace(/\D/g, '');
  if (!code || !validCodes().includes(code)) {
    return json({ ok: false, error: 'رمز الدخول غير صحيح' }, 401);
  }
  const level = await levelFor(code);
  return json({ ok: true, code, level }, 200, { 'set-cookie': await makeCookie(code, level) });
}
