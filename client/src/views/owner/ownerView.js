/**
 * client/src/views/owner/ownerView.js
 * Owner dashboard view - receives and displays device location
 */

import { socketManager } from '../../modules/socket/socketManager.js';
import { MapManager } from '../../modules/map/mapManager.js';
import { compassManager } from '../../modules/compass/compassManager.js';
import { audioRinger } from '../../modules/audio/audioRinger.js';
import { calculateBearing } from '../../utils/bearing.js';
import { formatLastSeen, formatTimestamp } from '../../modules/ui/domHelpers.js';

class OwnerView {
  constructor() {
    this.roomId = new URLSearchParams(window.location.search).get('room');
    this.mapManager = null;
    this.deviceLocation = null;
    this.ownerLocation = null;
    this.deviceStatus = 'offline';
    this.lastUpdateTime = null;
    this.bearingToDevice = null;
    this.deviceTrail = [];
  }

  /**
   * Initialize owner view
   */
  async initialize() {
    if (!this.roomId) {
      document.body.innerHTML = '<div class="error"><h1>❌ No Room Code</h1><p>Please provide a room code in the URL: ?room=XXXXXX</p></div>';
      return;
    }

    console.log('[OWNER] Initializing owner view for room:', this.roomId);

    this.setupUI();
    this.mapManager = new MapManager('map');

    try {
      await socketManager.connect();
      this.setupSocketListeners();
    } catch (error) {
      console.error('[OWNER] Socket connection failed:', error);
      this.updateStatus('❌ Connection failed', 'error');
      return;
    }

    this.joinRoom();
    this.setupEventListeners();

    // Request compass permission
    if (compassManager.hasDeviceOrientation()) {
      const permission = await compassManager.requestPermission();
      if (permission) {
        compassManager.startListening();
        compassManager.onHeadingChange(() => this.updateCompass());
      }
    }
  }

