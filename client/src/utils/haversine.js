/**
 * client/src/utils/haversine.js
 * Calculate distances between geographic coordinates
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculate great-circle distance using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate total distance from array of coordinates
 * @param {Array<[number, number]>} coordinates - Array of [lat, lng] pairs
 * @returns {number} Total distance in kilometers
 */
export function calculateTotalDistance(coordinates) {
  if (coordinates.length < 2) return 0;

  let total = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const [lat1, lon1] = coordinates[i - 1];
    const [lat2, lon2] = coordinates[i];

    total += calculateHaversineDistance(lat1, lon1, lat2, lon2);
  }

  return total;
}

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted string
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(2)} km`;
}
