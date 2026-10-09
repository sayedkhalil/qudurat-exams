import { put } from '@vercel/blob';
import { codeFromRequest, json } from './_auth.js';

const num = (v, max = 100000) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));

export async function POST(request) {
  const code = await codeFromRequest(request);
  if (!code) return json({ ok: false, error: 'انتهت الجلسة، سجّل الدخول من جديد' }, 401);
  let b = {};
  try { b = await request.json(); } catch {}
  const exam = num(b.exam, 999);
  const total = num(b.total, 500);
  const record = {
    code,
    exam,
    start: num(b.start),
    total,
    correct: num(b.correct, total),
    wrong: num(b.wrong, total),
    skipped: num(b.skipped, total),
    pct: num(b.pct, 100),
    minutes: num(b.minutes, 1000),
    name: String(b.name || '').slice(0, 40),
    answers: Array.isArray(b.answers) ? b.answers.slice(0, 500).map(x => (Number.isInteger(x) ? x : -1)) : [],
    at: new Date().toISOString(),
  };
  const path = `results/${code}/exam-${String(exam).padStart(2, '0')}-${Date.now()}.json`;
  await put(path, JSON.stringify(record), {
    access: 'private', contentType: 'application/json', addRandomSuffix: false,
  });
  return json({ ok: true, code });
}
