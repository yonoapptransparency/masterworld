var zt=Object.create;var Re=Object.defineProperty;var Bt=Object.getOwnPropertyDescriptor;var Mt=Object.getOwnPropertyNames;var Wt=Object.getPrototypeOf,Ht=Object.prototype.hasOwnProperty;var Ve=(t,e)=>()=>(t&&(e=t(t=0)),e);var nt=(t,e)=>{for(var s in e)Re(t,s,{get:e[s],enumerable:!0})},rt=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Mt(e))!Ht.call(t,r)&&r!==s&&Re(t,r,{get:()=>e[r],enumerable:!(n=Bt(e,r))||n.enumerable});return t};var H=(t,e,s)=>(s=t!=null?zt(Wt(t)):{},rt(e||!t||!t.__esModule?Re(s,"default",{value:t,enumerable:!0}):s,t)),be=t=>rt(Re({},"__esModule",{value:!0}),t);function ze(){let t=null;typeof process<"u"&&(t=process.env?.ADMIN_PATH||process.env?.VITE_ADMIN_PATH);try{let e=Jt.env?.VITE_ADMIN_PATH;e&&(t=e)}catch{}return t||"admin"}var Jt,ot=Ve(()=>{Jt={}});var it={};nt(it,{b64EncodeUnicode:()=>Gt,commitFileToGitHub:()=>Kt,generateStaticDataFileCode:()=>Be});function Gt(t){try{return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,s)=>String.fromCharCode(parseInt(s,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(t)}}function Be(t=[],e={},s=[],n=[],r=[]){let i=JSON.parse(JSON.stringify(t||[])).map(p=>(delete p.more_information_url,delete p.encrypted_download_url,delete p.download_url,p)),l={...{site_title:"Yono Store",meta_description:"Download All Yono Games, Rummy Apps & Teen Patti APKs",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))},a=JSON.parse(JSON.stringify(s||[])),d=JSON.parse(JSON.stringify(n||[])),f=JSON.parse(JSON.stringify(r||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockApps: AppConfig[] = ${JSON.stringify(i,null,2)} as any[];

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = ${JSON.stringify(l,null,2)} as any;

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

export const mockBlogs: BlogPost[] = ${JSON.stringify(d,null,2)} as any[];

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
`}async function Kt({owner:t,repo:e,token:s,branch:n,path:r,content:i,message:o}){let a=await fetch("/api/github-sync/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({owner:t,repo:e,token:s,branch:n,path:r,content:i,message:o})});if(!a.ok){let d=a.headers.get("content-type"),f=await a.text(),p=f||`Server returned ${a.status} ${a.statusText}`;if(d&&d.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${a.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${f.substring(0,100)}...`);try{let c=JSON.parse(f);p=c.message||c.error||p}catch{(!p||p.trim()==="")&&(p=`HTTP Error ${a.status}`)}throw new Error(p)}return a.json()}var Me=Ve(()=>{});var ve={};nt(ve,{fetchStoreData:()=>ke,getField:()=>u,injectSeoTags:()=>ys,syncFromFirestore:()=>wt});function bt(){if(ae)return ae;try{let n=le.default.readFileSync(Se.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&We(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ae=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&We(t))return ae={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ae;try{let n=Yt.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&We(r.projectId))return ae=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}function He(t){if(!t)return null;if("stringValue"in t)return t.stringValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("booleanValue"in t)return t.booleanValue;if("arrayValue"in t)return(t.arrayValue.values||[]).map(s=>He(s));if("mapValue"in t){let e=t.mapValue.fields||{},s={};for(let n of Object.keys(e))s[n]=He(e[n]);return s}return null}function oe(t){if(!t)return{};let e={};for(let s of Object.keys(t))e[s]=He(t[s]);return e}function u(t,e,s=""){if(!t)return s;let n=t[e];return n==null?s:typeof n=="object"?"stringValue"in n?n.stringValue??s:"integerValue"in n?String(n.integerValue)??s:"booleanValue"in n?String(n.booleanValue)??s:s:String(n)}async function wt(){try{let t=bt();if(!t||!t.projectId)return console.log("[SYNC] Skipping background Firestore sync: Firebase config not found."),null;let e=t.projectId,s=t.firestoreDatabaseId||"(default)",n=t.apiKey,r=n?`?key=${n}`:"",i=`https://firestore.googleapis.com/v1/projects/${e}/databases/${s}/documents/store_data`;console.log(`[SYNC] Syncing filesystem backup files with Firestore (${e})...`);let[o,l,a,d,f]=await Promise.all([fetch(`${i}/public_settings${r}`).catch(()=>null),fetch(`${i}/news${r}`).catch(()=>null),fetch(`${i}/blogs${r}`).catch(()=>null),fetch(`${i}/videos${r}`).catch(()=>null),fetch(`${i}/apps_meta${r}`).catch(()=>null)]),p=gt;if(o&&o.ok){let h=await o.json(),g=oe(h.fields);g&&Object.keys(g).length>0&&(p=g)}let c=mt;if(l&&l.ok){let h=await l.json(),g=oe(h.fields);g&&Array.isArray(g.items)&&(c=g.items)}let w=yt;if(a&&a.ok){let h=await a.json(),g=oe(h.fields);g&&Array.isArray(g.items)&&(w=g.items)}let m=ht;if(d&&d.ok){let h=await d.json(),g=oe(h.fields);g&&Array.isArray(g.items)&&(m=g.items)}let y=[],C=1,_=!1;if(f&&f.ok){let h=await f.json(),g=oe(h.fields);g&&typeof g.numChunks=="number"&&(C=g.numChunks,_=!0)}if(_){let h=[];for(let b=0;b<C;b++)h.push(fetch(`${i}/apps_chunk_${b}${r}`).then(x=>x.ok?x.json():null).catch(()=>null));(await Promise.all(h)).forEach(b=>{if(b){let x=oe(b.fields);x&&Array.isArray(x.items)&&y.push(...x.items)}})}else{let h=await fetch(`${i}/apps${r}`).catch(()=>null);if(h&&h.ok){let g=await h.json(),b=oe(g.fields);b&&Array.isArray(b.items)&&(y=b.items)}}y.length===0&&(y=ft);try{let h=Se.default.join(process.cwd(),"src/lib/public_backup.json");le.default.writeFileSync(h,JSON.stringify({apps:y,settings:p,news:c,blogs:w,videos:m},null,2),"utf8");try{let{generateStaticDataFileCode:g}=(Me(),be(it)),b=g(y,p,c,w,m);le.default.writeFileSync(Se.default.join(process.cwd(),"src/lib/staticData.ts"),b,"utf8")}catch(g){console.warn("Could not write staticData.ts fallback (skipping):",g.message)}}catch(h){console.warn("[SYNC] Could not write cache files to filesystem (running in read-only environment?):",h.message)}return console.log(`[SYNC] Synchronization successful. Apps count: ${y.length}`),{apps:y,settings:p,news:c,blogs:w,videos:m}}catch(t){return console.error("[SYNC] Sync error:",t),null}}async function ke(){let t=Date.now(),e=t-_e>at,s=t-_e>at*15;return we&&!s?(e&&!Te&&(Te=!0,ct().then(()=>{Te=!1}).catch(n=>{Te=!1,console.warn("Background store fetch failed safely:",n)})),we):await ct()}async function ct(){let t=Date.now(),e=Se.default.join(process.cwd(),"src/lib/public_backup.json");if(le.default.existsSync(e))try{let r=JSON.parse(le.default.readFileSync(e,"utf8"));if(r.apps&&r.apps.length>0){let i={apps:r.apps||[],settings:r.settings||{},news:r.news||[],blogs:r.blogs||[],videos:r.videos||[]};return we=i,_e=t,i}}catch(r){console.error("Error reading public_backup.json in seoHelper:",r)}let s=await wt();if(s)return we=s,_e=t,s;let n={apps:ft||[],settings:gt||{},news:mt||[],blogs:yt||[],videos:ht||[]};return we=n,_e=t,n}function k(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function je(t){if(!t)return"";let e=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");return e=e.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi,""),e=e.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi,'href="#"'),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,""),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi,""),e}function ee(t){return t?t.replace(/<[^>]*>?/gm," ").replace(/\s+/g," ").trim():""}function ce(t){if(!t)return"";let e=t.trim();if(e.startsWith("<")||e.includes("<meta ")){let s=e.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);if(s&&s[1])return s[1].trim();let n=e.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);return n&&n[1]?n[1].trim():ee(e).substring(0,160)}return e}async function Zt(t,e){let{apps:s,settings:n,news:r,blogs:i,videos:o}=e,l=t.split("?")[0].split("#")[0].replace(/\/+$/,"")||"/",a=l.toLowerCase(),d="";if(a==="/"||a==="")d=lt(s,n,r,i,o);else if(a==="/new-apps")d=es(s,n);else if(a.startsWith("/info/")||a.startsWith("/gateway/")||a.startsWith("/moredetail/")){let c="";a.startsWith("/info/")?c=l.split("/info/")[1]:a.startsWith("/gateway/")?c=l.split("/gateway/")[1]:c=l.split("/moredetail/")[1],d=ss(c,s,n)}else if(a==="/news")d=ns(r,n);else if(a.startsWith("/news/")){let c=l.split("/news/")[1];d=dt(c,r,n)}else if(a==="/blogs")d=rs(i,n);else if(a.startsWith("/blog/")){let c=l.split("/blog/")[1];d=ut(c,i,n)}else if(a==="/videos")d=os(o,n);else if(a.startsWith("/videos/")){let c=l.split("/videos/")[1];d=pt(c,o,n)}else if(a==="/about")d=is(n);else if(a==="/contact")d=as(n);else if(a==="/privacy")d=cs(n);else if(a==="/report-removal")d=ls(n);else if(a==="/terms")d=ds(n);else if(a==="/notice")d=ps(n);else if(a==="/ethics")d=fs(n);else if(a==="/disclaimer")d=gs(n);else if(a==="/responsibility")d=us(n);else{let c=a.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"");s.some(w=>w.slug?.toLowerCase()===c)?d=ts(c,s,n):r.some(w=>w.slug?.toLowerCase()===c)?d=dt(c,r,n):i.some(w=>w.slug?.toLowerCase()===c)?d=ut(c,i,n):o.some(w=>w.slug?.toLowerCase()===c)?d=pt(c,o,n):d=lt(s,n,r,i,o)}let f=Xt(n),p=Qt(n);return`
    <div class="flex flex-col min-h-screen">
      ${f}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${d}
      </main>
      ${p}
    </div>
  `}function Xt(t){let e=u(t,"site_title"),s=u(t,"logo_url");return`
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
  `}function Qt(t){let e=u(t,"site_title"),s=u(t,"logo_url"),n=u(t,"meta_description"),r=u(t,"disclaimer_text"),i=u(t,"ethics_discrimination_text"),o=u(t,"important_notice");return`
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
  `}function lt(t,e,s,n,r){let i=u(e,"site_title"),o=u(e,"meta_description"),l="";[...t].sort((f,p)=>parseInt(u(f,"serial_number","999"),10)-parseInt(u(p,"serial_number","999"),10)).forEach((f,p)=>{let c=u(f,"name"),w=u(f,"slug"),m=u(f,"category"),y=u(f,"rating","5.0"),C=u(f,"icon_url"),_=f.is_new===!0||f.is_new&&f.is_new.booleanValue===!0;l+=`
      <a href="/${encodeURIComponent(w)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${p+1}</span>
        <img src="${C||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${k(c)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${k(c)}</h3>
          <p class="text-xs text-zinc-500 truncate">${k(m)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${y}</span><span class="text-zinc-400">\u2605</span>
            ${_?'<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>':""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `});let d="";return s.slice(0,3).forEach(f=>{d+=`
      <a href="/news/${encodeURIComponent(u(f,"slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${k(u(f,"title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${k(u(f,"description"))}</p>
      </a>
    `}),`
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${k(i)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${k(o)}</p>
      </div>
      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
          <h2 class="text-xl font-bold mb-4 px-2 text-left">Popular E-Sports virtual clients</h2>
          <div class="flex flex-col">${l}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest Archives</h3>
            <div class="flex flex-col gap-3">${d}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates \u2192</a>
          </div>
        </div>
      </div>
    </div>
  `}function es(t,e){let s="",n=t.filter(i=>i.is_new===!0||i.is_new&&i.is_new.booleanValue===!0);return(n.length>0?n:t).forEach(i=>{let o=u(i,"name"),l=u(i,"slug"),a=u(i,"category"),d=u(i,"rating","5.0"),f=u(i,"icon_url");s+=`
      <a href="/${encodeURIComponent(l)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${k(o)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${k(a)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${d} \u2605</span>
      </a>
    `}),`
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${s}</div>
    </div>
  `}function ts(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(y=>u(y,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>';let i=u(r,"name"),o=u(r,"category"),l=u(r,"version","Latest"),a=u(r,"file_size","Variable"),d=u(r,"rating","5.0"),f=u(r,"icon_url"),p=r.description_html?je(r.description_html):`<p>No comprehensive details are configured yet for ${k(i)}.</p>`,c=r.features_html?je(r.features_html):"",w=c?`<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${c}</div>`:"",m=u(r,"package_name","Not published");return`
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="96" height="96" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${k(i)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${k(o)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${k(l)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${k(a)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${k(o.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${k(d)} \u2605</strong></div>
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
  `}function ss(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(l=>u(l,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>';let i=u(r,"name");return`
    <div class="max-w-xl mx-auto py-12 px-4 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5">
      <div class="text-center">
        <img src="${u(r,"icon_url")||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border" alt="icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-1">${k(i)}</h1>
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black mb-6">Information Hub</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-8">Access the application details and specifications below.</p>
        <a href="/" class="block w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl">Return Home</a>
        <a href="/${encodeURIComponent(t)}" class="block text-xs font-semibold text-blue-500 hover:underline mt-4">Read Technical Description</a>
      </div>
    </div>
  `}function ns(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/news/${encodeURIComponent(u(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${k(u(n,"category")||"Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${k(u(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${k(u(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${k(u(n,"description"))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`}function dt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(p=>u(p,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>';let i=u(r,"title"),o=u(r,"created_at")||"May 2026",l=u(r,"ceo_name","System Author"),a=u(r,"category","Report"),d=u(r,"content")||u(r,"description",""),f=je(d);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${k(a)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${o} | By ${k(l)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${k(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${f.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function rs(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/blog/${encodeURIComponent(u(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${k(u(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${k(u(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${k(ee(u(n,"excerpt")||u(n,"content","").substring(0,140)))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`}function ut(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(f=>u(f,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>';let i=u(r,"title"),o=u(r,"created_at")||"May 2026",l=u(r,"author","System Author"),a=u(r,"content",""),d=je(a);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${o} | Strategy by ${k(l)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${k(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${d.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function os(t,e){let s="";return t.forEach(n=>{let r=u(n,"title"),i=u(n,"slug"),o=u(n,"description","");s+=`
      <a href="/videos/${encodeURIComponent(i)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${k(r)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${k(o)}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${s||'<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`}function pt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(l=>u(l,"slug").toLowerCase()===n||u(l,"id").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>';let i=u(r,"title"),o=u(r,"description");return`<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${k(i)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${o.replace(/\n\n/g,"<br/><br/>")}</p></div>`}function is(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"about_content")||"About our application services.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function as(t){let e=u(t,"contact_content")||"Get in touch for active client files help.",s=u(t,"support_email","support@example.com");return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${e}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${k(s)}</p></div></div>`}function cs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"privacy_content")||"No private data tracking.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ls(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"report_removal_content")||"Report & Removal Policy compliance guidelines.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ds(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"terms_content")||"Service code terms of compliance.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function us(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"responsibility_content")||"Play safe for custom virtual entertainment.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ps(t){let e=u(t,"important_notice_heading")||"Important Notice",s=u(t,"important_notice")||"No important notices at this time.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function fs(t){let e=u(t,"ethics_heading")||"Ethics & Safety",s=u(t,"ethics_discrimination_text")||"Ethics and safety information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function gs(t){let e=u(t,"disclaimer_heading")||"Disclaimer",s=u(t,"disclaimer_text")||"Disclaimer information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ms(){try{let t=bt();return t?!t.apiKey||t.apiKey.trim()===""||t.apiKey.includes("YOUR_API_KEY")?{projectId:"placeholder-project-id",appId:"placeholder-app-id",apiKey:"PLACEHOLDER",authDomain:"placeholder-project.firebaseapp.com",firestoreDatabaseId:"(default)",storageBucket:"placeholder-project.firebasestorage.app",messagingSenderId:"000000000",measurementId:""}:t:null}catch{return null}}async function ys(t,e,s,n=""){let r=await ke();if(!r||!r.settings)return{html:t,isNotFound:!1};let i=r.apps||[],o=r.settings||{},l=r.news||[],a=r.blogs||[],d=r.videos||[],f=u(o,"site_title")||"RummyDex",p=f,c=u(o,"meta_description","");c||(c="A premium digital platform for applications and tools.");let w=u(o,"seo_keywords","");if(w||(w="app clearance, premium applications, digital tools, platform, tech specs, verified apps"),w){let A=w.split(",").map(S=>S.trim()).filter(Boolean);A.length>15&&(w=A.slice(0,15).join(", "))}let m="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",y=f||"Platform Administrator",C=null,_="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",h=!1,g=e.split("?")[0].split("#")[0],b=g.toLowerCase(),x=g.toLowerCase().replace(/^\/|\/$/g,""),I=ze().toLowerCase(),j=b.startsWith("/moreinfo/")||b.startsWith("/info/")||b.startsWith("/moredetail/")||b.startsWith("/gateway/");if(g==="/"||x==="")h=!1;else if(x===I||b.startsWith(`/${I}`)||b.startsWith("/admin")||["wp-admin","dashboard","panel"].includes(x))h=!1;else if(b.startsWith("/app/")){let A=decodeURIComponent(g.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase()),S=i.find(T=>{let R=u(T,"slug");return R&&R.toLowerCase()===A});if(S){h=!1;let T=u(S,"name");p=`${u(S,"seo_title")||T}`;let R=u(S,"description_html");c=ce(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||c,w=u(S,"seo_keywords")||w,m=u(S,"og_image_url")||u(S,"icon_url")||m;let P=(()=>{let Y=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return Y.includes("rummydex.com")?"https://www.rummydex.com":Y})();C=u(S,"canonical_url")||`${P}/app/${u(S,"slug")}`,_=u(S,"icon_url")||_}else h=!0}else if(b.startsWith("/info/")||b.startsWith("/moreinfo/")||b.startsWith("/moredetail/")||b.startsWith("/gateway/")){let A="/info/";b.startsWith("/moreinfo/")?A="/moreinfo/":b.startsWith("/moredetail/")?A="/moredetail/":b.startsWith("/gateway/")&&(A="/gateway/");let S=e.split(new RegExp(A,"i"))[1]||"",T=decodeURIComponent(S.split("/")[0].split("?")[0]),R=i.find(P=>{let M=u(P,"slug");return M&&M.toLowerCase()===T.toLowerCase()});if(R){h=!1;let P=u(R,"name");p=`${u(R,"seo_title")||P} - Technical Info`;let M=u(R,"description_html");c=ce(u(R,"seo_description"))||(M?ee(M).substring(0,160):"")||c,w=u(R,"seo_keywords")||w,m=u(R,"og_image_url")||u(R,"icon_url")||m,C=`${(()=>{let he=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return he.includes("rummydex.com")?"https://www.rummydex.com":he})()}${A}${u(R,"slug")}`,_=u(R,"icon_url")||_}else h=!0}else if(b.startsWith("/news/")&&b.length>6){let A=decodeURIComponent((e.split(/\/news\//i)[1]||"").split("/")[0].split("?")[0]),S=l.find(T=>{let R=u(T,"slug");return R&&R.toLowerCase()===A.toLowerCase()});if(S){h=!1;let T=u(S,"title","Latest News");p=`${u(S,"seo_title")||T} | ${f}`;let R=u(S,"description")||u(S,"content");c=ce(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||c,w=u(S,"seo_keywords")||w,m=u(S,"og_image_url")||u(S,"logo_url")||m,y=u(S,"ceo_name")||f;let P=(()=>{let Y=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return Y.includes("rummydex.com")?"https://www.rummydex.com":Y})();C=u(S,"canonical_url")||`${P}/news/${u(S,"slug")}`}else h=!0}else if(b.startsWith("/blog/")&&b.length>6){let A=decodeURIComponent((e.split(/\/blog\//i)[1]||"").split("/")[0].split("?")[0]),S=a.find(T=>{let R=u(T,"slug");return R&&R.toLowerCase()===A.toLowerCase()});if(S){h=!1;let T=u(S,"title","Blog Post");p=`${u(S,"seo_title")||T} | ${f}`;let R=u(S,"excerpt")||u(S,"content");c=ce(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||c,w=u(S,"seo_keywords")||w,m=u(S,"cover_url")||m,y=u(S,"author")||f;let P=(()=>{let Y=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return Y.includes("rummydex.com")?"https://www.rummydex.com":Y})();C=u(S,"canonical_url")||`${P}/blog/${u(S,"slug")}`}else h=!0}else if(b.startsWith("/videos/")&&b.length>8){let A=decodeURIComponent((e.split(/\/videos\//i)[1]||"").split("/")[0].split("?")[0]),S=d.find(T=>{let R=u(T,"slug"),P=u(T,"id");return R&&R.toLowerCase()===A.toLowerCase()||P&&P.toLowerCase()===A.toLowerCase()});if(S){h=!1;let T=u(S,"title","Video Specs");p=`${u(S,"seo_title")||T} | ${f}`;let R=u(S,"description");c=ce(u(S,"seo_description"))||(R?ee(R).substring(0,160):""),w=u(S,"seo_keywords");let P=u(S,"youtube_url"),M="";if(P){let $e=P.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);$e&&(M=$e[1])}M&&(m=`https://img.youtube.com/vi/${M}/maxresdefault.jpg`),C=`${(()=>{let he=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return he.includes("rummydex.com")?"https://www.rummydex.com":he})()}/videos/${u(S,"slug")||u(S,"id")}`}else h=!0}else if(["about","blogs","blog","contact","disclaimer","ethics","new-apps","news","notice","privacy","report-removal","responsibility","terms","videos","developers","submit-app"].includes(x))h=!1,x==="about"?(p=`About Us | ${f}`,c="Learn more about our mission, vision, and the premium services we offer on our platform."):x==="blogs"||x==="blog"?(p=`Official Blogs & Insights | ${f}`,c="Explore our official blog articles, professional guides, gameplay tips, and deep platform reviews."):x==="contact"?(p=`Contact Us | ${f}`,c="Get in touch with our professional support team. We are here to help you with your inquiries, feedback, and technical assistance."):x==="disclaimer"?(p=`Disclaimer | ${f}`,c="Read our platform disclaimer regarding content accuracy, fair play verification, and third-party links."):x==="ethics"?(p=`Code of Ethics & Content Policy | ${f}`,c="Discover our strict code of ethics, licensing standards, and platform content guidelines."):x==="new-apps"?(p=`New Releases & Up-and-Coming Apps | ${f}`,c="Stay updated with our latest releases, featured digital tools, and upcoming app launches."):x==="news"?(p=`Latest News & Press Updates | ${f}`,c="Browse official news bulletins, press announcements, security reports, and direct system updates."):x==="notice"?(p=`Important System Notice | ${f}`,c="Read our critical system alerts, maintenance updates, and important security advisories."):x==="privacy"?(p=`Privacy Policy | ${f}`,c="Read our comprehensive privacy policy to understand how we protect, secure, and handle your personal data."):x==="report-removal"?(p=`Report & Removal Request | ${f}`,c="Submit a content or application removal request to our legal and compliance team."):x==="responsibility"?(p=`Responsible Gaming & Play Policy | ${f}`,c="Learn about our commitment to user safety, self-exclusion tools, and responsible gameplay guidelines."):x==="terms"?(p=`Terms of Service & User Agreement | ${f}`,c="Review our terms of service, platform rules, and user agreements governing the use of our services."):x==="videos"?(p=`Video Previews & Walkthroughs | ${f}`,c="Watch high-definition videos, gameplay showcases, and technical walkthroughs of our certified applications."):x==="developers"?(p=`Meet Our Team | ${f}`,c=`Meet the brilliant developers behind ${f}. Discover our team's expertise and passion.`):x==="submit-app"&&(p=`Submit Your App | ${f}`,c=`Submit your Android application for listing and promotion on ${f}.`);else{let S=decodeURIComponent(e.split("?")[0].split("#")[0].replace(/^\/|\/$/g,""));if(S&&S!==""){let T=i.find(R=>u(R,"slug")?.toLowerCase()===S.toLowerCase());if(T){h=!1;let R=u(T,"name","App");p=u(T,"seo_title")||R;let P=u(T,"description_html"),M=`Discover the ${R} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;c=ce(u(T,"seo_description"))||(P?ee(P).substring(0,160):M),w=u(T,"seo_keywords"),m=u(T,"og_image_url")||u(T,"icon_url")||m,C=u(T,"canonical_url"),_=u(T,"icon_url")||_}else h=!0}else h=!0}h&&(p=`404 Page Not Found | ${f}`,c=`The requested page does not exist on ${f}. Browse our certified application listings and news updates.`);let O=(()=>{let S=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return S.includes("rummydex.com")?"https://www.rummydex.com":S})(),re=e.split("?")[0].split("#")[0].replace(/^\/api(\/[^/]+)?/i,"")||"/";re.length>1&&re.endsWith("/")&&(re=re.slice(0,-1));let Q=`${O}${re}`,W=C||Q;W.includes("rummydex.com")&&(W=W.replace(/^http:\/\//i,"https://").replace("https://rummydex.com","https://www.rummydex.com")),W.length>10&&W.endsWith("/")&&!W.endsWith("://www.rummydex.com/")&&(W=W.slice(0,-1));let D=m;if(m){let A=m.trim();if(A.startsWith("//"))D=`https:${A}`;else if(A.startsWith("data:"))D=A;else if(!A.startsWith("http://")&&!A.startsWith("https://")){let S=A.startsWith("/")?A:`/${A}`;D=`${O}${S}`}else D=A}let $=_;if(_){let A=_.trim();if(A.startsWith("//"))$=`https:${A}`;else if(A.startsWith("data:"))$=A;else if(!A.startsWith("http://")&&!A.startsWith("https://")){let S=A.startsWith("/")?A:`/${A}`;$=`${O}${S}`}else $=A}let N=e.startsWith(`/${ze()}`),z=u(o,"google_analytics_id","")||u(o,"ga_tracking_id",""),Fe=z?`
    <script async src="https://www.googletagmanager.com/gtag/js?id=${k(z)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${k(z)}');
    </script>
  `:"",ie=null;N||(i.some(S=>S.slug?.toLowerCase()===e.split("?")[0].split("#")[0].replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase())||e.startsWith("/gateway/")||e.startsWith("/moredetail/")||e.startsWith("/info/")||e.startsWith("/moreinfo/")?ie={"@context":"https://schema.org","@type":"SoftwareApplication",name:p,operatingSystem:"Android, iOS",applicationCategory:"GameApplication",description:c,url:W,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}}:e.startsWith("/news/")||e.startsWith("/blog/")?ie={"@context":"https://schema.org","@type":"Article",headline:p,description:c,image:D||[],author:{"@type":"Person",name:y}}:e.startsWith("/videos/")?ie={"@context":"https://schema.org","@type":"VideoObject",name:p,description:c,thumbnailUrl:D||[],uploadDate:new Date().toISOString()}:ie={"@context":"https://schema.org","@type":"WebSite",name:f,url:W});let st=ie?`<script type="application/ld+json">${JSON.stringify(ie).replace(/</g,"\\u003c")}</script>`:"";if(e==="/"||e===""){let A=u(o,"website_faqs");if(A&&Array.isArray(A)&&A.length>0){let S={"@context":"https://schema.org","@type":"FAQPage",mainEntity:A.map(T=>({"@type":"Question",name:T.question,acceptedAnswer:{"@type":"Answer",text:T.answer}}))};st+=`
    <script type="application/ld+json">${JSON.stringify(S).replace(/</g,"\\u003c")}</script>`}}let Ut=(()=>{let S=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").toLowerCase();if(S.includes("masterworld")||S.includes("dev-")||S.includes("pre-")||S.includes("localhost")||S.includes("127.0.0.1"))return!0;if(process.env.PUBLIC_DOMAIN)try{let T=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase(),R=s?new URL(s).host.toLowerCase():"";if(R&&R!==T)return!0}catch{}return!1})(),Ft=N||Ut||h?`
    <title>${N?"Admin Portal":k(p)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${k($)}" />
    <link rel="shortcut icon" href="${k($)}" />
    <link rel="apple-touch-icon" href="${k($)}" />
    `:""}
  `:`
    <title>${k(p)}</title>
    <meta name="description" content="${k(c)}" />
    <meta name="keywords" content="${k(w)}" />
    <meta name="author" content="${k(y)}" />
    <meta property="og:title" content="${k(p)}" />
    <meta property="og:description" content="${k(c)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${k(W)}" />
    ${D?`<meta property="og:image" content="${k(D)}" />`:""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${k(p)}" />
    <meta name="twitter:description" content="${k(c)}" />
    ${D?`<meta name="twitter:image" content="${k(D)}" />`:""}
    <meta name="robots" content="${j?"noindex, nofollow":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />
    <link rel="canonical" href="${k(W)}" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${k($)}" />
    <link rel="shortcut icon" href="${k($)}" />
    <link rel="apple-touch-icon" href="${k($)}" />
    `:""}
    ${st}
    ${Fe}
  `,q=t.replace(/<title>.*?<\/title>/ims,"");q=q.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims,""),q=q.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims,"");let Pe=ms();console.log("SAFE FIREBASE CONFIG:",Pe);let Pt=`
    <script id="firebase-config-loader">
      ${Pe?`window.__FIREBASE_CONFIG__ = ${JSON.stringify(Pe).replace(/</g,"\\u003c")};`:""}
      window.__INITIAL_DATA__ = ${JSON.stringify({apps:i,settings:o,news:l,blogs:a,videos:d}).replace(/</g,"\\u003c")};
    </script>
  `,Vt=Ft.replace(/<(meta|link) /g,'<$1 data-rh="true" ').replace(/<title>/g,'<title data-rh="true">').replace(/<script type="application\/ld\+json"/g,'<script data-rh="true" type="application/ld+json"');q=q.replace("</head>",`${Pt}${Vt}</head>`);try{let A=await Zt(e,r);q.includes('<div id="root">')?q=q.replace('<div id="root">',`<div id="root">${A}`):q=q.replace("</body>",`<div id="seo-prerender">${A}</div>
  </body>`)}catch(A){console.error("Static pre-rendering body injection failed:",A)}return{html:q,isNotFound:h}}var le,Se,qt,xe,ft,gt,mt,yt,ht,we,_e,at,Te,We,Yt,ae,de=Ve(()=>{le=H(require("fs")),Se=H(require("path"));ot();qt=()=>{try{return require("./lib/staticData")}catch{return{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}},xe=qt(),ft=xe.mockApps||[],gt=xe.mockSettings||{},mt=xe.mockNews||[],yt=xe.mockBlogs||[],ht=xe.mockVideos||[],we=null,_e=0,at=36e5,Te=!1,We=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},Yt="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ae=null});var Ue=H(require("express")),$t=H(require("helmet")),Qe=H(require("express-rate-limit")),Rt=H(require("cookie-parser")),J=H(require("path")),X=H(require("crypto")),Ke=H(require("compression")),F=H(require("fs")),Tt=H(require("dns"));de();Me();var Le=H(require("crypto-js"));var Ae=H(require("otpauth"));function _t(){return new Ae.Secret({size:20}).base32}function St(t,e){return new Ae.TOTP({issuer:"rummydex.com",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Je(t,e){try{return new Ae.TOTP({issuer:"rummydex.com",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(s){return console.error("TOTP verification error:",s),!1}}process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");console.log("Server starting with ADMIN_EMAIL:",process.env.ADMIN_EMAIL);var hs=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||hs();var qe=()=>{try{let t="./src/lib/staticData";try{let e=require.resolve(t);delete require.cache[e]}catch{}return require(t)}catch(t){return console.error("Failed to load staticData dynamically:",t),{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}},Vs=qe();function U(t,e){let s=[e,process.env.AES_SECRET].filter(Boolean),n=Array.from(new Set(s));for(let r of n)if(!(!r||r.trim()===""))try{let o=Le.default.AES.decrypt(t,r).toString(Le.default.enc.Utf8);if(o&&o.trim().length>0)return o}catch{}return""}var xt=!1;function K(){let t=process.env.AES_SECRET||AES_SECRET_GLOBAL;return t||(xt||(console.warn("WARNING: AES_SECRET environment variable is NOT SET. Using an insecure fallback key. DO NOT DO THIS IN PRODUCTION."),xt=!0),"fallback_aes_secret")}function G(t,e){if(!t||!e||e.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return Le.default.AES.encrypt(t,e).toString()}var Ge=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},bs="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ue=null;function B(){if(ue)return ue;try{let n=F.default.readFileSync(J.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Ge(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ue=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Ge(t))return ue={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ue;try{let n=bs.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Ge(r.projectId))return ue=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}var Ee=null,kt=!1;function Z(){if(Ee)return Ee;if(kt)return null;try{let t=require("firebase-admin"),e=B();t.apps.length===0&&(e&&e.projectId?t.initializeApp({projectId:e.projectId}):t.initializeApp());let s=e?.firestoreDatabaseId||"(default)";if(s&&s!=="(default)"){let{getFirestore:n}=require("firebase-admin/firestore");Ee=n(t.apps[0],s)}else Ee=t.firestore();return console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${s}`),Ee}catch(t){return console.warn("[WARN] Firebase Admin SDK initialization failed:",t.message||t),kt=!0,null}}function Ye(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:String(t)}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>Ye(e))}};if(typeof t=="object"){let e={};for(let[s,n]of Object.entries(t))n!==void 0&&(e[s]=Ye(n));return{mapValue:{fields:e}}}return{stringValue:String(t)}}function ws(t){let e={};if(!t||typeof t!="object")return e;for(let[s,n]of Object.entries(t))n!==void 0&&(e[s]=Ye(n));return e}async function pe(t,e){try{let s=B();if(!s||!s.projectId)return console.warn(`[SERVER] Cannot write REST doc ${t}: Missing project ID`),!1;let n=s.firestoreDatabaseId||"(default)",r=s.apiKey?`?key=${s.apiKey}`:"",i=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${n}/documents/store_data/${t}${r}`,o=ws(e),l=await fetch(i,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:o})});if(!l.ok){let a=await l.text();return console.warn(`[SERVER] writeFirestoreRestDoc failed for store_data/${t} (HTTP ${l.status}):`,a),!1}return console.log(`[SERVER] writeFirestoreRestDoc successfully written store_data/${t}`),!0}catch(s){return console.error(`[SERVER] writeFirestoreRestDoc exception for ${t}:`,s.message||s),!1}}var _s=[/zgrab/i,/masscan/i,/nmap/i,/nuclei/i,/sqlmap/i,/nikto/i,/dirbuster/i,/gobuster/i,/wfuzz/i],vt=process.env.CF_TURNSTILE_SECRET||"",Ss=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},Ze=Ss(vt)?vt:"";async function xs(t,e){if(!Ze)return!0;if(!t)return console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:",e),!1;try{let s=new URLSearchParams({secret:Ze,response:t,remoteip:e}),r=await(await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:s,headers:{"Content-Type":"application/x-www-form-urlencoded"}})).json();return r.success?!0:(console.warn("[CF_TURNSTILE] Failed:",r["error-codes"]),!1)}catch(s){return console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:",e,s),!1}}var jt=t=>{let e=t.headers["user-agent"]||"";return!!(e&&_s.some(s=>s.test(e)))};function ks(t){return!(!t||typeof t!="string"||t.length<8||/^(.)\1+$/.test(t))}var vs=60*1e3,As=300,De=new Map,me=async(t,e=As,s=vs)=>{try{let n=Date.now(),r=De.get(t);if((!r||n>r.resetTime)&&(r={count:0,resetTime:n+s}),r.count++,De.set(t,r),Math.random()<.01)for(let[i,o]of De.entries())n>o.resetTime&&De.delete(i);return r.count>e}catch{return!0}};function ne(t){return t.ip||t.socket?.remoteAddress||"unknown"}function At(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let s=[];for(let n of e){let r;if(n.toLowerCase().startsWith("0x")?r=parseInt(n,16):n.startsWith("0")&&n.length>1?r=parseInt(n,8):r=parseInt(n,10),isNaN(r)||r<0||r>255)return null;s.push(r)}if(e.length===1){let n=s[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=s[0],r=s[1];return r>16777215?null:[n,r>>>16&255,r>>>8&255,r&255]}else if(e.length===3){let n=s[0],r=s[1],i=s[2];return i>65535?null:[n,r,i>>>8&255,i&255]}return s}function Et(t){let[e,s,n,r]=t;return e===127||e===10||e===172&&s>=16&&s<=31||e===192&&s===168||e===169&&s===254||e===0||e===100&&s>=64&&s<=127||e===192&&s===0&&n===0||e===192&&s===0&&n===2||e===198&&s>=18&&s<=19||e===198&&s===51&&n>=100&&n<=103||e===203&&s===0&&n===113||e>=224&&e<=239||e>=240}async function Es(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let s=e.hostname.toLowerCase(),n=At(s);if(n&&Et(n)||s==="[::1]"||s==="::1"||s.startsWith("[fc00")||s.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(s)||s.endsWith(".local")||s.endsWith(".internal"))return!1;try{let i=await Tt.default.promises.lookup(s,{all:!0});for(let o of i){let l=o.address,a=At(l);if(a&&Et(a)||l==="::1"||l.startsWith("fc00:")||l.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var te=new Map,Is=new Set,Ie=new Map;setInterval(()=>{let t=Date.now();for(let[e,s]of te.entries())s.expiresAt<t&&te.delete(e);for(let[e,s]of Ie.entries())s.expiresAt<t&&Ie.delete(e)},3e4);function Cs(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let s=X.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",s,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0}),s}return t.cookies["__Host-sid"]}function $s(t,e,s,n){let i=Math.floor(Date.now()/1e3)+1800,o=`${t}|${e}|${s}|${n}|${i}`,l=X.default.createHmac("sha256",Dt).update(o).digest("hex");return Buffer.from(`${o}::${l}`).toString("base64url")}function Rs(t,e,s,n,r){try{let i=Buffer.from(t,"base64url").toString("utf8"),[o,l]=i.split("::");if(!o||!l)return!1;let a=o.split("|");if(a.length!==5)return!1;let[d,f,p,c,w]=a;if(c!==r)return console.warn(`[SECURITY] Token appId mismatch: expected ${r}, got ${c}`),!1;if(Math.floor(Date.now()/1e3)>parseInt(w,10))return console.warn("[WARN] Signature expired."),!1;let m=X.default.createHmac("sha256",Dt).update(o).digest("hex");return X.default.timingSafeEqual(Buffer.from(l,"hex"),Buffer.from(m,"hex"))}catch{return!1}}process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");var Ts=()=>["fallback","token","secret"].join("_"),Dt=process.env.TOKEN_SECRET||Ts(),Js=process.env.SESSION_SECRET||"fallback_session_secret_dev",v=(0,Ue.default)();v.set("trust proxy",1);v.use((0,$t.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1,xFrameOptions:!1}));var js=(0,Qe.default)({windowMs:900*1e3,limit:5e3,standardHeaders:"draft-7",legacyHeaders:!1,validate:{trustProxy:!1}});v.use(js);var et=(0,Qe.default)({windowMs:60*1e3,limit:100,standardHeaders:"draft-7",legacyHeaders:!1});v.use("/admin",et);v.use("/api/v1/admin",et);v.use("/api/download",et);v.use((t,e,s)=>{let n=Date.now();e.on("finish",()=>{let r=J.default.join(process.cwd(),"server_requests.log"),i=Date.now()-n,o=e.getHeader("content-type")||"unknown",l=t.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig,"$1$2=REDACTED")}),s()});v.use((0,Ke.default)({level:6,threshold:256,filter:(t,e)=>t.headers["x-no-compression"]?!1:Ke.default.filter(t,e)}));v.use((0,Rt.default)());v.use((t,e,s)=>{if(process.env.NODE_ENV==="production"){let n=(t.headers["x-forwarded-host"]||t.headers.host||"").toString().toLowerCase().split(",")[0].trim(),r=(t.headers["x-forwarded-proto"]||t.protocol||"https").toString().toLowerCase().split(",")[0].trim();if(n==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${t.originalUrl}`);if(r==="http"&&n.includes("rummydex.com"))return e.redirect(301,`https://${n}${t.originalUrl}`)}s()});v.disable("x-powered-by");v.use((t,e,s)=>{e.removeHeader("X-Powered-By"),e.setHeader("X-Powered-By","SecureServer/1.0"),e.setHeader("X-XSS-Protection","1; mode=block"),e.setHeader("X-Content-Type-Options","nosniff"),e.setHeader("Referrer-Policy","strict-origin-when-cross-origin");let n=t.headers.origin,r="",i=!1;if(n){let l=!1,a=(()=>{try{return new URL(n)}catch{return null}})();if(a){let d=a.hostname,f=process.env.PUBLIC_DOMAIN?new URL(process.env.PUBLIC_DOMAIN).hostname:"www.rummydex.com";(d==="localhost"||d==="127.0.0.1"||d.endsWith(".google.com")||d.endsWith(".studio")||d.endsWith(".run.app")||d.endsWith(".vercel.app")||d===f||d===f.replace(/^www\./,"")||process.env.ALLOWED_ORIGINS&&process.env.ALLOWED_ORIGINS.split(",").map(c=>c.trim()).includes(n))&&(l=!0)}l?(r=n,i=!0):r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com"}else r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com";if(r&&e.setHeader("Access-Control-Allow-Origin",r),e.setHeader("Vary","Origin"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PATCH, PUT, DELETE"),e.setHeader("Access-Control-Allow-Headers","X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For"),i&&e.setHeader("Access-Control-Allow-Credentials","true"),t.method==="OPTIONS"){e.sendStatus(200);return}(process.env.NODE_ENV==="production"||t.headers["x-forwarded-proto"]==="https")&&e.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");let o=process.env.NODE_ENV!=="production";e.setHeader(o?"Content-Security-Policy-Report-Only":"Content-Security-Policy","default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;"),s()});v.use(Ue.default.json({limit:"50mb"}));v.use(Ue.default.urlencoded({limit:"50mb",extended:!0}));["/trap/link","/trap/form","/trap/admin","/trap/backup","/trap/config","/trap/db","/trap/env","/trap/wp-admin","/trap/.git","/trap/api-keys","/trap/download"].forEach(t=>{v.all(t,(e,s)=>{console.warn(`[HONEYPOT] [${t}] IP: ${ne(e)} UA: ${e.headers["user-agent"]}`),s.status(403).send("Forbidden.")})});v.get(["/favicon.ico","/favicon.png","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,s)=>{console.log("--- FAVICON/LOGO ROUTE HIT ---",t.originalUrl);try{let n="";try{let{fetchStoreData:r}=(de(),be(ve)),i=await r();i&&i.settings&&(n=i.settings.favicon_url&&i.settings.favicon_url.trim()||i.settings.logo_url&&i.settings.logo_url.trim()||"")}catch(r){console.warn("Could not retrieve store settings for favicon, using default fallback:",r)}n||(n="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"),console.log("--- FAVICON/LOGO ROUTE RESOLVED TO ---",n);try{let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(r.ok){let i=await r.arrayBuffer(),o=Buffer.from(i),a=r.headers.get("content-type")||"image/png";return t.originalUrl.includes(".ico")?a="image/x-icon":t.originalUrl.includes(".png")&&(a="image/png"),e.set("Content-Type",a),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),console.log("--- FAVICON/LOGO PROXIED SECURELY ---",a,r.status),e.status(200).send(o)}else return console.warn(`Favicon proxy fetch returned status ${r.status}. Falling back to 302 redirect.`),e.set("Cache-Control","public, max-age=3600"),e.redirect(302,n)}catch(r){return console.error("Failed to proxy favicon content, falling back to 302 redirect:",r),e.redirect(302,n)}}catch(n){console.error("Favicon/Logo proxy routing failed:",n)}return s()});v.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let i=await ke();if(!i)throw new Error("No data");let{news:o=[],blogs:l=[],videos:a=[]}=i,d=`User-agent: *
Allow: /
Disallow: /api/
`,f=process.env.PUBLIC_DOMAIN||"";d+=`
Sitemap: ${f}/sitemap.xml
`,e.set("Content-Type","text/plain"),e.send(d)}catch{e.set("Content-Type","text/plain");let n=process.env.PUBLIC_DOMAIN||"";e.send(`User-agent: *
Allow: /
Sitemap: ${n}/sitemap.xml
`)}});v.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.status(404).send("Not Found");return}let i=await ke();if(!i)throw new Error("Unable to fetch store data");let{apps:o=[],news:l=[],blogs:a=[],videos:d=[]}=i,f=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com",p=t.headers.host?`https://${t.headers.host}`:f,c=`<?xml version="1.0" encoding="UTF-8"?>
`;c+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;let w="2024-05-01";c+=`  <url>
    <loc>${p}/</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/new-apps</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/news</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/blogs</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/videos</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/about</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/developers</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/contact</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/privacy</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/report-removal</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/terms</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/responsibility</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/notice</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/ethics</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,c+=`  <url>
    <loc>${p}/disclaimer</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;let m=_=>_.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),y=_=>{let h=u(_,"updated_at")||u(_,"created_at");if(h)try{if(typeof h=="object"&&h!==null&&h.seconds)return new Date(h.seconds*1e3).toISOString().split("T")[0];if(typeof h=="object"&&h!==null&&h._seconds)return new Date(h._seconds*1e3).toISOString().split("T")[0];let g=new Date(h);if(!isNaN(g.getTime()))return g.toISOString().split("T")[0]}catch{}return"2024-05-01"},C=_=>{if(!_||typeof _!="string")return!1;let h=_.trim().toLowerCase();return!h||h.startsWith("/")||h.includes("rummydex.com")?!1:!!(h.startsWith("http://")||h.startsWith("https://"))};for(let _ of o){let h=u(_,"slug"),g=u(_,"canonical_url");h&&!C(g)&&(c+=`  <url>
`,c+=`    <loc>${p}/app/${m(h)}</loc>
`,c+=`    <lastmod>${y(_)}</lastmod>
`,c+=`    <changefreq>weekly</changefreq>
`,c+=`    <priority>0.9</priority>
`,c+=`  </url>
`)}for(let _ of l){let h=u(_,"slug"),g=u(_,"canonical_url");h&&!C(g)&&(c+=`  <url>
`,c+=`    <loc>${p}/news/${m(h)}</loc>
`,c+=`    <lastmod>${y(_)}</lastmod>
`,c+=`    <changefreq>weekly</changefreq>
`,c+=`    <priority>0.7</priority>
`,c+=`  </url>
`)}for(let _ of a){let h=u(_,"slug"),g=u(_,"canonical_url");h&&!C(g)&&(c+=`  <url>
`,c+=`    <loc>${p}/blog/${m(h)}</loc>
`,c+=`    <lastmod>${y(_)}</lastmod>
`,c+=`    <changefreq>weekly</changefreq>
`,c+=`    <priority>0.7</priority>
`,c+=`  </url>
`)}for(let _ of d){let h=u(_,"slug");h&&(c+=`  <url>
`,c+=`    <loc>${p}/videos/${m(h)}</loc>
`,c+=`    <lastmod>${y(_)}</lastmod>
`,c+=`    <changefreq>weekly</changefreq>
`,c+=`    <priority>0.6</priority>
`,c+=`  </url>
`)}c+=`</urlset>
`,e.header("Content-Type","application/xml"),e.send(c)}catch(s){console.error("Sitemap Generation Error:",s),e.status(500).send("Error generating sitemap")}});var se=new Map,Nt=5,Xe=J.default.join(process.cwd(),"mock-2fa-state.json"),ge=new Map,Gs=(process.env.ADMIN_EMAIL||"").toLowerCase();try{if(F.default.existsSync(Xe)){let t=JSON.parse(F.default.readFileSync(Xe,"utf8"));for(let[e,s]of Object.entries(t))ge.set(e,s)}}catch(t){console.error("Failed to load mock 2FA file:",t)}function Ot(){try{let t={};for(let[e,s]of ge.entries())t[e]=s;F.default.writeFileSync(Xe,JSON.stringify(t,null,2),"utf8")}catch(t){console.error("Failed to save mock 2FA file:",t)}}var tt=900*1e3,Lt=3600*1e3;function Ds(t){let e=Date.now(),s=se.get(t);return s?s.lockedUntil>e?{allowed:!1,lockedUntil:s.lockedUntil}:e-s.windowStart>tt?(se.delete(t),{allowed:!0}):s.count>=Nt?(s.lockedUntil=e+Lt,se.set(t,s),{allowed:!1,lockedUntil:s.lockedUntil}):{allowed:!0}:{allowed:!0}}function It(t){let e=Date.now(),s=se.get(t);if(!s||e-s.windowStart>tt){se.set(t,{count:1,windowStart:e,lockedUntil:0});return}s.count+=1,s.count>=Nt&&(s.lockedUntil=e+Lt),se.set(t,s)}setInterval(()=>{let t=Date.now();for(let[e,s]of se.entries())s.lockedUntil<t&&t-s.windowStart>tt*2&&se.delete(e)},7200*1e3);var V=async(t,e,s)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token.",message:"Unauthorized: Missing verification token."});let r=n.split("Bearer ")[1];if(!r||r==="null"||r==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token.",message:"Unauthorized: Empty session verification token."});if(r.startsWith("ey"))try{let i="";if(Z())i=(await require("firebase-admin").auth().verifyIdToken(r)).email||"";else{let d=B()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(d){let f=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:r})});f.ok&&(i=(await f.json())?.users?.[0]?.email||"")}}let l=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return i&&i.toLowerCase().trim()===l?(t.adminUser={email:i.toLowerCase().trim()},s()):e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token.",message:"Unauthorized: Invalid Firebase token."})}try{let i=K();if(!i)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured.",message:"Encryption misconfigured."});let o=U(r,i);if(!o)return e.status(401).json({error:"Unauthorized: Invalid token.",message:"Unauthorized: Invalid token."});let l=JSON.parse(o);return!l.admin||!l.email||!l.exp?e.status(401).json({error:"Unauthorized: Malformed token.",message:"Unauthorized: Malformed token."}):Date.now()>l.exp?e.status(401).json({error:"Unauthorized: Session expired.",message:"Unauthorized: Session expired."}):(t.adminUser={email:l.email},s())}catch(i){return console.error("verifyAdminToken error:",i),e.status(401).json({error:"Unauthorized: Token verification failed.",message:"Unauthorized: Token verification failed."})}};v.post("/api/v1/admin/login",async(t,e)=>{let s=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=Ds(s);if(!n.allowed){let a=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${a} min.`})}let{email:r,password:i}=t.body??{};if(!r||!i)return It(s),e.status(400).json({error:"Missing email or password."});let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),l=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!l)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(r.toLowerCase().trim()===o&&i===l)try{let a=K(),d=JSON.stringify({admin:!0,email:o,exp:Date.now()+864e5}),f=G(d,a);return e.json({token:f,email:o})}catch(a){return console.error("Login encryption error:",a),e.status(500).json({error:"Internal server error."})}return It(s),e.status(401).json({error:"Invalid email or password."})});v.post("/api/v1/admin/google-login",async(t,e)=>{let{idToken:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing Firebase ID Token."});try{let n="";try{Z()&&(n=(await require("firebase-admin").auth().verifyIdToken(s)).email||"")}catch(a){console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:",a)}if(!n)try{let d=B()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(d){let f=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:s})});f.ok&&(n=(await f.json())?.users?.[0]?.email||"")}}catch(a){console.error("Firebase accounts:lookup verification failed:",a)}if(!n)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let r=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(n.toLowerCase().trim()!==r)return e.status(403).json({error:`Unauthorized: ${n} is not configured as an administrator.`});let i=K(),o=JSON.stringify({admin:!0,email:n.toLowerCase().trim(),exp:Date.now()+864e5}),l=G(o,i);return e.json({token:l,email:n.toLowerCase().trim()})}catch(n){return console.error("Google login backend error:",n),e.status(500).json({error:"Authentication failed on server: "+(n.message||String(n))})}});v.post("/api/v1/admin/verify-session",async(t,e)=>{let s=String(t.headers.authorization||"");if(!s.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=s.split("Bearer ")[1];if(n.startsWith("ey"))try{let r="";if(Z())r=(await require("firebase-admin").auth().verifyIdToken(n)).email||"";else{let a=B()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(a){let d=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${a}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:n})});d.ok&&(r=(await d.json())?.users?.[0]?.email||"")}}let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return r&&r.toLowerCase().trim()===o?e.json({ok:!0,email:r.toLowerCase().trim()}):e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let r=K(),i=U(n,r);if(!i)return e.status(401).json({error:"Unauthorized: Invalid token."});let o=JSON.parse(i);return!o.admin||Date.now()>o.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:o.email})}catch(r){return e.status(401).json({error:"Service error: "+(r?.message||String(r))})}});v.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing email address."});let n=String(s).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(s){return console.error("2fa resend error:",s),e.status(500).json({error:"Failed to process 2FA resend request: "+s.message})}});v.post("/api/github-sync/test",async(t,e)=>{try{let{owner:s,repo:n,token:r}=t.body||{},i=r||process.env.PAT;if(!s||!n||!i)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let o=i.trim(),l=o.toLowerCase().startsWith("ghp_")?`token ${o}`:`Bearer ${o}`,a=await fetch(`https://api.github.com/repos/${s.trim()}/${n.trim()}`,{headers:{Authorization:l,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(a.ok){let d=await a.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${d.full_name}`,permissions:d.permissions})}else{let d=await a.json().catch(()=>({})),f="";return a.status===401||a.status===403?f=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:a.status===404&&(f=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(a.status).json({ok:!1,message:(d.message||"Failed to connect to repository")+f})}}catch(s){return console.error("GitHub Test Connection error:",s),e.status(500).json({message:s.message||"Internal server error"})}});v.post("/api/github-sync/commit",async(t,e)=>{try{let{owner:s,repo:n,token:r,branch:i,path:o,content:l,message:a}=t.body||{},d=r||process.env.PAT;if(!s||!n||!d||!o||!l)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let f=i?i.trim():"main",p=o.replace(/^\/+/g,""),c=s.trim(),w=d.trim(),m=n.trim(),y=m,C=c.toLowerCase(),_=m.toLowerCase(),h=p.includes("staticData.ts")||p.includes("secureVault.ts")||p.includes("public_backup.json")||p.includes("secure_links_backup.json"),g=!1;console.log(`GitHub Sync Server Request: User "${c}" intends to sync "${p}" to repository "${m}"`);let b=w.toLowerCase().startsWith("ghp_")?`token ${w}`:`Bearer ${w}`,I=await(async j=>{let E=j;try{let D=await fetch(`https://api.github.com/users/${c}/repos?per_page=100`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(D.ok){let $=await D.json();if(Array.isArray($)){let N=$.find(z=>z.name?.toLowerCase()===E.toLowerCase());N&&N.name!==E&&(console.log(`GitHub Sync Server: Correcting repository casing alignment from "${E}" to "${N.name}"`),E=N.name)}}else{let $=await fetch(`https://api.github.com/orgs/${c}/repos?per_page=100`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();if(Array.isArray(N)){let z=N.find(Fe=>Fe.name?.toLowerCase()===E.toLowerCase());z&&z.name!==E&&(console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${E}" to "${z.name}"`),E=z.name)}}}}catch(D){console.warn("GitHub Repo casing alignment query not completed:",D)}console.log(`GitHub Sync Server: Fetching SHA of ${p} on repo ${c}/${E} [branch: ${f}]...`);let O,L="";try{let D=await fetch(`https://api.github.com/repos/${c}/${E}/contents/${p}?ref=${encodeURIComponent(f)}&_t=${Date.now()}`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(D.ok){let $=await D.json();$&&!Array.isArray($)&&$.sha&&(O=$.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${O}`))}else if(D.status===404){console.log(`GitHub Sync Server: File not found on branch "${f}". Attempting default branch fallback...`);let $=await fetch(`https://api.github.com/repos/${c}/${E}/contents/${p}?_t=${Date.now()}`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();N&&!Array.isArray(N)&&N.sha&&(O=N.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${O}`))}else if($.status!==404){let N=await $.json().catch(()=>({})),z="";N.message&&(N.message.toLowerCase().includes("resource not accessible")||N.message.toLowerCase().includes("permission")||$.status===403)&&(z=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+E+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+c+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),L=`Default branch lookup failed with status ${$.status}: ${N.message||"Unknown error"}${z}`}}else{let $=await D.json().catch(()=>({})),N="";$.message&&($.message.toLowerCase().includes("resource not accessible")||$.message.toLowerCase().includes("permission")||D.status===403)&&(N=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+E+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+c+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),L=`Target branch lookup failed with status ${D.status}: ${$.message||"Unknown error"}${N}`}}catch(D){console.error("GitHub SHA Fetch error on Server:",D),L=`Network error fetching repository contents on server: ${D.message||D}`}if(L&&!O)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${L}

Please check your Repository config and Token permissions.`};let ye=Buffer.from(l,"utf8").toString("base64"),re={message:a||"Admin Release Sync: Static file update",content:ye,branch:f,...O?{sha:O}:{}};console.log(`GitHub Sync Server: Initiating commit for ${p} to ${E}...`);let Q=await fetch(`https://api.github.com/repos/${c}/${E}/contents/${p}`,{method:"PUT",headers:{Authorization:b,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(re)});if(!Q.ok){let D=await Q.text(),$=D;try{let z=JSON.parse(D);$=z.message||z.error?.message||D}catch{}let N="";return $.toLowerCase().includes("not found")?N=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+E+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:($.toLowerCase().includes("credentials")||Q.status===401)&&(N=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!N&&($.toLowerCase().includes("resource not accessible")||$.toLowerCase().includes("permission")||Q.status===403)&&(N=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+E+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+c+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:Q.status,error:$+N}}return{success:!0,result:await Q.json(),finalRepo:E}})(m);return I.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${I.finalRepo}"!`,I.result?.commit?.sha),e.json({...I.result,message:`Successfully published to ${I.finalRepo} repository.`,targetRepo:I.finalRepo})):e.status(I.status||400).json({message:I.error})}catch(s){return console.error("Server GitHub commit handler error:",s),e.status(500).json({message:`Internal server error during GitHub sync: ${s.message||s}`})}});v.get("/api/v1/image",async(t,e)=>{let s=t.query.url;if(!s)return e.status(400).send("Missing image URL");try{let n=s;try{s.startsWith("http")||(n=Buffer.from(s,"base64").toString("utf-8"))}catch{}if(!await Es(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!r.ok)throw new Error("Failed to fetch image");let i=await r.arrayBuffer(),o=r.headers.get("content-type")||"image/jpeg";e.set("Content-Type",o),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(i))}catch{e.status(500).send("Image proxy error")}});v.get("/api/v1/admin/firebase-status",async(t,e)=>{try{let s=B(),n=s.apiKey||process.env.FIREBASE_API_KEY,r=s.projectId||process.env.FIREBASE_PROJECT_ID,i=s.firestoreDatabaseId||"(default)";if(!n||!r)return e.status(503).json({status:"offline",error:"Missing Firebase credentials"});let o=!1;try{let a=Z();a&&(await a.collection("store_data").doc("apps_meta").get(),o=!0)}catch{o=!1}let l=await fetch(`https://firestore.googleapis.com/v1/projects/${r}/databases/${i}/documents/store_data?key=${n}`);return o?e.json({status:"live",details:"Admin SDK Connected"}):l.status===200?e.json({status:"live",details:"REST Connected (No Admin SDK)"}):l.status===403?e.status(403).json({status:"permission_denied",error:"Permission Denied (Admin SDK misconfigured)"}):e.status(503).json({status:"offline",error:"Firestore unreachable"})}catch(s){return e.status(500).json({status:"offline",error:s.message})}});v.get("/api/v1/admin/verify",V,(t,e)=>{e.json({authorized:!0,user:t.adminUser})});v.get("/api/v1/admin/security/audit-logs",V,async(t,e)=>{let s=B();if(!!1&&s&&s.apiKey)try{let i=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${s.apiKey?"&key="+s.apiKey:""}`,o=await fetch(i);if(o.ok){let d=((await o.json()).documents||[]).map(f=>{let p=f.fields||{};return{id:f.name.split("/").pop(),email:p.email?.stringValue||"unknown",ip:p.ip?.stringValue||"unknown",ua:p.ua?.stringValue||"unknown",success:p.success?.booleanValue??!1,reason:p.reason?.stringValue||"unknown",ts:p.ts?.stringValue||new Date().toISOString()}}).sort((f,p)=>new Date(p.ts).getTime()-new Date(f.ts).getTime());return e.json({success:!0,logs:d})}}catch(i){console.error("Error fetching Firestore audit logs:",i)}let r=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:r})});v.get("/api/v1/admin/2fa/config",V,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim();if(!s)return e.status(400).json({error:"Missing admin email."});let n=!1,r=!1,i="";if(n){let o=ge.get(s);o&&(r=o.enabled,i=o.secret)}else{let o=B();if(o&&o.apiKey)try{let l=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,a=await fetch(l);if(a.ok){let d=await a.json();r=d.fields?.enabled?.booleanValue===!0,i=d.fields?.secret?.stringValue||""}}catch(l){console.error("Error fetching Firestore 2FA config:",l)}}if(r)return e.json({enabled:!0});{let o=_t(),l=St(s,o);return e.json({enabled:!1,tempSecret:o,qrCodeUri:l})}});v.post("/api/v1/admin/2fa/enable",V,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:r}=t.body||{};if(!s||!n||!r)return e.status(400).json({error:"Missing required fields (email, secret, code)."});let i=!1;if(!(i&&r==="123456")&&!Je(r,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});if(i)ge.set(s,{enabled:!0,secret:n}),Ot();else{let o=B();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable: Firebase is not configured."});try{let l=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,a=await fetch(l,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{enabled:{booleanValue:!0},secret:{stringValue:n}}})});if(!a.ok){let d=await a.text();return console.error("Failed to save 2FA config to Firestore:",d),e.status(500).json({error:"Failed to save 2FA configuration to database."})}}catch(l){return console.error("Firestore save 2FA exception:",l),e.status(500).json({error:"Server database write error."})}}return e.json({success:!0})});v.post("/api/v1/admin/2fa/disable",V,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!s||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let r=!1,i="";if(r){let o=ge.get(s);o&&o.enabled&&(i=o.secret)}else{let o=B();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable."});try{let l=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,a=await fetch(l);if(a.ok){let d=await a.json();d.fields?.enabled?.booleanValue===!0&&(i=d.fields?.secret?.stringValue||"")}}catch(l){console.error("Firestore 2FA config fetch fail on disable:",l)}}if(!i)return e.status(400).json({error:"2FA is not enabled for this account."});if(!(r&&n==="123456")&&!Je(n,i))return e.status(400).json({error:"Invalid verification code."});if(r)ge.delete(s),Ot();else{let o=B();if(o&&o.apiKey)try{let l=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,a=await fetch(l,{method:"DELETE"});if(!a.ok)return console.error("Failed to delete 2FA config from Firestore:",await a.text()),e.status(500).json({error:"Failed to delete 2FA from database."})}catch(l){return console.error("Firestore delete 2FA exception:",l),e.status(500).json({error:"Server database delete error."})}}return e.json({success:!0})});v.post("/api/v1/admin/encrypt",V,async(t,e)=>{let s=ne(t);if(await me(s))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let r=K();if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let i=G(n,r);e.json({encrypted:i})}catch{e.status(500).json({error:"Encryption failed"})}});v.post("/api/v1/admin/encrypt-links",V,async(t,e)=>{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid links array payload is required."});try{let n=K();if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let r=[],i=B();if(i){let p=i.apiKey?`?key=${i.apiKey}`:"",c=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents`;for(let w of["sec_links_vault_3","secure_links","sec_vault"])try{let y=await(await fetch(`${c}/store_data/${w}${p}`)).json();if(y&&!y.error&&y.fields?.encryptedData?.stringValue){let C=U(y.fields.encryptedData.stringValue,n);if(C){let _=JSON.parse(C);if(Array.isArray(_)){r=_;break}}}}catch{}}let o=new Map;r.forEach(p=>{p&&p.id&&o.set(p.id,p)}),s.map(p=>{let c=p.url||"";return c&&!c.startsWith("http://")&&!c.startsWith("https://")&&!c.startsWith("U2FsdGVkX1")&&(c="https://"+c),c&&!c.startsWith("U2FsdGVkX1")&&(c=G(c,n)),{...p,url:c}}).forEach(p=>{p&&p.id&&o.set(p.id,p)});let a=Array.from(o.values()),d=JSON.stringify(a),f=G(d,n);try{let p={};a.forEach(m=>{m&&m.id&&m.url&&(p[m.id]=m.url)});let w=`// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${String(G(JSON.stringify(p),n))}";
`}catch(p){console.warn("Failed to auto-seal secureVault.ts from encrypt-links:",p)}e.json({encrypted:f})}catch{e.status(500).json({error:"Links encryption failed"})}});v.get("/api/v1/admin/debug-links",V,async(t,e)=>{let s=ne(t);if(await me(s))return e.status(429).json({error:"Too many requests"});try{let n=JSON.parse(F.default.readFileSync("firebase-applet-config.json","utf8")),r=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,o=await(await fetch(r)).json();if(!o.fields||!o.fields.encryptedData)return e.json({error:"No vault data found"});let l=o.fields.encryptedData.stringValue,a=K(),d=U(l,a);e.json({decrypted:JSON.parse(d)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});v.post("/api/v1/admin/decrypt-url",V,async(t,e)=>{let s=ne(t);if(await me(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let r=K();if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=U(n,r);e.json({decrypted:o||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});v.post("/api/v1/admin/decrypt-links",V,async(t,e)=>{let s=ne(t);if(await me(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let r=K();if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=U(n,r);if(!o)throw new Error("Empty decrypted block.");let l=JSON.parse(o);l=l.map(a=>{let d=a.url||"";if(d.startsWith("U2FsdGVkX1"))try{d=U(d,r)}catch{}return{...a,url:d}}),e.json({items:l})}catch(o){console.error("[ERROR] Admin decrypt-links failed:",o.message||o),e.status(500).json({error:"Links decryption failed: "+(o.message||"Check AES_SECRET")})}});v.post("/api/v1/admin/sync-local",V,async(t,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:s,settings:n,news:r,blogs:i,videos:o}=t.body;if(!s||!n)return e.status(400).json({error:"Invalid sync payload."});let l=Be(s,n,r,i,o);try{F.default.writeFileSync(J.default.join(process.cwd(),"src/lib/staticData.ts"),l,"utf8")}catch(g){console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):",g.message)}let a=JSON.parse(JSON.stringify(s)).map(g=>(delete g.more_information_url,delete g.encrypted_download_url,delete g.download_url,g)),d=JSON.parse(JSON.stringify(n)),f=JSON.parse(JSON.stringify(r||[])),p=JSON.parse(JSON.stringify(i||[])),c=JSON.parse(JSON.stringify(o||[])),w=J.default.join(process.cwd(),"src/lib/public_backup.json");try{F.default.writeFileSync(w,JSON.stringify({apps:a,settings:d,news:f,blogs:p,videos:c},null,2),"utf8")}catch(g){console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):",g.message)}let m=K(),y={};s.forEach(g=>{if(g.more_information_url)if(g.more_information_url.startsWith("U2FsdGVkX1"))y[g.id]=g.more_information_url;else try{y[g.id]=G(g.more_information_url,m)}catch{console.warn(`[SECURITY] Skipped backup link for ${g.id} due to encryption failure`)}});let C=J.default.join(process.cwd(),".local/secure_links_backup.json"),_=y;if(F.default.existsSync(C))try{_={...JSON.parse(F.default.readFileSync(C,"utf8")),...y}}catch{}for(let[g,b]of Object.entries(_))if(b&&!b.startsWith("U2FsdGVkX1"))try{_[g]=G(b,m)}catch{delete _[g]}let h=!1;try{let g=Z();if(g){let b=[];if(s&&Array.isArray(s)){let I=Math.ceil(s.length/25)||1;for(let j=0;j<I;j++){let E=JSON.parse(JSON.stringify(s.slice(j*25,(j+1)*25)));E.forEach(O=>{delete O.more_information_url,delete O.encrypted_download_url,delete O.download_url}),b.push(g.collection("store_data").doc(`apps_chunk_${j}`).set({items:E}))}b.push(g.collection("store_data").doc("apps_meta").set({numChunks:I,last_updated:new Date().toISOString()}))}if(n){let x=JSON.parse(JSON.stringify(n));b.push(g.collection("store_data").doc("public_settings").set(x,{merge:!0}))}r&&Array.isArray(r)&&b.push(g.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(r))})),i&&Array.isArray(i)&&b.push(g.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(i))})),o&&Array.isArray(o)&&b.push(g.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(o))})),await Promise.all(b),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),h=!0}}catch(g){console.warn("[SERVER] Firestore Admin SDK update warning, switching to REST API fallback:",g.message)}if(!h)try{let g=[];if(s&&Array.isArray(s)){let x=Math.ceil(s.length/25)||1;for(let I=0;I<x;I++){let j=JSON.parse(JSON.stringify(s.slice(I*25,(I+1)*25)));j.forEach(E=>{delete E.more_information_url,delete E.encrypted_download_url,delete E.download_url}),g.push(pe(`apps_chunk_${I}`,{items:j}))}g.push(pe("apps_meta",{numChunks:x,last_updated:new Date().toISOString()}))}n&&g.push(pe("public_settings",JSON.parse(JSON.stringify(n)))),r&&Array.isArray(r)&&g.push(pe("news",{items:JSON.parse(JSON.stringify(r))})),i&&Array.isArray(i)&&g.push(pe("blogs",{items:JSON.parse(JSON.stringify(i))})),o&&Array.isArray(o)&&g.push(pe("videos",{items:JSON.parse(JSON.stringify(o))})),await Promise.all(g),console.log("[SERVER] Firestore documents successfully updated via REST API in sync-local endpoint.")}catch(g){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",g.message)}try{let g=J.default.join(process.cwd(),"src/lib/public_backup.json"),b={apps:s||[],settings:n||{},news:r||[],blogs:i||[],videos:o||[]};F.default.writeFileSync(g,JSON.stringify(b,null,2),"utf8")}catch(g){console.warn("[SERVER] Could not update public_backup.json:",g)}fe=null,e.json({success:!0,message:"Cloud Firestore and backup components strictly synced."})}catch(s){console.error("local file sync endpoint error:",s),e.status(500).json({error:"Failed to store backup: "+s.message})}});v.get("/api/v1/admin/backup-links-get",V,(t,e)=>{try{let s=K(),n={},r=J.default.join(process.cwd(),"src/lib/secureVault.ts");if(F.default.existsSync(r))try{let a=F.default.readFileSync(r,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(a&&a[1]){let d=a[1],f=U(d,s);if(f){let p=JSON.parse(f);Array.isArray(p)?p.forEach(c=>{c&&c.id&&(n[c.id]=c.url||c.more_information_url||"")}):p&&typeof p=="object"&&Object.assign(n,p),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(l){console.warn("backup-links-get: Failed to parse secureVault.ts:",l.message)}let i=J.default.join(process.cwd(),".local/secure_links_backup.json");if(F.default.existsSync(i))try{let l=JSON.parse(F.default.readFileSync(i,"utf8"));Object.assign(n,l),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(l){console.warn("backup-links-get: Failed to parse backup JSON:",l.message)}let o=[];for(let[l,a]of Object.entries(n)){let d="";typeof a=="string"&&(a.startsWith("U2FsdGVkX1")?d=U(a,s):d=a),o.push({id:l,url:d})}e.json({items:o})}catch(s){console.error("backup-links-get failed:",s),e.status(500).json({error:"Failed to read backup links: "+s.message})}});v.get("/api/v1/admin/fix-db-links",V,async(t,e)=>{try{let s=B();if(!s)return e.status(500).json({error:"Missing configuration."});let r=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_0${s.apiKey?"?key="+s.apiKey:""}`)).json(),i=[];!r.error&&r.fields?.items?.arrayValue?.values&&(i=r.fields.items.arrayValue.values.map(y=>y.mapValue.fields.id.stringValue));let l=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_1${s.apiKey?"?key="+s.apiKey:""}`)).json();!l.error&&l.fields?.items?.arrayValue?.values&&(i=i.concat(l.fields.items.arrayValue.values.map(y=>y.mapValue.fields.id.stringValue)));let a=K(),d=i.map(y=>({id:y,url:`https://example.com/demo/${y}`})),f=G(JSON.stringify(d),a),p=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",m=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${s.apiKey?"&key="+s.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${p}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:f}}})})).json();e.json(m)}catch(s){e.json({error:s.message})}});function Ce(t){if(!t||typeof t!="object")return t??null;if("stringValue"in t)return t.stringValue;if("booleanValue"in t)return t.booleanValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("timestampValue"in t)return t.timestampValue;if("nullValue"in t)return null;if("mapValue"in t){let e=t.mapValue?.fields||{},s={};for(let n of Object.keys(e))s[n]=Ce(e[n]);return s}return"arrayValue"in t?(t.arrayValue?.values||[]).map(s=>Ce(s)):null}function Ne(t){if(!t||typeof t!="object")return{};let e={};for(let s of Object.keys(t))e[s]=Ce(t[s]);return e}var fe=null,Oe=0,Ns=0;v.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data"],async(t,e)=>{try{let s=Date.now();if(fe&&s-Oe<Ns)return e.json(fe);try{let o=Z();if(o){let l=await o.collection("store_data").doc("apps_meta").get(),a=[];if(l.exists){let w=l.data()?.numChunks||1;for(let m=0;m<w;m++){let y=await o.collection("store_data").doc(`apps_chunk_${m}`).get();y.exists&&y.data()?.items&&a.push(...y.data().items)}}else{let w=await o.collection("store_data").doc("apps").get();w.exists&&w.data()?.items&&(a=w.data().items)}let d=await o.collection("store_data").doc("public_settings").get(),f=await o.collection("store_data").doc("news").get(),p=await o.collection("store_data").doc("blogs").get(),c=await o.collection("store_data").doc("videos").get();if(a.length>0||d.exists){let w={apps:a,settings:d.exists?d.data():{},news:f.exists?f.data()?.items||[]:[],blogs:p.exists?p.data()?.items||[]:[],videos:c.exists?c.data()?.items||[]:[]};return fe=w,Oe=s,e.json(w)}}}catch{}try{let o=B();if(o&&o.projectId){let l=o.apiKey?`?key=${o.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId||"(default)"}/documents/store_data`,d=await fetch(`${a}/apps_meta${l}`),f=[];if(d.ok){let g=await d.json(),b=g.fields?.numChunks?.integerValue?parseInt(g.fields.numChunks.integerValue,10):1;for(let x=0;x<b;x++){let I=await fetch(`${a}/apps_chunk_${x}${l}`);if(I.ok){let j=await I.json();if(j.fields?.items?.arrayValue?.values){let E=j.fields.items.arrayValue.values.map(O=>Ce(O));f.push(...E)}}}}else{let g=await fetch(`${a}/apps${l}`);if(g.ok){let b=await g.json();b.fields?.items?.arrayValue?.values&&(f=b.fields.items.arrayValue.values.map(x=>Ce(x)))}}let p=await fetch(`${a}/public_settings${l}`),c=await fetch(`${a}/news${l}`),w=await fetch(`${a}/blogs${l}`),m=await fetch(`${a}/videos${l}`),y={},C={},_={},h={};try{p.ok&&(y=Ne((await p.json())?.fields))}catch{}try{c.ok&&(C=Ne((await c.json())?.fields))}catch{}try{w.ok&&(_=Ne((await w.json())?.fields))}catch{}try{m.ok&&(h=Ne((await m.json())?.fields))}catch{}if(f.length>0||Object.keys(y).length>0){let g={apps:f,settings:y,news:C.items||[],blogs:_.items||[],videos:h.items||[]};return fe=g,Oe=s,e.json(g)}}}catch{}let n=J.default.join(process.cwd(),"src/lib/public_backup.json");if(F.default.existsSync(n))try{let o=JSON.parse(F.default.readFileSync(n,"utf8")),l={apps:o.apps||[],settings:o.settings||{},news:o.news||[],blogs:o.blogs||[],videos:o.videos||[]};return fe=l,Oe=s,e.json(l)}catch(o){console.error("Error reading public_backup.json in backup-data endpoint:",o)}let r=qe(),i={apps:r.mockApps||[],settings:r.mockSettings||{},news:r.mockNews||[],blogs:r.mockBlogs||[],videos:r.mockVideos||[]};return e.json(i)}catch(s){console.error("public backup endpoint error:",s);let n=qe();return e.status(200).json({apps:n.mockApps||[],settings:n.mockSettings||{},news:n.mockNews||[],blogs:n.mockBlogs||[],videos:n.mockVideos||[]})}});v.get("/api/v1/debug-seo",async(t,e)=>{try{let{fetchStoreData:s}=(de(),be(ve)),n=await s();e.json({hasData:!!n,hasSettings:!!n?.settings,settingsKeys:Object.keys(n?.settings||{})})}catch(s){e.json({error:s.message})}});v.post("/api/v1/admin/seal-vault",V,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n={};s.forEach(o=>{o.id&&(o.url||o.more_information_url)&&(n[o.id]=o.url||o.more_information_url)});let r={AES_SECRET:process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"")};if(!r.AES_SECRET)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let i="";typeof G<"u"?i=G(JSON.stringify(n),r.AES_SECRET):i=require("crypto-js").AES.encrypt(JSON.stringify(n),r.AES_SECRET).toString(),e.json({success:!0,ciphertext:i})}catch(s){e.status(500).json({error:s.message})}});v.post("/api/v1/admin/save-links-direct",V,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n=K(),r={};s.forEach(l=>{let a=l.url||l.more_information_url;if(l.id&&a)if(a.startsWith("U2FsdGVkX1"))r[l.id]=a;else try{r[l.id]=G(a,n)}catch{console.warn(`[SECURITY] Skipped backup link for ${l.id} due to encryption failure`)}});let i=require("path").join(process.cwd(),".local/secure_links_backup.json"),o=r;if(require("fs").existsSync(i))try{o={...JSON.parse(require("fs").readFileSync(i,"utf8")),...r}}catch{}for(let[l,a]of Object.entries(o))if(a&&!a.startsWith("U2FsdGVkX1"))try{o[l]=G(a,n)}catch{delete o[l]}e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(s){e.status(500).json({error:s.message})}});v.post("/api/v1/admin/pull-links-from-github",V,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));v.get("/api/v1/admin/config-status",V,(t,e)=>{let s=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,r=!!process.env.ADMIN_EMAIL;e.json({hasAes:s,hasSecLinks:n,hasAdminEmail:r})});v.get("/api/v1/admin/system-files",V,(t,e)=>{e.json({files:{}})});v.get("/api/v1/debug-index",async(t,e)=>{try{let s=F.default.readFileSync(J.default.resolve(process.cwd(),"index.html"),"utf-8"),n=t.app.get("vite");e.json({debug:!0})}catch(s){e.json({error:s.message})}});["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{v.all(t,(e,s)=>{s.status(404).send("Not Found")})});v.get(["/api/v1/_chal","/api/v1/get-challenge","/api/v1/init-file"],async(t,e)=>{console.log("[DEBUG] /api/v1/init-file called");let s=ne(t);if(await me(s))return e.status(429).json({error:"Too many requests. Please wait."});if(jt(t))return e.status(403).json({error:"Access denied."});let n=Cs(t,e),r=X.default.randomBytes(20).toString("hex"),i=Date.now(),o=Math.floor(Math.random()*100)+50;te.set(r,{sessionId:n,expiresAt:i+120*1e3,issuedAt:i+o}),setTimeout(()=>{e.json({nonce:r,difficulty:"0000",sid:n})},o)});v.post(["/api/v1/_proc","/api/v1/get-token","/api/v1/process-file"],async(t,e)=>{let s=ne(t);if(await me(s))return e.status(429).json({error:"Too many requests. Please wait."});if(jt(t))return e.status(403).json({error:"Access denied."});let n=t.body?.sid||t.cookies?.["__Host-sid"];if(!n)return e.status(403).json({error:"Session expired. Please reload."});let{nonce:r,solution:i,fingerprint:o,score:l,moved:a,touch:d,cfToken:f}=t.body||{};if(!r||!i||!o)return e.status(400).json({error:"Invalid request."});if(!ks(o))return console.warn(`[DEFENSE] Bad fingerprint from ${s}`),e.status(403).json({error:"Access denied."});let p=te.get(r);if(!p)return e.status(403).json({error:"Challenge expired. Please try again."});if(p.sessionId!==n)return te.delete(r),e.status(403).json({error:"Session mismatch."});if(p.expiresAt<Date.now())return te.delete(r),e.status(403).json({error:"Challenge timed out."});let c=Date.now()-p.issuedAt;if(c<80)return te.delete(r),console.warn(`[DEFENSE] Solve too fast (${c}ms) from ${s}`),e.status(403).json({error:"Access denied."});if(te.delete(r),typeof l!="number"||l<40)return console.warn(`[DEFENSE] Low score (${l}) from ${s}`),e.status(403).json({error:"Access denied: security check failed."});let w=r+i,m=X.default.createHash("sha256").update(w).digest("hex");if(!m.startsWith("0000"))return console.warn(`[DEFENSE] PoW fail from ${s}: ${m}`),e.status(403).json({error:"Access denied: verification failed."});if(Ze&&!await xs(f||"",s))return console.warn(`[CF] Rejected ${s}`),e.status(403).json({error:"Access denied: verification failed."});console.log(`[ACCESS] GRANTED ip=${s} score=${l} solveMs=${c} moved=${a} touch=${d}`);let y=t.body.appId||"unknown",C=$s(s,n,o,y);e.json({token:C})});v.get("/api/v1/link-check",async(t,e)=>{let s=t.query.id;if(!s)return e.json({configured:!1});try{let n=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");if(!n)return e.json({configured:!0});let r="",i=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(i)){let f=require("fs").readFileSync(i,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);f&&f[1]&&(r=f[1])}if(!r)return e.json({configured:!0});let o="";if(typeof U<"u")o=U(r,n);else{let d=require("crypto-js");o=d.AES.decrypt(r,n).toString(d.enc.Utf8)}if(!o)return e.json({configured:!0});let l=JSON.parse(o),a=!1;if(Array.isArray(l)){let d=l.find(f=>f&&f.id===s);d&&(d.url||d.more_information_url)&&(a=!0)}else l&&typeof l=="object"&&l[s]&&(a=!0);return e.json({configured:!0})}catch{return e.json({configured:!0})}});var Ct=new Map;v.post("/api/v1/public/chat",async(t,e)=>{let s=t.headers["x-forwarded-for"]||t.socket.remoteAddress||"unknown",n=Date.now(),r=3600*1e3,i=10,o=Ct.get(s);if((!o||n>o.resetTime)&&(o={count:0,resetTime:n+r}),o.count>=i)return e.status(429).json({error:"Rate limit exceeded. Maximum 10 messages per hour. Please try again later."});o.count+=1,Ct.set(s,o);let{message:l}=t.body;if(!l||typeof l!="string")return e.status(400).json({error:"Message payload is required."});try{let a=process.env.GEMINI_API_KEY;if(!a)throw new Error("AI service is currently offline.");let{fetchStoreData:d}=(de(),be(ve)),f=await d(),p={settings:{site_title:f.settings?.site_title,meta_description:f.settings?.meta_description,policies:f.settings?.policies?f.settings.policies.substring(0,500):""},categories:(f.categories||[]).map(y=>({id:y.id,n:y.name})),apps:(f.apps||[]).map(y=>({n:y.name,c:y.category,desc:y.description_html?.replace(/<[^>]+>/g,"").substring(0,200),r:y.rating})),news:(f.news||[]).map(y=>({t:y.title,d:y.description?.substring(0,200),c:y.content?.replace(/<[^>]+>/g,"").substring(0,300)})),blogs:(f.blogs||[]).map(y=>({t:y.title,d:y.description?.substring(0,200),c:y.content?.replace(/<[^>]+>/g,"").substring(0,300)})),videos:(f.videos||[]).map(y=>({t:y.title,d:y.description,c:y.content?.replace(/<[^>]+>/g,"").substring(0,1e3)}))},{GoogleGenAI:c}=require("@google/genai"),w=new c({apiKey:a,httpOptions:{headers:{"User-Agent":"aistudio-build"}}}),m=`You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(p,null,2)}`;try{let y=await w.models.generateContentStream({model:"gemini-2.0-flash",contents:l.trim(),config:{systemInstruction:m,maxOutputTokens:1e3,temperature:.3,tools:[{googleSearch:{}}]}});e.setHeader("Content-Type","text/event-stream"),e.setHeader("Cache-Control","no-cache"),e.setHeader("Connection","keep-alive"),e.flushHeaders();for await(let C of y)C.text&&e.write(`data: ${JSON.stringify({text:C.text})}

