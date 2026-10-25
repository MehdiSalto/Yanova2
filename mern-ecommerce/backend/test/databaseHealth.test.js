const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const { readinessHandler } = require('../utils/databaseHealth');
const { errorHandler } = require('../middleware/errorHandler');

test('readiness detects denied database reads even when the connection is open', async () => {
  const connection = { readyState: 1, db: { collection: () => ({ findOne: async () => { throw Object.assign(new Error('private database details'), { name: 'MongoServerError', code: 13 }); } }) } };
  const app = express(); app.get('/health', readinessHandler(connection));
  const server = http.createServer(app); await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);
    assert.equal(response.status, 503); assert.match(response.headers.get('Cache-Control'), /no-store/);
    assert.deepEqual(await response.json(), { status: 'unavailable', code: 'DATABASE_ACCESS_DENIED' });
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('an empty but readable catalog is ready; a disconnected database is not', async () => {
  const { checkDatabase } = require('../utils/databaseHealth');
  const connection = { readyState: 1, db: { collection: () => ({ findOne: async () => null }) } };
  assert.deepEqual(await checkDatabase(connection), { status: 'ready' });
  assert.deepEqual(await checkDatabase({ readyState: 0 }), { status: 'unavailable', code: 'DATABASE_DISCONNECTED' });
});

test('database errors are actionable without disclosing credentials in responses or logs', context => {
  const logs = []; context.mock.method(console, 'error', value => logs.push(value));
  for (const [number, code] of [[13, 'DATABASE_ACCESS_DENIED'], [18, 'DATABASE_AUTH_FAILED']]) {
    const err = Object.assign(new Error('mongodb+srv://private-user:private-password@private-host/secret-db'), { name: 'MongoServerError', code: number });
    const res = { headersSent: false, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; return this; } };
    errorHandler(err, { method: 'GET', path: '/api/products' }, res);
    assert.equal(res.statusCode, 503); assert.equal(res.body.code, code);
    assert(!JSON.stringify(res.body).includes('private-password'));
  }
  assert(logs.every(line => !line.includes('private-password') && !line.includes('secret-db')));
  assert.equal(JSON.parse(logs[0]).code, 13);
});
