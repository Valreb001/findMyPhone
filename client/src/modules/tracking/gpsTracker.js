/**
 * client/src/modules/tracking/gpsTracker.js
 * Handle geolocation tracking using native Geolocation API
 */

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable() {
  return !!navigator?.geolocation;
}

/**
 * Start tracking device position
 * Calls callback with position data on each update
 * @param {Function} onPosition - Callback with position data
 * @param {Function} onError - Error callback
 * @returns {number} Watch ID
 */
export function startTracking(onPosition, onError) {
  if (!isGeolocationAvailable()) {
    const error = new Error('Geolocation not available');
    onError(error);
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { coords, timestamp } = position;

      onPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        heading: coords.heading,
        speed: coords.speed,
        timestamp,
      });
    },
    (error) => {
      console.error('[GPS] Error:', error);
      onError(error);
    },
    options
  );

  return watchId;
}

/**
 * Stop tracking
 */
export function stopTracking(watchId) {
  if (watchId !== null && watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Get current position once
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject(new Error('Geolocation not available'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { coords, timestamp } = position;

        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          heading: coords.heading,
          speed: coords.speed,
          timestamp,
        });
      },
      (error) => reject(error),
      options
    );
  });
}
