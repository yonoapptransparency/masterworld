import { getField, optimizeImageUrl } from '../utils';
import { escapeHtml } from './common';

export function renderGateway(slug: string, settings: any, apps: any[] = []): string {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app = Array.isArray(apps) ? apps.find(a => getField(a, 'slug').toLowerCase() === cleanSlug) : null;
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';

  if (!app) {
    return `
      <div class="py-16 text-center max-w-2xl mx-auto px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl mb-4 font-bold text-2xl">🔒</div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">Verification Portal</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Direct access gateway for verified applications on ${escapeHtml(siteTitle)}.</p>
        <a href="/" class="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-md">&larr; Return to Homepage</a>
      </div>
    `;
  }

  const name = getField(app, 'name');
  const rawIcon = getField(app, 'icon_url') || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop';
  const icon = optimizeImageUrl(rawIcon, 160);
  
  return `
    <div class="max-w-xl mx-auto py-10 px-6 shadow-xs bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
      <div class="text-center">
        <img src="${escapeHtml(icon)}" loading="lazy" decoding="async" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border border-zinc-200 dark:border-zinc-700 shadow-sm" alt="${escapeHtml(name)} app icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-snug mb-1">${escapeHtml(name)}</h1>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold mb-4">Official Listing</p>
        <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-8">Access the application details, review summary, and verified specifications below.</p>
        <a href="/app/${encodeURIComponent(slug)}" class="block w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition shadow-md">View Application Details</a>
        <a href="/" class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:underline mt-4">Browse All Applications</a>
      </div>
    </div>
  `;
}
