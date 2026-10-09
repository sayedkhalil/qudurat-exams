// Shared helpers: signed session cookie for student access codes.
const enc = new TextEncoder();

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

export async function makeCookie(code) {
  const v = `${code}.${await hmac(code)}`;
  return `sc=${v}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 120}`;
}

export function clearCookie() {
  return 'sc=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

export async function codeFromRequest(request) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.match(/(?:^|;\s*)sc=([0-9]+)\.([0-9a-f]{64})/);
  if (!m) return null;
  const [, code, sig] = m;
  if (sig !== await hmac(code)) return null;
  if (!validCodes().includes(code)) return null;
  return code;
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}
