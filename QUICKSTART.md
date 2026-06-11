# Development Quick Start

Quick commands for development:

## Terminal 1: Server

```bash
cd server
npm run dev
```

Server listens on `http://localhost:3000`

## Terminal 2: Client (NEW TAB)

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173`

## Open Browser

- **Device View**: http://localhost:5173
- **Owner View**: http://localhost:5173/?room=XXXXXX

## Production Build

```bash
# Server
cd server
npm start

# Client
cd client
npm run build
npm run preview
```

## Useful npm Commands

```bash
# Development with auto-reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Check for errors
npm run lint (if configured)
```

## Testing Checklist

- [ ] Device view loads and shows room code
- [ ] Copy room code works
- [ ] Copy link works
- [ ] Start tracking button works
- [ ] GPS position updates appear
- [ ] Owner view loads with room parameter
- [ ] Owner sees device position on map
- [ ] Ring button plays sound on device
- [ ] Offline status shows when device disconnects
- [ ] Map controls work (zoom, pan, layers)
- [ ] Compass SVG appears and rotates
- [ ] Events log shows updates in real-time
