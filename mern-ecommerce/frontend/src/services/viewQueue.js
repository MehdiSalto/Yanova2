const queue = new Map();
let timer;
let send;
let flushing = false;
const flush = async () => {
  clearTimeout(timer); timer = null;
  if (flushing || !queue.size || !send) return;
  flushing = true;
  const batch = [...queue.values()].slice(0, 25);
  for (const item of batch) queue.delete(item.eventId);
  try { await send(batch.map(({ productId, eventId }) => ({ productId, eventId }))); batch.forEach(item => item.resolve()); }
  catch (error) { batch.forEach(item => item.reject(error)); }
  finally { flushing = false; if (queue.size) timer = setTimeout(flush, 500); }
};
export const enqueueView = (productId, eventId, sender) => {
  send = sender;
  if (queue.has(eventId)) return queue.get(eventId).promise;
  if (queue.size >= 100) return Promise.reject(new Error('View queue is full.'));
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  queue.set(eventId, { productId, eventId, resolve, reject, promise });
  if (queue.size >= 25) void flush();
  else if (!timer) timer = setTimeout(flush, 1000);
  return promise;
};
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void flush(); });
