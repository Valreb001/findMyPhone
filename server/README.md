# Find My Phone - Server

Node.js + Socket.io backend for real-time location tracking.

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Running

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Socket.io Events

### Device Events

**Emit from device:**
- `device:join` - Device joins tracking room
- `position:update` - Device sends location update
- `compass:heading` - Device sends compass heading

**Listen from device:**
- `device_joined` - Confirmation device joined room
- `device:ring` - Owner requests device to ring
- `compass:request` - Owner requests compass heading

### Owner Events

**Emit from owner:**
- `owner:join` - Owner joins tracking room
- `device:ring` - Request to ring the device
- `compass:request` - Request compass heading

**Listen from owner:**
- `owner_joined` - Confirmation owner joined room
- `position_update` - Receive location update from device
- `device_status` - Device online/offline status
- `compass:heading` - Receive compass heading from device

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/rooms/:roomId/status` - Get room status

## Architecture

The server uses a room-based architecture where:

1. Device and Owner connect via Socket.io
2. Both join the same room using a room ID
3. Position updates flow from device → server → owner
4. Ring requests flow from owner → server → device
5. RoomManager tracks all active rooms and connections
