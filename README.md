# Find My Phone 🗺️

Production-grade real-time phone tracking system. Refactored from Live Location Tracker into a complete client-server architecture with room-based tracking.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start Server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3000`

### 3. Start Client (in another terminal)

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173`

### 4. Open in Browser

- **Device View** (Phone to be tracked): `http://localhost:5173`
- **Owner View** (Dashboard): Open URL shown in device view, or manually: `http://localhost:5173/?room=XXXXXX`

## 📋 Features

### Device View
- ✅ GPS location tracking with permission request
- ✅ Real-time position updates to server
- ✅ Unique 6-character room code generation (e.g., `A7K9F2`)
- ✅ Shareable owner URL
- ✅ Ring request response with audio alert
- ✅ Compass heading transmission
- ✅ Live event log display
- ✅ Position data display (lat, lng, accuracy)

### Owner Dashboard
- ✅ Real-time location display on Leaflet map
- ✅ Device status indicator (online/offline/reconnecting)
- ✅ Last-seen timestamp
- ✅ Ring device button
- ✅ Compass with bearing to device
- ✅ Breadcrumb trail of device movement
- ✅ Accuracy radius visualization
- ✅ Map centering and layer selection
- ✅ Event log

### Backend
- ✅ Socket.io room-based tracking
- ✅ Real-time position relay
- ✅ Device status management
- ✅ Room lifecycle management
- ✅ RESTful API endpoints
- ✅ Graceful error handling
- ✅ CORS support
- ✅ Environment configuration

## 📁 Project Structure

```
find-my-phone/
├── server/
│   ├── src/
│   │   ├── index.js                 # Express + Socket.io server
│   │   ├── socket/
│   │   │   └── roomManager.js       # Room and session management
│   │   └── services/
│   │       └── trackingService.js   # Distance/bearing calculations
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── client/
│   ├── src/
│   │   ├── main.js                  # Entry point
│   │   ├── views/
│   │   │   ├── device/deviceView.js
│   │   │   └── owner/ownerView.js
│   │   ├── modules/
│   │   │   ├── socket/socketManager.js
│   │   │   ├── map/mapManager.js
│   │   │   ├── tracking/gpsTracker.js
│   │   │   ├── compass/compassManager.js
│   │   │   ├── audio/audioRinger.js
│   │   │   └── ui/domHelpers.js
│   │   ├── utils/
│   │   │   ├── roomGenerator.js
│   │   │   ├── haversine.js
│   │   │   └── bearing.js
│   │   └── styles/
│   │       └── main.css
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── README.md
```

## 🔧 Configuration

### Server (.env)

```
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```
VITE_SERVER_URL=http://localhost:3000
```

## 🎯 How It Works

### Room Creation & Sharing

1. Device view generates unique 6-character room code (e.g., `A7K9F2`)
2. Code displayed to user with shareable link
3. Owner opens: `http://app.com/?room=A7K9F2`
4. Both device and owner join same Socket.io room
5. Real-time sync begins

### Position Tracking

1. **Device** calls `navigator.geolocation.watchPosition()`
2. **Device** emits `position:update` event to server with GPS data
3. **Server** stores position in room state via RoomManager
4. **Server** broadcasts to all owners in room
5. **Owner** receives `position_update` event
6. **Owner** updates map marker, accuracy circle, and trail

### Device Ring Feature

1. **Owner** clicks "Ring Device" button
2. **Owner** emits `device:ring` event
3. **Server** relays to device in same room
4. **Device** receives `device:ring` event
5. **Device** plays audible tone using Web Audio API
6. **Device** triggers visual alert

### Compass Bearing

1. **Owner** dashboard requests bearing via `compass:request`
2. **Server** relays to device
3. **Device** sends back heading via `compass:heading`
4. **Owner** calculates bearing to device
5. **Compass SVG** rotates to show:
   - Blue line: Device heading (compass)
   - Red dashed line: Bearing to device from owner

### Status Management

- Device joins room → status = `online`
- Device sends position → owner receives update
- Device disconnects → status = `offline`
- Owner can see real-time status indicator

## 📊 Socket.io Event Flow

