let memorySession;
let memoryVisitor;
const randomId = () => Array.from(window.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2,'0')).join('');
export const sessionId = () => {
  if (memorySession) return memorySession;
  try { memorySession = sessionStorage.getItem('yanoben:session'); if (!memorySession || !/^[a-zA-Z0-9_-]{16,80}$/.test(memorySession)) { memorySession = randomId(); sessionStorage.setItem('yanoben:session', memorySession); } }
  catch { memorySession = randomId(); }
  return memorySession;
};
export const visitorId = () => {
  if (memoryVisitor) return memoryVisitor;
  try {
    memoryVisitor = localStorage.getItem('yanoben:visitor');
    if (!memoryVisitor || !/^[a-zA-Z0-9_-]{16,80}$/.test(memoryVisitor)) {
      memoryVisitor = randomId(); localStorage.setItem('yanoben:visitor', memoryVisitor);
    }
  } catch { memoryVisitor = sessionId(); }
  return memoryVisitor;
};
export const pageInstance = randomId().slice(0, 16);
export const trackingInfo = () => ({ visitorId: visitorId(), sessionId: sessionId(), eventId: randomId(), device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop' });

