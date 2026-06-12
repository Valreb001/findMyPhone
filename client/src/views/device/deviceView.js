/**
 * client/src/views/device/deviceView.js
 * Tracked device view - sends location to server
 */

import { socketManager } from '../../modules/socket/socketManager.js';
import { startTracking, stopTracking } from '../../modules/tracking/gpsTracker.js';
import { generateRoomCode, formatRoomCode, getShareableOwnerUrl } from '../../utils/roomGenerator.js';
import { formatTimestamp } from '../../modules/ui/domHelpers.js';

class DeviceView {
  constructor() {
    this.roomId = null;
    this.watchId = null;
    this.isTracking = false;
    this.lastPosition = null;
    this.positionCount = 0;
  }

  /**
   * Initialize device view
   */
  async initialize() {
    console.log('[DEVICE] Initializing device view...');

    // Setup UI
    this.setupUI();

    // Connect socket
    try {
      await socketManager.connect();
      this.setupSocketListeners();
    } catch (error) {
      console.error('[DEVICE] Socket connection failed:', error);
      this.updateStatus('❌ Connection failed', 'error');
      return;
    }

    // Generate room
    this.roomId = generateRoomCode();
    await this.joinRoom();

    this.updateStatus(`📍 Ready. Room: ${formatRoomCode(this.roomId)}`);
  }

  /**
   * Setup UI
   */
  setupUI() {
    const html = `
      <div class="device-container">
        <header class="device-header">
          <h1>📱 Find My Phone - Device</h1>
          <p>This is the tracked phone</p>
        </header>

        <div id="status" class="status-message">Initializing...</div>

        <div class="room-section">
          <div class="room-code-display">
            <div class="room-label">Share this code with owner:</div>
            <div id="roomCode" class="room-code-large">--</div>
            <button id="copyRoomBtn" class="btn btn-primary">Copy Code</button>
            <button id="copyLinkBtn" class="btn btn-secondary">Copy Link</button>
          </div>

          <div class="owner-link">
            <p>Or send this link:</p>
            <input 
              id="ownerLink" 
              type="text" 
              readonly 
              class="link-input"
              value="Loading..."
            />
          </div>
        </div>

        <div class="controls">
          <button id="startBtn" class="btn btn-primary" disabled>Start Tracking</button>
          <button id="stopBtn" class="btn btn-secondary" disabled>Stop Tracking</button>
        </div>

        <div class="info-panel">
          <h2>Position Data</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Status</label>
              <div id="trackingStatus" class="info-value">--</div>
            </div>
            <div class="info-item">
              <label>Updates Sent</label>
              <div id="updateCount" class="info-value">0</div>
            </div>
            <div class="info-item">
              <label>Latitude</label>
              <div id="latitude" class="info-value">--</div>
            </div>
            <div class="info-item">
              <label>Longitude</label>
              <div id="longitude" class="info-value">--</div>
            </div>
            <div class="info-item">
              <label>Accuracy</label>
              <div id="accuracy" class="info-value">--</div>
            </div>
            <div class="info-item">
              <label>Last Update</label>
              <div id="lastUpdate" class="info-value">--</div>
            </div>
          </div>
        </div>

        <div class="events-log">
          <h2>Events</h2>
          <div id="eventsList" class="events-list"></div>
        </div>
      </div>
    `;

    document.body.innerHTML = html;
  }

  /**
   * Setup socket listeners
   */
  setupSocketListeners() {
    // Device ring event
    socketManager.on('device:ring', () => {
      this.handleRingRequest();
    });

    // Compass request
    socketManager.on('compass:request', () => {
      this.handleCompassRequest();
    });

    // Connection status
  //   socketManager.on('connection_status', (status) => {
  //     this.logEvent(`Connection: ${status}`);
  //   });

  socketManager.on('connection_status', (status) => {
  this.logEvent(`Connection: ${status}`);

  if (status === 'connected' && this.roomId) {
    console.log('[DEVICE] Rejoining room after reconnect');

    socketManager.emit('device:join', {
      roomId: this.roomId
    });
  }
    });

  }