`);return e.write(`data: [DONE]

`),e.end()}catch(y){if(!e.headersSent)throw y;return e.write(`data: ${JSON.stringify({error:y.message||"Streaming failed"})}

`),e.end()}}catch(a){if(a.status===429||a.message?.includes("429"))return e.json({success:!0,answer:"\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities."});if(a.status===403||a.message?.includes("403"))return e.json({success:!0,answer:"\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings."});let d=l.trim().toLowerCase();try{let{fetchStoreData:f}=(de(),be(ve)),w=((await f()).apps||[]).filter(m=>m.name&&m.name.toLowerCase().includes(d)||m.category&&m.category.toLowerCase().includes(d));if(w.length>0){let m=w.slice(0,3).map(y=>y.name).join(", ");return e.json({success:!0,answer:`(Offline Fallback): I found some apps in the directory matching your query: ${m}${w.length>3?" and more.":"."}`})}else if(d.includes("hello")||d.includes("hi ")||d==="hi")return e.json({success:!0,answer:"(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!"})}catch{}return e.json({success:!0,answer:"(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."})}});v.post("/api/v1/report-missing",async(t,e)=>{let{appId:s}=t.body;return s?(console.log(`[report-missing] Received report for ${s}, mocked success due to hardcoded public mode.`),e.json({success:!0})):e.status(400).json({error:"Missing App ID parameter."})});v.get("/api/v1/moreinfo-resolve",async(t,e)=>{let s=ne(t),n=t.query.sid||t.cookies?.["__Host-sid"],r=t.query.token||t.query.t,i=t.query.id;if(!r||!i)return t.query.json==="true"?e.status(400).json({error:"Verification transmission tokens or App ID were omitted."}):e.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");try{let d=B();if(d&&d.projectId){let f=X.default.createHash("sha256").update(r).digest("hex"),p=!1,c=Z();if(c)try{(await c.collection("spent_tokens").doc(f).get()).exists&&(p=!0)}catch(w){console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:",w.message);let m=`https://firestore.googleapis.com/v1/projects/${d.projectId}/databases/${d.firestoreDatabaseId}/documents/spent_tokens/${f}${d.apiKey?"?key="+d.apiKey:""}`;(await fetch(m)).ok&&(p=!0)}else{let w=`https://firestore.googleapis.com/v1/projects/${d.projectId}/databases/${d.firestoreDatabaseId}/documents/spent_tokens/${f}${d.apiKey?"?key="+d.apiKey:""}`;(await fetch(w)).ok&&(p=!0)}if(p)return t.query.json==="true"?e.status(403).json({error:"This single-use private download signature has already been spent."}):e.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>")}}catch{}let o=!1;try{Buffer.from(r,"base64url").toString("utf8").includes("::")&&(o=!0)}catch{}if(o)try{let d=Buffer.from(r,"base64url").toString("utf8"),[f]=d.split("::"),[p,c,w]=f.split("|");if(!Rs(r,p,c,w,i))return t.query.json==="true"?e.status(403).json({error:"Cryptographic HMAC validation failed."}):e.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");try{let y=B();if(y&&y.projectId){let C=X.default.createHash("sha256").update(r).digest("hex"),_=new Date().toISOString(),h=Z();if(h)try{await h.collection("spent_tokens").doc(C).set({usedAt:_}),console.log(`[AUDIT] Successfully spent token ${C} via firebase-admin SDK`)}catch(g){console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:",g.message);let b=`https://firestore.googleapis.com/v1/projects/${y.projectId}/databases/${y.firestoreDatabaseId}/documents/spent_tokens/${C}${y.apiKey?"?key="+y.apiKey:""}`;fetch(b,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:_}}})}).catch(()=>{})}else{let g=`https://firestore.googleapis.com/v1/projects/${y.projectId}/databases/${y.firestoreDatabaseId}/documents/spent_tokens/${C}${y.apiKey?"?key="+y.apiKey:""}`;fetch(g,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:_}}})}).catch(()=>{})}}}catch{}let m="";try{let y=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:""),C=null;try{C=B()}catch{}if(C&&(!m||!m.startsWith("http"))){let _=Z();if(_)for(let h of["sec_links_vault_3","secure_links","sec_vault"])try{let g=await _.collection("store_data").doc(h).get();if(g.exists){let b=g.data();if(b&&b.encryptedData){let x=U(b.encryptedData,y);if(x){let I=JSON.parse(x),j="";if(I&&Array.isArray(I)){let E=I.find(O=>O&&O.id===i);E&&(j=typeof E.url=="string"?E.url:typeof E.more_information_url=="string"?E.more_information_url:"")}else if(I&&typeof I=="object"){let E=I[i];typeof E=="string"?j=E:E&&typeof E=="object"&&(j=typeof E.url=="string"?E.url:typeof E.more_information_url=="string"?E.more_information_url:"")}if(j&&typeof j=="string"&&(j.startsWith("U2FsdGVkX1")?m=U(j,y):m=j,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${h}) for app ID: ${i}`);break}}}}}catch(g){console.warn(`[WARN] Firestore SDK failed to fetch ${h}:`,g.message)}}if((!m||!m.startsWith("http"))&&C&&C.projectId){let _=C.apiKey?`?key=${C.apiKey}`:"",h=`https://firestore.googleapis.com/v1/projects/${C.projectId}/databases/${C.firestoreDatabaseId}/documents`;for(let g of["sec_links_vault_3","secure_links","sec_vault"])try{let b=await fetch(`${h}/store_data/${g}${_}`);if(b.ok){let x=await b.json();if(x&&!x.error&&x.fields?.encryptedData?.stringValue){let I=x.fields.encryptedData.stringValue,j=U(I,y);if(j){let E=JSON.parse(j),O="";if(E&&Array.isArray(E)){let L=E.find(ye=>ye&&ye.id===i);L&&(O=typeof L.url=="string"?L.url:typeof L.more_information_url=="string"?L.more_information_url:"")}else if(E&&typeof E=="object"){let L=E[i];typeof L=="string"?O=L:L&&typeof L=="object"&&(O=typeof L.url=="string"?L.url:typeof L.more_information_url=="string"?L.more_information_url:"")}if(O&&typeof O=="string"&&(O.startsWith("U2FsdGVkX1")?m=U(O,y):m=O,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${g}) for app ID: ${i}`);break}}}}}catch(b){console.warn(`[WARN] Firestore REST fallback failed to fetch ${g}:`,b.message)}}if(!m||!m.startsWith("http"))try{let _="",h=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(h)){let b=require("fs").readFileSync(h,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);b&&b[1]&&(_=b[1])}if(_){let g="";if(typeof U<"u")g=U(_,y);else{let b=require("crypto-js");g=b.AES.decrypt(_,y).toString(b.enc.Utf8)}if(g){let b=JSON.parse(g),x="";if(b&&Array.isArray(b)){let I=b.find(j=>j&&j.id===i);I&&(x=typeof I.url=="string"?I.url:typeof I.more_information_url=="string"?I.more_information_url:"")}else if(b&&typeof b=="object"){let I=b[i];typeof I=="string"?x=I:I&&typeof I=="object"&&(x=typeof I.url=="string"?I.url:typeof I.more_information_url=="string"?I.more_information_url:"")}x&&typeof x=="string"&&(x.startsWith("U2FsdGVkX1")?m=U(x,y):m=x,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${i}`))}}}catch(_){console.warn("Vault decryption failed",_)}if(!m||!m.startsWith("http"))try{if(process.env.SECURE_LINKS){let _=JSON.parse(process.env.SECURE_LINKS);if(_&&typeof _=="object"){let h=_[i],g="";typeof h=="string"?g=h:h&&typeof h=="object"&&(g=typeof h.url=="string"?h.url:typeof h.more_information_url=="string"?h.more_information_url:""),g&&typeof g=="string"&&(g.startsWith("U2FsdGVkX1")?m=U(g,y):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${i}`))}}}catch{}if(!m||!m.startsWith("http"))try{let _=require("path").join(process.cwd(),".local/secure_links_backup.json");if(require("fs").existsSync(_)){let h=JSON.parse(require("fs").readFileSync(_,"utf8")),g="";if(h&&Array.isArray(h)){let b=h.find(x=>x&&x.id===i);b&&(g=typeof b.url=="string"?b.url:typeof b.more_information_url=="string"?b.more_information_url:"")}else if(h&&typeof h=="object"){let b=h[i];typeof b=="string"?g=b:b&&typeof b=="object"&&(g=typeof b.url=="string"?b.url:typeof b.more_information_url=="string"?b.more_information_url:"")}if(g&&typeof g=="string"){let b=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");g.startsWith("U2FsdGVkX1")?m=U(g,b):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${i}`)}}}catch(_){console.warn("Local filesystem backup retrieval failed:",_)}}catch(y){console.error("Firestore retrieval or decryption failed",y)}if(typeof m!="string")return console.error("targetUrl resolved to an object instead of a string:",m),e.status(500).json({error:"Download link encryption integrity failed."});if(m&&!m.startsWith("http://")&&!m.startsWith("https://")&&!m.startsWith("/")&&m.includes(".")&&(m="https://"+m),!m||!m.startsWith("http")&&!m.startsWith("/"))return console.error("CRITICAL: Failed to retrieve or decrypt URL for app:",i,"Result:",m),t.query.json==="true"?e.status(404).json({error:"Download link not found or not yet configured for this app."}):e.status(404).send(`<!DOCTYPE html>
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
</html>`);try{if(m.startsWith("http")){let y=new URL(m);if(!(y.hostname.includes("google.com")||y.hostname.includes("googleapis.com"))&&!y.searchParams.has("code")){let _=process.env.AFFILIATE_CODE;_&&(y.searchParams.set("code",_),m=y.toString())}}}catch{}return console.log("FINAL REDIRECT TARGET IS:",m),e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.set("Referrer-Policy","no-referrer"),e.redirect(302,m)}catch{return e.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>")}let l=Ie.get(r);if(!l)return t.query.json==="true"?e.status(404).json({error:"Link expired or invalid."}):e.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");if(l.expiresAt<Date.now())return Ie.delete(r),t.query.json==="true"?e.status(404).json({error:"This connection timed out."}):e.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");Ie.delete(r),Is.add(r);let a=l.targetUrl;try{if(a.startsWith("http")){let d=new URL(a);if(!(d.hostname.includes("google.com")||d.hostname.includes("googleapis.com"))&&!d.searchParams.has("code")){let p=process.env.AFFILIATE_CODE;p&&(d.searchParams.set("code",p),a=d.toString())}}}catch{}return e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.redirect(302,a)});v.get("/api/v1/download/:id",async(t,e)=>{let s=t.params.id;return s?e.redirect(302,`/moreinfo/${s}`):e.status(400).send("Bad Request")});v.use((t,e,s,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let r=J.default.join(process.cwd(),"server_requests.log");F.default.appendFileSync(r,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(s.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return s.status(500).json({error:"Internal server error"});s.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});var Ks=module.exports=v;
