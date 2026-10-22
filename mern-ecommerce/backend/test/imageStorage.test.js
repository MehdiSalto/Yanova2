const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const sharp = require('sharp');
const { storeImage, optimizeImage } = require('../services/imageStorage');
afterEach(() => { for (const name of ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET']) delete process.env[name]; });
const configure = () => Object.assign(process.env, { CLOUDINARY_CLOUD_NAME: 'isolated-test', CLOUDINARY_API_KEY: 'fake-key', CLOUDINARY_API_SECRET: 'fake-secret' });
test('normalizes large images without upscaling small ones and rejects invalid content', async () => {
  const source = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: '#ccc' } }).png().toBuffer();
  const { info } = await optimizeImage(source); assert.equal(info.width, 2560); assert.equal(info.format, 'webp');
  await assert.rejects(optimizeImage(Buffer.from('<html>invalid</html>')), /invalid/);
});
test('signs Cloudinary uploads on the server and returns versioned CDN metadata', async context => {
  configure();
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.cloudinary.com/v1_1/isolated-test/image/upload');
    const form = options.body;
    const text = ['overwrite','public_id','timestamp'].map(key => `${key}=${form.get(key)}`).join('&') + 'fake-secret';
    assert.equal(form.get('signature'), crypto.createHash('sha256').update(text).digest('hex'));
    assert.equal(form.get('overwrite'), 'false'); assert(form.get('file').size > 0);
    return Response.json({ public_id: form.get('public_id'), secure_url: `https://res.cloudinary.com/isolated-test/image/upload/v1/${form.get('public_id')}.webp`, version: 1, width: 20, height: 20, bytes: 100, format: 'webp' });
  });
  const bytes = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#ccc' } }).png().toBuffer();
  const result = await storeImage(bytes);
  assert.equal(result.provider, 'cloudinary'); assert.equal(result.version, 1); assert.equal(result.width, 20);
  assert(!JSON.stringify(result).includes('fake-secret'));
});
test('partial credentials fail closed instead of silently writing to ephemeral disk', async () => {
  process.env.CLOUDINARY_CLOUD_NAME = 'isolated-test';
  const bytes = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#ccc' } }).png().toBuffer();
  await assert.rejects(storeImage(bytes), /not fully configured/);
});
