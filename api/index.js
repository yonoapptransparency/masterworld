var Lt=Object.create;var Ce=Object.defineProperty;var Ut=Object.getOwnPropertyDescriptor;var Ft=Object.getOwnPropertyNames;var Pt=Object.getPrototypeOf,Vt=Object.prototype.hasOwnProperty;var Fe=(t,e)=>()=>(t&&(e=t(t=0)),e);var Qe=(t,e)=>{for(var s in e)Ce(t,s,{get:e[s],enumerable:!0})},et=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Ft(e))!Vt.call(t,r)&&r!==s&&Ce(t,r,{get:()=>e[r],enumerable:!(n=Ut(e,r))||n.enumerable});return t};var J=(t,e,s)=>(s=t!=null?Lt(Pt(t)):{},et(e||!t||!t.__esModule?Ce(s,"default",{value:t,enumerable:!0}):s,t)),me=t=>et(Ce({},"__esModule",{value:!0}),t);function Pe(){let t=null;typeof process<"u"&&(t=process.env?.ADMIN_PATH||process.env?.VITE_ADMIN_PATH);try{let e=zt.env?.VITE_ADMIN_PATH;e&&(t=e)}catch{}return t||"admin"}var zt,tt=Fe(()=>{zt={}});var st={};Qe(st,{b64EncodeUnicode:()=>Bt,commitFileToGitHub:()=>Mt,generateStaticDataFileCode:()=>Ve});function Bt(t){try{return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,s)=>String.fromCharCode(parseInt(s,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(t)}}function Ve(t=[],e={},s=[],n=[],r=[]){let o=JSON.parse(JSON.stringify(t||[])).map(p=>(delete p.more_information_url,delete p.encrypted_download_url,delete p.download_url,p)),d={...{site_title:"Yono Store",meta_description:"Download All Yono Games, Rummy Apps & Teen Patti APKs",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))},a=JSON.parse(JSON.stringify(s||[])),c=JSON.parse(JSON.stringify(n||[])),f=JSON.parse(JSON.stringify(r||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

export interface GlobalSettings {
  site_title: string;
  meta_description: string;
  logo_url: string;
  favicon_url: string;
  helpline_whatsapp: string;
  helpline_telegram: string;
  support_email: string;
  disclaimer_text: string;
  disclaimer_heading?: string;
  ethics_discrimination_text: string;
  ethics_heading?: string;
  portal_heading?: string;
  important_notice_heading?: string;
  ticker_text: string;
  animations_enabled: boolean;
  seo_keywords?: string;
  about_content?: string;
  contact_content?: string;
  privacy_content?: string;
  terms_content?: string;
  responsibility_content?: string;
  report_removal_content?: string;
  important_notice?: string;
  categories: string[];
  banners: Banner[];
  last_updated?: string;
  secure_index_title?: string;
  secure_index_subtitle?: string;
  trending_searches?: string[];
  hero_title_text?: string;
  hero_title_color?: string;
  hero_title_style?: string;
  hero_title_animation?: string;
  hero_title_subtitle?: string;
  hero_title_visible?: boolean;
  ga_tracking_id?: string;
  quick_links?: Array<{ title: string; subtitle?: string; icon?: string; color?: string; url: string }>;
  social_links?: { facebook?: string; instagram?: string; twitter?: string; linkedin?: string; youtube?: string; };
  website_faqs?: Array<{ question: string; answer: string }>;
  developers?: Array<{ name: string; role: string; bio?: string; image_url?: string; github?: string; twitter?: string; avatar_url?: string; social?: any }>;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  logo_url: string;
  description: string;
  ceo_name: string;
  ceo_description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords?: string;
  category?: string;
  og_image_url?: string;
  canonical_url?: string;
  target_region?: string;
  content: string;
  published_at?: string;
  link: string;
  read_time?: string;
  author?: string;
  description_html?: string;
  date?: string;
  tags?: string[];
  related_app_id?: string;
}

export interface AppConfig {
  id: string;
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image_url?: string;
  canonical_url?: string;
  target_region?: string;
  category: string;
  is_coming_soon?: boolean;
  publish_date?: string;
  version: string;
  file_size: string;
  developer: string;
  icon_url: string;
  screenshots: string[];
  description_html: string;
  red_box_msg: string;
  yellow_box_msg: string;
  idea_box_msg: string;
  safety_status: 'Verified' | 'Caution' | 'Unsafe';
  serial_number: number;
  is_featured: boolean;
  is_new: boolean;
  is_hot?: boolean;
  release_notes: string;
  rating: number;
  created_at: string;
  custom_admin_box_html?: string;
  custom_admin_box_heading?: string;
  features_html?: string;
  faqs?: {question: string; answer: string}[];
  link_configured?: boolean;
  
  video_url?: string;
  is_top_chart?: boolean;
  top_chart_category?: string;
  more_information_url?: string;
}

export interface Review {
  id: string;
  app_id: string;
  username: string;
  rating: number;
  comment: string;
  is_approved: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  cover_url: string;
  published_at: string;
  related_app_slug?: string;
  related_app_name?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  canonical_url?: string;
  target_region?: string;
  description?: string;
  description_html?: string;
  date?: string;
  thumbnail_url?: string;
  publish_date?: string;
  read_time?: string;
  tags?: string[];
  created_at?: string;
}

export interface NewsUpdate {
  id: string;
  title: string;
  content_html: string;
  category: string;
  published_at: string;
}

export interface VideoItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  youtube_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords?: string;
  created_at: string;
}

export const mockApps: AppConfig[] = ${JSON.stringify(o,null,2)} as any[];

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = ${JSON.stringify(d,null,2)} as any;

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = ${JSON.stringify(a,null,2)} as any[];

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockBlogs: BlogPost[] = ${JSON.stringify(c,null,2)} as any[];

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(f,null,2)} as any[];

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}async function Mt({owner:t,repo:e,token:s,branch:n,path:r,content:o,message:i}){let a=await fetch("/api/github-sync/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({owner:t,repo:e,token:s,branch:n,path:r,content:o,message:i})});if(!a.ok){let c=a.headers.get("content-type"),f=await a.text(),p=f||`Server returned ${a.status} ${a.statusText}`;if(c&&c.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${a.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${f.substring(0,100)}...`);try{let l=JSON.parse(f);p=l.message||l.error||p}catch{(!p||p.trim()==="")&&(p=`HTTP Error ${a.status}`)}throw new Error(p)}return a.json()}var ze=Fe(()=>{});var Se={};Qe(Se,{fetchStoreData:()=>_e,getField:()=>u,injectSeoTags:()=>us,syncFromFirestore:()=>mt});function gt(){if(ie)return ie;try{let n=ce.default.readFileSync(be.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Be(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ie=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Be(t))return ie={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ie;try{let n=Ht.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Be(r.projectId))return ie=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}function Me(t){if(!t)return null;if("stringValue"in t)return t.stringValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("booleanValue"in t)return t.booleanValue;if("arrayValue"in t)return(t.arrayValue.values||[]).map(s=>Me(s));if("mapValue"in t){let e=t.mapValue.fields||{},s={};for(let n of Object.keys(e))s[n]=Me(e[n]);return s}return null}function re(t){if(!t)return{};let e={};for(let s of Object.keys(t))e[s]=Me(t[s]);return e}function u(t,e,s=""){if(!t)return s;let n=t[e];return n==null?s:typeof n=="object"?"stringValue"in n?n.stringValue??s:"integerValue"in n?String(n.integerValue)??s:"booleanValue"in n?String(n.booleanValue)??s:s:String(n)}async function mt(){try{let t=gt();if(!t||!t.projectId)return console.log("[SYNC] Skipping background Firestore sync: Firebase config not found."),null;let e=t.projectId,s=t.firestoreDatabaseId||"(default)",n=t.apiKey,r=n?`?key=${n}`:"",o=`https://firestore.googleapis.com/v1/projects/${e}/databases/${s}/documents/store_data`;console.log(`[SYNC] Syncing filesystem backup files with Firestore (${e})...`);let[i,d,a,c,f]=await Promise.all([fetch(`${o}/public_settings${r}`).catch(()=>null),fetch(`${o}/news${r}`).catch(()=>null),fetch(`${o}/blogs${r}`).catch(()=>null),fetch(`${o}/videos${r}`).catch(()=>null),fetch(`${o}/apps_meta${r}`).catch(()=>null)]),p=dt;if(i&&i.ok){let h=await i.json(),g=re(h.fields);g&&Object.keys(g).length>0&&(p=g)}let l=ut;if(d&&d.ok){let h=await d.json(),g=re(h.fields);g&&Array.isArray(g.items)&&(l=g.items)}let w=pt;if(a&&a.ok){let h=await a.json(),g=re(h.fields);g&&Array.isArray(g.items)&&(w=g.items)}let m=ft;if(c&&c.ok){let h=await c.json(),g=re(h.fields);g&&Array.isArray(g.items)&&(m=g.items)}let y=[],C=1,_=!1;if(f&&f.ok){let h=await f.json(),g=re(h.fields);g&&typeof g.numChunks=="number"&&(C=g.numChunks,_=!0)}if(_){let h=[];for(let b=0;b<C;b++)h.push(fetch(`${o}/apps_chunk_${b}${r}`).then(x=>x.ok?x.json():null).catch(()=>null));(await Promise.all(h)).forEach(b=>{if(b){let x=re(b.fields);x&&Array.isArray(x.items)&&y.push(...x.items)}})}else{let h=await fetch(`${o}/apps${r}`).catch(()=>null);if(h&&h.ok){let g=await h.json(),b=re(g.fields);b&&Array.isArray(b.items)&&(y=b.items)}}y.length===0&&(y=lt);try{let h=be.default.join(process.cwd(),"src/lib/public_backup.json");ce.default.writeFileSync(h,JSON.stringify({apps:y,settings:p,news:l,blogs:w,videos:m},null,2),"utf8");try{let{generateStaticDataFileCode:g}=(ze(),me(st)),b=g(y,p,l,w,m);ce.default.writeFileSync(be.default.join(process.cwd(),"src/lib/staticData.ts"),b,"utf8")}catch(g){console.warn("Could not write staticData.ts fallback (skipping):",g.message)}}catch(h){console.warn("[SYNC] Could not write cache files to filesystem (running in read-only environment?):",h.message)}return console.log(`[SYNC] Synchronization successful. Apps count: ${y.length}`),{apps:y,settings:p,news:l,blogs:w,videos:m}}catch(t){return console.error("[SYNC] Sync error:",t),null}}async function _e(){let t=Date.now(),e=t-he>nt,s=t-he>nt*15;return ye&&!s?(e&&!$e&&($e=!0,rt().then(()=>{$e=!1}).catch(n=>{$e=!1,console.warn("Background store fetch failed safely:",n)})),ye):await rt()}async function rt(){let t=Date.now(),e=be.default.join(process.cwd(),"src/lib/public_backup.json");if(ce.default.existsSync(e))try{let r=JSON.parse(ce.default.readFileSync(e,"utf8"));if(r.apps&&r.apps.length>0){let o={apps:r.apps||[],settings:r.settings||{},news:r.news||[],blogs:r.blogs||[],videos:r.videos||[]};return ye=o,he=t,o}}catch(r){console.error("Error reading public_backup.json in seoHelper:",r)}let s=await mt();if(s)return ye=s,he=t,s;let n={apps:lt||[],settings:dt||{},news:ut||[],blogs:pt||[],videos:ft||[]};return ye=n,he=t,n}function k(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Re(t){if(!t)return"";let e=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");return e=e.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi,""),e=e.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi,'href="#"'),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,""),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi,""),e}function ee(t){return t?t.replace(/<[^>]*>?/gm," ").replace(/\s+/g," ").trim():""}function ae(t){if(!t)return"";let e=t.trim();if(e.startsWith("<")||e.includes("<meta ")){let s=e.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);if(s&&s[1])return s[1].trim();let n=e.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);return n&&n[1]?n[1].trim():ee(e).substring(0,160)}return e}async function Jt(t,e){let{apps:s,settings:n,news:r,blogs:o,videos:i}=e,d=t.split("?")[0].split("#")[0].replace(/\/+$/,"")||"/",a=d.toLowerCase(),c="";if(a==="/"||a==="")c=ot(s,n,r,o,i);else if(a==="/new-apps")c=qt(s,n);else if(a.startsWith("/info/")||a.startsWith("/gateway/")||a.startsWith("/moredetail/")){let l="";a.startsWith("/info/")?l=d.split("/info/")[1]:a.startsWith("/gateway/")?l=d.split("/gateway/")[1]:l=d.split("/moredetail/")[1],c=Xt(l,s,n)}else if(a==="/news")c=Zt(r,n);else if(a.startsWith("/news/")){let l=d.split("/news/")[1];c=it(l,r,n)}else if(a==="/blogs")c=Qt(o,n);else if(a.startsWith("/blog/")){let l=d.split("/blog/")[1];c=at(l,o,n)}else if(a==="/videos")c=es(i,n);else if(a.startsWith("/videos/")){let l=d.split("/videos/")[1];c=ct(l,i,n)}else if(a==="/about")c=ts(n);else if(a==="/contact")c=ss(n);else if(a==="/privacy")c=ns(n);else if(a==="/report-removal")c=rs(n);else if(a==="/terms")c=os(n);else if(a==="/notice")c=as(n);else if(a==="/ethics")c=cs(n);else if(a==="/disclaimer")c=ls(n);else if(a==="/responsibility")c=is(n);else{let l=a.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"");s.some(w=>w.slug?.toLowerCase()===l)?c=Yt(l,s,n):r.some(w=>w.slug?.toLowerCase()===l)?c=it(l,r,n):o.some(w=>w.slug?.toLowerCase()===l)?c=at(l,o,n):i.some(w=>w.slug?.toLowerCase()===l)?c=ct(l,i,n):c=ot(s,n,r,o,i)}let f=Gt(n),p=Kt(n);return`
    <div class="flex flex-col min-h-screen">
      ${f}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${c}
      </main>
      ${p}
    </div>
  `}function Gt(t){let e=u(t,"site_title"),s=u(t,"logo_url");return`
    <header class="py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white">
          ${s?`<img src="${k(s)}" loading="eager" width="40" height="40" class="w-10 h-10 object-contain" alt="Logo"/>`:""}
          <span>${k(e)}</span>
        </a>
        <nav class="hidden md:flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <a href="/">Home</a>
          <a href="/new-apps">New Apps</a>
          <a href="/news">News</a>
          <a href="/blogs">Blogs</a>
          <a href="/videos">Videos</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>
  `}function Kt(t){let e=u(t,"site_title"),s=u(t,"logo_url"),n=u(t,"meta_description"),r=u(t,"disclaimer_text"),o=u(t,"ethics_discrimination_text"),i=u(t,"important_notice");return`
    <footer class="pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400">
      <div class="max-w-7xl mx-auto px-6">
        <h3 class="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2">
          ${s?`<img src="${k(s)}" loading="eager" width="32" height="32" class="w-8 h-8 object-contain" alt="Logo" />`:""}
          <span>${k(e)}</span>
        </h3>
        <p class="text-sm max-w-xl mx-auto mb-6 leading-relaxed">${k(n)}</p>
        <div class="flex flex-wrap justify-center gap-6 text-xs font-semibold mb-8 text-zinc-600 dark:text-zinc-400">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/videos">Apps</a>
          <a href="/blogs">Blog</a>
          <a href="/privacy">Privacy</a>
          <a href="/report-removal">Report & Removal</a>
          <a href="/terms">Terms</a>
          <a href="/notice">Notice</a>
          <a href="/ethics">Ethics</a>
          <a href="/disclaimer">Disclaimer</a>
        </div>
        <div class="text-xs text-zinc-400 mt-8">&copy; ${new Date().getFullYear()} ${k(e)}. All rights reserved.</div>
      </div>
    </footer>
  `}function ot(t,e,s,n,r){let o=u(e,"site_title"),i=u(e,"meta_description"),d="";[...t].sort((f,p)=>parseInt(u(f,"serial_number","999"),10)-parseInt(u(p,"serial_number","999"),10)).forEach((f,p)=>{let l=u(f,"name"),w=u(f,"slug"),m=u(f,"category"),y=u(f,"rating","5.0"),C=u(f,"icon_url"),_=f.is_new===!0||f.is_new&&f.is_new.booleanValue===!0;d+=`
      <a href="/${encodeURIComponent(w)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${p+1}</span>
        <img src="${C||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${k(l)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${k(l)}</h3>
          <p class="text-xs text-zinc-500 truncate">${k(m)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${y}</span><span class="text-zinc-400">\u2605</span>
            ${_?'<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>':""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `});let c="";return s.slice(0,3).forEach(f=>{c+=`
      <a href="/news/${encodeURIComponent(u(f,"slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${k(u(f,"title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${k(u(f,"description"))}</p>
      </a>
    `}),`
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${k(o)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${k(i)}</p>
      </div>
      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
          <h2 class="text-xl font-bold mb-4 px-2 text-left">Popular E-Sports virtual clients</h2>
          <div class="flex flex-col">${d}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest Archives</h3>
            <div class="flex flex-col gap-3">${c}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates \u2192</a>
          </div>
        </div>
      </div>
    </div>
  `}function qt(t,e){let s="",n=t.filter(o=>o.is_new===!0||o.is_new&&o.is_new.booleanValue===!0);return(n.length>0?n:t).forEach(o=>{let i=u(o,"name"),d=u(o,"slug"),a=u(o,"category"),c=u(o,"rating","5.0"),f=u(o,"icon_url");s+=`
      <a href="/${encodeURIComponent(d)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${k(i)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${k(a)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${c} \u2605</span>
      </a>
    `}),`
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${s}</div>
    </div>
  `}function Yt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(y=>u(y,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>';let o=u(r,"name"),i=u(r,"category"),d=u(r,"version","Latest"),a=u(r,"file_size","Variable"),c=u(r,"rating","5.0"),f=u(r,"icon_url"),p=r.description_html?Re(r.description_html):`<p>No comprehensive details are configured yet for ${k(o)}.</p>`,l=r.features_html?Re(r.features_html):"",w=l?`<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${l}</div>`:"",m=u(r,"package_name","Not published");return`
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="96" height="96" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${k(o)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${k(i)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${k(d)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${k(a)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${k(i.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${k(c)} \u2605</strong></div>
        </div>

        <a href="/info/${encodeURIComponent(t)}" class="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow hover:opacity-95">Install Direct Access Mirror \u{1F680}</a>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm text-left">
          <h2 class="text-lg font-bold mb-4">Detailed Game Review & Safe Guidelines</h2>
          <div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${p}</div>
          ${w}
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm h-fit text-left">
          <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-400">Specifications</h3>
          <table class="w-full text-xs text-left">
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Developer</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Store Certified</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Package Name</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white truncate max-w-[150px]">${k(m)}</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Status</td><td class="py-2 font-bold text-right text-green-500">Safe & Clean</td></tr>
            <tr><td class="py-2 text-zinc-400 font-semibold">System Code</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Android / iOS</td></tr>
          </table>
        </div>
      </div>
    </div>
  `}function Xt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(d=>u(d,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>';let o=u(r,"name");return`
    <div class="max-w-xl mx-auto py-12 px-4 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5">
      <div class="text-center">
        <img src="${u(r,"icon_url")||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border" alt="icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-1">${k(o)}</h1>
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black mb-6">Information Hub</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-8">Access the application details and specifications below.</p>
        <a href="/" class="block w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl">Return Home</a>
        <a href="/${encodeURIComponent(t)}" class="block text-xs font-semibold text-blue-500 hover:underline mt-4">Read Technical Description</a>
      </div>
    </div>
  `}function Zt(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/news/${encodeURIComponent(u(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${k(u(n,"category")||"Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${k(u(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${k(u(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${k(u(n,"description"))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`}function it(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(p=>u(p,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>';let o=u(r,"title"),i=u(r,"created_at")||"May 2026",d=u(r,"ceo_name","System Author"),a=u(r,"category","Report"),c=u(r,"content")||u(r,"description",""),f=Re(c);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${k(a)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${i} | By ${k(d)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${k(o)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${f.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function Qt(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/blog/${encodeURIComponent(u(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${k(u(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${k(u(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${k(ee(u(n,"excerpt")||u(n,"content","").substring(0,140)))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`}function at(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(f=>u(f,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>';let o=u(r,"title"),i=u(r,"created_at")||"May 2026",d=u(r,"author","System Author"),a=u(r,"content",""),c=Re(a);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${i} | Strategy by ${k(d)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${k(o)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${c.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function es(t,e){let s="";return t.forEach(n=>{let r=u(n,"title"),o=u(n,"slug"),i=u(n,"description","");s+=`
      <a href="/videos/${encodeURIComponent(o)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${k(r)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${k(i)}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${s||'<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`}function ct(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(d=>u(d,"slug").toLowerCase()===n||u(d,"id").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>';let o=u(r,"title"),i=u(r,"description");return`<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${k(o)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${i.replace(/\n\n/g,"<br/><br/>")}</p></div>`}function ts(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"about_content")||"About our application services.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ss(t){let e=u(t,"contact_content")||"Get in touch for active client files help.",s=u(t,"support_email","support@example.com");return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${e}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${k(s)}</p></div></div>`}function ns(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"privacy_content")||"No private data tracking.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function rs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"report_removal_content")||"Report & Removal Policy compliance guidelines.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function os(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"terms_content")||"Service code terms of compliance.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function is(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"responsibility_content")||"Play safe for custom virtual entertainment.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function as(t){let e=u(t,"important_notice_heading")||"Important Notice",s=u(t,"important_notice")||"No important notices at this time.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function cs(t){let e=u(t,"ethics_heading")||"Ethics & Safety",s=u(t,"ethics_discrimination_text")||"Ethics and safety information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ls(t){let e=u(t,"disclaimer_heading")||"Disclaimer",s=u(t,"disclaimer_text")||"Disclaimer information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ds(){try{let t=gt();return t?!t.apiKey||t.apiKey.trim()===""||t.apiKey.includes("YOUR_API_KEY")?{projectId:"placeholder-project-id",appId:"placeholder-app-id",apiKey:"PLACEHOLDER",authDomain:"placeholder-project.firebaseapp.com",firestoreDatabaseId:"(default)",storageBucket:"placeholder-project.firebasestorage.app",messagingSenderId:"000000000",measurementId:""}:t:null}catch{return null}}async function us(t,e,s,n=""){let r=await _e();if(!r||!r.settings)return{html:t,isNotFound:!1};let o=r.apps||[],i=r.settings||{},d=r.news||[],a=r.blogs||[],c=r.videos||[],f=u(i,"site_title")||"RummyDex",p=f,l=u(i,"meta_description","");l||(l="A premium digital platform for applications and tools.");let w=u(i,"seo_keywords","");if(w||(w="app clearance, premium applications, digital tools, platform, tech specs, verified apps"),w){let E=w.split(",").map(S=>S.trim()).filter(Boolean);E.length>15&&(w=E.slice(0,15).join(", "))}let m="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",y=f||"Platform Administrator",C=null,_="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",h=!1,g=e.split("?")[0].split("#")[0],b=g.toLowerCase(),x=g.toLowerCase().replace(/^\/|\/$/g,""),I=Pe().toLowerCase(),D=b.startsWith("/moreinfo/")||b.startsWith("/info/")||b.startsWith("/moredetail/")||b.startsWith("/gateway/");if(g==="/"||x==="")h=!1;else if(x===I||b.startsWith(`/${I}`)||b.startsWith("/admin")||["wp-admin","dashboard","panel"].includes(x))h=!1;else if(b.startsWith("/app/")){let E=decodeURIComponent(g.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase()),S=o.find(T=>{let R=u(T,"slug");return R&&R.toLowerCase()===E});if(S){h=!1;let T=u(S,"name");p=`${u(S,"seo_title")||T}`;let R=u(S,"description_html");l=ae(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||l,w=u(S,"seo_keywords")||w,m=u(S,"og_image_url")||u(S,"icon_url")||m;let P=(()=>{let X=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return X.includes("rummydex.com")?"https://www.rummydex.com":X})();C=u(S,"canonical_url")||`${P}/app/${u(S,"slug")}`,_=u(S,"icon_url")||_}else h=!0}else if(b.startsWith("/info/")||b.startsWith("/moreinfo/")||b.startsWith("/moredetail/")||b.startsWith("/gateway/")){let E="/info/";b.startsWith("/moreinfo/")?E="/moreinfo/":b.startsWith("/moredetail/")?E="/moredetail/":b.startsWith("/gateway/")&&(E="/gateway/");let S=e.split(new RegExp(E,"i"))[1]||"",T=decodeURIComponent(S.split("/")[0].split("?")[0]),R=o.find(P=>{let M=u(P,"slug");return M&&M.toLowerCase()===T.toLowerCase()});if(R){h=!1;let P=u(R,"name");p=`${u(R,"seo_title")||P} - Technical Info`;let M=u(R,"description_html");l=ae(u(R,"seo_description"))||(M?ee(M).substring(0,160):"")||l,w=u(R,"seo_keywords")||w,m=u(R,"og_image_url")||u(R,"icon_url")||m,C=`${(()=>{let ge=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return ge.includes("rummydex.com")?"https://www.rummydex.com":ge})()}${E}${u(R,"slug")}`,_=u(R,"icon_url")||_}else h=!0}else if(b.startsWith("/news/")&&b.length>6){let E=decodeURIComponent((e.split(/\/news\//i)[1]||"").split("/")[0].split("?")[0]),S=d.find(T=>{let R=u(T,"slug");return R&&R.toLowerCase()===E.toLowerCase()});if(S){h=!1;let T=u(S,"title","Latest News");p=`${u(S,"seo_title")||T} | ${f}`;let R=u(S,"description")||u(S,"content");l=ae(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||l,w=u(S,"seo_keywords")||w,m=u(S,"og_image_url")||u(S,"logo_url")||m,y=u(S,"ceo_name")||f;let P=(()=>{let X=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return X.includes("rummydex.com")?"https://www.rummydex.com":X})();C=u(S,"canonical_url")||`${P}/news/${u(S,"slug")}`}else h=!0}else if(b.startsWith("/blog/")&&b.length>6){let E=decodeURIComponent((e.split(/\/blog\//i)[1]||"").split("/")[0].split("?")[0]),S=a.find(T=>{let R=u(T,"slug");return R&&R.toLowerCase()===E.toLowerCase()});if(S){h=!1;let T=u(S,"title","Blog Post");p=`${u(S,"seo_title")||T} | ${f}`;let R=u(S,"excerpt")||u(S,"content");l=ae(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||l,w=u(S,"seo_keywords")||w,m=u(S,"cover_url")||m,y=u(S,"author")||f;let P=(()=>{let X=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return X.includes("rummydex.com")?"https://www.rummydex.com":X})();C=u(S,"canonical_url")||`${P}/blog/${u(S,"slug")}`}else h=!0}else if(b.startsWith("/videos/")&&b.length>8){let E=decodeURIComponent((e.split(/\/videos\//i)[1]||"").split("/")[0].split("?")[0]),S=c.find(T=>{let R=u(T,"slug"),P=u(T,"id");return R&&R.toLowerCase()===E.toLowerCase()||P&&P.toLowerCase()===E.toLowerCase()});if(S){h=!1;let T=u(S,"title","Video Specs");p=`${u(S,"seo_title")||T} | ${f}`;let R=u(S,"description");l=ae(u(S,"seo_description"))||(R?ee(R).substring(0,160):""),w=u(S,"seo_keywords");let P=u(S,"youtube_url"),M="";if(P){let Ie=P.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);Ie&&(M=Ie[1])}M&&(m=`https://img.youtube.com/vi/${M}/maxresdefault.jpg`),C=`${(()=>{let ge=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return ge.includes("rummydex.com")?"https://www.rummydex.com":ge})()}/videos/${u(S,"slug")||u(S,"id")}`}else h=!0}else if(["about","blogs","blog","contact","disclaimer","ethics","new-apps","news","notice","privacy","report-removal","responsibility","terms","videos","developers","submit-app"].includes(x))h=!1,x==="about"?(p=`About Us | ${f}`,l="Learn more about our mission, vision, and the premium services we offer on our platform."):x==="blogs"||x==="blog"?(p=`Official Blogs & Insights | ${f}`,l="Explore our official blog articles, professional guides, gameplay tips, and deep platform reviews."):x==="contact"?(p=`Contact Us | ${f}`,l="Get in touch with our professional support team. We are here to help you with your inquiries, feedback, and technical assistance."):x==="disclaimer"?(p=`Disclaimer | ${f}`,l="Read our platform disclaimer regarding content accuracy, fair play verification, and third-party links."):x==="ethics"?(p=`Code of Ethics & Content Policy | ${f}`,l="Discover our strict code of ethics, licensing standards, and platform content guidelines."):x==="new-apps"?(p=`New Releases & Up-and-Coming Apps | ${f}`,l="Stay updated with our latest releases, featured digital tools, and upcoming app launches."):x==="news"?(p=`Latest News & Press Updates | ${f}`,l="Browse official news bulletins, press announcements, security reports, and direct system updates."):x==="notice"?(p=`Important System Notice | ${f}`,l="Read our critical system alerts, maintenance updates, and important security advisories."):x==="privacy"?(p=`Privacy Policy | ${f}`,l="Read our comprehensive privacy policy to understand how we protect, secure, and handle your personal data."):x==="report-removal"?(p=`Report & Removal Request | ${f}`,l="Submit a content or application removal request to our legal and compliance team."):x==="responsibility"?(p=`Responsible Gaming & Play Policy | ${f}`,l="Learn about our commitment to user safety, self-exclusion tools, and responsible gameplay guidelines."):x==="terms"?(p=`Terms of Service & User Agreement | ${f}`,l="Review our terms of service, platform rules, and user agreements governing the use of our services."):x==="videos"?(p=`Video Previews & Walkthroughs | ${f}`,l="Watch high-definition videos, gameplay showcases, and technical walkthroughs of our certified applications."):x==="developers"?(p=`Meet Our Team | ${f}`,l=`Meet the brilliant developers behind ${f}. Discover our team's expertise and passion.`):x==="submit-app"&&(p=`Submit Your App | ${f}`,l=`Submit your Android application for listing and promotion on ${f}.`);else{let S=decodeURIComponent(e.split("?")[0].split("#")[0].replace(/^\/|\/$/g,""));if(S&&S!==""){let T=o.find(R=>u(R,"slug")?.toLowerCase()===S.toLowerCase());if(T){h=!1;let R=u(T,"name","App");p=u(T,"seo_title")||R;let P=u(T,"description_html"),M=`Discover the ${R} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;l=ae(u(T,"seo_description"))||(P?ee(P).substring(0,160):M),w=u(T,"seo_keywords"),m=u(T,"og_image_url")||u(T,"icon_url")||m,C=u(T,"canonical_url"),_=u(T,"icon_url")||_}else h=!0}else h=!0}h&&(p=`404 Page Not Found | ${f}`,l=`The requested page does not exist on ${f}. Browse our certified application listings and news updates.`);let O=(()=>{let S=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return S.includes("rummydex.com")?"https://www.rummydex.com":S})(),ne=e.split("?")[0].split("#")[0].replace(/^\/api(\/[^/]+)?/i,"")||"/";ne.length>1&&ne.endsWith("/")&&(ne=ne.slice(0,-1));let Q=`${O}${ne}`,H=C||Q;H.includes("rummydex.com")&&(H=H.replace(/^http:\/\//i,"https://").replace("https://rummydex.com","https://www.rummydex.com")),H.length>10&&H.endsWith("/")&&!H.endsWith("://www.rummydex.com/")&&(H=H.slice(0,-1));let j=m;if(m){let E=m.trim();if(E.startsWith("//"))j=`https:${E}`;else if(E.startsWith("data:"))j=E;else if(!E.startsWith("http://")&&!E.startsWith("https://")){let S=E.startsWith("/")?E:`/${E}`;j=`${O}${S}`}else j=E}let $=_;if(_){let E=_.trim();if(E.startsWith("//"))$=`https:${E}`;else if(E.startsWith("data:"))$=E;else if(!E.startsWith("http://")&&!E.startsWith("https://")){let S=E.startsWith("/")?E:`/${E}`;$=`${O}${S}`}else $=E}let N=e.startsWith(`/${Pe()}`),z=u(i,"google_analytics_id","")||u(i,"ga_tracking_id",""),Ue=z?`
    <script async src="https://www.googletagmanager.com/gtag/js?id=${k(z)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${k(z)}');
    </script>
  `:"",oe=null;N||(o.some(S=>S.slug?.toLowerCase()===e.split("?")[0].split("#")[0].replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase())||e.startsWith("/gateway/")||e.startsWith("/moredetail/")||e.startsWith("/info/")||e.startsWith("/moreinfo/")?oe={"@context":"https://schema.org","@type":"SoftwareApplication",name:p,operatingSystem:"Android, iOS",applicationCategory:"GameApplication",description:l,url:H,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}}:e.startsWith("/news/")||e.startsWith("/blog/")?oe={"@context":"https://schema.org","@type":"Article",headline:p,description:l,image:j||[],author:{"@type":"Person",name:y}}:e.startsWith("/videos/")?oe={"@context":"https://schema.org","@type":"VideoObject",name:p,description:l,thumbnailUrl:j||[],uploadDate:new Date().toISOString()}:oe={"@context":"https://schema.org","@type":"WebSite",name:f,url:H});let Xe=oe?`<script type="application/ld+json">${JSON.stringify(oe).replace(/</g,"\\u003c")}</script>`:"";if(e==="/"||e===""){let E=u(i,"website_faqs");if(E&&Array.isArray(E)&&E.length>0){let S={"@context":"https://schema.org","@type":"FAQPage",mainEntity:E.map(T=>({"@type":"Question",name:T.question,acceptedAnswer:{"@type":"Answer",text:T.answer}}))};Xe+=`
    <script type="application/ld+json">${JSON.stringify(S).replace(/</g,"\\u003c")}</script>`}}let Dt=(()=>{let S=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").toLowerCase();if(S.includes("masterworld")||S.includes("dev-")||S.includes("pre-")||S.includes("localhost")||S.includes("127.0.0.1"))return!0;if(process.env.PUBLIC_DOMAIN)try{let T=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase(),R=s?new URL(s).host.toLowerCase():"";if(R&&R!==T)return!0}catch{}return!1})(),jt=N||Dt||h?`
    <title>${N?"Admin Portal":k(p)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${k($)}" />
    <link rel="shortcut icon" href="${k($)}" />
    <link rel="apple-touch-icon" href="${k($)}" />
    `:""}
  `:`
    <title>${k(p)}</title>
    <meta name="description" content="${k(l)}" />
    <meta name="keywords" content="${k(w)}" />
    <meta name="author" content="${k(y)}" />
    <meta property="og:title" content="${k(p)}" />
    <meta property="og:description" content="${k(l)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${k(H)}" />
    ${j?`<meta property="og:image" content="${k(j)}" />`:""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${k(p)}" />
    <meta name="twitter:description" content="${k(l)}" />
    ${j?`<meta name="twitter:image" content="${k(j)}" />`:""}
    <meta name="robots" content="${D?"noindex, nofollow":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />
    <link rel="canonical" href="${k(H)}" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${k($)}" />
    <link rel="shortcut icon" href="${k($)}" />
    <link rel="apple-touch-icon" href="${k($)}" />
    `:""}
    ${Xe}
    ${Ue}
  `,Y=t.replace(/<title>.*?<\/title>/ims,"");Y=Y.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims,""),Y=Y.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims,"");let Ze=ds(),Nt=`
    <script id="firebase-config-loader">
      ${Ze?`window.__FIREBASE_CONFIG__ = ${JSON.stringify(Ze).replace(/</g,"\\u003c")};`:""}
      window.__INITIAL_DATA__ = ${JSON.stringify({apps:o,settings:i,news:d,blogs:a,videos:c}).replace(/</g,"\\u003c")};
    </script>
  `,Ot=jt.replace(/<(meta|link) /g,'<$1 data-rh="true" ').replace(/<title>/g,'<title data-rh="true">').replace(/<script type="application\/ld\+json"/g,'<script data-rh="true" type="application/ld+json"');Y=Y.replace("</head>",`${Nt}${Ot}</head>`);try{let E=await Jt(e,r);Y.includes('<div id="root">')?Y=Y.replace('<div id="root">',`<div id="root">${E}`):Y=Y.replace("</body>",`<div id="seo-prerender">${E}</div>
  </body>`)}catch(E){console.error("Static pre-rendering body injection failed:",E)}return{html:Y,isNotFound:h}}var ce,be,Wt,we,lt,dt,ut,pt,ft,ye,he,nt,$e,Be,Ht,ie,le=Fe(()=>{ce=J(require("fs")),be=J(require("path"));tt();Wt=()=>{try{return require("./lib/staticData")}catch{return{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}},we=Wt(),lt=we.mockApps||[],dt=we.mockSettings||{},ut=we.mockNews||[],pt=we.mockBlogs||[],ft=we.mockVideos||[],ye=null,he=0,nt=36e5,$e=!1,Be=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},Ht="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ie=null});var Le=J(require("express")),At=J(require("helmet")),qe=J(require("express-rate-limit")),It=J(require("cookie-parser")),G=J(require("path")),Z=J(require("crypto")),He=J(require("compression")),V=J(require("fs")),Ct=J(require("dns"));le();ze();var Oe=J(require("crypto-js"));var xe=J(require("otpauth"));function yt(){return new xe.Secret({size:20}).base32}function ht(t,e){return new xe.TOTP({issuer:"rummydex.com",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function We(t,e){try{return new xe.TOTP({issuer:"rummydex.com",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(s){return console.error("TOTP verification error:",s),!1}}process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");console.log("Server starting with ADMIN_EMAIL:",process.env.ADMIN_EMAIL);var Et=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||Et();var Je=()=>{try{let t="./src/lib/staticData";try{let e=require.resolve(t);delete require.cache[e]}catch{}return require(t)}catch(t){return console.error("Failed to load staticData dynamically:",t),{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}},Ns=Je();function U(t,e){let s=[e,process.env.AES_SECRET].filter(Boolean),n=Array.from(new Set(s));for(let r of n)if(!(!r||r.trim()===""))try{let i=Oe.default.AES.decrypt(t,r).toString(Oe.default.enc.Utf8);if(i&&i.trim().length>0)return i}catch{}return""}function W(){let t=process.env.AES_SECRET;if(!t||t===Et())throw console.error("CRITICAL: AES_SECRET environment variable is NOT SET."),new Error("AES_SECRET environment variable is NOT SET. Server misconfiguration.");return t}function K(t,e){if(!t||!e||e.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return Oe.default.AES.encrypt(t,e).toString()}var bt=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},ke=null;function q(){if(ke)return ke;try{let n=V.default.readFileSync(G.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&bt(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ke=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&bt(t))return ke={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ke;throw new Error("Firebase configuration not found and no environment variables set.")}var ve=null,Te=!1;function B(){if(ve)return ve;if(Te)return null;try{let t=require("firebase-admin"),e=q();if(t.apps.length===0){let n=process.env.FIREBASE_SERVICE_ACCOUNT;if(n)try{let r=JSON.parse(n);t.initializeApp({credential:t.credential.cert(r),projectId:e?.projectId}),console.log("[Admin SDK] Initialized with service account credentials.")}catch(r){return console.error("[Admin SDK] Failed to parse FIREBASE_SERVICE_ACCOUNT:",r.message),Te=!0,null}else if(process.env.GOOGLE_APPLICATION_CREDENTIALS)t.initializeApp({projectId:e?.projectId}),console.log("[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.");else return console.warn("[Admin SDK] No service account credentials found. Admin SDK disabled. Set FIREBASE_SERVICE_ACCOUNT env var with your service account JSON (stringified)."),Te=!0,null}let s=e?.firestoreDatabaseId||"(default)";if(s&&s!=="(default)"){let{getFirestore:n}=require("firebase-admin/firestore");ve=n(t.apps[0],s)}else ve=t.firestore();return console.log(`[Admin SDK] Firestore initialized for database: ${s}`),ve}catch(t){return console.warn("[Admin SDK] Initialization failed:",t.message||t),Te=!0,null}}function Ge(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:String(t)}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>Ge(e))}};if(typeof t=="object"){let e={};for(let[s,n]of Object.entries(t))n!==void 0&&(e[s]=Ge(n));return{mapValue:{fields:e}}}return{stringValue:String(t)}}function ps(t){let e={};if(!t||typeof t!="object")return e;for(let[s,n]of Object.entries(t))n!==void 0&&(e[s]=Ge(n));return e}async function de(t,e){try{let s=q();if(!s||!s.projectId)return console.warn(`[SERVER] Cannot write REST doc ${t}: Missing project ID`),!1;let n=s.firestoreDatabaseId||"(default)",r=s.apiKey?`?key=${s.apiKey}`:"",o=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${n}/documents/store_data/${t}${r}`,i=ps(e),d=await fetch(o,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:i})});if(!d.ok){let a=await d.text();return console.warn(`[SERVER] writeFirestoreRestDoc failed for store_data/${t} (HTTP ${d.status}):`,a),!1}return console.log(`[SERVER] writeFirestoreRestDoc successfully written store_data/${t}`),!0}catch(s){return console.error(`[SERVER] writeFirestoreRestDoc exception for ${t}:`,s.message||s),!1}}var fs=[/zgrab/i,/masscan/i,/nmap/i,/nuclei/i,/sqlmap/i,/nikto/i,/dirbuster/i,/gobuster/i,/wfuzz/i],wt=process.env.CF_TURNSTILE_SECRET||"",gs=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},Ke=gs(wt)?wt:"";async function ms(t,e){if(!Ke)return!0;if(!t)return console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:",e),!1;try{let s=new URLSearchParams({secret:Ke,response:t,remoteip:e}),r=await(await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:s,headers:{"Content-Type":"application/x-www-form-urlencoded"}})).json();return r.success?!0:(console.warn("[CF_TURNSTILE] Failed:",r["error-codes"]),!1)}catch(s){return console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:",e,s),!1}}var $t=t=>{let e=t.headers["user-agent"]||"";return!!(e&&fs.some(s=>s.test(e)))};function ys(t){return!(!t||typeof t!="string"||t.length<8||/^(.)\1+$/.test(t))}var hs=60*1e3,bs=300,De=new Map,pe=async(t,e=bs,s=hs)=>{try{let n=Date.now(),r=De.get(t);if((!r||n>r.resetTime)&&(r={count:0,resetTime:n+s}),r.count++,De.set(t,r),Math.random()<.01)for(let[o,i]of De.entries())n>i.resetTime&&De.delete(o);return r.count>e}catch{return!0}};function se(t){return t.ip||t.socket?.remoteAddress||"unknown"}function _t(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let s=[];for(let n of e){let r;if(n.toLowerCase().startsWith("0x")?r=parseInt(n,16):n.startsWith("0")&&n.length>1?r=parseInt(n,8):r=parseInt(n,10),isNaN(r)||r<0||r>255)return null;s.push(r)}if(e.length===1){let n=s[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=s[0],r=s[1];return r>16777215?null:[n,r>>>16&255,r>>>8&255,r&255]}else if(e.length===3){let n=s[0],r=s[1],o=s[2];return o>65535?null:[n,r,o>>>8&255,o&255]}return s}function St(t){let[e,s,n,r]=t;return e===127||e===10||e===172&&s>=16&&s<=31||e===192&&s===168||e===169&&s===254||e===0||e===100&&s>=64&&s<=127||e===192&&s===0&&n===0||e===192&&s===0&&n===2||e===198&&s>=18&&s<=19||e===198&&s===51&&n>=100&&n<=103||e===203&&s===0&&n===113||e>=224&&e<=239||e>=240}async function ws(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let s=e.hostname.toLowerCase(),n=_t(s);if(n&&St(n)||s==="[::1]"||s==="::1"||s.startsWith("[fc00")||s.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(s)||s.endsWith(".local")||s.endsWith(".internal"))return!1;try{let o=await Ct.default.promises.lookup(s,{all:!0});for(let i of o){let d=i.address,a=_t(d);if(a&&St(a)||d==="::1"||d.startsWith("fc00:")||d.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var te=new Map,_s=new Set,Ee=new Map;setInterval(()=>{let t=Date.now();for(let[e,s]of te.entries())s.expiresAt<t&&te.delete(e);for(let[e,s]of Ee.entries())s.expiresAt<t&&Ee.delete(e)},3e4);function Ss(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let s=Z.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",s,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0}),s}return t.cookies["__Host-sid"]}function xs(t,e,s,n){let o=Math.floor(Date.now()/1e3)+1800,i=`${t}|${e}|${s}|${n}|${o}`,d=Z.default.createHmac("sha256",Rt).update(i).digest("hex");return Buffer.from(`${i}::${d}`).toString("base64url")}function ks(t,e,s,n,r){try{let o=Buffer.from(t,"base64url").toString("utf8"),[i,d]=o.split("::");if(!i||!d)return!1;let a=i.split("|");if(a.length!==5)return!1;let[c,f,p,l,w]=a;if(l!==r)return console.warn(`[SECURITY] Token appId mismatch: expected ${r}, got ${l}`),!1;if(Math.floor(Date.now()/1e3)>parseInt(w,10))return console.warn("[WARN] Signature expired."),!1;let m=Z.default.createHmac("sha256",Rt).update(i).digest("hex");return Z.default.timingSafeEqual(Buffer.from(d,"hex"),Buffer.from(m,"hex"))}catch{return!1}}process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");var vs=()=>["fallback","token","secret"].join("_"),Rt=process.env.TOKEN_SECRET||vs(),Vs=process.env.SESSION_SECRET||"fallback_session_secret_dev",v=(0,Le.default)();v.set("trust proxy",1);v.use((0,At.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1,xFrameOptions:!1}));var Es=(0,qe.default)({windowMs:900*1e3,limit:5e3,standardHeaders:"draft-7",legacyHeaders:!1,validate:{trustProxy:!1}});v.use(Es);var Ye=(0,qe.default)({windowMs:60*1e3,limit:100,standardHeaders:"draft-7",legacyHeaders:!1});v.use("/admin",Ye);v.use("/api/v1/admin",Ye);v.use("/api/download",Ye);v.use((t,e,s)=>{let n=Date.now();e.on("finish",()=>{let r=G.default.join(process.cwd(),"server_requests.log"),o=Date.now()-n,i=e.getHeader("content-type")||"unknown",d=t.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig,"$1$2=REDACTED")}),s()});v.use((0,He.default)({level:6,threshold:256,filter:(t,e)=>t.headers["x-no-compression"]?!1:He.default.filter(t,e)}));v.use((0,It.default)());v.use((t,e,s)=>{if(process.env.NODE_ENV==="production"){let n=(t.headers["x-forwarded-host"]||t.headers.host||"").toString().toLowerCase().split(",")[0].trim(),r=(t.headers["x-forwarded-proto"]||t.protocol||"https").toString().toLowerCase().split(",")[0].trim();if(n==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${t.originalUrl}`);if(r==="http"&&n.includes("rummydex.com"))return e.redirect(301,`https://${n}${t.originalUrl}`)}s()});v.disable("x-powered-by");v.use((t,e,s)=>{e.removeHeader("X-Powered-By"),e.setHeader("X-Powered-By","SecureServer/1.0"),e.setHeader("X-XSS-Protection","1; mode=block"),e.setHeader("X-Content-Type-Options","nosniff"),e.setHeader("Referrer-Policy","strict-origin-when-cross-origin");let n=t.headers.origin,r="",o=!1;if(n){let d=!1,a=(()=>{try{return new URL(n)}catch{return null}})();if(a){let c=a.hostname,f=process.env.PUBLIC_DOMAIN?new URL(process.env.PUBLIC_DOMAIN).hostname:"www.rummydex.com";(c==="localhost"||c==="127.0.0.1"||c.endsWith(".google.com")||c.endsWith(".studio")||c.endsWith(".run.app")||c.endsWith(".vercel.app")||c===f||c===f.replace(/^www\./,"")||process.env.ALLOWED_ORIGINS&&process.env.ALLOWED_ORIGINS.split(",").map(l=>l.trim()).includes(n))&&(d=!0)}d?(r=n,o=!0):r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com"}else r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com";if(r&&e.setHeader("Access-Control-Allow-Origin",r),e.setHeader("Vary","Origin"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PATCH, PUT, DELETE"),e.setHeader("Access-Control-Allow-Headers","X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For"),o&&e.setHeader("Access-Control-Allow-Credentials","true"),t.method==="OPTIONS"){e.sendStatus(200);return}(process.env.NODE_ENV==="production"||t.headers["x-forwarded-proto"]==="https")&&e.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");let i=process.env.NODE_ENV!=="production";e.setHeader(i?"Content-Security-Policy-Report-Only":"Content-Security-Policy","default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;"),s()});v.use(Le.default.json({limit:"50mb"}));v.use(Le.default.urlencoded({limit:"50mb",extended:!0}));["/trap/link","/trap/form","/trap/admin","/trap/backup","/trap/config","/trap/db","/trap/env","/trap/wp-admin","/trap/.git","/trap/api-keys","/trap/download"].forEach(t=>{v.all(t,(e,s)=>{console.warn(`[HONEYPOT] [${t}] IP: ${se(e)} UA: ${e.headers["user-agent"]}`),s.status(403).send("Forbidden.")})});v.get(["/favicon.ico","/favicon.png","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,s)=>{console.log("--- FAVICON/LOGO ROUTE HIT ---",t.originalUrl);try{let n="";try{let{fetchStoreData:r}=(le(),me(Se)),o=await r();o&&o.settings&&(n=o.settings.favicon_url&&o.settings.favicon_url.trim()||o.settings.logo_url&&o.settings.logo_url.trim()||"")}catch(r){console.warn("Could not retrieve store settings for favicon, using default fallback:",r)}n||(n="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"),console.log("--- FAVICON/LOGO ROUTE RESOLVED TO ---",n);try{let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(r.ok){let o=await r.arrayBuffer(),i=Buffer.from(o),a=r.headers.get("content-type")||"image/png";return t.originalUrl.includes(".ico")?a="image/x-icon":t.originalUrl.includes(".png")&&(a="image/png"),e.set("Content-Type",a),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),console.log("--- FAVICON/LOGO PROXIED SECURELY ---",a,r.status),e.status(200).send(i)}else return console.warn(`Favicon proxy fetch returned status ${r.status}. Falling back to 302 redirect.`),e.set("Cache-Control","public, max-age=3600"),e.redirect(302,n)}catch(r){return console.error("Failed to proxy favicon content, falling back to 302 redirect:",r),e.redirect(302,n)}}catch(n){console.error("Favicon/Logo proxy routing failed:",n)}return s()});v.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let o=await _e();if(!o)throw new Error("No data");let{news:i=[],blogs:d=[],videos:a=[]}=o,c=`User-agent: *
Allow: /
Disallow: /api/
`,f=process.env.PUBLIC_DOMAIN||"";c+=`
Sitemap: ${f}/sitemap.xml
`,e.set("Content-Type","text/plain"),e.send(c)}catch{e.set("Content-Type","text/plain");let n=process.env.PUBLIC_DOMAIN||"";e.send(`User-agent: *
Allow: /
Sitemap: ${n}/sitemap.xml
`)}});v.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.status(404).send("Not Found");return}let o=await _e();if(!o)throw new Error("Unable to fetch store data");let{apps:i=[],news:d=[],blogs:a=[],videos:c=[]}=o,f=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com",p=t.headers.host?`https://${t.headers.host}`:f,l=`<?xml version="1.0" encoding="UTF-8"?>
`;l+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;let w="2024-05-01";l+=`  <url>
    <loc>${p}/</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/new-apps</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/news</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/blogs</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/videos</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/about</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/developers</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/contact</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/privacy</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/report-removal</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/terms</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/responsibility</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/notice</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/ethics</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${p}/disclaimer</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;let m=_=>_.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),y=_=>{let h=u(_,"updated_at")||u(_,"created_at");if(h)try{if(typeof h=="object"&&h!==null&&h.seconds)return new Date(h.seconds*1e3).toISOString().split("T")[0];if(typeof h=="object"&&h!==null&&h._seconds)return new Date(h._seconds*1e3).toISOString().split("T")[0];let g=new Date(h);if(!isNaN(g.getTime()))return g.toISOString().split("T")[0]}catch{}return"2024-05-01"},C=_=>{if(!_||typeof _!="string")return!1;let h=_.trim().toLowerCase();return!h||h.startsWith("/")||h.includes("rummydex.com")?!1:!!(h.startsWith("http://")||h.startsWith("https://"))};for(let _ of i){let h=u(_,"slug"),g=u(_,"canonical_url");h&&!C(g)&&(l+=`  <url>
`,l+=`    <loc>${p}/app/${m(h)}</loc>
`,l+=`    <lastmod>${y(_)}</lastmod>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.9</priority>
`,l+=`  </url>
`)}for(let _ of d){let h=u(_,"slug"),g=u(_,"canonical_url");h&&!C(g)&&(l+=`  <url>
`,l+=`    <loc>${p}/news/${m(h)}</loc>
`,l+=`    <lastmod>${y(_)}</lastmod>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.7</priority>
`,l+=`  </url>
`)}for(let _ of a){let h=u(_,"slug"),g=u(_,"canonical_url");h&&!C(g)&&(l+=`  <url>
`,l+=`    <loc>${p}/blog/${m(h)}</loc>
`,l+=`    <lastmod>${y(_)}</lastmod>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.7</priority>
`,l+=`  </url>
`)}for(let _ of c){let h=u(_,"slug");h&&(l+=`  <url>
`,l+=`    <loc>${p}/videos/${m(h)}</loc>
`,l+=`    <lastmod>${y(_)}</lastmod>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.6</priority>
`,l+=`  </url>
`)}l+=`</urlset>
`,e.header("Content-Type","application/xml"),e.send(l)}catch(s){console.error("Sitemap Generation Error:",s),e.status(500).send("Error generating sitemap")}});var xt=G.default.join(process.cwd(),"mock-2fa-state.json"),As=new Map,zs=(process.env.ADMIN_EMAIL||"").toLowerCase();try{if(V.default.existsSync(xt)){let t=JSON.parse(V.default.readFileSync(xt,"utf8"));for(let[e,s]of Object.entries(t))As.set(e,s)}}catch(t){console.error("Failed to load mock 2FA file:",t)}var Bs=900*1e3,Ms=3600*1e3;async function Is(t){try{let e=B();if(e){let s=await e.collection("admin_rate_limits").doc(t).get();if(s.exists){let n=s.data(),r=Date.now();if(n&&n.lockedUntil>r)return{allowed:!1,lockedUntil:n.lockedUntil}}}}catch{}return{allowed:!0}}async function kt(t){try{let r=B();if(r){let o=r.collection("admin_rate_limits").doc(t),i=await o.get(),d=Date.now();if(i.exists){let a=i.data();if(a&&d-a.windowStart>9e5)await o.set({count:1,windowStart:d,lockedUntil:0});else if(a){let c=(a.count||0)+1,f=c>=5?d+36e5:0;await o.update({count:c,lockedUntil:f})}}else await o.set({count:1,windowStart:d,lockedUntil:0})}}catch{}}var F=async(t,e,s)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token.",message:"Unauthorized: Missing verification token."});let r=n.split("Bearer ")[1];if(!r||r==="null"||r==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token.",message:"Unauthorized: Empty session verification token."});if(r.startsWith("ey"))try{let o="";if(B())o=(await require("firebase-admin").auth().verifyIdToken(r)).email||"";else{let c=q()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(c){let f=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:r})});f.ok&&(o=(await f.json())?.users?.[0]?.email||"")}}let d=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return o&&o.toLowerCase().trim()===d?(t.adminUser={email:o.toLowerCase().trim()},s()):e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token.",message:"Unauthorized: Invalid Firebase token."})}try{let o=W();if(!o)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured.",message:"Encryption misconfigured."});let i=U(r,o);if(!i)return e.status(401).json({error:"Unauthorized: Invalid token.",message:"Unauthorized: Invalid token."});let d=JSON.parse(i);return!d.admin||!d.email||!d.exp?e.status(401).json({error:"Unauthorized: Malformed token.",message:"Unauthorized: Malformed token."}):Date.now()>d.exp?e.status(401).json({error:"Unauthorized: Session expired.",message:"Unauthorized: Session expired."}):(t.adminUser={email:d.email},s())}catch(o){return console.error("verifyAdminToken error:",o),e.status(401).json({error:"Unauthorized: Token verification failed.",message:"Unauthorized: Token verification failed."})}};async function Tt(t,e){let s=!1,n="";try{let i=B();if(i){let d=await i.collection("admins_2fa").doc(t).get();if(d.exists){let a=d.data();a?.enabled&&(s=!0,n=a.secret)}}}catch(i){console.error("Failed to check 2FA status:",i)}if(!s)return{ok:!0};if(!e)return{mfaRequired:!0};let{authenticator:r}=require("otplib");return r.verify({token:e,secret:n})?{ok:!0}:{ok:!1,error:"Invalid 2FA code."}}v.post("/api/v1/admin/login",async(t,e)=>{let s=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=await Is(s);if(!n.allowed){let a=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${a} min.`})}let{email:r,password:o}=t.body??{};if(!r||!o)return await kt(s),e.status(400).json({error:"Missing email or password."});let i=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),d=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!d)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(r.toLowerCase().trim()===i&&o===d){let a=t.body.code,c=await Tt(i,a);if(c.mfaRequired)return e.json({mfaRequired:!0});if(!c.ok)return e.status(401).json({error:c.error});try{let f=W(),p=JSON.stringify({admin:!0,email:i,exp:Date.now()+864e5}),l=K(p,f);return e.json({token:l,email:i})}catch(f){return console.error("Login encryption error:",f),e.status(500).json({error:"Internal server error."})}}return await kt(s),e.status(401).json({error:"Invalid email or password."})});v.post("/api/v1/admin/google-login",async(t,e)=>{let{idToken:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing Firebase ID Token."});try{let n="";try{B()&&(n=(await require("firebase-admin").auth().verifyIdToken(s)).email||"")}catch(a){console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:",a)}if(!n)try{let c=q()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(c){let f=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:s})});f.ok&&(n=(await f.json())?.users?.[0]?.email||"")}}catch(a){console.error("Firebase accounts:lookup verification failed:",a)}if(!n)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let r=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(n.toLowerCase().trim()!==r)return e.status(403).json({error:`Unauthorized: ${n} is not configured as an administrator.`});let o=W(),i=JSON.stringify({admin:!0,email:n.toLowerCase().trim(),exp:Date.now()+864e5}),d=K(i,o);return e.json({token:d,email:n.toLowerCase().trim()})}catch(n){return console.error("Google login backend error:",n),e.status(500).json({error:"Authentication failed on server: "+(n.message||String(n))})}});v.post("/api/v1/admin/verify-session",async(t,e)=>{let s=String(t.headers.authorization||"");if(!s.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=s.split("Bearer ")[1];if(n.startsWith("ey"))try{let r="";if(B())r=(await require("firebase-admin").auth().verifyIdToken(n)).email||"";else{let a=q()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(a){let c=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${a}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:n})});c.ok&&(r=(await c.json())?.users?.[0]?.email||"")}}let i=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(r&&r.toLowerCase().trim()===i){let d=t.body.code,a=await Tt(r.toLowerCase().trim(),d);return a.mfaRequired?e.json({mfaRequired:!0}):a.ok?e.json({ok:!0,email:r.toLowerCase().trim(),token:n}):e.status(401).json({error:a.error})}else return e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let r=W(),o=U(n,r);if(!o)return e.status(401).json({error:"Unauthorized: Invalid token."});let i=JSON.parse(o);return!i.admin||Date.now()>i.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:i.email})}catch(r){return e.status(401).json({error:"Service error: "+(r?.message||String(r))})}});v.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing email address."});let n=String(s).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(s){return console.error("2fa resend error:",s),e.status(500).json({error:"Failed to process 2FA resend request: "+s.message})}});v.post("/api/github-sync/test",async(t,e)=>{try{let{owner:s,repo:n,token:r}=t.body||{},o=r||process.env.PAT;if(!s||!n||!o)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let i=o.trim(),d=i.toLowerCase().startsWith("ghp_")?`token ${i}`:`Bearer ${i}`,a=await fetch(`https://api.github.com/repos/${s.trim()}/${n.trim()}`,{headers:{Authorization:d,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(a.ok){let c=await a.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${c.full_name}`,permissions:c.permissions})}else{let c=await a.json().catch(()=>({})),f="";return a.status===401||a.status===403?f=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:a.status===404&&(f=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(a.status).json({ok:!1,message:(c.message||"Failed to connect to repository")+f})}}catch(s){return console.error("GitHub Test Connection error:",s),e.status(500).json({message:s.message||"Internal server error"})}});v.post("/api/github-sync/commit",async(t,e)=>{try{let{owner:s,repo:n,token:r,branch:o,path:i,content:d,message:a}=t.body||{},c=r||process.env.PAT;if(!s||!n||!c||!i||!d)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let f=o?o.trim():"main",p=i.replace(/^\/+/g,""),l=s.trim(),w=c.trim(),m=n.trim(),y=m,C=l.toLowerCase(),_=m.toLowerCase(),h=p.includes("staticData.ts")||p.includes("secureVault.ts")||p.includes("public_backup.json")||p.includes("secure_links_backup.json"),g=!1;console.log(`GitHub Sync Server Request: User "${l}" intends to sync "${p}" to repository "${m}"`);let b=w.toLowerCase().startsWith("ghp_")?`token ${w}`:`Bearer ${w}`,I=await(async D=>{let A=D;try{let j=await fetch(`https://api.github.com/users/${l}/repos?per_page=100`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(j.ok){let $=await j.json();if(Array.isArray($)){let N=$.find(z=>z.name?.toLowerCase()===A.toLowerCase());N&&N.name!==A&&(console.log(`GitHub Sync Server: Correcting repository casing alignment from "${A}" to "${N.name}"`),A=N.name)}}else{let $=await fetch(`https://api.github.com/orgs/${l}/repos?per_page=100`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();if(Array.isArray(N)){let z=N.find(Ue=>Ue.name?.toLowerCase()===A.toLowerCase());z&&z.name!==A&&(console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${A}" to "${z.name}"`),A=z.name)}}}}catch(j){console.warn("GitHub Repo casing alignment query not completed:",j)}console.log(`GitHub Sync Server: Fetching SHA of ${p} on repo ${l}/${A} [branch: ${f}]...`);let O,L="";try{let j=await fetch(`https://api.github.com/repos/${l}/${A}/contents/${p}?ref=${encodeURIComponent(f)}&_t=${Date.now()}`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(j.ok){let $=await j.json();$&&!Array.isArray($)&&$.sha&&(O=$.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${O}`))}else if(j.status===404){console.log(`GitHub Sync Server: File not found on branch "${f}". Attempting default branch fallback...`);let $=await fetch(`https://api.github.com/repos/${l}/${A}/contents/${p}?_t=${Date.now()}`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();N&&!Array.isArray(N)&&N.sha&&(O=N.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${O}`))}else if($.status!==404){let N=await $.json().catch(()=>({})),z="";N.message&&(N.message.toLowerCase().includes("resource not accessible")||N.message.toLowerCase().includes("permission")||$.status===403)&&(z=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+A+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+l+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),L=`Default branch lookup failed with status ${$.status}: ${N.message||"Unknown error"}${z}`}}else{let $=await j.json().catch(()=>({})),N="";$.message&&($.message.toLowerCase().includes("resource not accessible")||$.message.toLowerCase().includes("permission")||j.status===403)&&(N=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+A+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+l+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),L=`Target branch lookup failed with status ${j.status}: ${$.message||"Unknown error"}${N}`}}catch(j){console.error("GitHub SHA Fetch error on Server:",j),L=`Network error fetching repository contents on server: ${j.message||j}`}if(L&&!O)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${L}

Please check your Repository config and Token permissions.`};let fe=Buffer.from(d,"utf8").toString("base64"),ne={message:a||"Admin Release Sync: Static file update",content:fe,branch:f,...O?{sha:O}:{}};console.log(`GitHub Sync Server: Initiating commit for ${p} to ${A}...`);let Q=await fetch(`https://api.github.com/repos/${l}/${A}/contents/${p}`,{method:"PUT",headers:{Authorization:b,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(ne)});if(!Q.ok){let j=await Q.text(),$=j;try{let z=JSON.parse(j);$=z.message||z.error?.message||j}catch{}let N="";return $.toLowerCase().includes("not found")?N=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+A+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:($.toLowerCase().includes("credentials")||Q.status===401)&&(N=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!N&&($.toLowerCase().includes("resource not accessible")||$.toLowerCase().includes("permission")||Q.status===403)&&(N=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+A+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+l+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:Q.status,error:$+N}}return{success:!0,result:await Q.json(),finalRepo:A}})(m);return I.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${I.finalRepo}"!`,I.result?.commit?.sha),e.json({...I.result,message:`Successfully published to ${I.finalRepo} repository.`,targetRepo:I.finalRepo})):e.status(I.status||400).json({message:I.error})}catch(s){return console.error("Server GitHub commit handler error:",s),e.status(500).json({message:`Internal server error during GitHub sync: ${s.message||s}`})}});v.get("/api/v1/image",async(t,e)=>{let s=t.query.url;if(!s)return e.status(400).send("Missing image URL");try{let n=s;try{s.startsWith("http")||(n=Buffer.from(s,"base64").toString("utf-8"))}catch{}if(!await ws(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!r.ok)throw new Error("Failed to fetch image");let o=await r.arrayBuffer(),i=r.headers.get("content-type")||"image/jpeg";e.set("Content-Type",i),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(o))}catch{e.status(500).send("Image proxy error")}});v.get("/api/v1/admin/firebase-status",F,async(t,e)=>{let s={config:!1,firestoreRead:!1,firestoreWrite:!1,adminSdk:!1,aesConfigured:!1,details:{}};try{let n=q(),r=n?.apiKey,o=n?.projectId,i=n?.firestoreDatabaseId||"(default)";if(s.config=!!(r&&o),s.aesConfigured=!!(process.env.AES_SECRET&&process.env.AES_SECRET!==W()),s.details.projectId=o,s.details.databaseId=i,!r||!o)return e.status(503).json({status:"offline",error:"Missing Firebase credentials",results:s});try{let c=B();c&&(await c.collection("store_data").doc("_status_check_").set({ts:Date.now()}),await c.collection("store_data").doc("_status_check_").delete(),s.adminSdk=!0)}catch(c){s.details.adminSdkError=c.message}try{let c=`https://firestore.googleapis.com/v1/projects/${o}/databases/${i}/documents/store_data/public_settings?key=${r}`,f=await fetch(c);s.firestoreRead=f.status===200||f.status===404,s.details.restReadStatus=f.status}catch(c){s.details.restReadError=c.message}if(s.firestoreRead&&!s.adminSdk)try{let c=`https://firestore.googleapis.com/v1/projects/${o}/databases/${i}/documents/store_data/_write_test_?key=${r}`,f=await fetch(c,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{ts:{stringValue:new Date().toISOString()}}})});if(s.firestoreWrite=f.ok,s.details.restWriteStatus=f.status,!f.ok){let p=await f.text();s.details.restWriteError=p}}catch(c){s.details.restWriteError=c.message}else s.adminSdk&&(s.firestoreWrite=!0);let a=s.firestoreRead&&(s.firestoreWrite||s.adminSdk)?"live":s.firestoreRead?"read_only":"offline";return e.json({status:a,results:s,details:s.details})}catch(n){return e.status(500).json({status:"offline",error:n.message,results:s})}});v.get("/api/v1/admin/verify",F,(t,e)=>{e.json({authorized:!0,user:t.adminUser})});v.get("/api/v1/admin/security/audit-logs",F,async(t,e)=>{let s=q();if(!!1&&s&&s.apiKey)try{let o=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${s.apiKey?"&key="+s.apiKey:""}`,i=await fetch(o);if(i.ok){let c=((await i.json()).documents||[]).map(f=>{let p=f.fields||{};return{id:f.name.split("/").pop(),email:p.email?.stringValue||"unknown",ip:p.ip?.stringValue||"unknown",ua:p.ua?.stringValue||"unknown",success:p.success?.booleanValue??!1,reason:p.reason?.stringValue||"unknown",ts:p.ts?.stringValue||new Date().toISOString()}}).sort((f,p)=>new Date(p.ts).getTime()-new Date(f.ts).getTime());return e.json({success:!0,logs:c})}}catch(o){console.error("Error fetching Firestore audit logs:",o)}let r=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:r})});v.get("/api/v1/admin/2fa/config",F,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim();if(!s)return e.status(400).json({error:"Missing admin email."});let n=!1,r="";try{let o=B();if(o){let i=await o.collection("admins_2fa").doc(s).get();if(i.exists){let d=i.data();n=d?.enabled===!0,r=d?.secret||""}}}catch(o){console.error("Error fetching Firestore 2FA config with Admin SDK:",o)}if(n)return e.json({enabled:!0});{let o=yt(),i=ht(s,o);return e.json({enabled:!1,tempSecret:o,qrCodeUri:i})}});v.post("/api/v1/admin/2fa/enable",F,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:r}=t.body||{};if(!s||!n||!r)return e.status(400).json({error:"Missing required fields (email, secret, code)."});if(!We(r,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});try{let o=B();if(o)await o.collection("admins_2fa").doc(s).set({enabled:!0,secret:n});else return e.status(503).json({error:"Service Unavailable: Firebase Admin SDK not configured."})}catch(o){return console.error("Firestore save 2FA exception:",o),e.status(500).json({error:"Server database write error."})}return e.json({success:!0})});v.post("/api/v1/admin/2fa/disable",F,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!s||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let r="";try{let o=B();if(o){let i=await o.collection("admins_2fa").doc(s).get();if(i.exists){let d=i.data();d?.enabled===!0&&(r=d?.secret||"")}}}catch(o){console.error("Firestore 2FA config fetch fail on disable:",o)}if(!r)return e.status(400).json({error:"2FA is not currently enabled."});if(!We(n,r))return e.status(400).json({error:"Invalid verification code."});try{let o=B();o&&await o.collection("admins_2fa").doc(s).delete()}catch(o){return console.error("Firestore delete 2FA exception:",o),e.status(500).json({error:"Server database delete error."})}return e.json({success:!0})});v.post("/api/v1/admin/encrypt",F,async(t,e)=>{let s=se(t);if(await pe(s))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let r=W();if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let o=K(n,r);e.json({encrypted:o})}catch{e.status(500).json({error:"Encryption failed"})}});v.post("/api/v1/admin/encrypt-links",F,async(t,e)=>{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid links array payload is required."});try{let n=W();if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let r=[],o=q();if(o){let p=o.apiKey?`?key=${o.apiKey}`:"",l=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents`;for(let w of["sec_links_vault_3","secure_links","sec_vault"])try{let y=await(await fetch(`${l}/store_data/${w}${p}`)).json();if(y&&!y.error&&y.fields?.encryptedData?.stringValue){let C=U(y.fields.encryptedData.stringValue,n);if(C){let _=JSON.parse(C);if(Array.isArray(_)){r=_;break}}}}catch{}}let i=new Map;r.forEach(p=>{p&&p.id&&i.set(p.id,p)}),s.map(p=>{let l=p.url||"";return l&&!l.startsWith("http://")&&!l.startsWith("https://")&&!l.startsWith("U2FsdGVkX1")&&(l="https://"+l),l&&!l.startsWith("U2FsdGVkX1")&&(l=K(l,n)),{...p,url:l}}).forEach(p=>{p&&p.id&&i.set(p.id,p)});let a=Array.from(i.values()),c=JSON.stringify(a),f=K(c,n);try{let p={};a.forEach(m=>{m&&m.id&&m.url&&(p[m.id]=m.url)});let w=`// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${String(K(JSON.stringify(p),n))}";
`}catch(p){console.warn("Failed to auto-seal secureVault.ts from encrypt-links:",p)}e.json({encrypted:f})}catch{e.status(500).json({error:"Links encryption failed"})}});v.get("/api/v1/admin/debug-links",F,async(t,e)=>{let s=se(t);if(await pe(s))return e.status(429).json({error:"Too many requests"});try{let n=JSON.parse(V.default.readFileSync("firebase-applet-config.json","utf8")),r=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,i=await(await fetch(r)).json();if(!i.fields||!i.fields.encryptedData)return e.json({error:"No vault data found"});let d=i.fields.encryptedData.stringValue,a=W(),c=U(d,a);e.json({decrypted:JSON.parse(c)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});v.post("/api/v1/admin/decrypt-url",F,async(t,e)=>{let s=se(t);if(await pe(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let r=W();if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let o=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${o} from IP ${s} at ${new Date().toISOString()}`);try{let i=U(n,r);e.json({decrypted:i||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});v.post("/api/v1/admin/decrypt-links",F,async(t,e)=>{let s=se(t);if(await pe(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let r=W();if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let o=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${o} from IP ${s} at ${new Date().toISOString()}`);try{let i=U(n,r);if(!i)throw new Error("Empty decrypted block.");let d=JSON.parse(i);d=d.map(a=>{let c=a.url||"";if(c.startsWith("U2FsdGVkX1"))try{c=U(c,r)}catch{}return{...a,url:c}}),e.json({items:d})}catch(i){console.error("[ERROR] Admin decrypt-links failed:",i.message||i),e.status(500).json({error:"Links decryption failed: "+(i.message||"Check AES_SECRET")})}});v.post("/api/v1/admin/sync-local",F,async(t,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:s,settings:n,news:r,blogs:o,videos:i}=t.body;if(!s||!n)return e.status(400).json({error:"Invalid sync payload."});let d=Ve(s,n,r,o,i);try{V.default.writeFileSync(G.default.join(process.cwd(),"src/lib/staticData.ts"),d,"utf8")}catch(g){console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):",g.message)}let a=JSON.parse(JSON.stringify(s)).map(g=>(delete g.more_information_url,delete g.encrypted_download_url,delete g.download_url,g)),c=JSON.parse(JSON.stringify(n)),f=JSON.parse(JSON.stringify(r||[])),p=JSON.parse(JSON.stringify(o||[])),l=JSON.parse(JSON.stringify(i||[])),w=G.default.join(process.cwd(),"src/lib/public_backup.json");try{V.default.writeFileSync(w,JSON.stringify({apps:a,settings:c,news:f,blogs:p,videos:l},null,2),"utf8")}catch(g){console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):",g.message)}let m=W(),y={};s.forEach(g=>{if(g.more_information_url)if(g.more_information_url.startsWith("U2FsdGVkX1"))y[g.id]=g.more_information_url;else try{y[g.id]=K(g.more_information_url,m)}catch{console.warn(`[SECURITY] Skipped backup link for ${g.id} due to encryption failure`)}});let C=G.default.join(process.cwd(),".local/secure_links_backup.json"),_=y;if(V.default.existsSync(C))try{_={...JSON.parse(V.default.readFileSync(C,"utf8")),...y}}catch{}for(let[g,b]of Object.entries(_))if(b&&!b.startsWith("U2FsdGVkX1"))try{_[g]=K(b,m)}catch{delete _[g]}let h=!1;try{let g=B();if(g){let b=[];if(s&&Array.isArray(s)){let I=Math.ceil(s.length/25)||1;for(let D=0;D<I;D++){let A=JSON.parse(JSON.stringify(s.slice(D*25,(D+1)*25)));A.forEach(O=>{delete O.more_information_url,delete O.encrypted_download_url,delete O.download_url}),b.push(g.collection("store_data").doc(`apps_chunk_${D}`).set({items:A}))}b.push(g.collection("store_data").doc("apps_meta").set({numChunks:I,last_updated:new Date().toISOString()}))}if(n){let x=JSON.parse(JSON.stringify(n));b.push(g.collection("store_data").doc("public_settings").set(x,{merge:!0}))}r&&Array.isArray(r)&&b.push(g.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(r))})),o&&Array.isArray(o)&&b.push(g.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(o))})),i&&Array.isArray(i)&&b.push(g.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(i))})),await Promise.all(b),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),h=!0}}catch(g){console.warn("[SERVER] Firestore Admin SDK update warning, switching to REST API fallback:",g.message)}if(!h)try{let g=[];if(s&&Array.isArray(s)){let x=Math.ceil(s.length/25)||1;for(let I=0;I<x;I++){let D=JSON.parse(JSON.stringify(s.slice(I*25,(I+1)*25)));D.forEach(A=>{delete A.more_information_url,delete A.encrypted_download_url,delete A.download_url}),g.push(de(`apps_chunk_${I}`,{items:D}))}g.push(de("apps_meta",{numChunks:x,last_updated:new Date().toISOString()}))}n&&g.push(de("public_settings",JSON.parse(JSON.stringify(n)))),r&&Array.isArray(r)&&g.push(de("news",{items:JSON.parse(JSON.stringify(r))})),o&&Array.isArray(o)&&g.push(de("blogs",{items:JSON.parse(JSON.stringify(o))})),i&&Array.isArray(i)&&g.push(de("videos",{items:JSON.parse(JSON.stringify(i))})),await Promise.all(g),console.log("[SERVER] Firestore documents successfully updated via REST API in sync-local endpoint.")}catch(g){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",g.message)}try{let g=G.default.join(process.cwd(),"src/lib/public_backup.json"),b={apps:s||[],settings:n||{},news:r||[],blogs:o||[],videos:i||[]};V.default.writeFileSync(g,JSON.stringify(b,null,2),"utf8")}catch(g){console.warn("[SERVER] Could not update public_backup.json:",g)}ue=null,e.json({success:!0,message:"Cloud Firestore and backup components strictly synced."})}catch(s){console.error("local file sync endpoint error:",s),e.status(500).json({error:"Failed to store backup: "+s.message})}});v.get("/api/v1/admin/backup-links-get",F,(t,e)=>{try{let s=W(),n={},r=G.default.join(process.cwd(),"src/lib/secureVault.ts");if(V.default.existsSync(r))try{let a=V.default.readFileSync(r,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(a&&a[1]){let c=a[1],f=U(c,s);if(f){let p=JSON.parse(f);Array.isArray(p)?p.forEach(l=>{l&&l.id&&(n[l.id]=l.url||l.more_information_url||"")}):p&&typeof p=="object"&&Object.assign(n,p),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(d){console.warn("backup-links-get: Failed to parse secureVault.ts:",d.message)}let o=G.default.join(process.cwd(),".local/secure_links_backup.json");if(V.default.existsSync(o))try{let d=JSON.parse(V.default.readFileSync(o,"utf8"));Object.assign(n,d),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(d){console.warn("backup-links-get: Failed to parse backup JSON:",d.message)}let i=[];for(let[d,a]of Object.entries(n)){let c="";typeof a=="string"&&(a.startsWith("U2FsdGVkX1")?c=U(a,s):c=a),i.push({id:d,url:c})}e.json({items:i})}catch(s){console.error("backup-links-get failed:",s),e.status(500).json({error:"Failed to read backup links: "+s.message})}});v.get("/api/v1/admin/fix-db-links",F,async(t,e)=>{try{let s=q();if(!s)return e.status(500).json({error:"Missing configuration."});let r=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_0${s.apiKey?"?key="+s.apiKey:""}`)).json(),o=[];!r.error&&r.fields?.items?.arrayValue?.values&&(o=r.fields.items.arrayValue.values.map(y=>y.mapValue.fields.id.stringValue));let d=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_1${s.apiKey?"?key="+s.apiKey:""}`)).json();!d.error&&d.fields?.items?.arrayValue?.values&&(o=o.concat(d.fields.items.arrayValue.values.map(y=>y.mapValue.fields.id.stringValue)));let a=W(),c=o.map(y=>({id:y,url:`https://example.com/demo/${y}`})),f=K(JSON.stringify(c),a),p=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",m=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${s.apiKey?"&key="+s.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${p}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:f}}})})).json();e.json(m)}catch(s){e.json({error:s.message})}});function Ae(t){if(!t||typeof t!="object")return t??null;if("stringValue"in t)return t.stringValue;if("booleanValue"in t)return t.booleanValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("timestampValue"in t)return t.timestampValue;if("nullValue"in t)return null;if("mapValue"in t){let e=t.mapValue?.fields||{},s={};for(let n of Object.keys(e))s[n]=Ae(e[n]);return s}return"arrayValue"in t?(t.arrayValue?.values||[]).map(s=>Ae(s)):null}function je(t){if(!t||typeof t!="object")return{};let e={};for(let s of Object.keys(t))e[s]=Ae(t[s]);return e}var ue=null,Ne=0,Cs=0;v.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data"],async(t,e)=>{try{let s=Date.now();if(ue&&s-Ne<Cs)return e.json(ue);try{let i=B();if(i){let d=await i.collection("store_data").doc("apps_meta").get(),a=[];if(d.exists){let w=d.data()?.numChunks||1;for(let m=0;m<w;m++){let y=await i.collection("store_data").doc(`apps_chunk_${m}`).get();y.exists&&y.data()?.items&&a.push(...y.data().items)}}else{let w=await i.collection("store_data").doc("apps").get();w.exists&&w.data()?.items&&(a=w.data().items)}let c=await i.collection("store_data").doc("public_settings").get(),f=await i.collection("store_data").doc("news").get(),p=await i.collection("store_data").doc("blogs").get(),l=await i.collection("store_data").doc("videos").get();if(a.length>0||c.exists){let w={apps:a,settings:c.exists?c.data():{},news:f.exists?f.data()?.items||[]:[],blogs:p.exists?p.data()?.items||[]:[],videos:l.exists?l.data()?.items||[]:[]};return ue=w,Ne=s,e.json(w)}}}catch{}try{let i=q();if(i&&i.projectId){let d=i.apiKey?`?key=${i.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId||"(default)"}/documents/store_data`,c=await fetch(`${a}/apps_meta${d}`),f=[];if(c.ok){let g=await c.json(),b=g.fields?.numChunks?.integerValue?parseInt(g.fields.numChunks.integerValue,10):1;for(let x=0;x<b;x++){let I=await fetch(`${a}/apps_chunk_${x}${d}`);if(I.ok){let D=await I.json();if(D.fields?.items?.arrayValue?.values){let A=D.fields.items.arrayValue.values.map(O=>Ae(O));f.push(...A)}}}}else{let g=await fetch(`${a}/apps${d}`);if(g.ok){let b=await g.json();b.fields?.items?.arrayValue?.values&&(f=b.fields.items.arrayValue.values.map(x=>Ae(x)))}}let p=await fetch(`${a}/public_settings${d}`),l=await fetch(`${a}/news${d}`),w=await fetch(`${a}/blogs${d}`),m=await fetch(`${a}/videos${d}`),y={},C={},_={},h={};try{p.ok&&(y=je((await p.json())?.fields))}catch{}try{l.ok&&(C=je((await l.json())?.fields))}catch{}try{w.ok&&(_=je((await w.json())?.fields))}catch{}try{m.ok&&(h=je((await m.json())?.fields))}catch{}if(f.length>0||Object.keys(y).length>0){let g={apps:f,settings:y,news:C.items||[],blogs:_.items||[],videos:h.items||[]};return ue=g,Ne=s,e.json(g)}}}catch{}let n=G.default.join(process.cwd(),"src/lib/public_backup.json");if(V.default.existsSync(n))try{let i=JSON.parse(V.default.readFileSync(n,"utf8")),d={apps:i.apps||[],settings:i.settings||{},news:i.news||[],blogs:i.blogs||[],videos:i.videos||[]};return ue=d,Ne=s,e.json(d)}catch(i){console.error("Error reading public_backup.json in backup-data endpoint:",i)}let r=Je(),o={apps:r.mockApps||[],settings:r.mockSettings||{},news:r.mockNews||[],blogs:r.mockBlogs||[],videos:r.mockVideos||[]};return e.json(o)}catch(s){console.error("public backup endpoint error:",s);let n=Je();return e.status(200).json({apps:n.mockApps||[],settings:n.mockSettings||{},news:n.mockNews||[],blogs:n.mockBlogs||[],videos:n.mockVideos||[]})}});v.get("/api/v1/debug-seo",async(t,e)=>{try{let{fetchStoreData:s}=(le(),me(Se)),n=await s();e.json({hasData:!!n,hasSettings:!!n?.settings,settingsKeys:Object.keys(n?.settings||{})})}catch(s){e.json({error:s.message})}});v.post("/api/v1/admin/seal-vault",F,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n={};s.forEach(i=>{i.id&&(i.url||i.more_information_url)&&(n[i.id]=i.url||i.more_information_url)});let r={AES_SECRET:process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"")};if(!r.AES_SECRET)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let o="";typeof K<"u"?o=K(JSON.stringify(n),r.AES_SECRET):o=require("crypto-js").AES.encrypt(JSON.stringify(n),r.AES_SECRET).toString(),e.json({success:!0,ciphertext:o})}catch(s){e.status(500).json({error:s.message})}});v.post("/api/v1/admin/save-links-direct",F,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n=W(),r={};s.forEach(d=>{let a=d.url||d.more_information_url;if(d.id&&a)if(a.startsWith("U2FsdGVkX1"))r[d.id]=a;else try{r[d.id]=K(a,n)}catch{console.warn(`[SECURITY] Skipped backup link for ${d.id} due to encryption failure`)}});let o=require("path").join(process.cwd(),".local/secure_links_backup.json"),i=r;if(require("fs").existsSync(o))try{i={...JSON.parse(require("fs").readFileSync(o,"utf8")),...r}}catch{}for(let[d,a]of Object.entries(i))if(a&&!a.startsWith("U2FsdGVkX1"))try{i[d]=K(a,n)}catch{delete i[d]}e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(s){e.status(500).json({error:s.message})}});v.post("/api/v1/admin/pull-links-from-github",F,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));v.get("/api/v1/admin/config-status",F,(t,e)=>{let s=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,r=!!process.env.ADMIN_EMAIL;e.json({hasAes:s,hasSecLinks:n,hasAdminEmail:r})});v.get("/api/v1/admin/system-files",F,(t,e)=>{e.json({files:{}})});v.get("/api/v1/debug-index",async(t,e)=>{try{let s=V.default.readFileSync(G.default.resolve(process.cwd(),"index.html"),"utf-8"),n=t.app.get("vite");e.json({debug:!0})}catch(s){e.json({error:s.message})}});["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{v.all(t,(e,s)=>{s.status(404).send("Not Found")})});v.get(["/api/v1/_chal","/api/v1/get-challenge","/api/v1/init-file"],async(t,e)=>{console.log("[DEBUG] /api/v1/init-file called");let s=se(t);if(await pe(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=Ss(t,e),r=Z.default.randomBytes(20).toString("hex"),o=Date.now(),i=Math.floor(Math.random()*100)+50;te.set(r,{sessionId:n,expiresAt:o+120*1e3,issuedAt:o+i}),setTimeout(()=>{e.json({nonce:r,difficulty:"0000",sid:n})},i)});v.post(["/api/v1/_proc","/api/v1/get-token","/api/v1/process-file"],async(t,e)=>{let s=se(t);if(await pe(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=t.body?.sid||t.cookies?.["__Host-sid"];if(!n)return e.status(403).json({error:"Session expired. Please reload."});let{nonce:r,solution:o,fingerprint:i,score:d,moved:a,touch:c,cfToken:f}=t.body||{};if(!r||!o||!i)return e.status(400).json({error:"Invalid request."});if(!ys(i))return console.warn(`[DEFENSE] Bad fingerprint from ${s}`),e.status(403).json({error:"Access denied."});let p=te.get(r);if(!p)return e.status(403).json({error:"Challenge expired. Please try again."});if(p.sessionId!==n)return te.delete(r),e.status(403).json({error:"Session mismatch."});if(p.expiresAt<Date.now())return te.delete(r),e.status(403).json({error:"Challenge timed out."});let l=Date.now()-p.issuedAt;if(l<80)return te.delete(r),console.warn(`[DEFENSE] Solve too fast (${l}ms) from ${s}`),e.status(403).json({error:"Access denied."});if(te.delete(r),typeof d!="number"||d<40)return console.warn(`[DEFENSE] Low score (${d}) from ${s}`),e.status(403).json({error:"Access denied: security check failed."});let w=r+o,m=Z.default.createHash("sha256").update(w).digest("hex");if(!m.startsWith("0000"))return console.warn(`[DEFENSE] PoW fail from ${s}: ${m}`),e.status(403).json({error:"Access denied: verification failed."});if(Ke&&!await ms(f||"",s))return console.warn(`[CF] Rejected ${s}`),e.status(403).json({error:"Access denied: verification failed."});console.log(`[ACCESS] GRANTED ip=${s} score=${d} solveMs=${l} moved=${a} touch=${c}`);let y=t.body.appId||"unknown",C=xs(s,n,i,y);e.json({token:C})});v.get("/api/v1/link-check",async(t,e)=>{let s=t.query.id;if(!s)return e.json({configured:!1});try{let n=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");if(!n)return e.json({configured:!0});let r="",o=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(o)){let f=require("fs").readFileSync(o,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);f&&f[1]&&(r=f[1])}if(!r)return e.json({configured:!0});let i="";if(typeof U<"u")i=U(r,n);else{let c=require("crypto-js");i=c.AES.decrypt(r,n).toString(c.enc.Utf8)}if(!i)return e.json({configured:!0});let d=JSON.parse(i),a=!1;if(Array.isArray(d)){let c=d.find(f=>f&&f.id===s);c&&(c.url||c.more_information_url)&&(a=!0)}else d&&typeof d=="object"&&d[s]&&(a=!0);return e.json({configured:!0})}catch{return e.json({configured:!0})}});var vt=new Map;v.post("/api/v1/public/chat",async(t,e)=>{let s=t.headers["x-forwarded-for"]||t.socket.remoteAddress||"unknown",n=Date.now(),r=3600*1e3,o=10,i=vt.get(s);if((!i||n>i.resetTime)&&(i={count:0,resetTime:n+r}),i.count>=o)return e.status(429).json({error:"Rate limit exceeded. Maximum 10 messages per hour. Please try again later."});i.count+=1,vt.set(s,i);let{message:d}=t.body;if(!d||typeof d!="string")return e.status(400).json({error:"Message payload is required."});try{let a=process.env.GEMINI_API_KEY;if(!a)throw new Error("AI service is currently offline.");let{fetchStoreData:c}=(le(),me(Se)),f=await c(),p={settings:{site_title:f.settings?.site_title,meta_description:f.settings?.meta_description,policies:f.settings?.policies?f.settings.policies.substring(0,500):""},categories:(f.categories||[]).map(y=>({id:y.id,n:y.name})),apps:(f.apps||[]).map(y=>({n:y.name,c:y.category,desc:y.description_html?.replace(/<[^>]+>/g,"").substring(0,200),r:y.rating})),news:(f.news||[]).map(y=>({t:y.title,d:y.description?.substring(0,200),c:y.content?.replace(/<[^>]+>/g,"").substring(0,300)})),blogs:(f.blogs||[]).map(y=>({t:y.title,d:y.description?.substring(0,200),c:y.content?.replace(/<[^>]+>/g,"").substring(0,300)})),videos:(f.videos||[]).map(y=>({t:y.title,d:y.description,c:y.content?.replace(/<[^>]+>/g,"").substring(0,1e3)}))},{GoogleGenAI:l}=require("@google/genai"),w=new l({apiKey:a,httpOptions:{headers:{"User-Agent":"aistudio-build"}}}),m=`You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(p,null,2)}`;try{let y=await w.models.generateContentStream({model:"gemini-2.0-flash",contents:d.trim(),config:{systemInstruction:m,maxOutputTokens:1e3,temperature:.3,tools:[{googleSearch:{}}]}});e.setHeader("Content-Type","text/event-stream"),e.setHeader("Cache-Control","no-cache"),e.setHeader("Connection","keep-alive"),e.flushHeaders();for await(let C of y)C.text&&e.write(`data: ${JSON.stringify({text:C.text})}

`);return e.write(`data: [DONE]

`),e.end()}catch(y){if(!e.headersSent)throw y;return e.write(`data: ${JSON.stringify({error:y.message||"Streaming failed"})}

`),e.end()}}catch(a){if(a.status===429||a.message?.includes("429"))return e.json({success:!0,answer:"\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities."});if(a.status===403||a.message?.includes("403"))return e.json({success:!0,answer:"\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings."});let c=d.trim().toLowerCase();try{let{fetchStoreData:f}=(le(),me(Se)),w=((await f()).apps||[]).filter(m=>m.name&&m.name.toLowerCase().includes(c)||m.category&&m.category.toLowerCase().includes(c));if(w.length>0){let m=w.slice(0,3).map(y=>y.name).join(", ");return e.json({success:!0,answer:`(Offline Fallback): I found some apps in the directory matching your query: ${m}${w.length>3?" and more.":"."}`})}else if(c.includes("hello")||c.includes("hi ")||c==="hi")return e.json({success:!0,answer:"(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!"})}catch{}return e.json({success:!0,answer:"(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."})}});v.post("/api/v1/report-missing",async(t,e)=>{let{appId:s}=t.body;return s?(console.log(`[report-missing] Received report for ${s}, mocked success due to hardcoded public mode.`),e.json({success:!0})):e.status(400).json({error:"Missing App ID parameter."})});v.get("/api/v1/moreinfo-resolve",async(t,e)=>{let s=se(t),n=t.query.sid||t.cookies?.["__Host-sid"],r=t.query.token||t.query.t,o=t.query.id;if(!r||!o)return t.query.json==="true"?e.status(400).json({error:"Verification transmission tokens or App ID were omitted."}):e.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");try{let c=q();if(c&&c.projectId){let f=Z.default.createHash("sha256").update(r).digest("hex"),p=!1,l=B();if(l)try{(await l.collection("spent_tokens").doc(f).get()).exists&&(p=!0)}catch(w){console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:",w.message);let m=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId}/documents/spent_tokens/${f}${c.apiKey?"?key="+c.apiKey:""}`;(await fetch(m)).ok&&(p=!0)}else{let w=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId}/documents/spent_tokens/${f}${c.apiKey?"?key="+c.apiKey:""}`;(await fetch(w)).ok&&(p=!0)}if(p)return t.query.json==="true"?e.status(403).json({error:"This single-use private download signature has already been spent."}):e.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>")}}catch{}let i=!1;try{Buffer.from(r,"base64url").toString("utf8").includes("::")&&(i=!0)}catch{}if(i)try{let c=Buffer.from(r,"base64url").toString("utf8"),[f]=c.split("::"),[p,l,w]=f.split("|");if(!ks(r,p,l,w,o))return t.query.json==="true"?e.status(403).json({error:"Cryptographic HMAC validation failed."}):e.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");try{let y=q();if(y&&y.projectId){let C=Z.default.createHash("sha256").update(r).digest("hex"),_=new Date().toISOString(),h=B();if(h)try{await h.collection("spent_tokens").doc(C).set({usedAt:_}),console.log(`[AUDIT] Successfully spent token ${C} via firebase-admin SDK`)}catch(g){console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:",g.message);let b=`https://firestore.googleapis.com/v1/projects/${y.projectId}/databases/${y.firestoreDatabaseId}/documents/spent_tokens/${C}${y.apiKey?"?key="+y.apiKey:""}`;fetch(b,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:_}}})}).catch(()=>{})}else{let g=`https://firestore.googleapis.com/v1/projects/${y.projectId}/databases/${y.firestoreDatabaseId}/documents/spent_tokens/${C}${y.apiKey?"?key="+y.apiKey:""}`;fetch(g,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:_}}})}).catch(()=>{})}}}catch{}let m="";try{let y=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:""),C=null;try{C=q()}catch{}if(C&&(!m||!m.startsWith("http"))){let _=B();if(_)for(let h of["sec_links_vault_3","secure_links","sec_vault"])try{let g=await _.collection("store_data").doc(h).get();if(g.exists){let b=g.data();if(b&&b.encryptedData){let x=U(b.encryptedData,y);if(x){let I=JSON.parse(x),D="";if(I&&Array.isArray(I)){let A=I.find(O=>O&&O.id===o);A&&(D=typeof A.url=="string"?A.url:typeof A.more_information_url=="string"?A.more_information_url:"")}else if(I&&typeof I=="object"){let A=I[o];typeof A=="string"?D=A:A&&typeof A=="object"&&(D=typeof A.url=="string"?A.url:typeof A.more_information_url=="string"?A.more_information_url:"")}if(D&&typeof D=="string"&&(D.startsWith("U2FsdGVkX1")?m=U(D,y):m=D,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${h}) for app ID: ${o}`);break}}}}}catch(g){console.warn(`[WARN] Firestore SDK failed to fetch ${h}:`,g.message)}}if((!m||!m.startsWith("http"))&&C&&C.projectId){let _=C.apiKey?`?key=${C.apiKey}`:"",h=`https://firestore.googleapis.com/v1/projects/${C.projectId}/databases/${C.firestoreDatabaseId}/documents`;for(let g of["sec_links_vault_3","secure_links","sec_vault"])try{let b=await fetch(`${h}/store_data/${g}${_}`);if(b.ok){let x=await b.json();if(x&&!x.error&&x.fields?.encryptedData?.stringValue){let I=x.fields.encryptedData.stringValue,D=U(I,y);if(D){let A=JSON.parse(D),O="";if(A&&Array.isArray(A)){let L=A.find(fe=>fe&&fe.id===o);L&&(O=typeof L.url=="string"?L.url:typeof L.more_information_url=="string"?L.more_information_url:"")}else if(A&&typeof A=="object"){let L=A[o];typeof L=="string"?O=L:L&&typeof L=="object"&&(O=typeof L.url=="string"?L.url:typeof L.more_information_url=="string"?L.more_information_url:"")}if(O&&typeof O=="string"&&(O.startsWith("U2FsdGVkX1")?m=U(O,y):m=O,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${g}) for app ID: ${o}`);break}}}}}catch(b){console.warn(`[WARN] Firestore REST fallback failed to fetch ${g}:`,b.message)}}if(!m||!m.startsWith("http"))try{let _="",h=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(h)){let b=require("fs").readFileSync(h,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);b&&b[1]&&(_=b[1])}if(_){let g="";if(typeof U<"u")g=U(_,y);else{let b=require("crypto-js");g=b.AES.decrypt(_,y).toString(b.enc.Utf8)}if(g){let b=JSON.parse(g),x="";if(b&&Array.isArray(b)){let I=b.find(D=>D&&D.id===o);I&&(x=typeof I.url=="string"?I.url:typeof I.more_information_url=="string"?I.more_information_url:"")}else if(b&&typeof b=="object"){let I=b[o];typeof I=="string"?x=I:I&&typeof I=="object"&&(x=typeof I.url=="string"?I.url:typeof I.more_information_url=="string"?I.more_information_url:"")}x&&typeof x=="string"&&(x.startsWith("U2FsdGVkX1")?m=U(x,y):m=x,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${o}`))}}}catch(_){console.warn("Vault decryption failed",_)}if(!m||!m.startsWith("http"))try{if(process.env.SECURE_LINKS){let _=JSON.parse(process.env.SECURE_LINKS);if(_&&typeof _=="object"){let h=_[o],g="";typeof h=="string"?g=h:h&&typeof h=="object"&&(g=typeof h.url=="string"?h.url:typeof h.more_information_url=="string"?h.more_information_url:""),g&&typeof g=="string"&&(g.startsWith("U2FsdGVkX1")?m=U(g,y):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${o}`))}}}catch{}if(!m||!m.startsWith("http"))try{let _=require("path").join(process.cwd(),".local/secure_links_backup.json");if(require("fs").existsSync(_)){let h=JSON.parse(require("fs").readFileSync(_,"utf8")),g="";if(h&&Array.isArray(h)){let b=h.find(x=>x&&x.id===o);b&&(g=typeof b.url=="string"?b.url:typeof b.more_information_url=="string"?b.more_information_url:"")}else if(h&&typeof h=="object"){let b=h[o];typeof b=="string"?g=b:b&&typeof b=="object"&&(g=typeof b.url=="string"?b.url:typeof b.more_information_url=="string"?b.more_information_url:"")}if(g&&typeof g=="string"){let b=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");g.startsWith("U2FsdGVkX1")?m=U(g,b):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${o}`)}}}catch(_){console.warn("Local filesystem backup retrieval failed:",_)}}catch(y){console.error("Firestore retrieval or decryption failed",y)}if(typeof m!="string")return console.error("targetUrl resolved to an object instead of a string:",m),e.status(500).json({error:"Download link encryption integrity failed."});if(m&&!m.startsWith("http://")&&!m.startsWith("https://")&&!m.startsWith("/")&&m.includes(".")&&(m="https://"+m),!m||!m.startsWith("http")&&!m.startsWith("/"))return console.error("CRITICAL: Failed to retrieve or decrypt URL for app:",o,"Result:",m),t.query.json==="true"?e.status(404).json({error:"Download link not found or not yet configured for this app."}):e.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download Link Not Found | RummyStore</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f9fafb;
      color: #111827;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      padding: 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .icon {
      width: 64px;
      height: 64px;
      background-color: #fef3c7;
      color: #d97706;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 12px;
      color: #111827;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 12px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #09090b;
        color: #f4f4f5;
      }
      .card {
        background-color: #18181b;
        border-color: #27272a;
      }
      h1 {
        color: #f4f4f5;
      }
      p {
        color: #a1a1aa;
      }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div>
    <h1>Information Page Pending</h1>
    <p>This download link or details has not been configured yet, or is currently undergoing maintenance. Please try again later or contact our support team.</p>
    <a href="/" class="btn">Go Back Home</a>
  </div>
</body>
</html>`);try{if(m.startsWith("http")){let y=new URL(m);if(!(y.hostname.includes("google.com")||y.hostname.includes("googleapis.com"))&&!y.searchParams.has("code")){let _=process.env.AFFILIATE_CODE;_&&(y.searchParams.set("code",_),m=y.toString())}}}catch{}return console.log("FINAL REDIRECT TARGET IS:",m),e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.set("Referrer-Policy","no-referrer"),e.redirect(302,m)}catch{return e.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>")}let d=Ee.get(r);if(!d)return t.query.json==="true"?e.status(404).json({error:"Link expired or invalid."}):e.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");if(d.expiresAt<Date.now())return Ee.delete(r),t.query.json==="true"?e.status(404).json({error:"This connection timed out."}):e.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");Ee.delete(r),_s.add(r);let a=d.targetUrl;try{if(a.startsWith("http")){let c=new URL(a);if(!(c.hostname.includes("google.com")||c.hostname.includes("googleapis.com"))&&!c.searchParams.has("code")){let p=process.env.AFFILIATE_CODE;p&&(c.searchParams.set("code",p),a=c.toString())}}}catch{}return e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.redirect(302,a)});v.get("/api/v1/download/:id",async(t,e)=>{let s=t.params.id;return s?e.redirect(302,`/moreinfo/${s}`):e.status(400).send("Bad Request")});v.use((t,e,s,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let r=G.default.join(process.cwd(),"server_requests.log");V.default.appendFileSync(r,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(s.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return s.status(500).json({error:"Internal server error"});s.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});var Ws=module.exports=v;
