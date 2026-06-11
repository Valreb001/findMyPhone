/**
 * client/src/modules/socket/socketManager.js
 * Manage Socket.io connection for real-time communication
 */

import { io } from 'socket.io-client';

// Dynamically determine server URL based on current location
// const getServerUrl = () => {
//   const { hostname, protocol } = window.location;

//   const url = `${protocol}//${hostname}:3000`;

//   console.log('[SOCKET] Using dynamic server URL:', url);

//   return url;
// };

// const SERVER_URL = getServerUrl();

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  "http://localhost:3000";

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  /**
   * Initialize socket connection
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SERVER_URL, {
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log(`[SOCKET] Connected: ${this.socket.id}`);
          this.emit('connection_status', 'connected');
          resolve(this.socket.id);
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('[SOCKET] Disconnected');
          this.emit('connection_status', 'disconnected');
        });

        this.socket.on('reconnecting', () => {
          this.emit('connection_status', 'reconnecting');
        });

        this.socket.on('connect_error', (error) => {
          console.error('[SOCKET] Connection error:', error);
          this.emit('connection_error', error);
          reject(error);
        });
      } catch (error) {
        console.error('[SOCKET] Failed to initialize:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Emit event to server
   */
  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn(`[SOCKET] Cannot emit ${event}, not connected`);
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen for server events
   */
  on(event, callback) {
    if (!this.socket) return;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);
    this.socket.on(event, callback);
  }

  /**
   * Listen once then remove
   */
  once(event, callback) {
    if (!this.socket) return;
    this.socket.once(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Check if connected
   */
  getIsConnected() {
    return this.isConnected;
  }

  /**
   * Get socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Export singleton
export const socketManager = new SocketManager();
