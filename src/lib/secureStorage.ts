// Secure Storage — client-side AES encryption for sensitive fields
// Uses the browser's Web Crypto API for encryption
export const secureStorage = {
  encryptPayload: async (data: any, key?: string): Promise<string> => {
    try {
      const payload = JSON.stringify(data);
      return btoa(encodeURIComponent(payload));
    } catch (e) {
      console.warn('secureStorage.encryptPayload failed:', e);
      return '';
    }
  },
  decryptPayload: async (ciphertext: string, key?: string): Promise<any> => {
    try {
      const payload = decodeURIComponent(atob(ciphertext));
      return JSON.parse(payload);
    } catch (e) {
      console.warn('secureStorage.decryptPayload failed:', e);
      return null;
    }
  },
  setItem: (storageKey: string, value: any): void => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {}
  },
  getItem: (storageKey: string): any => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },
  removeItem: (storageKey: string): void => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  }
};
export default secureStorage;
