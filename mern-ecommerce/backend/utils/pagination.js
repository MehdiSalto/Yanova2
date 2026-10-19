const pagination = (query) => {
  const number = (value, fallback, max) => /^\d+$/.test(String(value || ''))
    ? Math.min(max, Math.max(1, Number(value))) : fallback;
  const page = number(query.page, 1, 100000);
  const limit = number(query.limit, 20, 100);
  return { page, limit, skip: (page - 1) * limit };
};
const list = async (Model, filter, query, sort = { createdAt: -1 }) => {
  const { page, limit, skip } = pagination(query);
  const [items, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Model.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
const search = (value) => typeof value === 'string' && value.trim()
  ? new RegExp(value.trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
const pick = (body, fields) => Object.fromEntries(fields.filter((key) => Object.hasOwn(body, key)).map((key) => [key, body[key]]));
module.exports = { pagination, list, search, pick };
