/**
 * client/src/main.js
 * Find My Phone - Application Entry Point
 */

import { DeviceView } from './views/device/deviceView.js';
import { OwnerView } from './views/owner/ownerView.js';

/**
 * Determine which view to load based on URL
 */
async function initializeApp() {
  const urlParams = new URLSearchParams(window.location.search);
  const isOwnerView = urlParams.has('room');

  console.log(`[APP] Starting ${isOwnerView ? 'Owner' : 'Device'} view`);

  if (isOwnerView) {
    // Owner dashboard
    const ownerView = new OwnerView();
    await ownerView.initialize();
  } else {
    // Device tracking
    const deviceView = new DeviceView();
    await deviceView.initialize();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
