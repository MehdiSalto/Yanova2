import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { productAPI } from '../services/api';
import { pageInstance, sessionId } from '../services/tracking';
const requests = new Map();
// One impression per product per navigation, including duplicated featured cards.
// A product must be at least half visible for one second in a visible tab.
export default function useProductView(productId) {
  const ref = useRef(null);
  const { key } = useLocation();
  useEffect(() => {
    const element = ref.current;
    if (!element || !productId || !window.IntersectionObserver) return;
    const eventId = `pv_${sessionId().slice(0, 32)}_${pageInstance}_${key}_${productId}`;
    let timer; let inView = false; let stopped = false;
    const schedule = () => {
      clearTimeout(timer);
      if (!inView || document.visibilityState !== 'visible' || requests.has(eventId)) return;
      timer = setTimeout(() => {
        if (stopped || requests.has(eventId) || document.visibilityState !== 'visible') return;
        const request = productAPI.view(productId, eventId);
        requests.set(eventId, request);
        if (requests.size > 500) requests.delete(requests.keys().next().value);
        request.catch(() => { requests.delete(eventId); });
      }, 1000);
    };
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5;
      schedule();
    }, { threshold: [0, 0.5] });
    observer.observe(element);
    document.addEventListener('visibilitychange', schedule);
    return () => { stopped = true; clearTimeout(timer); observer.disconnect(); document.removeEventListener('visibilitychange', schedule); };
  }, [productId, key]);
  return ref;
}
