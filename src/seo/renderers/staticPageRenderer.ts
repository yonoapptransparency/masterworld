import { getField, optimizeImageUrl } from '../utils';
import {
  DEFAULT_DISCLAIMER_HTML,
  DEFAULT_ETHICS_HTML,
  DEFAULT_PRIVACY_HTML,
  DEFAULT_TERMS_HTML,
  DEFAULT_RESPONSIBILITY_HTML,
  DEFAULT_REPORT_REMOVAL_HTML,
  DEFAULT_NOTICE_HTML,
  DEFAULT_ABOUT_HTML
} from '../../lib/defaultLegalContent';
import { escapeHtml } from './common';

export function renderCategoriesList(categoriesList: Array<{ name: string; slug: string; count: number }>, settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  
  let catsHtml = '';
  categoriesList.forEach(cat => {
    catsHtml += `
      <a href="/category/${encodeURIComponent(cat.slug)}" class="p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/30 rounded-3xl transition text-left flex items-center justify-between group shadow-2xs">
        <div>
          <h2 class="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(cat.name)}</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">${cat.count} Verified Application${cat.count === 1 ? '' : 's'}</p>
        </div>
        <span class="text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:translate-x-1 transition-transform">Explore →</span>
      </a>
    `;
  });

  return `
    <div class="max-w-4xl mx-auto py-6 px-2 sm:px-4">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6 text-left">
        <a href="/" class="hover:text-blue-600">Home</a>
        <span>/</span>
        <span class="font-bold text-zinc-800 dark:text-zinc-200">Categories</span>
      </nav>
      <div class="text-center py-8 mb-6 bg-white dark:bg-zinc-900 rounded-[28px] border border-black/5 p-6 shadow-sm">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Application Categories</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">Browse apps by game genre and category on ${escapeHtml(siteTitle)}.</p>
      </div>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${catsHtml || '<p class="text-center text-zinc-400 py-10 col-span-full">No categories available.</p>'}
      </div>
    </div>
  `;
}

export function renderDevelopersList(developers: any[], _settings: any): string {
  let cards = '';
  (developers || []).forEach(d => {
    const name = getField(d, 'name') || getField(d, 'title');
    const logo = getField(d, 'logo_url') || getField(d, 'icon_url');
    const optimizedLogo = logo ? optimizeImageUrl(logo, 120) : '';
    const desc = getField(d, 'description') || 'Certified publisher and software developer.';

    cards += `
      <div class="p-6 bg-white dark:bg-zinc-900 border border-black/5 rounded-3xl text-left flex items-start gap-4">
        ${logo ? `<img src="${escapeHtml(optimizedLogo)}" loading="lazy" decoding="async" width="64" height="64" class="w-16 h-16 rounded-2xl object-cover border border-black/5 shrink-0" alt="${escapeHtml(name)} developer brand logo"/>` : ''}
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-lg text-zinc-900 dark:text-white leading-tight">${escapeHtml(name)}</h3>
          <span class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1 mb-2">Verified Developer</span>
          <p class="text-xs text-zinc-500 line-clamp-2 leading-relaxed">${escapeHtml(desc)}</p>
        </div>
      </div>
    `;
  });

  return `
    <div class="py-6 container max-w-4xl mx-auto px-4 text-left">
      <header class="mb-8 text-center sm:text-left">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">Verified Developer Directory</h1>
        <p class="text-sm text-zinc-500">Official profiles of verified software creators, studio publishers, and developer teams.</p>
      </header>
      <div class="grid sm:grid-cols-2 gap-4">${cards || '<p class="text-zinc-400 py-10 col-span-full">No developer listings registered.</p>'}</div>
    </div>
  `;
}

