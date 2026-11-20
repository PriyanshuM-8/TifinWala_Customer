import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.joinedUserId = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        // If we had a user logged in, rejoin user room on reconnect
        if (this.joinedUserId) {
          this.socket.emit('join_user', this.joinedUserId);
        }
      });
    }
    return this.socket;
  }

  joinUser(userId) {
    if (!userId) return;
    this.joinedUserId = userId;
    const s = this.connect();
    if (s.connected) {
      s.emit('join_user', userId);
    }
  }

  joinOrder(orderId) {
    if (!orderId) return;
    const s = this.connect();
    s.emit('join_order', orderId);
  }

  leaveOrder(orderId) {
    if (!orderId) return;
    if (this.socket) {
      this.socket.emit('leave_order', orderId);
    }
  }

  onOrderStatusUpdated(callback) {
    const s = this.connect();
    s.on('order_status_updated', callback);
    return () => s.off('order_status_updated', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.joinedUserId = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
