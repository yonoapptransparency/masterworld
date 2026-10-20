import { getField } from '../utils';
import { escapeHtml } from './common';

export function renderVideosList(videos: any[], _settings: any): string {
  let cards = '';
  videos.forEach(v => {
    const title = getField(v, 'title');
    const slug = getField(v, 'slug');
    const desc = getField(v, 'description', '');
    const videoUrl = getField(v, 'url', '');
    let videoId = '';
    if (videoUrl.includes('v=')) {
      videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    }
    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

    cards += `
      <a href="/videos/${encodeURIComponent(slug)}" class="block p-4 border border-black/5 bg-white dark:bg-zinc-900 rounded-3xl text-left hover:shadow-md transition">
        ${thumb ? `<img src="${escapeHtml(thumb)}" loading="lazy" decoding="async" width="360" height="200" class="w-full h-40 object-cover rounded-2xl mb-3 border border-black/5" alt="${escapeHtml(title)} video review thumbnail"/>` : ''}
        <h3 class="font-bold text-lg text-zinc-900 dark:text-white truncate">${escapeHtml(title)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(desc)}</p>
      </a>
    `;
  });
  return `<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${cards || '<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`;
}

export function renderVideoDetail(slug: string, videos: any[], _settings: any): string {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const v = videos.find(item => getField(item, 'slug').toLowerCase() === cleanSlug || getField(item, 'id').toLowerCase() === cleanSlug);
  if (!v) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>`;
  const title = getField(v, 'title');
  const desc = getField(v, 'description', '');
  const videoUrl = getField(v, 'url', '');
  let videoId = '';
  if (videoUrl.includes('v=')) {
    videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';

  return `
    <div class="max-w-2xl mx-auto py-12 text-left">
      <h1 class="text-3xl font-extrabold mb-4">${escapeHtml(title)}</h1>
      ${thumb ? `<div class="mb-6 rounded-3xl overflow-hidden border border-black/5"><img src="${escapeHtml(thumb)}" loading="eager" decoding="async" width="640" height="360" class="w-full h-auto object-cover max-h-80" alt="${escapeHtml(title)} full video preview image"/></div>` : ''}
      <p class="prose text-zinc-650 leading-relaxed font-semibold">${desc.replace(/\n\n/g, '<br/><br/>')}</p>
    </div>
  `;
}
