/**
 * COSMOS.AI Toast Notification Engine
 */
import { playBeep } from './audio.js';

let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.id = 'cosmos-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, { title = 'Cosmos Telemetry', type = 'info', duration = 3500 } = {}) {
  const cont = ensureContainer();
  playBeep('hover');

  const toast = document.createElement('div');
  toast.className = `cosmos-toast toast-${type}`;

  const iconMap = {
    info: '🛰️',
    success: '✨',
    warp: '⚡',
    warning: '⚠️',
    scan: '🔍',
  };

  const icon = iconMap[type] || '🚀';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    dismissToast(toast);
  });

  cont.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const timer = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  toast.dataset.timer = timer;
}

function dismissToast(toast) {
  if (!toast || toast.dataset.dismissed) return;
  toast.dataset.dismissed = 'true';
  clearTimeout(toast.dataset.timer);
  toast.classList.remove('show');
  toast.classList.add('hide');

  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 400);
}
