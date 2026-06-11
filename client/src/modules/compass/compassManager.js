/**
 * client/src/modules/compass/compassManager.js
 * Handle device orientation and compass heading
 */

class CompassManager {
  constructor() {
    this.currentHeading = 0;
    this.currentAccuracy = null;
    this.isListening = false;
    this.listeners = [];
  }

  /**
   * Request permission for device orientation (iOS 13+)
   */
  async requestPermission() {
    if (!this.hasDeviceOrientation()) {
      return false;
    }

    // iOS 13+ requires explicit permission
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        console.log(`[COMPASS] Permission: ${permission}`);
        return permission === 'granted';
      } catch (error) {
        console.error('[COMPASS] Permission denied:', error);
        return false;
      }
    }

    // Non-iOS or older iOS
    return true;
  }

  /**
   * Check if device orientation is supported
   */
  hasDeviceOrientation() {
    return window.DeviceOrientationEvent !== undefined;
  }

  /**
   * Start listening for device orientation
   */
  startListening() {
    if (this.isListening) return;

    if (!this.hasDeviceOrientation()) {
      console.warn('[COMPASS] Device orientation not supported');
      return false;
    }

    window.addEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
    this.isListening = true;

    console.log('[COMPASS] Listening started');
    return true;
  }

  /**
   * Stop listening
   */
  stopListening() {
    window.removeEventListener('deviceorientation', this.handleDeviceOrientation.bind(this));
    this.isListening = false;
    console.log('[COMPASS] Listening stopped');
  }

  /**
   * Handle device orientation event
   */
  handleDeviceOrientation(event) {
    // event.alpha: Z axis rotation (0-360) - compass bearing
    // event.beta: X axis rotation (-180 to 180)
    // event.gamma: Y axis rotation (-90 to 90)

    const heading = Math.round(event.alpha);
    const accuracy = event.webkitCompassAccuracy || null; // Some phones provide this

    this.currentHeading = heading;
    this.currentAccuracy = accuracy;

    // Notify listeners
    this.listeners.forEach((callback) => {
      callback({
        heading,
        accuracy,
        beta: event.beta,
        gamma: event.gamma,
      });
    });
  }

  /**
   * Subscribe to heading changes
   */
  onHeadingChange(callback) {
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get current heading
   */
  getHeading() {
    return this.currentHeading;
  }

  /**
   * Get current accuracy
   */
  getAccuracy() {
    return this.currentAccuracy;
  }
}

export const compassManager = new CompassManager();
