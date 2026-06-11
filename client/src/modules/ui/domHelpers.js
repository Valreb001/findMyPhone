/**
 * client/src/modules/ui/domHelpers.js
 * DOM manipulation utilities
 */

/**
 * Update element text content
 */
export function setText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
}

/**
 * Update element HTML
 */
export function setHTML(elementId, html) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = html;
}

/**
 * Show element
 */
export function show(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = '';
}

/**
 * Hide element
 */
export function hide(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.style.display = 'none';
}

/**
 * Add CSS class
 */
export function addClass(elementId, className) {
  const el = document.getElementById(elementId);
  if (el) el.classList.add(className);
}

/**
 * Remove CSS class
 */
export function removeClass(elementId, className) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove(className);
}

/**
 * Toggle CSS class
 */
export function toggleClass(elementId, className) {
  const el = document.getElementById(elementId);
  if (el) el.classList.toggle(className);
}

/**
 * Set button enabled/disabled
 */
export function setButtonEnabled(elementId, enabled) {
  const el = document.getElementById(elementId);
  if (el) el.disabled = !enabled;
}

/**
 * Copy to clipboard
 */
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    console.log('[UI] Copied to clipboard');
  });
}

/**
 * Show toast notification
 */
export function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Format last seen time
 */
export function formatLastSeen(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;

  return new Date(timestamp).toLocaleDateString();
}