  /**
   * Join room
   */
  async joinRoom() {
    socketManager.emit('device:join', { roomId: this.roomId });

    socketManager.once('device_joined', (data) => {
      console.log('[DEVICE] Joined room:', data);
      this.updateRoomDisplay();
      this.setupEventListeners();
      
      // Enable start button
      document.getElementById('startBtn').disabled = false;
      document.getElementById('trackingStatus').textContent = '🔴 Inactive';
      
      this.logEvent(`✅ Joined room ${formatRoomCode(this.roomId)}`);
    });
  }

  /**
   * Update room display
   */
  updateRoomDisplay() {
    document.getElementById('roomCode').textContent = formatRoomCode(this.roomId);

    const ownerUrl = getShareableOwnerUrl(this.roomId);
    document.getElementById('ownerLink').value = ownerUrl;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.startTracking());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopTracking());
    document.getElementById('copyRoomBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(this.roomId);
      this.logEvent('✅ Room code copied');
    });
    document.getElementById('copyLinkBtn').addEventListener('click', () => {
      const url = getShareableOwnerUrl(this.roomId);
      navigator.clipboard.writeText(url);
      this.logEvent('✅ Link copied');
    });
  }

  /**
   * Start tracking
   */
  startTracking() {
    if (this.isTracking) return;

    console.log('[DEVICE] Starting tracking...');

    this.watchId = startTracking(
      (position) => this.handlePositionUpdate(position),
      (error) => this.handleGPSError(error)
    );

    this.isTracking = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('trackingStatus').textContent = '🟢 Active';

    this.logEvent('📍 Tracking started');
  }

  /**
   * Stop tracking
   */
  stopTracking() {
    if (!this.isTracking) return;

    stopTracking(this.watchId);

    this.isTracking = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('trackingStatus').textContent = '🔴 Inactive';

    this.logEvent('⏹️ Tracking stopped');
  }

  /**
   * Handle position update from GPS
   */
  handlePositionUpdate(position) {
    this.lastPosition = position;
    this.positionCount++;

    // Update UI
    document.getElementById('latitude').textContent = position.latitude.toFixed(6);
    document.getElementById('longitude').textContent = position.longitude.toFixed(6);
    document.getElementById('accuracy').textContent = position.accuracy ? `${Math.round(position.accuracy)} m` : '--';
    document.getElementById('updateCount').textContent = this.positionCount;
    document.getElementById('lastUpdate').textContent = formatTimestamp(position.timestamp);

    // Send to server
    socketManager.emit('position:update', {
      latitude: position.latitude,
      longitude: position.longitude,
      accuracy: position.accuracy,
      heading: position.heading,
      speed: position.speed,
    });

    console.log(`[DEVICE] Position update #${this.positionCount}:`, position);
  }

  /**
   * Handle GPS error
   */
  handleGPSError(error) {
    console.error('[DEVICE] GPS Error:', error);
    this.updateStatus(`❌ GPS Error: ${error.message}`, 'error');
    this.logEvent(`❌ GPS Error: ${error.message}`);
  }

  /**
   * Handle ring request from owner
   */
  handleRingRequest() {
    console.log('[DEVICE] Ring request received!');
    this.logEvent('📞 Owner ringing device!');

    // Play audio alert
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playRingTone(audioContext);
      }, i * 600);
    }

    // Visual alert
    document.body.style.backgroundColor = '#ff6b6b';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 2000);
  }

  /**
   * Play ring tone
   */
  playRingTone(audioContext) {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.frequency.value = 1000;
    osc.connect(gain);
    gain.connect(audioContext.destination);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Handle compass request
   */
  handleCompassRequest() {
    console.log('[DEVICE] Compass request received');
    this.logEvent('🧭 Owner requesting compass data');

    if (this.lastPosition?.heading !== null) {
      socketManager.emit('compass:heading', {
        heading: this.lastPosition.heading,
      });
    }
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
   * Log event to UI
   */
  logEvent(message) {
    const eventsList = document.getElementById('eventsList');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'event-entry';
    entry.textContent = `[${timestamp}] ${message}`;
    eventsList.insertBefore(entry, eventsList.firstChild);

    // Keep only last 20 events
    while (eventsList.children.length > 20) {
      eventsList.removeChild(eventsList.lastChild);
    }
  }
}

export { DeviceView };
