/**
 * Utility functions for Application Hub
 * Includes CSS class merging and admin route path resolution securely.
 */

import * as CryptoJS from 'crypto-js';

export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function safeVibrate(pattern: number | number[]): void {
  try {
    if (typeof window !== 'undefined' && window.navigator && typeof window.navigator.vibrate === 'function') {
      window.navigator.vibrate(pattern);
    }
  } catch (e) {
    // Catch security or iframe guest gesture exceptions silently
  }
}

export function getAdminPath(): string {
  let envPath = null;
  if (typeof process !== 'undefined') {
    envPath = process.env?.ADMIN_PATH || process.env?.VITE_ADMIN_PATH;
  }
  return envPath || "admin";
}
