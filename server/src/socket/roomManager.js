/**
 * server/src/socket/roomManager.js
 * Manages tracking rooms, devices, and owners
 */

/**
 * RoomManager handles room creation, device/owner associations,
 * and real-time location tracking state
 */
export class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomId -> { devices: [], owners: [], latestLocation: {} }
  }

  /**
   * Add device to room
   */
  addDevice(roomId, socketId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        devices: [],
        owners: [],
        latestLocation: null,
        createdAt: new Date(),
      });
    }

    const room = this.rooms.get(roomId);
    
    if (!room.devices.includes(socketId)) {
      room.devices.push(socketId);
      console.log(`[ROOM] Device ${socketId} added to room ${roomId}`);
    }
  }

  /**
   * Add owner to room
   */
  addOwner(roomId, socketId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        devices: [],
        owners: [],
        latestLocation: null,
        createdAt: new Date(),
      });
    }

    const room = this.rooms.get(roomId);
    
    if (!room.owners.includes(socketId)) {
      room.owners.push(socketId);
      console.log(`[ROOM] Owner ${socketId} added to room ${roomId}`);
    }
  }

  /**
   * Remove client from room (device or owner)
   */
  removeClient(roomId, socketId) {
    if (!this.rooms.has(roomId)) return;

    const room = this.rooms.get(roomId);
    
    room.devices = room.devices.filter(id => id !== socketId);
    room.owners = room.owners.filter(id => id !== socketId);

    console.log(`[ROOM] Client ${socketId} removed from room ${roomId}`);

    // Clean up empty rooms
    if (room.devices.length === 0 && room.owners.length === 0) {
      this.rooms.delete(roomId);
      console.log(`[ROOM] Empty room ${roomId} deleted`);
    }
  }

  /**
   * Update device location in room
   */
  updateDeviceLocation(roomId, locationData) {
    if (!this.rooms.has(roomId)) return;

    const room = this.rooms.get(roomId);
    room.latestLocation = locationData;
  }

  /**
   * Get device ID for a room
   */
  getDeviceId(roomId) {
    if (!this.rooms.has(roomId)) return null;
    
    const room = this.rooms.get(roomId);
    return room.devices.length > 0 ? room.devices[0] : null;
  }

  /**
   * Get device status
   */
  getDeviceStatus(roomId) {
    if (!this.rooms.has(roomId)) return null;

    const room = this.rooms.get(roomId);
    
    return {
      status: room.devices.length > 0 ? 'online' : 'offline',
      deviceId: room.devices.length > 0 ? room.devices[0] : null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get room status for API
   */
  getRoomStatus(roomId) {
    if (!this.rooms.has(roomId)) return null;

    const room = this.rooms.get(roomId);
    
    return {
      roomId,
      deviceCount: room.devices.length,
      ownerCount: room.owners.length,
      isOnline: room.devices.length > 0,
      latestLocation: room.latestLocation,
      createdAt: room.createdAt,
    };
  }

  /**
   * Get all active rooms (for monitoring/debugging)
   */
  getAllRooms() {
    const rooms = [];
    
    this.rooms.forEach((room, roomId) => {
      rooms.push({
        roomId,
        deviceCount: room.devices.length,
        ownerCount: room.owners.length,
        isOnline: room.devices.length > 0,
      });
    });

    return rooms;
  }
}