export function renderAbout(settings: any): string {
  const content = getField(settings, 'about_content') || DEFAULT_ABOUT_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderContact(settings: any): string {
  const content = getField(settings, 'contact_content') || 'Get in touch for active client files help.';
  const email = getField(settings, 'support_email', 'rummydex1@gmail.com');
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${content}</p><div class="grid gap-4 mt-6"><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${escapeHtml(email)}</p></div><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Live Chat Support:</strong><p class="text-zinc-800 font-semibold mt-1">Monday to Saturday, 10:00 AM - 3:00 PM (Instant reply in every section)</p></div><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Registered Delhi Office:</strong><p class="text-zinc-800 font-semibold mt-1">Plot No. 18, 4th Floor, Commercial Complex, Sector 12, Dwarka, New Delhi, Delhi 110075, India</p></div></div></div>`;
}

export function renderPrivacy(settings: any): string {
  const content = getField(settings, 'privacy_content') || DEFAULT_PRIVACY_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderReportRemoval(settings: any): string {
  const content = getField(settings, 'report_removal_content') || DEFAULT_REPORT_REMOVAL_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderTerms(settings: any): string {
  const content = getField(settings, 'terms_content') || DEFAULT_TERMS_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderResponsibility(settings: any): string {
  const content = getField(settings, 'responsibility_content') || DEFAULT_RESPONSIBILITY_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</article></div>`;
}

export function renderNotice(settings: any): string {
  const heading = getField(settings, 'important_notice_heading') || 'Important Notice';
  const content = getField(settings, 'important_notice') || DEFAULT_NOTICE_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}

export function renderEthics(settings: any): string {
  const heading = getField(settings, 'ethics_heading') || 'Ethics & Safety';
  const content = getField(settings, 'ethics_discrimination_text') || DEFAULT_ETHICS_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}

export function renderDisclaimer(settings: any): string {
  const heading = getField(settings, 'disclaimer_heading') || 'Disclaimer';
  const content = getField(settings, 'disclaimer_text') || DEFAULT_DISCLAIMER_HTML;
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}

export function render404(urlPath: string, settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  return `
    <div class="py-16 text-center max-w-2xl mx-auto px-4">
      <div class="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 text-red-600 dark:text-red-400 rounded-3xl mb-6 font-extrabold text-3xl">404</div>
      <h1 class="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-4">404 - Page Not Found</h1>
      <h2 class="text-lg font-bold text-zinc-600 dark:text-zinc-400 mb-6">The requested resource could not be found on ${escapeHtml(siteTitle)}</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
        The URL <code class="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-red-500 font-mono text-sm">${escapeHtml(urlPath)}</code> does not match any application listing, news bulletin, or page.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition">Return to Homepage</a>
        <a href="/news" class="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold py-3.5 px-8 rounded-2xl transition">Latest News</a>
      </div>
    </div>
  `;
}

export function renderFaqPage(settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const siteFaqs = Array.isArray(settings?.website_faqs) ? settings.website_faqs.filter((f: any) => f && f.question && f.answer) : [];
  return `
    <div class="max-w-[1000px] mx-auto px-4 sm:px-6 md:px-8 py-12 text-left">
      <div class="mb-6">
        <a href="/" class="text-sm font-semibold text-zinc-500 hover:text-blue-600 transition-colors">← Home</a>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
        Frequently Asked Questions
      </h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Everything you need to know about ${escapeHtml(siteTitle)}, app downloads, verification, and safety.
      </p>
      <div class="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        ${siteFaqs.map((faq: any, idx: number) => `
          <details class="group rounded-2xl border border-black/5 dark:border-white/5 bg-zinc-50/80 dark:bg-zinc-800/50 p-5" ${idx === 0 ? 'open' : ''}>
            <summary class="font-bold text-base text-zinc-900 dark:text-zinc-100 cursor-pointer list-none flex justify-between items-center gap-3">
              <span class="flex items-start gap-2">
                <span class="text-blue-500 font-extrabold select-none">Q.</span>
                <span>${escapeHtml(faq.question)}</span>
              </span>
              <span class="text-blue-500 font-bold select-none">+</span>
            </summary>
            <div class="mt-3 pt-3 border-t border-black/5 dark:border-white/5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
              ${escapeHtml(faq.answer)}
            </div>
          </details>
        `).join('')}
      </div>
    </div>
  `;
}
