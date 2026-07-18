/**
 * Dummy stub for admin files that are stripped from the public Dex repository.
 * This ensures Vite builds successfully without needing to rewrite import logic.
 */

// src/services/adminAuthService
export const adminFetch = async () => ({ ok: false, json: async () => ({}) });
export const saveSession = () => {};
export const loadSession = () => null;
export const clearSession = () => {};

// src/lib/githubSync
export interface GitConfig {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  token?: string;
  isPublic?: boolean;
}
export const generateStaticDataFileCode = () => '';
export const commitFileToGitHub = async () => {};
export const fetchFileFromGitHub = async () => null;
export const getGitHubFileSha = async () => null;

// src/lib/sessionStore
export const sessionStore = {
  getItem: (k: string) => {
    try { return typeof window !== 'undefined' ? localStorage.getItem(k) : null; } catch(e) { return null; }
  },
  setItem: (k: string, v: string) => {
    try { if (typeof window !== 'undefined') localStorage.setItem(k, v); } catch(e) {}
  },
  removeItem: (k: string) => {
    try { if (typeof window !== 'undefined') localStorage.removeItem(k); } catch(e) {}
  }
};
export const getObfuscatedKey = (k: string) => k;

// src/lib/totp
export const generateTOTP = () => '';
export const verifyTOTP = () => false;
export const generateSecret = () => '';
export const generateQRCodeUri = () => '';

// src/lib/secureVault
export const secureVault = {
  encryptPayload: (p: any) => p,
  decryptPayload: (p: any) => p
};

// src/components/ClearanceButton
export default function ClearanceButton() {
  return null;
}
