// Per-code package access, stored as one private JSON blob: { "<code>": <number of packages> }
import { get, put } from '@vercel/blob';
import { clampLevel } from './_auth.js';

const PATH = 'config/levels.json';
export const DEFAULT_LEVEL = () => clampLevel(process.env.DEFAULT_LEVEL || 1);

export async function readLevels() {
  try {
    const r = await get(PATH, { access: 'private', useCache: false });
    if (!r || r.statusCode !== 200) return {};
    return JSON.parse(await new Response(r.stream).text()) || {};
  } catch {
    return {};
  }
}

export async function levelFor(code) {
  const all = await readLevels();
  return all[code] ? clampLevel(all[code]) : DEFAULT_LEVEL();
}

export async function writeLevels(levels) {
  await put(PATH, JSON.stringify(levels), {
    access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
  });
}
