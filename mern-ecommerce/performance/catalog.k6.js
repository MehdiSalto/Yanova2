import http from 'k6/http';
import { check, sleep } from 'k6';

const base = __ENV.BASE_URL || 'http://127.0.0.1:5000';
export const options = {
  stages: [{ duration: '5s', target: 5 }, { duration: '5s', target: 20 }, { duration: '10s', target: 20 }, { duration: '5s', target: 0 }],
  thresholds: { http_req_failed: ['rate<0.01'], http_req_duration: ['p(95)<1000'], checks: ['rate>0.99'] },
};
export default function () {
  const result = http.get(`${base}/api/products?page=1&limit=12`, { tags: { name: 'public catalog' } });
  check(result, { 'catalog returns JSON': r => r.status === 200 && r.headers['Content-Type']?.includes('application/json'), 'drafts stay private': r => { try { return r.json('items').every(item => item.status === 'published'); } catch { return false; } } });
  sleep(0.1);
}
