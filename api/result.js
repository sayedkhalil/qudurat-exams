import { put } from '@vercel/blob';
import { codeFromRequest, json } from './_auth.js';
import KEY from './_key.js';

const num = (v, max = 100000) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));

export async function POST(request) {
  const code = await codeFromRequest(request);
  if (!code) return json({ ok: false, error: 'انتهت الجلسة، سجّل الدخول من جديد' }, 401);
  let b = {};
  try { b = await request.json(); } catch {}
  const exam = num(b.exam, 999);
  const key = KEY[exam];
  if (!key) return json({ ok: false, error: 'رقم الاختبار غير صحيح' }, 400);
  const answers = key.map((_, i) => {
    const x = Array.isArray(b.answers) ? b.answers[i] : -1;
    return Number.isInteger(x) && x >= 0 && x <= 3 ? x : -1;
  });
  const correct = answers.filter((x, i) => x === key[i]).length;
  const skipped = answers.filter(x => x < 0).length;
  const total = key.length;
  const record = {
    code,
    exam,
    total,
    correct,
    wrong: total - correct, // unanswered questions count as wrong
    skipped,
    pct: Math.round((correct / total) * 100),
    minutes: num(b.minutes, 1000),
    name: String(b.name || '').slice(0, 40),
    answers,
    at: new Date().toISOString(),
  };
  const path = `results/${code}/exam-${String(exam).padStart(2, '0')}-${Date.now()}.json`;
  let saved = true;
  try {
    await put(path, JSON.stringify(record), { access: 'private', contentType: 'application/json', addRandomSuffix: false });
  } catch (e) {
    console.error('save failed', e);
    saved = false;
  }
  return json({ ok: true, saved, code, key, ...record });
}
