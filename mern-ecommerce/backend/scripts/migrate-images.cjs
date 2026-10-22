// Run beside the original upload volume. Dry run is the default; no deletions.
require('../config/env');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { uploadsPath } = require('../config/uploads');
const { cloudinaryConfig, optimizeImage, uploadCloudinary } = require('../services/imageStorage');
const MediaAsset = require('../models/MediaAsset');
const targets = [['Product', ['imageUrl', 'gallery']], ['Banner', ['imageUrl']], ['Offer', ['imageUrl']]];
const apply = process.argv.includes('--apply');
const legacyPath = value => {
  if (typeof value !== 'string') return null;
  let pathname = value;
  if (value.startsWith('https://')) {
    if (!process.env.API_PUBLIC_URL) return null;
    const url = new URL(value), origin = new URL(process.env.API_PUBLIC_URL);
    if (url.origin !== origin.origin || url.search || url.hash) return null;
    pathname = url.pathname;
  }
  const match = pathname.match(/^\/uploads\/([a-zA-Z0-9_-]+\.(?:webp|png|jpe?g|gif))$/);
  return match ? path.join(uploadsPath(), match[1]) : null;
};
async function main() {
  if (!process.env.MONGO_URI) throw Error('MONGO_URI is required.');
  if (apply && !cloudinaryConfig()) throw Error('Configure all three Cloudinary variables first.');
  await mongoose.connect(process.env.MONGO_URI);
  const mappings = new Map();
  const report = { dryRun: !apply, documents: 0, references: 0, uploaded: 0, missing: 0, conflicts: 0 };
  for (const [name, fields] of targets) {
    const Model = require(`../models/${name}`);
    for await (const doc of Model.find().cursor()) {
      const updates = {};
      for (const field of fields) {
        const values = Array.isArray(doc[field]) ? [...doc[field]] : [doc[field]];
        let changed = false;
        for (let i = 0; i < values.length; i++) {
          const source = values[i], file = legacyPath(source);
          if (!file) continue;
          report.references++;
          if (!mappings.has(source)) {
            const buffer = await fs.readFile(file).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
            if (!buffer) { report.missing++; continue; }
            if (buffer.length > 5 * 1024 * 1024) throw Error('A legacy image exceeds 5 MiB. Review it before migration.');
            if (!apply) continue;
            let asset = await MediaAsset.findOne({ sourceUrl: source });
            if (!asset) {
              const { data } = await optimizeImage(buffer);
              const publicId = `yanoben/legacy/${crypto.createHash('sha256').update(data).digest('hex')}`;
              asset = await MediaAsset.findOne({ publicId });
              if (!asset) {
                const uploaded = await uploadCloudinary(data, publicId);
                asset = await MediaAsset.findOneAndUpdate({ publicId }, { $setOnInsert: { ...uploaded, sourceUrl: source } }, { upsert: true, new: true, runValidators: true });
                report.uploaded++;
              }
            }
            // Check that CDN delivery works before replacing a single reference.
            const check = await fetch(asset.url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
            if (!check.ok || !check.headers.get('content-type')?.startsWith('image/')) throw Error('CDN verification failed. Original references remain unchanged.');
            mappings.set(source, asset.url);
          }
          if (mappings.has(source)) { values[i] = mappings.get(source); changed = true; }
        }
        if (changed) updates[field] = Array.isArray(doc[field]) ? values : values[0];
      }
      if (Object.keys(updates).length) {
        // Compare the original fields to avoid overwriting a concurrent admin edit.
        const result = await Model.updateOne({ _id: doc._id, ...Object.fromEntries(Object.keys(updates).map(field => [field, doc[field]])) }, { $set: updates }, { runValidators: true });
        if (result.modifiedCount) report.documents++; else report.conflicts++;
      }
    }
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.missing || report.conflicts) process.exitCode = 2;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