  /**
   * Setup UI
   */
  setupUI() {
    const html = `
      <div class="owner-container">
        <header class="owner-header">
          <h1>🗺️ Find My Phone - Owner Dashboard</h1>
          <div id="status" class="status-message">Connecting...</div>
        </header>

        <div class="owner-layout">
          <!-- Map Container -->
          <div id="map" class="owner-map"></div>

          <!-- Control Panel -->
          <div class="control-panel">
            <div class="panel-section">
              <h2>Device Status</h2>
              <div class="status-box">
                <div class="status-indicator" id="deviceStatusIndicator">🔴</div>
                <div>
                  <div id="deviceStatusText">Offline</div>
                  <div id="lastSeenText" class="secondary">Never</div>
                </div>
              </div>
            </div>

            <div class="panel-section">
              <h2>Location</h2>
              <div class="info-grid">
                <div class="info-item">
                  <label>Latitude</label>
                  <div id="deviceLat" class="info-value">--</div>
                </div>
                <div class="info-item">
                  <label>Longitude</label>
                  <div id="deviceLng" class="info-value">--</div>
                </div>
                <div class="info-item">
                  <label>Accuracy</label>
                  <div id="deviceAccuracy" class="info-value">--</div>
                </div>
                <div class="info-item">
                  <label>Last Update</label>
                  <div id="deviceTimestamp" class="info-value">--</div>
                </div>
              </div>
            </div>

            <div class="panel-section">
              <h2>Controls</h2>
              <button id="ringBtn" class="btn btn-primary btn-large">
                📞 Ring Device
              </button>
              <button id="centerBtn" class="btn btn-secondary">
                📍 Center Map
              </button>
              <button id="clearTrailBtn" class="btn btn-warning">
                🗑️ Clear Trail
              </button>
            </div>

            <!-- Compass Section -->
            <div class="panel-section compass-section">
              <h2>🧭 Compass</h2>
              <div class="compass-container">
                <svg id="compassSVG" class="compass-svg" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="95" fill="white" stroke="#333" stroke-width="2"/>
                  
                  <!-- Cardinal directions -->
                  <text x="100" y="20" text-anchor="middle" class="compass-text">N</text>
                  <text x="180" y="105" text-anchor="middle" class="compass-text">E</text>
                  <text x="100" y="190" text-anchor="middle" class="compass-text">S</text>
                  <text x="20" y="105" text-anchor="middle" class="compass-text">W</text>
                  
                  <!-- Degree markers -->
                  <g id="degreeMarkers"></g>
                  
                  <!-- Device heading indicator (blue) -->
                  <g id="deviceHeading" transform="translate(100, 100)">
                    <line x1="0" y1="0" x2="0" y2="-70" stroke="blue" stroke-width="3"/>
                    <circle cx="0" cy="0" r="8" fill="blue"/>
                  </g>
                  
                  <!-- Bearing to device (red arrow) -->
                  <g id="bearingArrow" transform="translate(100, 100)">
                    <line x1="0" y1="0" x2="0" y2="-60" stroke="red" stroke-width="2" stroke-dasharray="5,5"/>
                    <polygon points="0,-60 -5,-50 5,-50" fill="red"/>
                  </g>
                </svg>
                <div id="compassBearing" class="compass-bearing">--°</div>
              </div>
            </div>

            <div class="panel-section">
              <h2>Events</h2>
              <div id="eventsList" class="events-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.innerHTML = html;
  }

  /**
   * Setup socket listeners
   */
  setupSocketListeners() {
    // Position update from device
    socketManager.on('position_update', (data) => {
      this.handlePositionUpdate(data);
    });

    // Device status changes
    socketManager.on('device_status', (data) => {
      this.handleDeviceStatus(data);
    });

    // Connection status
    socketManager.on('connection_status', (status) => {
      this.updateStatus(`Connection: ${status}`);
    });

    socketManager.on('owner_joined', (data) => {
      this.logEvent(`✅ Joined room ${this.roomId}`);
    });
  }

  /**
   * Join room
   */
  joinRoom() {
    socketManager.emit('owner:join', { roomId: this.roomId });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.getElementById('ringBtn').addEventListener('click', () => this.ringDevice());
    document.getElementById('centerBtn').addEventListener('click', () => this.centerMap());
    document.getElementById('clearTrailBtn').addEventListener('click', () => this.clearTrail());
  }

  /**
   * Handle position update
   */
  handlePositionUpdate(data) {
    this.deviceLocation = data;
    this.lastUpdateTime = new Date(data.timestamp);

    // Update map
    this.mapManager.setMarker('device', data.latitude, data.longitude, {
      title: 'Tracked Device',
      focus: false,
    });

    if (data.accuracy) {
      this.mapManager.setAccuracyCircle('device', data.latitude, data.longitude, data.accuracy);
    }

    // Add to trail
    this.deviceTrail.push([data.latitude, data.longitude]);
    this.mapManager.addPolylinePoint('trail', data.latitude, data.longitude);

    // Update UI
    document.getElementById('deviceLat').textContent = data.latitude.toFixed(6);
    document.getElementById('deviceLng').textContent = data.longitude.toFixed(6);
    document.getElementById('deviceAccuracy').textContent = data.accuracy ? `${Math.round(data.accuracy)} m` : '--';
    document.getElementById('deviceTimestamp').textContent = formatTimestamp(data.timestamp);

    // Update bearing to device
    if (this.ownerLocation) {
      this.updateBearing();
    }

    this.logEvent(`📍 Device position updated`);
  }

  /**
   * Handle device status change
   */
  handleDeviceStatus(data) {
    this.deviceStatus = data.status;

    const indicator = document.getElementById('deviceStatusIndicator');
    const statusText = document.getElementById('deviceStatusText');

    if (data.status === 'online') {
      indicator.textContent = '🟢';
      statusText.textContent = 'Online';
      this.logEvent('🟢 Device online');
    } else if (data.status === 'offline') {
      indicator.textContent = '🔴';
      statusText.textContent = 'Offline';
      this.logEvent('🔴 Device offline');
    } else if (data.status === 'reconnecting') {
      indicator.textContent = '🟡';
      statusText.textContent = 'Reconnecting...';
      this.logEvent('🟡 Device reconnecting');
    }
  }

  /**
   * Ring device
   */
  ringDevice() {
    if (this.deviceStatus !== 'online') {
      alert('Device is not online');
      return;
    }

    socketManager.emit('device:ring', {});
    this.logEvent('📞 Ring signal sent');
    audioRinger.playPulse(2);
  }

  /**
   * Center map on device
   */
  centerMap() {
    if (this.deviceLocation) {
      this.mapManager.panToMarker('device');
    }
  }

  /**
   * Clear trail
   */
  clearTrail() {
    this.mapManager.clearPolyline('trail');
    this.deviceTrail = [];
    this.logEvent('🗑️ Trail cleared');
  }

  /**
   * Update bearing to device
   */
  updateBearing() {
    if (!this.deviceLocation) return;

    const bearing = calculateBearing(
      this.ownerLocation.latitude,
      this.ownerLocation.longitude,
      this.deviceLocation.latitude,
      this.deviceLocation.longitude
    );

    this.bearingToDevice = bearing;
    this.updateCompass();
  }

  /**
   * Update compass display
   */
  updateCompass() {
    if (!this.bearingToDevice) return;

    const deviceHeadingEl = document.getElementById('deviceHeading');
    const bearingArrowEl = document.getElementById('bearingArrow');

    // Rotate device heading (blue line)
    if (this.deviceLocation?.heading !== null) {
      const rotation = this.deviceLocation.heading;
      deviceHeadingEl.setAttribute('transform', `translate(100, 100) rotate(${rotation})`);
    }

    // Rotate bearing arrow (red line)
    const rotation = this.bearingToDevice;
    bearingArrowEl.setAttribute('transform', `translate(100, 100) rotate(${rotation})`);

    // Display bearing
    document.getElementById('compassBearing').textContent = `${Math.round(this.bearingToDevice)}°`;
  }

  /**
   * Update status message
   */
  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status-message status-${type}`;
  }

  /**
   * Log event
   */
  logEvent(message) {
    const eventsList = document.getElementById('eventsList');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'event-entry';
    entry.textContent = `[${timestamp}] ${message}`;
    eventsList.insertBefore(entry, eventsList.firstChild);

    while (eventsList.children.length > 15) {
      eventsList.removeChild(eventsList.lastChild);
    }
  }
}

export { OwnerView };
