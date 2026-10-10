import { validCodes, clampLevel, json } from './_auth.js';
import { readLevels, writeLevels } from './_levels.js';

// Admin: set the number of packages for one or more codes. Body: { codes: ["123456", ...], level: 1..5 }
export async function POST(request) {
  const key = request.headers.get('x-admin-key') || '';
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return json({ ok: false, error: 'كلمة مرور الإدارة غير صحيحة' }, 401);
  }
  let b = {};
  try { b = await request.json(); } catch {}
  const valid = new Set(validCodes());
  const codes = (Array.isArray(b.codes) ? b.codes : []).map(String).filter(c => valid.has(c));
  if (!codes.length) return json({ ok: false, error: 'لم يتم تحديد رموز صحيحة' }, 400);
  const level = clampLevel(b.level);
  const levels = await readLevels();
  codes.forEach(c => { levels[c] = level; });
  await writeLevels(levels);
  return json({ ok: true, updated: codes.length, level, levels });
}
