const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const { uploadsPath } = require('../config/uploads');
const httpError = require('../utils/httpError');

const cloudinaryConfig = () => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud && !key && !secret) return null;
  if (!cloud || !key || !secret || !/^[a-zA-Z0-9_-]+$/.test(cloud)) throw httpError(503, 'Image storage is not fully configured.');
  return { cloud, key, secret };
};
const optimizeImage = async buffer => {
  try {
    return await sharp(buffer, { limitInputPixels: 20000000, failOn: 'error' }).rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  } catch { throw httpError(400, 'This image is invalid or exceeds the 20 megapixel limit.'); }
};
const uploadCloudinary = async (buffer, publicId = `yanoben/${crypto.randomUUID()}`) => {
  const config = cloudinaryConfig();
  if (!config) throw httpError(503, 'Configure Cloudinary before migrating images.');
  const params = { overwrite: 'false', public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
  const signature = crypto.createHash('sha256').update(Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&') + config.secret).digest('hex');
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...params, api_key: config.key, signature })) form.append(key, value);
  form.append('file', new Blob([buffer], { type: 'image/webp' }), 'image.webp');
  let response, asset;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloud}/image/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(30000) });
    asset = await response.json();
  } catch { throw httpError(502, 'Image storage is temporarily unavailable. Please try again.'); }
  if (!response.ok || !asset.secure_url || asset.public_id !== publicId) throw httpError(502, 'Image storage rejected the upload. Check its configuration and quota.');
  const url = new URL(asset.secure_url);
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.startsWith(`/${config.cloud}/image/upload/`)) throw httpError(502, 'Image storage returned an invalid image URL.');
  return { url: asset.secure_url, provider: 'cloudinary', publicId: asset.public_id, version: asset.version, width: asset.width, height: asset.height, bytes: asset.bytes, format: asset.format };
};
const storeImage = async buffer => {
  const { data, info } = await optimizeImage(buffer);
  if (cloudinaryConfig()) return uploadCloudinary(data);
  const filename = `${crypto.randomUUID()}.webp`;
  await fs.mkdir(uploadsPath(), { recursive: true });
  await fs.writeFile(path.join(uploadsPath(), filename), data, { flag: 'wx' });
  return { url: `/uploads/${filename}`, provider: 'local', width: info.width, height: info.height, bytes: info.size, format: 'webp' };
};
module.exports = { cloudinaryConfig, optimizeImage, uploadCloudinary, storeImage };