```
┌─────────────┐                    ┌─────────────┐
│   Device    │                    │ Owner/Owner  │
└─────────────┘                    └─────────────┘
       │                                  │
       │ device:join(room)                │
       ├────────────────────────────────→ [Server]
       │                                  │
       │                           owner:join(room)
       │                           ← ─ ─ ─ ─ ─ ─ ─
       │
       │ position:update ──┐
       │ position:update   ├──→ [Server] ──→ [Owner] position_update
       │ position:update ──┘
       │
       │                        [Owner] device:ring
       │                           ← ─ ─ ─ ─ ─ ─
       │ device:ring event
       ├────────────────────────────────→ [Device]
       │ (play sound, visual alert)
       │
```

## 🚀 Deployment

### Server (Node.js)

```bash
# Build
npm run build

# Start production
npm start

# Or with PM2
pm2 start server/src/index.js --name "find-my-phone-server"
```

### Client (Static + SPA)

```bash
# Build
npm run build

# Deploy dist/ folder to:
# - Vercel, Netlify, GitHub Pages
# - Apache/Nginx
# - Any static hosting
```

### Docker

```dockerfile
# Server Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Client Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY client .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Full | Best experience |
| Firefox | ✅ Full | All features work |
| Safari  | ✅ Full | iOS 13+ needs orientation permission |
| Edge    | ✅ Full | Chromium-based |
| Mobile  | ✅ Full | Optimized for small screens |

## 🔒 Security Considerations

- **Room codes**: 6-character alphanumeric (2.2 billion combinations)
- **No authentication**: Suitable for trusted networks (friends, family)
- **No database**: Room state in-memory only (cleared on server restart)
- **Socket.io CORS**: Configured to allow only client URL
- **No location persistence**: Data not stored

### For Production:
- Add authentication (JWT, OAuth)
- Implement database for location history
- Add rate limiting
- Use HTTPS/WSS
- Add admin dashboard for monitoring
- Implement data retention policies

## 🎮 Usage Examples

### Scenario 1: Find Lost Phone

1. Person with phone clicks "Start Tracking"
2. Phone generates room code: `K2M7P9`
3. Shares code or link with friend
4. Friend opens dashboard with room code
5. Sees real-time location on map
6. Clicks "Ring Device" to help locate it
7. Phone plays loud audio alert

### Scenario 2: Track Family Member

1. Family member's phone view open
2. Parent opens dashboard with same room code
3. Sees real-time position and movement trail
4. Can check last-seen time when phone goes offline
5. Can ring if they don't respond

### Scenario 3: Group Meeting Point

1. Multiple people share same room code
2. Everyone can see each other's positions (requires multi-device support)
3. Easy to meet up at location

## 🐛 Troubleshooting

### "Geolocation not available"
- Enable location permissions in browser
- Use HTTPS (required for geolocation in production)
- Check device supports Geolocation API

### "Connection failed"
- Ensure server is running on correct port
- Check VITE_SERVER_URL environment variable
- Verify CORS settings

### "Map not loading"
- Check Leaflet CSS import
- Verify map container exists
- Check browser console for errors

### "No audio when ringing"
- Ensure volume is not muted
- Check browser audio permissions
- Safari may need user gesture first

### "Compass not working"
- Requires HTTPS in production
- iOS 13+ needs explicit permission request
- Not all devices have compass sensor

## 📚 Dependencies

### Server
- **express**: Web server framework
- **socket.io**: Real-time bidirectional communication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

### Client
- **vite**: Build tool and dev server
- **leaflet**: Interactive maps
- **socket.io-client**: Socket client library

## 📝 Migration from Old Project

See [MIGRATION.md](./MIGRATION.md) for detailed migration notes from the original Live Location Tracker.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use in personal and commercial projects

## 🙋 Support

- Check [server README](./server/README.md) for backend details
- Check [client README](./client/README.md) for frontend details
- Review source code comments for implementation details
- Open GitHub issues for bugs

## 🎉 Features Preserved from Original

✅ Leaflet map integration
✅ GPS tracking with high accuracy
✅ Distance calculations (Haversine formula)
✅ Accuracy radius visualization
✅ Timestamp handling
✅ Breadcrumb trail
✅ Marker customization

---

**Made with ❤️ for finding things**
