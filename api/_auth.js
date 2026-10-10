// Shared helpers: signed session cookie "code.level.sig" for student access codes.
const enc = new TextEncoder();
export const PACKAGES = 5;          // 50 tests -> 5 packages of 10
export const PACK_SIZE = 10;

async function hmac(text) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(process.env.SESSION_SECRET || ''),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(text));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function validCodes() {
  return (process.env.ACCESS_CODES || '').split(/[\s,]+/).filter(Boolean);
}

export function clampLevel(v) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(1, Math.min(PACKAGES, n)) : 1;
}

export const packageOf = (exam) => Math.ceil(Number(exam) / PACK_SIZE);

export async function makeCookie(code, level) {
  const body = `${code}.${clampLevel(level)}`;
  return `sc=${body}.${await hmac(body)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 120}`;
}

export function clearCookie() {
  return 'sc=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

// Returns { code, level } from a valid cookie, or null.
export async function sessionFromRequest(request) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.match(/(?:^|;\s*)sc=([0-9]+)\.([0-9]+)\.([0-9a-f]{64})/);
  if (!m) return null;
  const [, code, level, sig] = m;
  if (sig !== await hmac(`${code}.${level}`)) return null;
  if (!validCodes().includes(code)) return null;
  return { code, level: clampLevel(level) };
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}
