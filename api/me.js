import { codeFromRequest, json } from './_auth.js';

export async function GET(request) {
  const code = await codeFromRequest(request);
  return code ? json({ ok: true, code }) : json({ ok: false }, 401);
}
