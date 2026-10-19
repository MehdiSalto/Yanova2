let memorySession;
const randomId = () => Array.from(window.crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2,'0')).join('');
export const sessionId = () => {
  if (memorySession) return memorySession;
  try { memorySession = sessionStorage.getItem('yanova:session'); if (!memorySession || !/^[a-zA-Z0-9_-]{16,80}$/.test(memorySession)) { memorySession = randomId(); sessionStorage.setItem('yanova:session', memorySession); } }
  catch { memorySession = randomId(); }
  return memorySession;
};
export const trackingInfo = () => ({ sessionId: sessionId(), eventId: randomId(), device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop' });
