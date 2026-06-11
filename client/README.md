# Find My Phone - Client

Real-time location tracking web application using Leaflet, Socket.io, and Geolocation API.

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_SERVER_URL=http://localhost:3000
```

## Running

Development server:
```bash
npm run dev
```

Open in browser:
- Device view: `http://localhost:5173`
- Owner view: `http://localhost:5173/?room=XXXXXX`

Production build:
```bash
npm run build
npm run preview
```

## Architecture

### Device View (`src/views/device/deviceView.js`)
- Requests geolocation permission
- Continuously sends GPS coordinates to server
- Receives ring events and plays alert sound
- Generates unique room code

### Owner View (`src/views/owner/ownerView.js`)
- Joins tracking session via room code
- Displays device location on interactive map
- Shows device status (online/offline)
- Ring button to locate device
- Compass showing bearing to device
- Breadcrumb trail of device path

### Modules

- **Socket**: Real-time Socket.io communication
- **GPS Tracker**: Geolocation API wrapper
- **Map Manager**: Leaflet map management
- **Audio Ringer**: Web Audio API for ring tones
- **Compass Manager**: Device orientation handling
- **DOM Helpers**: UI update utilities

### Utils

- **Room Generator**: Unique room code generation
- **Haversine**: Distance calculations
- **Bearing**: Directional calculations

## Socket Events

### Device

**Emit:**
- `device:join` - Join tracking room
- `position:update` - Send location update
- `compass:heading` - Send compass heading

**Listen:**
- `device_joined` - Room join confirmation
- `device:ring` - Owner ringing device
- `compass:request` - Owner requesting compass

### Owner

**Emit:**
- `owner:join` - Join tracking room
- `device:ring` - Ring the device
- `compass:request` - Request compass heading

**Listen:**
- `owner_joined` - Room join confirmation
- `position_update` - Location from device
- `device_status` - Device online/offline
- `compass:heading` - Compass from device

## Features

✅ Real-time location tracking
✅ Room-based tracking sessions
✅ Unique 6-character room codes
✅ Device online/offline status
✅ Last-seen timestamp
✅ Ring device feature
✅ Compass bearing to device
✅ Breadcrumb trail visualization
✅ Distance calculations
✅ Responsive design
✅ Mobile-optimized UI

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+ requires orientation permission)
- Mobile browsers: Recommended for both device and owner views

## Security Notes

- Room codes are 6-character alphanumeric (non-sequential)
- No authentication required (suitable for trusted networks)
- All communication via Socket.io (no location exposed to third parties)
- Location data only shared between device and owner in same room
