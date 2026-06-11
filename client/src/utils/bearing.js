/**
 * client/src/utils/bearing.js
 * Calculate bearing between coordinates
 */

/**
 * Calculate bearing between two points
 * Returns degrees 0-360, where 0° is North
 * @param {number} lat1 - Starting latitude
 * @param {number} lon1 - Starting longitude
 * @param {number} lat2 - Ending latitude
 * @param {number} lon2 - Ending longitude
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const toDeg = (radians) => (radians * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

  return bearing;
}

/**
 * Calculate relative bearing
 * Useful for compass arrow rotation
 * @param {number} deviceBearing - Device's heading (compass)
 * @param {number} targetBearing - Bearing to target
 * @returns {number} Relative bearing in degrees
 */
export function calculateRelativeBearing(deviceBearing, targetBearing) {
  return (targetBearing - deviceBearing + 360) % 360;
}

/**
 * Convert bearing to cardinal direction
 * @param {number} bearing - Bearing in degrees (0-360)
 * @returns {string} Cardinal direction (N, NE, E, SE, etc.)
 */
export function bearingToCardinal(bearing) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}
