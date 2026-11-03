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
import { escapeHtml, sanitizeHtml } from './common';

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

export function renderDevelopersList(developers: any[], settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  const devList = (Array.isArray(developers) && developers.length > 0)
    ? developers
    : (Array.isArray(settings?.developers) ? settings.developers : []);

  if (devList.length === 0) {
    return `
      <div class="max-w-[1000px] mx-auto px-3.5 sm:px-6 py-3 sm:py-6 animate-fade-in pb-14 min-h-[70vh] text-left">
        <div class="mb-3 sm:mb-4">
          <a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"></path></svg>
            Home
          </a>
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5 pb-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80">Our Developers</h1>
        <p class="text-xs xs:text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mt-3">Information about our developers is not available at this moment. Please check back later.</p>
      </div>
    `;
  }

  let cards = '';
  devList.forEach(d => {
    const name = getField(d, 'name') || getField(d, 'title') || 'Developer';
    const logo = getField(d, 'image_url') || getField(d, 'logo_url') || getField(d, 'icon_url');
    const optimizedLogo = logo ? optimizeImageUrl(logo, 256) : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    const bio = getField(d, 'bio') || getField(d, 'description') || '';
    const role = getField(d, 'role') || 'Verified Developer';
    const github = getField(d, 'github') || '';
    const twitter = getField(d, 'twitter') || '';

    cards += `
      <div class="border border-zinc-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col items-center text-center group animate-fade-in">
        <div class="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-zinc-200 dark:border-zinc-800">
          <img src="${escapeHtml(optimizedLogo)}" alt="${escapeHtml(name)}" loading="lazy" decoding="async" width="96" height="96" class="w-full h-full object-cover" referrerpolicy="no-referrer"/>
        </div>
        <h3 class="text-lg font-extrabold text-zinc-900 dark:text-white mb-1 tracking-tight">${escapeHtml(name)}</h3>
        <div class="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">${escapeHtml(role)}</div>
        ${bio ? `<p class="text-zinc-600 dark:text-zinc-400 mb-4 flex-grow text-xs sm:text-sm leading-relaxed">${escapeHtml(bio)}</p>` : ''}
        <div class="flex gap-3 mt-auto pt-3 border-t border-zinc-200/80 dark:border-white/10 w-full justify-center">
          ${github ? `<a href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 border border-zinc-200/80 dark:border-white/10 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300" aria-label="${escapeHtml(name)} GitHub Profile">GitHub</a>` : ''}
          ${twitter ? `<a href="${escapeHtml(twitter)}" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 border border-zinc-200/80 dark:border-white/10 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300" aria-label="${escapeHtml(name)} Twitter Profile">Twitter</a>` : ''}
        </div>
      </div>
    `;
  });

  return `
    <div class="max-w-[1000px] mx-auto px-3.5 sm:px-6 py-3 sm:py-6 animate-fade-in pb-14 min-h-[70vh] text-left">
      <div class="mb-3 sm:mb-4">
        <a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"></path></svg>
          Home
        </a>
      </div>
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2 pb-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80">Meet Our Team</h1>
      <p class="text-xs xs:text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6">The creative minds and technical experts building the future of ${escapeHtml(siteTitle)}.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">${cards}</div>
    </div>
  `;
}

function renderStandardLegalLayout(heading: string, statusLabel: string, statusValue: string, emailLabel: string, supportEmail: string, contentHtml: string): string {
  return `
    <div class="max-w-[1000px] mx-auto px-3.5 sm:px-6 py-3 sm:py-6 animate-fade-in pb-14 min-h-[70vh] text-left">
      <div class="mb-3 sm:mb-4">
        <a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"></path></svg>
          Home
        </a>
      </div>
      <div class="animate-fade-in">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5 pb-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80">${escapeHtml(heading)}</h1>
        <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-5">
          <div><span class="font-semibold">${escapeHtml(statusLabel)}:</span> ${escapeHtml(statusValue)}</div>
          ${supportEmail ? `<div><span class="font-semibold">${escapeHtml(emailLabel)}:</span> ${escapeHtml(supportEmail)}</div>` : ''}
        </div>
        <div class="rich-html-content prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-xs xs:text-sm sm:text-base font-normal leading-relaxed">
          <div>${contentHtml}</div>
        </div>
      </div>
    </div>
  `;
}

export function renderAbout(settings: any): string {
  const content = sanitizeHtml(getField(settings, 'about_content') || DEFAULT_ABOUT_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout('About Us', 'Platform', 'Verifiable & Transparent', 'Inquiries', email, content);
}

export function renderContact(settings: any): string {
  const content = sanitizeHtml(getField(settings, 'contact_content') || '');
  const email = getField(settings, 'support_email', 'support@rummydex.com');
  return `
    <div class="max-w-[1000px] mx-auto px-3.5 sm:px-6 py-3 sm:py-6 animate-fade-in pb-14 min-h-[70vh] text-left">
      <div class="mb-3 sm:mb-4">
        <a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"></path></svg>
          Home
        </a>
      </div>
      <div class="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        <div class="lg:col-span-12 xl:col-span-5 space-y-5">
          <div>
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2.5 pb-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80">Contact Us</h1>
            <div class="rich-html-content markdown-body text-xs xs:text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">${content}</div>
          </div>
          <div class="space-y-3 pt-2">
            <div class="flex items-start gap-3.5 py-2.5 border-b border-zinc-200/70 dark:border-zinc-800/80">
              <div class="text-blue-500 mt-0.5 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">Email</h3>
                <p class="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">${escapeHtml(email)}</p>
              </div>
            </div>
            <div class="flex items-start gap-3.5 py-2.5 border-b border-zinc-200/70 dark:border-zinc-800/80">
              <div class="text-pink-500 mt-0.5 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">Live Chat</h3>
                <p class="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">Monday to Saturday, 10:00 AM - 3:00 PM (Instant reply in every section)</p>
              </div>
            </div>
            <div class="flex items-start gap-3.5 py-2.5">
              <div class="text-purple-500 mt-0.5 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">Office</h3>
                <p class="text-zinc-900 dark:text-zinc-100 font-semibold text-sm">Plot No. 18, 4th Floor, Commercial Complex, Sector 12, Dwarka, New Delhi, Delhi 110075, India</p>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:col-span-12 xl:col-span-7 border-t lg:border-t-0 lg:border-l border-zinc-200/80 dark:border-zinc-800/80 pt-5 lg:pt-0 lg:pl-8 space-y-4">
          <div class="pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <h2 class="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Send a Message</h2>
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Name</label>
              <div class="w-full h-11 px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl"></div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
              <div class="w-full h-11 px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl"></div>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Message</label>
            <div class="w-full h-32 px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl"></div>
          </div>
          <div class="w-full h-11 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center text-sm">Send Message</div>
        </div>
      </div>
    </div>
  `;
}

export function renderPrivacy(settings: any): string {
  const content = sanitizeHtml(getField(settings, 'privacy_content') || DEFAULT_PRIVACY_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout('Privacy Policy', 'Security Status', 'Secured & Active', 'Support Email', email, content);
}

export function renderReportRemoval(settings: any): string {
  const content = sanitizeHtml(getField(settings, 'report_removal_content') || DEFAULT_REPORT_REMOVAL_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout('Report & Removal Policy', 'DMCA & Takedowns', 'Active 24/7', 'Compliance Desk', email, content);
}

export function renderTerms(settings: any): string {
  const content = sanitizeHtml(getField(settings, 'terms_content') || DEFAULT_TERMS_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout('Terms & Conditions', 'Agreement Status', 'Active & Binding', 'Support Contact', email, content);
}

export function renderResponsibility(settings: any): string {
  const content = sanitizeHtml(getField(settings, 'responsibility_content') || DEFAULT_RESPONSIBILITY_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout('Platform Responsibility Clause', 'Safety & Compliance', 'Verified Policy', 'Helpdesk', email, content);
}

export function renderNotice(settings: any): string {
  const heading = getField(settings, 'important_notice_heading') || 'Important Notice';
  const content = sanitizeHtml(getField(settings, 'important_notice') || DEFAULT_NOTICE_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout(heading, 'Advisory Type', 'Official Platform Notice', 'Support Contact', email, content);
}

export function renderEthics(settings: any): string {
  const heading = getField(settings, 'ethics_heading') || 'Ethics & Safety';
  const content = sanitizeHtml(getField(settings, 'ethics_discrimination_text') || DEFAULT_ETHICS_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout(heading, 'Policy Status', 'Active & Enforced', 'Compliance Contact', email, content);
}

export function renderDisclaimer(settings: any): string {
  const heading = getField(settings, 'disclaimer_heading') || 'Disclaimer';
  const content = sanitizeHtml(getField(settings, 'disclaimer_text') || DEFAULT_DISCLAIMER_HTML);
  const email = getField(settings, 'support_email') || '';
  return renderStandardLegalLayout(heading, 'Notice Type', 'Liability Disclaimer', 'Support Desk', email, content);
}

export function render404(urlPath: string, settings: any): string {
  const siteTitle = getField(settings, 'site_title') || 'RummyDex';
  return `
    <div class="py-12 text-center max-w-2xl mx-auto px-4 min-h-[60vh]">
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
    <div class="max-w-[1000px] mx-auto px-3.5 sm:px-6 py-3 sm:py-6 animate-fade-in pb-14 min-h-[70vh] text-left">
      <div class="mb-3 sm:mb-4">
        <a href="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-blue-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5M12 19l-7-7 7-7"></path></svg>
          Home
        </a>
      </div>
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1.5">
        Frequently Asked Questions
      </h1>
      <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-4 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        Everything you need to know about ${escapeHtml(siteTitle)}, app downloads, verification, and safety.
      </p>
      <div class="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
        ${siteFaqs.map((faq: any) => `
          <details class="group py-3.5" open>
            <summary class="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 cursor-pointer list-none flex justify-between items-center gap-3">
              <span class="flex items-start gap-2">
                <span class="text-blue-600 dark:text-blue-400 font-extrabold select-none">Q.</span>
                <span>${escapeHtml(faq.question)}</span>
              </span>
              <span class="text-blue-500 font-bold select-none">+</span>
            </summary>
            <div class="mt-2 pt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-5 rich-html-content">
              ${sanitizeHtml(faq.answer)}
            </div>
          </details>
        `).join('')}
      </div>
    </div>
  `;
}
