import { lazyWithRetry } from './lazyWithRetry';

export const AppDetails = lazyWithRetry(() => import('../pages/AppDetails'));

export const preloadAppDetails = () => {
  try {
    AppDetails.preload();
  } catch (e) {
    // Ignore preload error on unsupported browsers/environments
  }
};
