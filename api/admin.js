import { list, get } from '@vercel/blob';
import { validCodes, json, PACKAGES } from './_auth.js';
import { readLevels, DEFAULT_LEVEL } from './_levels.js';

export async function GET(request) {
  const key = request.headers.get('x-admin-key') || '';
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return json({ ok: false, error: 'كلمة مرور الإدارة غير صحيحة' }, 401);
  }
  const blobs = [];
  let cursor;
  do {
    const r = await list({ prefix: 'results/', cursor, limit: 1000 });
    blobs.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);

  const results = [];
  for (let i = 0; i < blobs.length; i += 40) {
    const chunk = await Promise.all(blobs.slice(i, i + 40).map(async (bl) => {
      try {
        const r = await get(bl.pathname, { access: 'private' });
        if (!r || r.statusCode !== 200) return null;
        return JSON.parse(await new Response(r.stream).text());
      } catch { return null; }
    }));
    results.push(...chunk.filter(Boolean));
  }
  results.sort((a, b) => (a.at < b.at ? 1 : -1));
  return json({ ok: true, codes: validCodes(), results, levels: await readLevels(), defaultLevel: DEFAULT_LEVEL(), packages: PACKAGES });
}
