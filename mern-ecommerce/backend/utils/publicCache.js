const crypto = require('crypto');
const entries = new Map();
const pending = new Map();
const generations = new Map();
let bytes = 0;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_ENTRIES = 200;

const remove = key => { const value = entries.get(key); if (value) bytes -= value.bytes; entries.delete(key); };
const invalidatePublic = (scope, req) => {
  generations.set(scope, (generations.get(scope) || 0) + 1);
  for (const key of entries.keys()) if (key.startsWith(`${scope}:`)) remove(key);
  req?.app.get('io')?.emit('catalog:update', { revision: crypto.randomUUID() });
};
const clearPublicCache = () => { entries.clear(); pending.clear(); generations.clear(); bytes = 0; };
const expirySeconds = (value, maximum) => {
  let seconds = maximum;
  for (const item of value?.items || []) {
    if (item.expiresAt) seconds = Math.min(seconds, (new Date(item.expiresAt).getTime() - Date.now()) / 1000);
  }
  return Math.max(0, Math.floor(seconds));
};

// Only explicit public controllers use this cache. Management never reads it.
// Collapse identical reads and bound memory so search traffic cannot grow it forever.
const sendPublic = async (req, res, scope, load, seconds = 60) => {
  if (req.management) { res.set('Cache-Control', 'private, no-store'); return res.json(await load()); }
  const query = Object.entries(req.query).filter(([key]) => key !== '_v').sort(([a], [b]) => a.localeCompare(b));
  const key = `${scope}:${req.path}:${JSON.stringify(query)}`;
  const generation = generations.get(scope) || 0;
  const workKey = `${generation}:${key}`;
  let entry = entries.get(key);
  const hit = !!entry && entry.expires > Date.now();
  if (!hit) {
    remove(key);
    if (!pending.has(workKey)) {
      const work = Promise.resolve().then(load).then(result => {
        const body = JSON.stringify(result);
        const value = JSON.parse(body);
        const ttl = scope === 'offers' ? expirySeconds(value, seconds) : seconds;
        const fresh = { value, expires: Date.now() + ttl * 1000, bytes: Buffer.byteLength(body) };
        if ((generations.get(scope) || 0) === generation && ttl > 0 && fresh.bytes <= MAX_BYTES / 2) {
          while (entries.size >= MAX_ENTRIES || bytes + fresh.bytes > MAX_BYTES) remove(entries.keys().next().value);
          entries.set(key, fresh); bytes += fresh.bytes;
        }
        return fresh;
      }).finally(() => pending.delete(workKey));
      pending.set(workKey, work);
    }
    entry = await pending.get(workKey);
  }
  const ttl = Math.max(0, Math.floor((entry.expires - Date.now()) / 1000));
  res.set('Cache-Control', ttl ? `public, max-age=0, s-maxage=${ttl}, must-revalidate` : 'no-store');
  res.set('X-Catalog-Cache', hit ? 'HIT' : 'MISS');
  res.set('X-Catalog-Expires', String(entry.expires));
  return res.json(entry.value);
};
module.exports = { sendPublic, invalidatePublic, clearPublicCache, expirySeconds };
