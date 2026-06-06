/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global state for install prompt
let deferredPrompt: any = null;
const promptListeners = new Set<(prompt: any) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Notify all UI listeners
    promptListeners.forEach((listener) => listener(e));
  });
}

/**
 * Registers the Service Worker.
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    // Register the SW from public root
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}

/**
 * Subscribe to beforeinstallprompt events
 */
export function subscribeToInstallPrompt(callback: (prompt: any) => void) {
  promptListeners.add(callback);
  if (deferredPrompt) {
    callback(deferredPrompt);
  }
  return () => {
    promptListeners.delete(callback);
  };
}

/**
 * Trigger manual installation UI prompt
 */
export async function triggerInstall() {
  if (!deferredPrompt) {
    return false;
  }
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response to install prompt: ${outcome}`);
  // We've used the prompt, and can't use it again, clear it
  deferredPrompt = null;
  promptListeners.forEach((listener) => listener(null));
  return outcome === 'accepted';
}
