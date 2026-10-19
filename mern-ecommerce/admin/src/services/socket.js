import { io } from 'socket.io-client';
const url = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api\/?$/, '').replace(/\/$/, '');
const socket = io(url, { withCredentials: true, autoConnect: false, auth: { role: 'admin' } });
export default socket;
