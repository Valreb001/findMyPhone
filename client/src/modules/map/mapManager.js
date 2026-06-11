/**
 * client/src/modules/map/mapManager.js
 * Manage Leaflet map and markers
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

class MapManager {
  constructor(containerId) {
    this.map = null;
    this.markers = new Map(); // id -> marker
    this.circles = new Map(); // id -> circle (accuracy)
    this.polylines = new Map(); // id -> polyline
    this.initialize(containerId);
  }

  /**
   * Initialize map
   */
  initialize(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Map container ${containerId} not found`);
      return false;
    }

    this.map = L.map(containerId, {
      center: [40, 0],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    // Add tile layers
    const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 2,
    });

    const cartoLight = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; CartoDB',
        maxZoom: 19,
        minZoom: 2,
      }
    );

    osmStandard.addTo(this.map);

    // Layer control
    L.control.layers(
      {
        'OpenStreetMap': osmStandard,
        'CartoDB Light': cartoLight,
      },
      {},
      { position: 'topright' }
    ).addTo(this.map);

    // Scale control
    L.control.scale({ position: 'bottomleft' }).addTo(this.map);

    console.log('[MAP] Initialized');
    return true;
  }

  /**
   * Create or update marker
   */
  setMarker(id, latitude, longitude, options = {}) {
    const latlng = [latitude, longitude];

    if (this.markers.has(id)) {
      this.markers.get(id).setLatLng(latlng);
    } else {
      const icon = this.createIcon(options.icon || 'device');
      const marker = L.marker(latlng, { icon }).addTo(this.map);

      if (options.title) {
        marker.bindPopup(options.title);
      }

      this.markers.set(id, marker);
      console.log(`[MAP] Marker ${id} added`);
    }

    // Auto pan if focused
    if (options.focus) {
      this.map.panTo(latlng, { animate: true });
    }
  }

  /**
   * Remove marker
   */
  removeMarker(id) {
    if (this.markers.has(id)) {
      this.map.removeLayer(this.markers.get(id));
      this.markers.delete(id);
    }
  }

  /**
   * Add accuracy circle
   */
  setAccuracyCircle(id, latitude, longitude, accuracy) {
    const latlng = [latitude, longitude];

    if (this.circles.has(id)) {
      const circle = this.circles.get(id);
      circle.setLatLng(latlng);
      circle.setRadius(accuracy);
    } else {
      const circle = L.circle(latlng, {
        radius: accuracy,
        color: '#3498db',
        fillColor: '#3498db',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(this.map);

      this.circles.set(id, circle);
    }
  }

  /**
   * Remove accuracy circle
   */
  removeAccuracyCircle(id) {
    if (this.circles.has(id)) {
      this.map.removeLayer(this.circles.get(id));
      this.circles.delete(id);
    }
  }

  /**
   * Add point to polyline trail
   */
  addPolylinePoint(id, latitude, longitude) {
    const latlng = [latitude, longitude];

    if (this.polylines.has(id)) {
      this.polylines.get(id).addLatLng(latlng);
    } else {
      const polyline = L.polyline([latlng], {
        color: '#e74c3c',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 5',
      }).addTo(this.map);

      this.polylines.set(id, polyline);
    }
  }

  /**
   * Clear polyline trail
   */
  clearPolyline(id) {
    if (this.polylines.has(id)) {
      this.map.removeLayer(this.polylines.get(id));
      this.polylines.delete(id);
    }
  }

  /**
   * Pan to marker
   */
  panToMarker(id) {
    if (this.markers.has(id)) {
      const marker = this.markers.get(id);
      this.map.panTo(marker.getLatLng(), { animate: true });
    }
  }

  /**
   * Fit bounds
   */
  fitBounds(bounds) {
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  /**
   * Get all marker bounds
   */
  getAllMarkerBounds() {
    if (this.markers.size === 0) return null;

    const bounds = L.latLngBounds([]);

    this.markers.forEach((marker) => {
      bounds.extend(marker.getLatLng());
    });

    return bounds;
  }

  /**
   * Create custom icon
   */
  createIcon(type = 'device') {
    const icons = {
      device: {
        html: '📍',
        size: 30,
      },
      owner: {
        html: '👤',
        size: 30,
      },
      target: {
        html: '🎯',
        size: 25,
      },
    };

    const config = icons[type] || icons.device;

    return L.divIcon({
      html: `<div style="font-size: ${config.size}px;">${config.html}</div>`,
      iconSize: [config.size, config.size],
      className: `custom-icon-${type}`,
    });
  }

  /**
   * Get map instance
   */
  getMap() {
    return this.map;
  }
}

export { MapManager };
