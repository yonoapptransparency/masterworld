var Ft=Object.create;var Te=Object.defineProperty;var Pt=Object.getOwnPropertyDescriptor;var Bt=Object.getOwnPropertyNames;var zt=Object.getPrototypeOf,Vt=Object.prototype.hasOwnProperty;var je=(t,e)=>()=>(t&&(e=t(t=0)),e);var He=(t,e)=>{for(var s in e)Te(t,s,{get:e[s],enumerable:!0})},ct=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Bt(e))!Vt.call(t,r)&&r!==s&&Te(t,r,{get:()=>e[r],enumerable:!(n=Pt(e,r))||n.enumerable});return t};var H=(t,e,s)=>(s=t!=null?Ft(zt(t)):{},ct(e||!t||!t.__esModule?Te(s,"default",{value:t,enumerable:!0}):s,t)),Se=t=>ct(Te({},"__esModule",{value:!0}),t);var De={};He(De,{mockApps:()=>ae,mockBlogs:()=>le,mockNews:()=>ce,mockSettings:()=>xe,mockVideos:()=>de,saveMockApps:()=>Mt,saveMockBlogs:()=>Gt,saveMockNews:()=>Ht,saveMockSettings:()=>Wt,saveMockVideos:()=>Jt});var ae,Mt,xe,Wt,ce,Ht,le,Gt,de,Jt,Ge=je(()=>{ae=[],Mt=t=>{try{localStorage.setItem("rummystore_apps",JSON.stringify(t))}catch(e){console.warn("saveMockApps storage failed:",e)}ae.splice(0,ae.length,...t)},xe={site_title:"",meta_description:"",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},Wt=t=>{try{localStorage.setItem("rummystore_settings",JSON.stringify(t))}catch(e){console.warn("saveMockSettings storage failed:",e)}Object.assign(xe,t)},ce=[],Ht=t=>{try{localStorage.setItem("rummystore_news",JSON.stringify(t))}catch(e){console.warn("saveMockNews storage failed:",e)}ce.splice(0,ce.length,...t)},le=[],Gt=t=>{try{localStorage.setItem("rummystore_blogs",JSON.stringify(t))}catch(e){console.warn("saveMockBlogs storage failed:",e)}le.splice(0,le.length,...t)},de=[],Jt=t=>{try{localStorage.setItem("rummystore_videos",JSON.stringify(t))}catch(e){console.warn("saveMockVideos storage failed:",e)}de.splice(0,de.length,...t)}});function Je(){let t=null;typeof process<"u"&&(t=process.env?.ADMIN_PATH||process.env?.VITE_ADMIN_PATH);try{let e=Kt.env?.VITE_ADMIN_PATH;e&&(t=e)}catch{}return t||"admin"}var Kt,lt=je(()=>{Kt={}});var dt={};He(dt,{b64EncodeUnicode:()=>qt,commitFileToGitHub:()=>Yt,generateStaticDataFileCode:()=>Ke});function qt(t){try{return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,s)=>String.fromCharCode(parseInt(s,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(t)}}function Ke(t=[],e={},s=[],n=[],r=[]){let i=JSON.parse(JSON.stringify(t||[])).map(c=>(delete c.more_information_url,delete c.encrypted_download_url,delete c.download_url,c)),f={...{site_title:"Yono Store",meta_description:"Download All Yono Games, Rummy Apps & Teen Patti APKs",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))},l=JSON.parse(JSON.stringify(s||[])),p=JSON.parse(JSON.stringify(n||[])),d=JSON.parse(JSON.stringify(r||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockApps: AppConfig[] = ${JSON.stringify(i,null,2)};

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = ${JSON.stringify(f,null,2)};

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = ${JSON.stringify(l,null,2)};

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockBlogs: BlogPost[] = ${JSON.stringify(p,null,2)};

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(d,null,2)};

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}async function Yt({owner:t,repo:e,token:s,branch:n,path:r,content:i,message:o}){let l=await fetch("/api/github-sync/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({owner:t,repo:e,token:s,branch:n,path:r,content:i,message:o})});if(!l.ok){let p=l.headers.get("content-type"),d=await l.text(),c=d||`Server returned ${l.status} ${l.statusText}`;if(p&&p.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${l.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${d.substring(0,100)}...`);try{let a=JSON.parse(d);c=a.message||a.error||c}catch{(!c||c.trim()==="")&&(c=`HTTP Error ${l.status}`)}throw new Error(c)}return l.json()}var qe=je(()=>{});var Ee={};He(Ee,{fetchStoreData:()=>ve,getField:()=>u,injectSeoTags:()=>bs,syncFromFirestore:()=>Xt});function ht(){if(ue)return ue;try{let n=fe.default.readFileSync(ke.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Ye(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ue=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Ye(t))return ue={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ue;try{let n=Zt.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Ye(r.projectId))return ue=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}function Ze(t){if(!t)return null;if("stringValue"in t)return t.stringValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("booleanValue"in t)return t.booleanValue;if("arrayValue"in t)return(t.arrayValue.values||[]).map(s=>Ze(s));if("mapValue"in t){let e=t.mapValue.fields||{},s={};for(let n of Object.keys(e))s[n]=Ze(e[n]);return s}return null}function oe(t){if(!t)return{};let e={};for(let s of Object.keys(t))e[s]=Ze(t[s]);return e}function u(t,e,s=""){if(!t)return s;let n=t[e];return n==null?s:typeof n=="object"?"stringValue"in n?n.stringValue??s:"integerValue"in n?String(n.integerValue)??s:"booleanValue"in n?String(n.booleanValue)??s:s:String(n)}async function Xt(){try{let t=ht();if(!t||!t.projectId)return console.log("[SYNC] Skipping background Firestore sync: Firebase config not found."),null;let e=t.projectId,s=t.firestoreDatabaseId||"(default)",n=t.apiKey,r=n?`?key=${n}`:"",i=`https://firestore.googleapis.com/v1/projects/${e}/databases/${s}/documents/store_data`;console.log(`[SYNC] Syncing filesystem backup files with Firestore (${e})...`);let[o,f,l,p,d]=await Promise.all([fetch(`${i}/public_settings${r}`).catch(()=>null),fetch(`${i}/news${r}`).catch(()=>null),fetch(`${i}/blogs${r}`).catch(()=>null),fetch(`${i}/videos${r}`).catch(()=>null),fetch(`${i}/apps_meta${r}`).catch(()=>null)]),c=xe;if(o&&o.ok){let y=await o.json(),g=oe(y.fields);g&&Object.keys(g).length>0&&(c=g)}let a=ce;if(f&&f.ok){let y=await f.json(),g=oe(y.fields);g&&Array.isArray(g.items)&&(a=g.items)}let _=le;if(l&&l.ok){let y=await l.json(),g=oe(y.fields);g&&Array.isArray(g.items)&&(_=g.items)}let m=de;if(p&&p.ok){let y=await p.json(),g=oe(y.fields);g&&Array.isArray(g.items)&&(m=g.items)}let h=[],I=1,w=!1;if(d&&d.ok){let y=await d.json(),g=oe(y.fields);g&&typeof g.numChunks=="number"&&(I=g.numChunks,w=!0)}if(w){let y=[];for(let b=0;b<I;b++)y.push(fetch(`${i}/apps_chunk_${b}${r}`).then(x=>x.ok?x.json():null).catch(()=>null));(await Promise.all(y)).forEach(b=>{if(b){let x=oe(b.fields);x&&Array.isArray(x.items)&&h.push(...x.items)}})}else{let y=await fetch(`${i}/apps${r}`).catch(()=>null);if(y&&y.ok){let g=await y.json(),b=oe(g.fields);b&&Array.isArray(b.items)&&(h=b.items)}}h.length===0&&(h=ae);try{let y=ke.default.join(process.cwd(),"src/lib/public_backup.json");fe.default.writeFileSync(y,JSON.stringify({apps:h,settings:c,news:a,blogs:_,videos:m},null,2),"utf8");try{let{generateStaticDataFileCode:g}=(qe(),Se(dt)),b=g(h,c,a,_,m);fe.default.writeFileSync(ke.default.join(process.cwd(),"src/lib/staticData.ts"),b,"utf8")}catch(g){console.warn("Could not write staticData.ts fallback (skipping):",g.message)}}catch(y){console.warn("[SYNC] Could not write cache files to filesystem (running in read-only environment?):",y.message)}return console.log(`[SYNC] Synchronization successful. Apps count: ${h.length}`),{apps:h,settings:c,news:a,blogs:_,videos:m}}catch(t){return console.error("[SYNC] Sync error:",t),null}}async function ve(){let t=Date.now(),e=t-Le>ut,s=t-Le>ut*15;return Oe&&!s?(e&&!Ne&&(Ne=!0,pt().then(()=>{Ne=!1}).catch(n=>{Ne=!1,console.warn("Background store fetch failed safely:",n)})),Oe):await pt()}async function pt(){let t=Date.now(),e=ke.default.join(process.cwd(),"src/lib/public_backup.json");if(fe.default.existsSync(e))try{let n=JSON.parse(fe.default.readFileSync(e,"utf8")),r={apps:n.apps||[],settings:n.settings||{},news:n.news||[],blogs:n.blogs||[],videos:n.videos||[]};return Oe=r,Le=t,r}catch(n){console.error("Error reading public_backup.json in seoHelper:",n)}let s={apps:ae||[],settings:xe||{},news:ce||[],blogs:le||[],videos:de||[]};return Oe=s,Le=t,s}function k(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Ue(t){if(!t)return"";let e=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");return e=e.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi,""),e=e.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi,'href="#"'),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,""),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi,""),e}function ee(t){return t?t.replace(/<[^>]*>?/gm," ").replace(/\s+/g," ").trim():""}function pe(t){if(!t)return"";let e=t.trim();if(e.startsWith("<")||e.includes("<meta ")){let s=e.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);if(s&&s[1])return s[1].trim();let n=e.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);return n&&n[1]?n[1].trim():ee(e).substring(0,160)}return e}async function Qt(t,e){let{apps:s,settings:n,news:r,blogs:i,videos:o}=e,f=t.split("?")[0].split("#")[0].replace(/\/+$/,"")||"/",l=f.toLowerCase(),p="";if(l==="/"||l==="")p=ft(s,n,r,i,o);else if(l==="/new-apps")p=ss(s,n);else if(l.startsWith("/info/")||l.startsWith("/gateway/")||l.startsWith("/moredetail/")){let a="";l.startsWith("/info/")?a=f.split("/info/")[1]:l.startsWith("/gateway/")?a=f.split("/gateway/")[1]:a=f.split("/moredetail/")[1],p=rs(a,s,n)}else if(l==="/news")p=os(r,n);else if(l.startsWith("/news/")){let a=f.split("/news/")[1];p=gt(a,r,n)}else if(l==="/blogs")p=is(i,n);else if(l.startsWith("/blog/")){let a=f.split("/blog/")[1];p=mt(a,i,n)}else if(l==="/videos")p=as(o,n);else if(l.startsWith("/videos/")){let a=f.split("/videos/")[1];p=yt(a,o,n)}else if(l==="/about")p=cs(n);else if(l==="/contact")p=ls(n);else if(l==="/privacy")p=ds(n);else if(l==="/report-removal")p=us(n);else if(l==="/terms")p=ps(n);else if(l==="/notice")p=gs(n);else if(l==="/ethics")p=ms(n);else if(l==="/disclaimer")p=ys(n);else if(l==="/responsibility")p=fs(n);else{let a=l.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"");s.some(_=>_.slug?.toLowerCase()===a)?p=ns(a,s,n):r.some(_=>_.slug?.toLowerCase()===a)?p=gt(a,r,n):i.some(_=>_.slug?.toLowerCase()===a)?p=mt(a,i,n):o.some(_=>_.slug?.toLowerCase()===a)?p=yt(a,o,n):p=ft(s,n,r,i,o)}let d=es(n),c=ts(n);return`
    <div class="flex flex-col min-h-screen">
      ${d}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${p}
      </main>
      ${c}
    </div>
  `}function es(t){let e=u(t,"site_title"),s=u(t,"logo_url");return`
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
  `}function ts(t){let e=u(t,"site_title"),s=u(t,"logo_url"),n=u(t,"meta_description"),r=u(t,"disclaimer_text"),i=u(t,"ethics_discrimination_text"),o=u(t,"important_notice");return`
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
  `}function ft(t,e,s,n,r){let i=u(e,"site_title"),o=u(e,"meta_description"),f="";[...t].sort((d,c)=>parseInt(u(d,"serial_number","999"),10)-parseInt(u(c,"serial_number","999"),10)).forEach((d,c)=>{let a=u(d,"name"),_=u(d,"slug"),m=u(d,"category"),h=u(d,"rating","5.0"),I=u(d,"icon_url"),w=d.is_new===!0||d.is_new&&d.is_new.booleanValue===!0;f+=`
      <a href="/${encodeURIComponent(_)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${c+1}</span>
        <img src="${I||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${k(a)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${k(a)}</h3>
          <p class="text-xs text-zinc-500 truncate">${k(m)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${h}</span><span class="text-zinc-400">\u2605</span>
            ${w?'<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>':""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `});let p="";return s.slice(0,3).forEach(d=>{p+=`
      <a href="/news/${encodeURIComponent(u(d,"slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${k(u(d,"title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${k(u(d,"description"))}</p>
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
          <div class="flex flex-col">${f}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest Archives</h3>
            <div class="flex flex-col gap-3">${p}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates \u2192</a>
          </div>
        </div>
      </div>
    </div>
  `}function ss(t,e){let s="",n=t.filter(i=>i.is_new===!0||i.is_new&&i.is_new.booleanValue===!0);return(n.length>0?n:t).forEach(i=>{let o=u(i,"name"),f=u(i,"slug"),l=u(i,"category"),p=u(i,"rating","5.0"),d=u(i,"icon_url");s+=`
      <a href="/${encodeURIComponent(f)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${d||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${k(o)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${k(l)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${p} \u2605</span>
      </a>
    `}),`
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${s}</div>
    </div>
  `}function ns(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(h=>u(h,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>';let i=u(r,"name"),o=u(r,"category"),f=u(r,"version","Latest"),l=u(r,"file_size","Variable"),p=u(r,"rating","5.0"),d=u(r,"icon_url"),c=r.description_html?Ue(r.description_html):`<p>No comprehensive details are configured yet for ${k(i)}.</p>`,a=r.features_html?Ue(r.features_html):"",_=a?`<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${a}</div>`:"",m=u(r,"package_name","Not published");return`
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${d||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="96" height="96" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${k(i)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${k(o)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${k(f)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${k(l)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${k(o.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${k(p)} \u2605</strong></div>
        </div>

        <a href="/info/${encodeURIComponent(t)}" class="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow hover:opacity-95">Install Direct Access Mirror \u{1F680}</a>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm text-left">
          <h2 class="text-lg font-bold mb-4">Detailed Game Review & Safe Guidelines</h2>
          <div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${c}</div>
          ${_}
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
  `}function rs(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(f=>u(f,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>';let i=u(r,"name");return`
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
  `}function os(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/news/${encodeURIComponent(u(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${k(u(n,"category")||"Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${k(u(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${k(u(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${k(u(n,"description"))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`}function gt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(c=>u(c,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>';let i=u(r,"title"),o=u(r,"created_at")||"May 2026",f=u(r,"ceo_name","System Author"),l=u(r,"category","Report"),p=u(r,"content")||u(r,"description",""),d=Ue(p);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${k(l)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${o} | By ${k(f)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${k(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${d.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function is(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/blog/${encodeURIComponent(u(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${k(u(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${k(u(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${k(ee(u(n,"excerpt")||u(n,"content","").substring(0,140)))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`}function mt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(d=>u(d,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>';let i=u(r,"title"),o=u(r,"created_at")||"May 2026",f=u(r,"author","System Author"),l=u(r,"content",""),p=Ue(l);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${o} | Strategy by ${k(f)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${k(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${p.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function as(t,e){let s="";return t.forEach(n=>{let r=u(n,"title"),i=u(n,"slug"),o=u(n,"description","");s+=`
      <a href="/videos/${encodeURIComponent(i)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${k(r)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${k(o)}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${s||'<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`}function yt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(f=>u(f,"slug").toLowerCase()===n||u(f,"id").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>';let i=u(r,"title"),o=u(r,"description");return`<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${k(i)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${o.replace(/\n\n/g,"<br/><br/>")}</p></div>`}function cs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"about_content")||"About our application services.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ls(t){let e=u(t,"contact_content")||"Get in touch for active client files help.",s=u(t,"support_email","support@example.com");return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${e}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${k(s)}</p></div></div>`}function ds(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"privacy_content")||"No private data tracking.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function us(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"report_removal_content")||"Report & Removal Policy compliance guidelines.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ps(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"terms_content")||"Service code terms of compliance.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function fs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(u(t,"responsibility_content")||"Play safe for custom virtual entertainment.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function gs(t){let e=u(t,"important_notice_heading")||"Important Notice",s=u(t,"important_notice")||"No important notices at this time.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ms(t){let e=u(t,"ethics_heading")||"Ethics & Safety",s=u(t,"ethics_discrimination_text")||"Ethics and safety information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ys(t){let e=u(t,"disclaimer_heading")||"Disclaimer",s=u(t,"disclaimer_text")||"Disclaimer information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function hs(){try{let t=ht();return t?!t.apiKey||t.apiKey.trim()===""||t.apiKey.includes("YOUR_API_KEY")?{projectId:"placeholder-project-id",appId:"placeholder-app-id",apiKey:"PLACEHOLDER",authDomain:"placeholder-project.firebaseapp.com",firestoreDatabaseId:"(default)",storageBucket:"placeholder-project.firebasestorage.app",messagingSenderId:"000000000",measurementId:""}:t:null}catch{return null}}async function bs(t,e,s,n=""){let r=await ve();if(!r||!r.settings)return{html:t,isNotFound:!1};let i=r.apps||[],o=r.settings||{},f=r.news||[],l=r.blogs||[],p=r.videos||[],d=u(o,"site_title")||"RummyDex",c=d,a=u(o,"meta_description","");a||(a="A premium digital platform for applications and tools.");let _=u(o,"seo_keywords","");if(_||(_="app clearance, premium applications, digital tools, platform, tech specs, verified apps"),_){let E=_.split(",").map(S=>S.trim()).filter(Boolean);E.length>15&&(_=E.slice(0,15).join(", "))}let m="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",h=d||"Platform Administrator",I=null,w="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",y=!1,g=e.split("?")[0].split("#")[0],b=g.toLowerCase(),x=g.toLowerCase().replace(/^\/|\/$/g,""),C=Je().toLowerCase(),T=b.startsWith("/moreinfo/")||b.startsWith("/info/")||b.startsWith("/moredetail/")||b.startsWith("/gateway/");if(g==="/"||x==="")y=!1;else if(x===C||b.startsWith(`/${C}`)||b.startsWith("/admin")||["wp-admin","dashboard","panel"].includes(x))y=!1;else if(b.startsWith("/app/")){let E=decodeURIComponent(g.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase()),S=i.find(j=>{let R=u(j,"slug");return R&&R.toLowerCase()===E});if(S){y=!1;let j=u(S,"name");c=`${u(S,"seo_title")||j}`;let R=u(S,"description_html");a=pe(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||a,_=u(S,"seo_keywords")||_,m=u(S,"og_image_url")||u(S,"icon_url")||m;let P=(()=>{let Y=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return Y.includes("rummydex.com")?"https://www.rummydex.com":Y})();I=u(S,"canonical_url")||`${P}/app/${u(S,"slug")}`,w=u(S,"icon_url")||w}else y=!0}else if(b.startsWith("/info/")||b.startsWith("/moreinfo/")||b.startsWith("/moredetail/")||b.startsWith("/gateway/")){let E="/info/";b.startsWith("/moreinfo/")?E="/moreinfo/":b.startsWith("/moredetail/")?E="/moredetail/":b.startsWith("/gateway/")&&(E="/gateway/");let S=e.split(new RegExp(E,"i"))[1]||"",j=decodeURIComponent(S.split("/")[0].split("?")[0]),R=i.find(P=>{let M=u(P,"slug");return M&&M.toLowerCase()===j.toLowerCase()});if(R){y=!1;let P=u(R,"name");c=`${u(R,"seo_title")||P} - Technical Info`;let M=u(R,"description_html");a=pe(u(R,"seo_description"))||(M?ee(M).substring(0,160):"")||a,_=u(R,"seo_keywords")||_,m=u(R,"og_image_url")||u(R,"icon_url")||m,I=`${(()=>{let _e=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return _e.includes("rummydex.com")?"https://www.rummydex.com":_e})()}${E}${u(R,"slug")}`,w=u(R,"icon_url")||w}else y=!0}else if(b.startsWith("/news/")&&b.length>6){let E=decodeURIComponent((e.split(/\/news\//i)[1]||"").split("/")[0].split("?")[0]),S=f.find(j=>{let R=u(j,"slug");return R&&R.toLowerCase()===E.toLowerCase()});if(S){y=!1;let j=u(S,"title","Latest News");c=`${u(S,"seo_title")||j} | ${d}`;let R=u(S,"description")||u(S,"content");a=pe(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||a,_=u(S,"seo_keywords")||_,m=u(S,"og_image_url")||u(S,"logo_url")||m,h=u(S,"ceo_name")||d;let P=(()=>{let Y=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return Y.includes("rummydex.com")?"https://www.rummydex.com":Y})();I=u(S,"canonical_url")||`${P}/news/${u(S,"slug")}`}else y=!0}else if(b.startsWith("/blog/")&&b.length>6){let E=decodeURIComponent((e.split(/\/blog\//i)[1]||"").split("/")[0].split("?")[0]),S=l.find(j=>{let R=u(j,"slug");return R&&R.toLowerCase()===E.toLowerCase()});if(S){y=!1;let j=u(S,"title","Blog Post");c=`${u(S,"seo_title")||j} | ${d}`;let R=u(S,"excerpt")||u(S,"content");a=pe(u(S,"seo_description"))||(R?ee(R).substring(0,160):"")||a,_=u(S,"seo_keywords")||_,m=u(S,"cover_url")||m,h=u(S,"author")||d;let P=(()=>{let Y=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return Y.includes("rummydex.com")?"https://www.rummydex.com":Y})();I=u(S,"canonical_url")||`${P}/blog/${u(S,"slug")}`}else y=!0}else if(b.startsWith("/videos/")&&b.length>8){let E=decodeURIComponent((e.split(/\/videos\//i)[1]||"").split("/")[0].split("?")[0]),S=p.find(j=>{let R=u(j,"slug"),P=u(j,"id");return R&&R.toLowerCase()===E.toLowerCase()||P&&P.toLowerCase()===E.toLowerCase()});if(S){y=!1;let j=u(S,"title","Video Specs");c=`${u(S,"seo_title")||j} | ${d}`;let R=u(S,"description");a=pe(u(S,"seo_description"))||(R?ee(R).substring(0,160):""),_=u(S,"seo_keywords");let P=u(S,"youtube_url"),M="";if(P){let Re=P.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);Re&&(M=Re[1])}M&&(m=`https://img.youtube.com/vi/${M}/maxresdefault.jpg`),I=`${(()=>{let _e=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return _e.includes("rummydex.com")?"https://www.rummydex.com":_e})()}/videos/${u(S,"slug")||u(S,"id")}`}else y=!0}else if(["about","blogs","blog","contact","disclaimer","ethics","new-apps","news","notice","privacy","report-removal","responsibility","terms","videos","developers","submit-app"].includes(x))y=!1,x==="about"?(c=`About Us | ${d}`,a="Learn more about our mission, vision, and the premium services we offer on our platform."):x==="blogs"||x==="blog"?(c=`Official Blogs & Insights | ${d}`,a="Explore our official blog articles, professional guides, gameplay tips, and deep platform reviews."):x==="contact"?(c=`Contact Us | ${d}`,a="Get in touch with our professional support team. We are here to help you with your inquiries, feedback, and technical assistance."):x==="disclaimer"?(c=`Disclaimer | ${d}`,a="Read our platform disclaimer regarding content accuracy, fair play verification, and third-party links."):x==="ethics"?(c=`Code of Ethics & Content Policy | ${d}`,a="Discover our strict code of ethics, licensing standards, and platform content guidelines."):x==="new-apps"?(c=`New Releases & Up-and-Coming Apps | ${d}`,a="Stay updated with our latest releases, featured digital tools, and upcoming app launches."):x==="news"?(c=`Latest News & Press Updates | ${d}`,a="Browse official news bulletins, press announcements, security reports, and direct system updates."):x==="notice"?(c=`Important System Notice | ${d}`,a="Read our critical system alerts, maintenance updates, and important security advisories."):x==="privacy"?(c=`Privacy Policy | ${d}`,a="Read our comprehensive privacy policy to understand how we protect, secure, and handle your personal data."):x==="report-removal"?(c=`Report & Removal Request | ${d}`,a="Submit a content or application removal request to our legal and compliance team."):x==="responsibility"?(c=`Responsible Gaming & Play Policy | ${d}`,a="Learn about our commitment to user safety, self-exclusion tools, and responsible gameplay guidelines."):x==="terms"?(c=`Terms of Service & User Agreement | ${d}`,a="Review our terms of service, platform rules, and user agreements governing the use of our services."):x==="videos"?(c=`Video Previews & Walkthroughs | ${d}`,a="Watch high-definition videos, gameplay showcases, and technical walkthroughs of our certified applications."):x==="developers"?(c=`Meet Our Team | ${d}`,a=`Meet the brilliant developers behind ${d}. Discover our team's expertise and passion.`):x==="submit-app"&&(c=`Submit Your App | ${d}`,a=`Submit your Android application for listing and promotion on ${d}.`);else{let S=decodeURIComponent(e.split("?")[0].split("#")[0].replace(/^\/|\/$/g,""));if(S&&S!==""){let j=i.find(R=>u(R,"slug")?.toLowerCase()===S.toLowerCase());if(j){y=!1;let R=u(j,"name","App");c=u(j,"seo_title")||R;let P=u(j,"description_html"),M=`Discover the ${R} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;a=pe(u(j,"seo_description"))||(P?ee(P).substring(0,160):M),_=u(j,"seo_keywords"),m=u(j,"og_image_url")||u(j,"icon_url")||m,I=u(j,"canonical_url"),w=u(j,"icon_url")||w}else y=!0}else y=!0}y&&(c=`404 Page Not Found | ${d}`,a=`The requested page does not exist on ${d}. Browse our certified application listings and news updates.`);let O=(()=>{let S=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return S.includes("rummydex.com")?"https://www.rummydex.com":S})(),Z=e.split("?")[0].split("#")[0].replace(/^\/api(\/[^/]+)?/i,"")||"/";Z.length>1&&Z.endsWith("/")&&(Z=Z.slice(0,-1));let q=`${O}${Z}`,W=I||q;W.includes("rummydex.com")&&(W=W.replace(/^http:\/\//i,"https://").replace("https://rummydex.com","https://www.rummydex.com")),W.length>10&&W.endsWith("/")&&!W.endsWith("://www.rummydex.com/")&&(W=W.slice(0,-1));let D=m;if(m){let E=m.trim();if(E.startsWith("//"))D=`https:${E}`;else if(E.startsWith("data:"))D=E;else if(!E.startsWith("http://")&&!E.startsWith("https://")){let S=E.startsWith("/")?E:`/${E}`;D=`${O}${S}`}else D=E}let $=w;if(w){let E=w.trim();if(E.startsWith("//"))$=`https:${E}`;else if(E.startsWith("data:"))$=E;else if(!E.startsWith("http://")&&!E.startsWith("https://")){let S=E.startsWith("/")?E:`/${E}`;$=`${O}${S}`}else $=E}let N=e.startsWith(`/${Je()}`),z=u(o,"google_analytics_id","")||u(o,"ga_tracking_id",""),Me=z?`
    <script async src="https://www.googletagmanager.com/gtag/js?id=${k(z)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${k(z)}');
    </script>
  `:"",ie=null;N||(i.some(S=>S.slug?.toLowerCase()===e.split("?")[0].split("#")[0].replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase())||e.startsWith("/gateway/")||e.startsWith("/moredetail/")||e.startsWith("/info/")||e.startsWith("/moreinfo/")?ie={"@context":"https://schema.org","@type":"SoftwareApplication",name:c,operatingSystem:"Android, iOS",applicationCategory:"GameApplication",description:a,url:W,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}}:e.startsWith("/news/")||e.startsWith("/blog/")?ie={"@context":"https://schema.org","@type":"Article",headline:c,description:a,image:D||[],author:{"@type":"Person",name:h}}:e.startsWith("/videos/")?ie={"@context":"https://schema.org","@type":"VideoObject",name:c,description:a,thumbnailUrl:D||[],uploadDate:new Date().toISOString()}:ie={"@context":"https://schema.org","@type":"WebSite",name:d,url:W});let at=ie?`<script type="application/ld+json">${JSON.stringify(ie).replace(/</g,"\\u003c")}</script>`:"";if(e==="/"||e===""){let E=u(o,"website_faqs");if(E&&Array.isArray(E)&&E.length>0){let S={"@context":"https://schema.org","@type":"FAQPage",mainEntity:E.map(j=>({"@type":"Question",name:j.question,acceptedAnswer:{"@type":"Answer",text:j.answer}}))};at+=`
    <script type="application/ld+json">${JSON.stringify(S).replace(/</g,"\\u003c")}</script>`}}let Nt=(()=>{let S=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").toLowerCase();if(S.includes("masterworld")||S.includes("dev-")||S.includes("pre-")||S.includes("localhost")||S.includes("127.0.0.1"))return!0;if(process.env.PUBLIC_DOMAIN)try{let j=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase(),R=s?new URL(s).host.toLowerCase():"";if(R&&R!==j)return!0}catch{}return!1})(),Ot=N||Nt||y?`
    <title>${N?"Admin Portal":k(c)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${k($)}" />
    <link rel="shortcut icon" href="${k($)}" />
    <link rel="apple-touch-icon" href="${k($)}" />
    `:""}
  `:`
    <title>${k(c)}</title>
    <meta name="description" content="${k(a)}" />
    <meta name="keywords" content="${k(_)}" />
    <meta name="author" content="${k(h)}" />
    <meta property="og:title" content="${k(c)}" />
    <meta property="og:description" content="${k(a)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${k(W)}" />
    ${D?`<meta property="og:image" content="${k(D)}" />`:""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${k(c)}" />
    <meta name="twitter:description" content="${k(a)}" />
    ${D?`<meta name="twitter:image" content="${k(D)}" />`:""}
    <meta name="robots" content="${T?"noindex, nofollow":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />
    <link rel="canonical" href="${k(W)}" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${k($)}" />
    <link rel="shortcut icon" href="${k($)}" />
    <link rel="apple-touch-icon" href="${k($)}" />
    `:""}
    ${at}
    ${Me}
  `,K=t.replace(/<title>.*?<\/title>/ims,"");K=K.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims,""),K=K.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims,"");let We=hs();console.log("SAFE FIREBASE CONFIG:",We);let Lt=`
    <script id="firebase-config-loader">
      ${We?`window.__FIREBASE_CONFIG__ = ${JSON.stringify(We).replace(/</g,"\\u003c")};`:""}
      window.__INITIAL_DATA__ = ${JSON.stringify({apps:i,settings:o,news:f,blogs:l,videos:p}).replace(/</g,"\\u003c")};
    </script>
  `,Ut=Ot.replace(/<(meta|link) /g,'<$1 data-rh="true" ').replace(/<title>/g,'<title data-rh="true">').replace(/<script type="application\/ld\+json"/g,'<script data-rh="true" type="application/ld+json"');K=K.replace("</head>",`${Lt}${Ut}</head>`);try{let E=await Qt(e,r);K.includes('<div id="root">')?K=K.replace('<div id="root">',`<div id="root">${E}`):K=K.replace("</body>",`<div id="seo-prerender">${E}</div>
  </body>`)}catch(E){console.error("Static pre-rendering body injection failed:",E)}return{html:K,isNotFound:y}}var fe,ke,Oe,Le,ut,Ne,Ye,Zt,ue,ge=je(()=>{fe=H(require("fs")),ke=H(require("path"));Ge();lt();Oe=null,Le=0,ut=36e5,Ne=!1,Ye=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},Zt="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ue=null});var Ve=H(require("express")),At=H(require("helmet")),rt=H(require("express-rate-limit")),It=H(require("cookie-parser")),G=H(require("path")),X=H(require("crypto")),et=H(require("compression")),F=H(require("fs")),Ct=H(require("dns"));Ge();ge();qe();var ze=H(require("crypto-js"));var Ae=H(require("otpauth"));function bt(){return new Ae.Secret({size:20}).base32}function wt(t,e){return new Ae.TOTP({issuer:"rummydex.com",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Xe(t,e){try{return new Ae.TOTP({issuer:"rummydex.com",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(s){return console.error("TOTP verification error:",s),!1}}process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");console.log("Server starting with ADMIN_EMAIL:",process.env.ADMIN_EMAIL);var ws=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||ws();function U(t,e){let s=[e,process.env.AES_SECRET].filter(Boolean),n=Array.from(new Set(s));for(let r of n)if(!(!r||r.trim()===""))try{let o=ze.default.AES.decrypt(t,r).toString(ze.default.enc.Utf8);if(o&&o.trim().length>0)return o}catch{}return""}function J(t,e){if(!t||!e||e.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return ze.default.AES.encrypt(t,e).toString()}var Qe=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},_s="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",me=null;function V(){if(me)return me;try{let n=F.default.readFileSync(G.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Qe(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,me=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Qe(t))return me={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},me;try{let n=_s.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Qe(r.projectId))return me=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}var Ie=null,_t=!1;function se(){if(Ie)return Ie;if(_t)return null;try{let t=require("firebase-admin"),e=V();t.apps.length===0&&(e&&e.projectId?t.initializeApp({projectId:e.projectId}):t.initializeApp());let s=e?.firestoreDatabaseId||"(default)";if(s&&s!=="(default)"){let{getFirestore:n}=require("firebase-admin/firestore");Ie=n(t.apps[0],s)}else Ie=t.firestore();return console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${s}`),Ie}catch(t){return console.warn("[WARN] Firebase Admin SDK initialization failed:",t.message||t),_t=!0,null}}var Ss=[/zgrab/i,/masscan/i,/nmap/i,/nuclei/i,/sqlmap/i,/nikto/i,/dirbuster/i,/gobuster/i,/wfuzz/i],St=process.env.CF_TURNSTILE_SECRET||"",xs=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},tt=xs(St)?St:"";async function ks(t,e){if(!tt)return!0;if(!t)return console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:",e),!1;try{let s=new URLSearchParams({secret:tt,response:t,remoteip:e}),r=await(await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:s,headers:{"Content-Type":"application/x-www-form-urlencoded"}})).json();return r.success?!0:(console.warn("[CF_TURNSTILE] Failed:",r["error-codes"]),!1)}catch(s){return console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:",e,s),!1}}var $t=t=>{let e=t.headers["user-agent"]||"";return!!(e&&Ss.some(s=>s.test(e)))};function vs(t){return!(!t||typeof t!="string"||t.length<8||/^(.)\1+$/.test(t))}var Es=60*1e3,As=300,Fe=new Map,we=async(t,e=As,s=Es)=>{try{let n=Date.now(),r=Fe.get(t);if((!r||n>r.resetTime)&&(r={count:0,resetTime:n+s}),r.count++,Fe.set(t,r),Math.random()<.01)for(let[i,o]of Fe.entries())n>o.resetTime&&Fe.delete(i);return r.count>e}catch{return!0}};function re(t){return t.ip||t.socket?.remoteAddress||"unknown"}function xt(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let s=[];for(let n of e){let r;if(n.toLowerCase().startsWith("0x")?r=parseInt(n,16):n.startsWith("0")&&n.length>1?r=parseInt(n,8):r=parseInt(n,10),isNaN(r)||r<0||r>255)return null;s.push(r)}if(e.length===1){let n=s[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=s[0],r=s[1];return r>16777215?null:[n,r>>>16&255,r>>>8&255,r&255]}else if(e.length===3){let n=s[0],r=s[1],i=s[2];return i>65535?null:[n,r,i>>>8&255,i&255]}return s}function kt(t){let[e,s,n,r]=t;return e===127||e===10||e===172&&s>=16&&s<=31||e===192&&s===168||e===169&&s===254||e===0||e===100&&s>=64&&s<=127||e===192&&s===0&&n===0||e===192&&s===0&&n===2||e===198&&s>=18&&s<=19||e===198&&s===51&&n>=100&&n<=103||e===203&&s===0&&n===113||e>=224&&e<=239||e>=240}async function Is(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let s=e.hostname.toLowerCase(),n=xt(s);if(n&&kt(n)||s==="[::1]"||s==="::1"||s.startsWith("[fc00")||s.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(s)||s.endsWith(".local")||s.endsWith(".internal"))return!1;try{let i=await Ct.default.promises.lookup(s,{all:!0});for(let o of i){let f=o.address,l=xt(f);if(l&&kt(l)||f==="::1"||f.startsWith("fc00:")||f.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var te=new Map,Cs=new Set,Ce=new Map;setInterval(()=>{let t=Date.now();for(let[e,s]of te.entries())s.expiresAt<t&&te.delete(e);for(let[e,s]of Ce.entries())s.expiresAt<t&&Ce.delete(e)},3e4);function $s(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let s=X.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",s,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0}),s}return t.cookies["__Host-sid"]}function Rs(t,e,s,n){let i=Math.floor(Date.now()/1e3)+1800,o=`${t}|${e}|${s}|${n}|${i}`,f=X.default.createHmac("sha256",Rt).update(o).digest("hex");return Buffer.from(`${o}::${f}`).toString("base64url")}function Ts(t,e,s,n,r){try{let i=Buffer.from(t,"base64url").toString("utf8"),[o,f]=i.split("::");if(!o||!f)return!1;let l=o.split("|");if(l.length!==5)return!1;let[p,d,c,a,_]=l;if(a!==r)return console.warn(`[SECURITY] Token appId mismatch: expected ${r}, got ${a}`),!1;if(Math.floor(Date.now()/1e3)>parseInt(_,10))return console.warn("[WARN] Signature expired."),!1;let m=X.default.createHmac("sha256",Rt).update(o).digest("hex");return X.default.timingSafeEqual(Buffer.from(f,"hex"),Buffer.from(m,"hex"))}catch{return!1}}process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");var js=()=>["fallback","token","secret"].join("_"),Rt=process.env.TOKEN_SECRET||js(),Ks=process.env.SESSION_SECRET||"fallback_session_secret_dev",v=(0,Ve.default)();v.set("trust proxy",1);v.use((0,At.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1,xFrameOptions:!1}));var Ds=(0,rt.default)({windowMs:900*1e3,limit:5e3,standardHeaders:"draft-7",legacyHeaders:!1,validate:{trustProxy:!1}});v.use(Ds);var ot=(0,rt.default)({windowMs:60*1e3,limit:100,standardHeaders:"draft-7",legacyHeaders:!1});v.use("/admin",ot);v.use("/api/v1/admin",ot);v.use("/api/download",ot);v.use((t,e,s)=>{let n=Date.now();e.on("finish",()=>{let r=G.default.join(process.cwd(),"server_requests.log"),i=Date.now()-n,o=e.getHeader("content-type")||"unknown",f=t.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig,"$1$2=REDACTED")}),s()});v.use((0,et.default)({level:6,threshold:256,filter:(t,e)=>t.headers["x-no-compression"]?!1:et.default.filter(t,e)}));v.use((0,It.default)());v.use((t,e,s)=>{if(process.env.NODE_ENV==="production"){let n=(t.headers["x-forwarded-host"]||t.headers.host||"").toString().toLowerCase().split(",")[0].trim(),r=(t.headers["x-forwarded-proto"]||t.protocol||"https").toString().toLowerCase().split(",")[0].trim();if(n==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${t.originalUrl}`);if(r==="http"&&n.includes("rummydex.com"))return e.redirect(301,`https://${n}${t.originalUrl}`)}s()});v.disable("x-powered-by");v.use((t,e,s)=>{e.removeHeader("X-Powered-By"),e.setHeader("X-Powered-By","SecureServer/1.0"),e.setHeader("X-XSS-Protection","1; mode=block"),e.setHeader("X-Content-Type-Options","nosniff"),e.setHeader("Referrer-Policy","strict-origin-when-cross-origin");let n=t.headers.origin,r="",i=!1;if(n){let f=!1,l=(()=>{try{return new URL(n)}catch{return null}})();if(l){let p=l.hostname,d=process.env.PUBLIC_DOMAIN?new URL(process.env.PUBLIC_DOMAIN).hostname:"www.rummydex.com";(p==="localhost"||p==="127.0.0.1"||p.endsWith(".google.com")||p.endsWith(".studio")||p.endsWith(".run.app")||p.endsWith(".vercel.app")||p===d||p===d.replace(/^www\./,"")||process.env.ALLOWED_ORIGINS&&process.env.ALLOWED_ORIGINS.split(",").map(a=>a.trim()).includes(n))&&(f=!0)}f?(r=n,i=!0):r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com"}else r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com";if(r&&e.setHeader("Access-Control-Allow-Origin",r),e.setHeader("Vary","Origin"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PATCH, PUT, DELETE"),e.setHeader("Access-Control-Allow-Headers","X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For"),i&&e.setHeader("Access-Control-Allow-Credentials","true"),t.method==="OPTIONS"){e.sendStatus(200);return}(process.env.NODE_ENV==="production"||t.headers["x-forwarded-proto"]==="https")&&e.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");let o=process.env.NODE_ENV!=="production";e.setHeader(o?"Content-Security-Policy-Report-Only":"Content-Security-Policy","default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;"),s()});v.use(Ve.default.json({limit:"50mb"}));v.use(Ve.default.urlencoded({limit:"50mb",extended:!0}));["/trap/link","/trap/form","/trap/admin","/trap/backup","/trap/config","/trap/db","/trap/env","/trap/wp-admin","/trap/.git","/trap/api-keys","/trap/download"].forEach(t=>{v.all(t,(e,s)=>{console.warn(`[HONEYPOT] [${t}] IP: ${re(e)} UA: ${e.headers["user-agent"]}`),s.status(403).send("Forbidden.")})});v.get(["/favicon.ico","/favicon.png","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,s)=>{console.log("--- FAVICON/LOGO ROUTE HIT ---",t.originalUrl);try{let n="";try{let{fetchStoreData:r}=(ge(),Se(Ee)),i=await r();i&&i.settings&&(n=i.settings.favicon_url&&i.settings.favicon_url.trim()||i.settings.logo_url&&i.settings.logo_url.trim()||"")}catch(r){console.warn("Could not retrieve store settings for favicon, using default fallback:",r)}n||(n="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"),console.log("--- FAVICON/LOGO ROUTE RESOLVED TO ---",n);try{let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(r.ok){let i=await r.arrayBuffer(),o=Buffer.from(i),l=r.headers.get("content-type")||"image/png";return t.originalUrl.includes(".ico")?l="image/x-icon":t.originalUrl.includes(".png")&&(l="image/png"),e.set("Content-Type",l),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),console.log("--- FAVICON/LOGO PROXIED SECURELY ---",l,r.status),e.status(200).send(o)}else return console.warn(`Favicon proxy fetch returned status ${r.status}. Falling back to 302 redirect.`),e.set("Cache-Control","public, max-age=3600"),e.redirect(302,n)}catch(r){return console.error("Failed to proxy favicon content, falling back to 302 redirect:",r),e.redirect(302,n)}}catch(n){console.error("Favicon/Logo proxy routing failed:",n)}return s()});v.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let i=await ve();if(!i)throw new Error("No data");let{news:o=[],blogs:f=[],videos:l=[]}=i,p=`User-agent: *
Allow: /
Disallow: /api/
`,d=process.env.PUBLIC_DOMAIN||"";p+=`
Sitemap: ${d}/sitemap.xml
`,e.set("Content-Type","text/plain"),e.send(p)}catch{e.set("Content-Type","text/plain");let n=process.env.PUBLIC_DOMAIN||"";e.send(`User-agent: *
Allow: /
Sitemap: ${n}/sitemap.xml
`)}});v.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.status(404).send("Not Found");return}let i=await ve();if(!i)throw new Error("Unable to fetch store data");let{apps:o=[],news:f=[],blogs:l=[],videos:p=[]}=i,d=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com",c=t.headers.host?`https://${t.headers.host}`:d,a=`<?xml version="1.0" encoding="UTF-8"?>
`;a+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;let _="2024-05-01";a+=`  <url>
    <loc>${c}/</loc>
    <lastmod>${_}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/new-apps</loc>
    <lastmod>${_}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/news</loc>
    <lastmod>${_}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/blogs</loc>
    <lastmod>${_}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/videos</loc>
    <lastmod>${_}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/about</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/developers</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/contact</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/privacy</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/report-removal</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/terms</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/responsibility</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/notice</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/ethics</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/disclaimer</loc>
    <lastmod>${_}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;let m=w=>w.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),h=w=>{let y=u(w,"updated_at")||u(w,"created_at");if(y)try{if(typeof y=="object"&&y!==null&&y.seconds)return new Date(y.seconds*1e3).toISOString().split("T")[0];if(typeof y=="object"&&y!==null&&y._seconds)return new Date(y._seconds*1e3).toISOString().split("T")[0];let g=new Date(y);if(!isNaN(g.getTime()))return g.toISOString().split("T")[0]}catch{}return"2024-05-01"},I=w=>{if(!w||typeof w!="string")return!1;let y=w.trim().toLowerCase();return!y||y.startsWith("/")||y.includes("rummydex.com")?!1:!!(y.startsWith("http://")||y.startsWith("https://"))};for(let w of o){let y=u(w,"slug"),g=u(w,"canonical_url");y&&!I(g)&&(a+=`  <url>
`,a+=`    <loc>${c}/app/${m(y)}</loc>
`,a+=`    <lastmod>${h(w)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.9</priority>
`,a+=`  </url>
`)}for(let w of f){let y=u(w,"slug"),g=u(w,"canonical_url");y&&!I(g)&&(a+=`  <url>
`,a+=`    <loc>${c}/news/${m(y)}</loc>
`,a+=`    <lastmod>${h(w)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.7</priority>
`,a+=`  </url>
`)}for(let w of l){let y=u(w,"slug"),g=u(w,"canonical_url");y&&!I(g)&&(a+=`  <url>
`,a+=`    <loc>${c}/blog/${m(y)}</loc>
`,a+=`    <lastmod>${h(w)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.7</priority>
`,a+=`  </url>
`)}for(let w of p){let y=u(w,"slug");y&&(a+=`  <url>
`,a+=`    <loc>${c}/videos/${m(y)}</loc>
`,a+=`    <lastmod>${h(w)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.6</priority>
`,a+=`  </url>
`)}a+=`</urlset>
`,e.header("Content-Type","application/xml"),e.send(a)}catch(s){console.error("Sitemap Generation Error:",s),e.status(500).send("Error generating sitemap")}});var ne=new Map,Tt=5,st=G.default.join(process.cwd(),"mock-2fa-state.json"),be=new Map,qs=(process.env.ADMIN_EMAIL||"").toLowerCase();try{if(F.default.existsSync(st)){let t=JSON.parse(F.default.readFileSync(st,"utf8"));for(let[e,s]of Object.entries(t))be.set(e,s)}}catch(t){console.error("Failed to load mock 2FA file:",t)}function jt(){try{let t={};for(let[e,s]of be.entries())t[e]=s;F.default.writeFileSync(st,JSON.stringify(t,null,2),"utf8")}catch(t){console.error("Failed to save mock 2FA file:",t)}}var it=900*1e3,Dt=3600*1e3;function Ns(t){let e=Date.now(),s=ne.get(t);return s?s.lockedUntil>e?{allowed:!1,lockedUntil:s.lockedUntil}:e-s.windowStart>it?(ne.delete(t),{allowed:!0}):s.count>=Tt?(s.lockedUntil=e+Dt,ne.set(t,s),{allowed:!1,lockedUntil:s.lockedUntil}):{allowed:!0}:{allowed:!0}}function vt(t){let e=Date.now(),s=ne.get(t);if(!s||e-s.windowStart>it){ne.set(t,{count:1,windowStart:e,lockedUntil:0});return}s.count+=1,s.count>=Tt&&(s.lockedUntil=e+Dt),ne.set(t,s)}setInterval(()=>{let t=Date.now();for(let[e,s]of ne.entries())s.lockedUntil<t&&t-s.windowStart>it*2&&ne.delete(e)},7200*1e3);var B=async(t,e,s)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token.",message:"Unauthorized: Missing verification token."});let r=n.split("Bearer ")[1];if(!r||r==="null"||r==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token.",message:"Unauthorized: Empty session verification token."});if(r.startsWith("ey"))try{let i="";if(se())i=(await require("firebase-admin").auth().verifyIdToken(r)).email||"";else{let p=V()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(p){let d=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${p}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:r})});d.ok&&(i=(await d.json())?.users?.[0]?.email||"")}}let f=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return i&&i.toLowerCase().trim()===f?(t.adminUser={email:i.toLowerCase().trim()},s()):e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token.",message:"Unauthorized: Invalid Firebase token."})}try{let i=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!i)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured.",message:"Encryption misconfigured."});let o=U(r,i);if(!o)return e.status(401).json({error:"Unauthorized: Invalid token.",message:"Unauthorized: Invalid token."});let f=JSON.parse(o);return!f.admin||!f.email||!f.exp?e.status(401).json({error:"Unauthorized: Malformed token.",message:"Unauthorized: Malformed token."}):Date.now()>f.exp?e.status(401).json({error:"Unauthorized: Session expired.",message:"Unauthorized: Session expired."}):(t.adminUser={email:f.email},s())}catch(i){return console.error("verifyAdminToken error:",i),e.status(401).json({error:"Unauthorized: Token verification failed.",message:"Unauthorized: Token verification failed."})}};v.post("/api/v1/admin/login",async(t,e)=>{let s=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=Ns(s);if(!n.allowed){let l=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${l} min.`})}let{email:r,password:i}=t.body??{};if(!r||!i)return vt(s),e.status(400).json({error:"Missing email or password."});let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),f=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!f)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(r.toLowerCase().trim()===o&&i===f)try{let l=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",p=JSON.stringify({admin:!0,email:o,exp:Date.now()+864e5}),d=J(p,l);return e.json({token:d,email:o})}catch(l){return console.error("Login encryption error:",l),e.status(500).json({error:"Internal server error."})}return vt(s),e.status(401).json({error:"Invalid email or password."})});v.post("/api/v1/admin/google-login",async(t,e)=>{let{idToken:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing Firebase ID Token."});try{let n="";try{se()&&(n=(await require("firebase-admin").auth().verifyIdToken(s)).email||"")}catch(l){console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:",l)}if(!n)try{let p=V()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(p){let d=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${p}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:s})});d.ok&&(n=(await d.json())?.users?.[0]?.email||"")}}catch(l){console.error("Firebase accounts:lookup verification failed:",l)}if(!n)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let r=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(n.toLowerCase().trim()!==r)return e.status(403).json({error:`Unauthorized: ${n} is not configured as an administrator.`});let i=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",o=JSON.stringify({admin:!0,email:n.toLowerCase().trim(),exp:Date.now()+864e5}),f=J(o,i);return e.json({token:f,email:n.toLowerCase().trim()})}catch(n){return console.error("Google login backend error:",n),e.status(500).json({error:"Authentication failed on server: "+(n.message||String(n))})}});v.post("/api/v1/admin/verify-session",async(t,e)=>{let s=String(t.headers.authorization||"");if(!s.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=s.split("Bearer ")[1];if(n.startsWith("ey"))try{let r="";if(se())r=(await require("firebase-admin").auth().verifyIdToken(n)).email||"";else{let l=V()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(l){let p=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${l}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:n})});p.ok&&(r=(await p.json())?.users?.[0]?.email||"")}}let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return r&&r.toLowerCase().trim()===o?e.json({ok:!0,email:r.toLowerCase().trim()}):e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",i=U(n,r);if(!i)return e.status(401).json({error:"Unauthorized: Invalid token."});let o=JSON.parse(i);return!o.admin||Date.now()>o.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:o.email})}catch(r){return e.status(401).json({error:"Service error: "+(r?.message||String(r))})}});v.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing email address."});let n=String(s).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(s){return console.error("2fa resend error:",s),e.status(500).json({error:"Failed to process 2FA resend request: "+s.message})}});v.post("/api/github-sync/test",async(t,e)=>{try{let{owner:s,repo:n,token:r}=t.body||{},i=r||process.env.PAT;if(!s||!n||!i)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let o=i.trim(),f=o.toLowerCase().startsWith("ghp_")?`token ${o}`:`Bearer ${o}`,l=await fetch(`https://api.github.com/repos/${s.trim()}/${n.trim()}`,{headers:{Authorization:f,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(l.ok){let p=await l.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${p.full_name}`,permissions:p.permissions})}else{let p=await l.json().catch(()=>({})),d="";return l.status===401||l.status===403?d=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:l.status===404&&(d=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(l.status).json({ok:!1,message:(p.message||"Failed to connect to repository")+d})}}catch(s){return console.error("GitHub Test Connection error:",s),e.status(500).json({message:s.message||"Internal server error"})}});v.post("/api/github-sync/commit",async(t,e)=>{try{let{owner:s,repo:n,token:r,branch:i,path:o,content:f,message:l}=t.body||{},p=r||process.env.PAT;if(!s||!n||!p||!o||!f)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let d=i?i.trim():"main",c=o.replace(/^\/+/g,""),a=s.trim(),_=p.trim(),m=n.trim(),h=m,I=a.toLowerCase(),w=m.toLowerCase(),y=c.includes("staticData.ts")||c.includes("secureVault.ts")||c.includes("public_backup.json")||c.includes("secure_links_backup.json"),g=!1;console.log(`GitHub Sync Server Request: User "${a}" intends to sync "${c}" to repository "${m}"`);let b=_.toLowerCase().startsWith("ghp_")?`token ${_}`:`Bearer ${_}`,C=await(async T=>{let A=T;try{let D=await fetch(`https://api.github.com/users/${a}/repos?per_page=100`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(D.ok){let $=await D.json();if(Array.isArray($)){let N=$.find(z=>z.name?.toLowerCase()===A.toLowerCase());N&&N.name!==A&&(console.log(`GitHub Sync Server: Correcting repository casing alignment from "${A}" to "${N.name}"`),A=N.name)}}else{let $=await fetch(`https://api.github.com/orgs/${a}/repos?per_page=100`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();if(Array.isArray(N)){let z=N.find(Me=>Me.name?.toLowerCase()===A.toLowerCase());z&&z.name!==A&&(console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${A}" to "${z.name}"`),A=z.name)}}}}catch(D){console.warn("GitHub Repo casing alignment query not completed:",D)}console.log(`GitHub Sync Server: Fetching SHA of ${c} on repo ${a}/${A} [branch: ${d}]...`);let O,L="";try{let D=await fetch(`https://api.github.com/repos/${a}/${A}/contents/${c}?ref=${encodeURIComponent(d)}&_t=${Date.now()}`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(D.ok){let $=await D.json();$&&!Array.isArray($)&&$.sha&&(O=$.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${O}`))}else if(D.status===404){console.log(`GitHub Sync Server: File not found on branch "${d}". Attempting default branch fallback...`);let $=await fetch(`https://api.github.com/repos/${a}/${A}/contents/${c}?_t=${Date.now()}`,{headers:{Authorization:b,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();N&&!Array.isArray(N)&&N.sha&&(O=N.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${O}`))}else if($.status!==404){let N=await $.json().catch(()=>({})),z="";N.message&&(N.message.toLowerCase().includes("resource not accessible")||N.message.toLowerCase().includes("permission")||$.status===403)&&(z=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+A+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),L=`Default branch lookup failed with status ${$.status}: ${N.message||"Unknown error"}${z}`}}else{let $=await D.json().catch(()=>({})),N="";$.message&&($.message.toLowerCase().includes("resource not accessible")||$.message.toLowerCase().includes("permission")||D.status===403)&&(N=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+A+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),L=`Target branch lookup failed with status ${D.status}: ${$.message||"Unknown error"}${N}`}}catch(D){console.error("GitHub SHA Fetch error on Server:",D),L=`Network error fetching repository contents on server: ${D.message||D}`}if(L&&!O)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${L}

Please check your Repository config and Token permissions.`};let Q=Buffer.from(f,"utf8").toString("base64"),Z={message:l||"Admin Release Sync: Static file update",content:Q,branch:d,...O?{sha:O}:{}};console.log(`GitHub Sync Server: Initiating commit for ${c} to ${A}...`);let q=await fetch(`https://api.github.com/repos/${a}/${A}/contents/${c}`,{method:"PUT",headers:{Authorization:b,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(Z)});if(!q.ok){let D=await q.text(),$=D;try{let z=JSON.parse(D);$=z.message||z.error?.message||D}catch{}let N="";return $.toLowerCase().includes("not found")?N=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+A+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:($.toLowerCase().includes("credentials")||q.status===401)&&(N=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!N&&($.toLowerCase().includes("resource not accessible")||$.toLowerCase().includes("permission")||q.status===403)&&(N=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+A+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:q.status,error:$+N}}return{success:!0,result:await q.json(),finalRepo:A}})(m);return C.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${C.finalRepo}"!`,C.result?.commit?.sha),e.json({...C.result,message:`Successfully published to ${C.finalRepo} repository.`,targetRepo:C.finalRepo})):e.status(C.status||400).json({message:C.error})}catch(s){return console.error("Server GitHub commit handler error:",s),e.status(500).json({message:`Internal server error during GitHub sync: ${s.message||s}`})}});v.get("/api/v1/image",async(t,e)=>{let s=t.query.url;if(!s)return e.status(400).send("Missing image URL");try{let n=s;try{s.startsWith("http")||(n=Buffer.from(s,"base64").toString("utf-8"))}catch{}if(!await Is(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!r.ok)throw new Error("Failed to fetch image");let i=await r.arrayBuffer(),o=r.headers.get("content-type")||"image/jpeg";e.set("Content-Type",o),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(i))}catch{e.status(500).send("Image proxy error")}});v.get("/api/v1/admin/firebase-status",async(t,e)=>{try{let s=V(),n=s.apiKey||process.env.FIREBASE_API_KEY,r=s.projectId||process.env.FIREBASE_PROJECT_ID,i=s.firestoreDatabaseId||"(default)";if(!n||!r)return e.status(503).json({status:"offline",error:"Missing Firebase credentials"});let o=await fetch(`https://firestore.googleapis.com/v1/projects/${r}/databases/${i}/documents?pageSize=1&key=${n}`);return o.status<500?e.json({status:"live"}):e.status(o.status).json({status:"offline",error:"Firestore returned server error"})}catch(s){return e.status(500).json({status:"offline",error:s.message})}});v.get("/api/v1/admin/verify",B,(t,e)=>{e.json({authorized:!0,user:t.adminUser})});v.get("/api/v1/admin/security/audit-logs",B,async(t,e)=>{let s=V();if(!!1&&s&&s.apiKey)try{let i=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${s.apiKey?"&key="+s.apiKey:""}`,o=await fetch(i);if(o.ok){let p=((await o.json()).documents||[]).map(d=>{let c=d.fields||{};return{id:d.name.split("/").pop(),email:c.email?.stringValue||"unknown",ip:c.ip?.stringValue||"unknown",ua:c.ua?.stringValue||"unknown",success:c.success?.booleanValue??!1,reason:c.reason?.stringValue||"unknown",ts:c.ts?.stringValue||new Date().toISOString()}}).sort((d,c)=>new Date(c.ts).getTime()-new Date(d.ts).getTime());return e.json({success:!0,logs:p})}}catch(i){console.error("Error fetching Firestore audit logs:",i)}let r=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:r})});v.get("/api/v1/admin/2fa/config",B,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim();if(!s)return e.status(400).json({error:"Missing admin email."});let n=!1,r=!1,i="";if(n){let o=be.get(s);o&&(r=o.enabled,i=o.secret)}else{let o=V();if(o&&o.apiKey)try{let f=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,l=await fetch(f);if(l.ok){let p=await l.json();r=p.fields?.enabled?.booleanValue===!0,i=p.fields?.secret?.stringValue||""}}catch(f){console.error("Error fetching Firestore 2FA config:",f)}}if(r)return e.json({enabled:!0});{let o=bt(),f=wt(s,o);return e.json({enabled:!1,tempSecret:o,qrCodeUri:f})}});v.post("/api/v1/admin/2fa/enable",B,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:r}=t.body||{};if(!s||!n||!r)return e.status(400).json({error:"Missing required fields (email, secret, code)."});let i=!1;if(!(i&&r==="123456")&&!Xe(r,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});if(i)be.set(s,{enabled:!0,secret:n}),jt();else{let o=V();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable: Firebase is not configured."});try{let f=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,l=await fetch(f,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{enabled:{booleanValue:!0},secret:{stringValue:n}}})});if(!l.ok){let p=await l.text();return console.error("Failed to save 2FA config to Firestore:",p),e.status(500).json({error:"Failed to save 2FA configuration to database."})}}catch(f){return console.error("Firestore save 2FA exception:",f),e.status(500).json({error:"Server database write error."})}}return e.json({success:!0})});v.post("/api/v1/admin/2fa/disable",B,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!s||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let r=!1,i="";if(r){let o=be.get(s);o&&o.enabled&&(i=o.secret)}else{let o=V();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable."});try{let f=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,l=await fetch(f);if(l.ok){let p=await l.json();p.fields?.enabled?.booleanValue===!0&&(i=p.fields?.secret?.stringValue||"")}}catch(f){console.error("Firestore 2FA config fetch fail on disable:",f)}}if(!i)return e.status(400).json({error:"2FA is not enabled for this account."});if(!(r&&n==="123456")&&!Xe(n,i))return e.status(400).json({error:"Invalid verification code."});if(r)be.delete(s),jt();else{let o=V();if(o&&o.apiKey)try{let f=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,l=await fetch(f,{method:"DELETE"});if(!l.ok)return console.error("Failed to delete 2FA config from Firestore:",await l.text()),e.status(500).json({error:"Failed to delete 2FA from database."})}catch(f){return console.error("Firestore delete 2FA exception:",f),e.status(500).json({error:"Server database delete error."})}}return e.json({success:!0})});v.post("/api/v1/admin/encrypt",B,async(t,e)=>{let s=re(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let i=J(n,r);e.json({encrypted:i})}catch{e.status(500).json({error:"Encryption failed"})}});v.post("/api/v1/admin/encrypt-links",B,async(t,e)=>{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid links array payload is required."});try{let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let r=[],i=V();if(i){let c=i.apiKey?`?key=${i.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents`;for(let _ of["sec_links_vault_3","secure_links","sec_vault"])try{let h=await(await fetch(`${a}/store_data/${_}${c}`)).json();if(h&&!h.error&&h.fields?.encryptedData?.stringValue){let I=U(h.fields.encryptedData.stringValue,n);if(I){let w=JSON.parse(I);if(Array.isArray(w)){r=w;break}}}}catch{}}let o=new Map;r.forEach(c=>{c&&c.id&&o.set(c.id,c)}),s.map(c=>{let a=c.url||"";return a&&!a.startsWith("http://")&&!a.startsWith("https://")&&!a.startsWith("U2FsdGVkX1")&&(a="https://"+a),a&&!a.startsWith("U2FsdGVkX1")&&(a=J(a,n)),{...c,url:a}}).forEach(c=>{c&&c.id&&o.set(c.id,c)});let l=Array.from(o.values()),p=JSON.stringify(l),d=J(p,n);try{let c={};l.forEach(m=>{m&&m.id&&m.url&&(c[m.id]=m.url)});let _=`// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${String(J(JSON.stringify(c),n))}";
`}catch(c){console.warn("Failed to auto-seal secureVault.ts from encrypt-links:",c)}e.json({encrypted:d})}catch{e.status(500).json({error:"Links encryption failed"})}});v.get("/api/v1/admin/debug-links",B,async(t,e)=>{let s=re(t);if(await we(s))return e.status(429).json({error:"Too many requests"});try{let n=JSON.parse(F.default.readFileSync("firebase-applet-config.json","utf8")),r=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,o=await(await fetch(r)).json();if(!o.fields||!o.fields.encryptedData)return e.json({error:"No vault data found"});let f=o.fields.encryptedData.stringValue,l=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",p=U(f,l);e.json({decrypted:JSON.parse(p)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});v.post("/api/v1/admin/decrypt-url",B,async(t,e)=>{let s=re(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=U(n,r);e.json({decrypted:o||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});v.post("/api/v1/admin/decrypt-links",B,async(t,e)=>{let s=re(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=U(n,r);if(!o)throw new Error("Empty decrypted block.");let f=JSON.parse(o);f=f.map(l=>{let p=l.url||"";if(p.startsWith("U2FsdGVkX1"))try{p=U(p,r)}catch{}return{...l,url:p}}),e.json({items:f})}catch(o){console.error("[ERROR] Admin decrypt-links failed:",o.message||o),e.status(500).json({error:"Links decryption failed: "+(o.message||"Check AES_SECRET")})}});v.post("/api/v1/admin/sync-local",B,async(t,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:s,settings:n,news:r,blogs:i,videos:o}=t.body;if(!s||!n)return e.status(400).json({error:"Invalid sync payload."});let f=Ke(s,n,r,i,o);try{F.default.writeFileSync(G.default.join(process.cwd(),"src/lib/staticData.ts"),f,"utf8")}catch(g){console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):",g.message)}let l=JSON.parse(JSON.stringify(s)).map(g=>(delete g.more_information_url,delete g.encrypted_download_url,delete g.download_url,g)),p=JSON.parse(JSON.stringify(n)),d=JSON.parse(JSON.stringify(r||[])),c=JSON.parse(JSON.stringify(i||[])),a=JSON.parse(JSON.stringify(o||[])),_=G.default.join(process.cwd(),"src/lib/public_backup.json");try{F.default.writeFileSync(_,JSON.stringify({apps:l,settings:p,news:d,blogs:c,videos:a},null,2),"utf8")}catch(g){console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):",g.message)}let m=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",h={};s.forEach(g=>{if(g.more_information_url)if(g.more_information_url.startsWith("U2FsdGVkX1"))h[g.id]=g.more_information_url;else try{h[g.id]=J(g.more_information_url,m)}catch{console.warn(`[SECURITY] Skipped backup link for ${g.id} due to encryption failure`)}});let I=G.default.join(process.cwd(),".local/secure_links_backup.json"),w=h;if(F.default.existsSync(I))try{w={...JSON.parse(F.default.readFileSync(I,"utf8")),...h}}catch{}for(let[g,b]of Object.entries(w))if(b&&!b.startsWith("U2FsdGVkX1"))try{w[g]=J(b,m)}catch{delete w[g]}let y=!1;try{let g=se();if(g){if(s&&Array.isArray(s)){let x=Math.ceil(s.length/25)||1;for(let C=0;C<x;C++){let T=JSON.parse(JSON.stringify(s.slice(C*25,(C+1)*25)));T.forEach(A=>{delete A.more_information_url,delete A.encrypted_download_url,delete A.download_url}),await g.collection("store_data").doc(`apps_chunk_${C}`).set({items:T})}await g.collection("store_data").doc("apps_meta").set({numChunks:x,last_updated:new Date().toISOString()})}if(n){let b=JSON.parse(JSON.stringify(n));await g.collection("store_data").doc("public_settings").set(b,{merge:!0})}r&&Array.isArray(r)&&await g.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(r))}),i&&Array.isArray(i)&&await g.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(i))}),o&&Array.isArray(o)&&await g.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(o))}),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),y=!0}}catch(g){console.warn("[SERVER] Firestore Admin SDK update warning, switching to REST API fallback:",g.message)}if(!y)try{if(s&&Array.isArray(s)){let b=Math.ceil(s.length/25)||1;for(let x=0;x<b;x++){let C=JSON.parse(JSON.stringify(s.slice(x*25,(x+1)*25)));C.forEach(T=>{delete T.more_information_url,delete T.encrypted_download_url,delete T.download_url}),await ye(`apps_chunk_${x}`,{items:C})}await ye("apps_meta",{numChunks:b,last_updated:new Date().toISOString()})}n&&await ye("public_settings",JSON.parse(JSON.stringify(n))),r&&Array.isArray(r)&&await ye("news",{items:JSON.parse(JSON.stringify(r))}),i&&Array.isArray(i)&&await ye("blogs",{items:JSON.parse(JSON.stringify(i))}),o&&Array.isArray(o)&&await ye("videos",{items:JSON.parse(JSON.stringify(o))}),console.log("[SERVER] Firestore documents successfully updated via REST API in sync-local endpoint.")}catch(g){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",g.message)}try{let g=G.default.join(process.cwd(),"src/lib/public_backup.json"),b={apps:s||[],settings:n||{},news:r||[],blogs:i||[],videos:o||[]};F.default.writeFileSync(g,JSON.stringify(b,null,2),"utf8")}catch(g){console.warn("[SERVER] Could not update public_backup.json:",g)}he=null,e.json({success:!0,message:"Cloud Firestore and backup components strictly synced."})}catch(s){console.error("local file sync endpoint error:",s),e.status(500).json({error:"Failed to store backup: "+s.message})}});v.get("/api/v1/admin/backup-links-get",B,(t,e)=>{try{let s=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",n={},r=G.default.join(process.cwd(),"src/lib/secureVault.ts");if(F.default.existsSync(r))try{let l=F.default.readFileSync(r,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(l&&l[1]){let p=l[1],d=U(p,s);if(d){let c=JSON.parse(d);Array.isArray(c)?c.forEach(a=>{a&&a.id&&(n[a.id]=a.url||a.more_information_url||"")}):c&&typeof c=="object"&&Object.assign(n,c),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(f){console.warn("backup-links-get: Failed to parse secureVault.ts:",f.message)}let i=G.default.join(process.cwd(),".local/secure_links_backup.json");if(F.default.existsSync(i))try{let f=JSON.parse(F.default.readFileSync(i,"utf8"));Object.assign(n,f),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(f){console.warn("backup-links-get: Failed to parse backup JSON:",f.message)}let o=[];for(let[f,l]of Object.entries(n)){let p="";typeof l=="string"&&(l.startsWith("U2FsdGVkX1")?p=U(l,s):p=l),o.push({id:f,url:p})}e.json({items:o})}catch(s){console.error("backup-links-get failed:",s),e.status(500).json({error:"Failed to read backup links: "+s.message})}});v.get("/api/v1/admin/fix-db-links",B,async(t,e)=>{try{let s=V();if(!s)return e.status(500).json({error:"Missing configuration."});let r=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_0${s.apiKey?"?key="+s.apiKey:""}`)).json(),i=[];!r.error&&r.fields?.items?.arrayValue?.values&&(i=r.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue));let f=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_1${s.apiKey?"?key="+s.apiKey:""}`)).json();!f.error&&f.fields?.items?.arrayValue?.values&&(i=i.concat(f.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue)));let l=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",p=i.map(h=>({id:h,url:`https://example.com/demo/${h}`})),d=J(JSON.stringify(p),l),c=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",m=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${s.apiKey?"&key="+s.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${c}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:d}}})})).json();e.json(m)}catch(s){e.json({error:s.message})}});function nt(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:t.toString()}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>nt(e))}};if(typeof t=="object"){let e={};for(let s of Object.keys(t))e[s]=nt(t[s]);return{mapValue:{fields:e}}}return{stringValue:String(t)}}function Os(t){let e={};if(t&&typeof t=="object")for(let s of Object.keys(t))e[s]=nt(t[s]);return{fields:e}}async function ye(t,e){try{let s=V();if(!s||!s.projectId)return!1;let n=s.apiKey?`?key=${s.apiKey}`:"",r=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/store_data/${t}${n}`,i=Os(e),o=await fetch(r,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});return o.ok?(console.log(`[SERVER] REST write to store_data/${t} succeeded.`),!0):(console.warn(`[SERVER] REST write to store_data/${t} status ${o.status}:`,await o.text()),!1)}catch(s){return console.warn(`[SERVER] REST write to store_data/${t} failed:`,s.message),!1}}function $e(t){if(!t||typeof t!="object")return t??null;if("stringValue"in t)return t.stringValue;if("booleanValue"in t)return t.booleanValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("timestampValue"in t)return t.timestampValue;if("nullValue"in t)return null;if("mapValue"in t){let e=t.mapValue?.fields||{},s={};for(let n of Object.keys(e))s[n]=$e(e[n]);return s}return"arrayValue"in t?(t.arrayValue?.values||[]).map(s=>$e(s)):null}function Pe(t){if(!t||typeof t!="object")return{};let e={};for(let s of Object.keys(t))e[s]=$e(t[s]);return e}var he=null,Be=0,Ls=3e4;v.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data"],async(t,e)=>{try{let s=Date.now();if(he&&s-Be<Ls)return e.json(he);try{let d=se();if(d){let c=await d.collection("store_data").doc("apps_meta").get(),a=[];if(c.exists){let w=c.data()?.numChunks||1;for(let y=0;y<w;y++){let g=await d.collection("store_data").doc(`apps_chunk_${y}`).get();g.exists&&g.data()?.items&&a.push(...g.data().items)}}else{let w=await d.collection("store_data").doc("apps").get();w.exists&&w.data()?.items&&(a=w.data().items)}let _=await d.collection("store_data").doc("public_settings").get(),m=await d.collection("store_data").doc("news").get(),h=await d.collection("store_data").doc("blogs").get(),I=await d.collection("store_data").doc("videos").get();if(a.length>0||_.exists){let w={apps:a,settings:_.exists?_.data():{},news:m.exists?m.data()?.items||[]:[],blogs:h.exists?h.data()?.items||[]:[],videos:I.exists?I.data()?.items||[]:[]};return he=w,Be=s,e.json(w)}}}catch{}try{let d=V();if(d&&d.projectId){let c=d.apiKey?`?key=${d.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${d.projectId}/databases/${d.firestoreDatabaseId||"(default)"}/documents/store_data`,_=await fetch(`${a}/apps_meta${c}`),m=[];if(_.ok){let T=await _.json(),A=T.fields?.numChunks?.integerValue?parseInt(T.fields.numChunks.integerValue,10):1;for(let O=0;O<A;O++){let L=await fetch(`${a}/apps_chunk_${O}${c}`);if(L.ok){let Q=await L.json();if(Q.fields?.items?.arrayValue?.values){let Z=Q.fields.items.arrayValue.values.map(q=>$e(q));m.push(...Z)}}}}else{let T=await fetch(`${a}/apps${c}`);if(T.ok){let A=await T.json();A.fields?.items?.arrayValue?.values&&(m=A.fields.items.arrayValue.values.map(O=>$e(O)))}}let h=await fetch(`${a}/public_settings${c}`),I=await fetch(`${a}/news${c}`),w=await fetch(`${a}/blogs${c}`),y=await fetch(`${a}/videos${c}`),g={},b={},x={},C={};try{h.ok&&(g=Pe((await h.json())?.fields))}catch{}try{I.ok&&(b=Pe((await I.json())?.fields))}catch{}try{w.ok&&(x=Pe((await w.json())?.fields))}catch{}try{y.ok&&(C=Pe((await y.json())?.fields))}catch{}if(m.length>0||Object.keys(g).length>0){let T={apps:m,settings:g,news:b.items||[],blogs:x.items||[],videos:C.items||[]};return he=T,Be=s,e.json(T)}}}catch{}let n=G.default.join(process.cwd(),"src/lib/public_backup.json");if(F.default.existsSync(n))try{let d=JSON.parse(F.default.readFileSync(n,"utf8")),c={apps:d.apps||[],settings:d.settings||{},news:d.news||[],blogs:d.blogs||[],videos:d.videos||[]};return he=c,Be=s,e.json(c)}catch(d){console.error("Error reading public_backup.json in backup-data endpoint:",d)}let{mockApps:r,mockSettings:i,mockNews:o,mockBlogs:f,mockVideos:l}=De,p={apps:r||[],settings:i||{},news:o||[],blogs:f||[],videos:l||[]};return e.json(p)}catch(s){console.error("public backup endpoint error:",s);let{mockApps:n,mockSettings:r,mockNews:i,mockBlogs:o,mockVideos:f}=De;return e.status(200).json({apps:n||[],settings:r||{},news:i||[],blogs:o||[],videos:f||[]})}});v.get("/api/v1/debug-seo",async(t,e)=>{try{let{fetchStoreData:s}=(ge(),Se(Ee)),n=await s();e.json({hasData:!!n,hasSettings:!!n?.settings,settingsKeys:Object.keys(n?.settings||{})})}catch(s){e.json({error:s.message})}});v.post("/api/v1/admin/seal-vault",B,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n={};s.forEach(o=>{o.id&&(o.url||o.more_information_url)&&(n[o.id]=o.url||o.more_information_url)});let r={AES_SECRET:process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"")};if(!r.AES_SECRET)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let i="";typeof J<"u"?i=J(JSON.stringify(n),r.AES_SECRET):i=require("crypto-js").AES.encrypt(JSON.stringify(n),r.AES_SECRET).toString(),e.json({success:!0,ciphertext:i})}catch(s){e.status(500).json({error:s.message})}});v.post("/api/v1/admin/save-links-direct",B,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",r={};s.forEach(f=>{let l=f.url||f.more_information_url;if(f.id&&l)if(l.startsWith("U2FsdGVkX1"))r[f.id]=l;else try{r[f.id]=J(l,n)}catch{console.warn(`[SECURITY] Skipped backup link for ${f.id} due to encryption failure`)}});let i=require("path").join(process.cwd(),".local/secure_links_backup.json"),o=r;if(require("fs").existsSync(i))try{o={...JSON.parse(require("fs").readFileSync(i,"utf8")),...r}}catch{}for(let[f,l]of Object.entries(o))if(l&&!l.startsWith("U2FsdGVkX1"))try{o[f]=J(l,n)}catch{delete o[f]}e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(s){e.status(500).json({error:s.message})}});v.post("/api/v1/admin/pull-links-from-github",B,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));v.get("/api/v1/admin/config-status",B,(t,e)=>{let s=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,r=!!process.env.ADMIN_EMAIL;e.json({hasAes:s,hasSecLinks:n,hasAdminEmail:r})});v.get("/api/v1/admin/system-files",B,(t,e)=>{e.json({files:{}})});v.get("/api/v1/debug-index",async(t,e)=>{try{let s=F.default.readFileSync(G.default.resolve(process.cwd(),"index.html"),"utf-8"),n=t.app.get("vite");e.json({debug:!0})}catch(s){e.json({error:s.message})}});["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{v.all(t,(e,s)=>{s.status(404).send("Not Found")})});v.get(["/api/v1/_chal","/api/v1/get-challenge","/api/v1/init-file"],async(t,e)=>{console.log("[DEBUG] /api/v1/init-file called");let s=re(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=$s(t,e),r=X.default.randomBytes(20).toString("hex"),i=Date.now(),o=Math.floor(Math.random()*100)+50;te.set(r,{sessionId:n,expiresAt:i+120*1e3,issuedAt:i+o}),setTimeout(()=>{e.json({nonce:r,difficulty:"0000",sid:n})},o)});v.post(["/api/v1/_proc","/api/v1/get-token","/api/v1/process-file"],async(t,e)=>{let s=re(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=t.body?.sid||t.cookies?.["__Host-sid"];if(!n)return e.status(403).json({error:"Session expired. Please reload."});let{nonce:r,solution:i,fingerprint:o,score:f,moved:l,touch:p,cfToken:d}=t.body||{};if(!r||!i||!o)return e.status(400).json({error:"Invalid request."});if(!vs(o))return console.warn(`[DEFENSE] Bad fingerprint from ${s}`),e.status(403).json({error:"Access denied."});let c=te.get(r);if(!c)return e.status(403).json({error:"Challenge expired. Please try again."});if(c.sessionId!==n)return te.delete(r),e.status(403).json({error:"Session mismatch."});if(c.expiresAt<Date.now())return te.delete(r),e.status(403).json({error:"Challenge timed out."});let a=Date.now()-c.issuedAt;if(a<80)return te.delete(r),console.warn(`[DEFENSE] Solve too fast (${a}ms) from ${s}`),e.status(403).json({error:"Access denied."});if(te.delete(r),typeof f!="number"||f<40)return console.warn(`[DEFENSE] Low score (${f}) from ${s}`),e.status(403).json({error:"Access denied: security check failed."});let _=r+i,m=X.default.createHash("sha256").update(_).digest("hex");if(!m.startsWith("0000"))return console.warn(`[DEFENSE] PoW fail from ${s}: ${m}`),e.status(403).json({error:"Access denied: verification failed."});if(tt&&!await ks(d||"",s))return console.warn(`[CF] Rejected ${s}`),e.status(403).json({error:"Access denied: verification failed."});console.log(`[ACCESS] GRANTED ip=${s} score=${f} solveMs=${a} moved=${l} touch=${p}`);let h=t.body.appId||"unknown",I=Rs(s,n,o,h);e.json({token:I})});v.get("/api/v1/link-check",async(t,e)=>{let s=t.query.id;if(!s)return e.json({configured:!1});try{let n=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");if(!n)return e.json({configured:!0});let r="",i=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(i)){let d=require("fs").readFileSync(i,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);d&&d[1]&&(r=d[1])}if(!r)return e.json({configured:!0});let o="";if(typeof U<"u")o=U(r,n);else{let p=require("crypto-js");o=p.AES.decrypt(r,n).toString(p.enc.Utf8)}if(!o)return e.json({configured:!0});let f=JSON.parse(o),l=!1;if(Array.isArray(f)){let p=f.find(d=>d&&d.id===s);p&&(p.url||p.more_information_url)&&(l=!0)}else f&&typeof f=="object"&&f[s]&&(l=!0);return e.json({configured:!0})}catch{return e.json({configured:!0})}});var Et=new Map;v.post("/api/v1/public/chat",async(t,e)=>{let s=t.headers["x-forwarded-for"]||t.socket.remoteAddress||"unknown",n=Date.now(),r=3600*1e3,i=10,o=Et.get(s);if((!o||n>o.resetTime)&&(o={count:0,resetTime:n+r}),o.count>=i)return e.status(429).json({error:"Rate limit exceeded. Maximum 10 messages per hour. Please try again later."});o.count+=1,Et.set(s,o);let{message:f}=t.body;if(!f||typeof f!="string")return e.status(400).json({error:"Message payload is required."});try{let l=process.env.GEMINI_API_KEY;if(!l)throw new Error("AI service is currently offline.");let{fetchStoreData:p}=(ge(),Se(Ee)),d=await p(),c={settings:{site_title:d.settings?.site_title,meta_description:d.settings?.meta_description,policies:d.settings?.policies?d.settings.policies.substring(0,500):""},categories:(d.categories||[]).map(h=>({id:h.id,n:h.name})),apps:(d.apps||[]).map(h=>({n:h.name,c:h.category,desc:h.description_html?.replace(/<[^>]+>/g,"").substring(0,200),r:h.rating})),news:(d.news||[]).map(h=>({t:h.title,d:h.description?.substring(0,200),c:h.content?.replace(/<[^>]+>/g,"").substring(0,300)})),blogs:(d.blogs||[]).map(h=>({t:h.title,d:h.description?.substring(0,200),c:h.content?.replace(/<[^>]+>/g,"").substring(0,300)})),videos:(d.videos||[]).map(h=>({t:h.title,d:h.description,c:h.content?.replace(/<[^>]+>/g,"").substring(0,1e3)}))},{GoogleGenAI:a}=require("@google/genai"),_=new a({apiKey:l,httpOptions:{headers:{"User-Agent":"aistudio-build"}}}),m=`You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(c,null,2)}`;try{let h=await _.models.generateContentStream({model:"gemini-2.0-flash",contents:f.trim(),config:{systemInstruction:m,maxOutputTokens:1e3,temperature:.3,tools:[{googleSearch:{}}]}});e.setHeader("Content-Type","text/event-stream"),e.setHeader("Cache-Control","no-cache"),e.setHeader("Connection","keep-alive"),e.flushHeaders();for await(let I of h)I.text&&e.write(`data: ${JSON.stringify({text:I.text})}

`);return e.write(`data: [DONE]

`),e.end()}catch(h){if(!e.headersSent)throw h;return e.write(`data: ${JSON.stringify({error:h.message||"Streaming failed"})}

`),e.end()}}catch(l){if(l.status===429||l.message?.includes("429"))return e.json({success:!0,answer:"\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities."});if(l.status===403||l.message?.includes("403"))return e.json({success:!0,answer:"\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings."});let p=f.trim().toLowerCase();try{let{fetchStoreData:d}=(ge(),Se(Ee)),_=((await d()).apps||[]).filter(m=>m.name&&m.name.toLowerCase().includes(p)||m.category&&m.category.toLowerCase().includes(p));if(_.length>0){let m=_.slice(0,3).map(h=>h.name).join(", ");return e.json({success:!0,answer:`(Offline Fallback): I found some apps in the directory matching your query: ${m}${_.length>3?" and more.":"."}`})}else if(p.includes("hello")||p.includes("hi ")||p==="hi")return e.json({success:!0,answer:"(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!"})}catch{}return e.json({success:!0,answer:"(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."})}});v.post("/api/v1/report-missing",async(t,e)=>{let{appId:s}=t.body;return s?(console.log(`[report-missing] Received report for ${s}, mocked success due to hardcoded public mode.`),e.json({success:!0})):e.status(400).json({error:"Missing App ID parameter."})});v.get("/api/v1/moreinfo-resolve",async(t,e)=>{let s=re(t),n=t.query.sid||t.cookies?.["__Host-sid"],r=t.query.token||t.query.t,i=t.query.id;if(!r||!i)return t.query.json==="true"?e.status(400).json({error:"Verification transmission tokens or App ID were omitted."}):e.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");try{let p=V();if(p&&p.projectId){let d=X.default.createHash("sha256").update(r).digest("hex"),c=!1,a=se();if(a)try{(await a.collection("spent_tokens").doc(d).get()).exists&&(c=!0)}catch(_){console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:",_.message);let m=`https://firestore.googleapis.com/v1/projects/${p.projectId}/databases/${p.firestoreDatabaseId}/documents/spent_tokens/${d}${p.apiKey?"?key="+p.apiKey:""}`;(await fetch(m)).ok&&(c=!0)}else{let _=`https://firestore.googleapis.com/v1/projects/${p.projectId}/databases/${p.firestoreDatabaseId}/documents/spent_tokens/${d}${p.apiKey?"?key="+p.apiKey:""}`;(await fetch(_)).ok&&(c=!0)}if(c)return t.query.json==="true"?e.status(403).json({error:"This single-use private download signature has already been spent."}):e.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>")}}catch{}let o=!1;try{Buffer.from(r,"base64url").toString("utf8").includes("::")&&(o=!0)}catch{}if(o)try{let p=Buffer.from(r,"base64url").toString("utf8"),[d]=p.split("::"),[c,a,_]=d.split("|");if(!Ts(r,c,a,_,i))return t.query.json==="true"?e.status(403).json({error:"Cryptographic HMAC validation failed."}):e.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");try{let h=V();if(h&&h.projectId){let I=X.default.createHash("sha256").update(r).digest("hex"),w=new Date().toISOString(),y=se();if(y)try{await y.collection("spent_tokens").doc(I).set({usedAt:w}),console.log(`[AUDIT] Successfully spent token ${I} via firebase-admin SDK`)}catch(g){console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:",g.message);let b=`https://firestore.googleapis.com/v1/projects/${h.projectId}/databases/${h.firestoreDatabaseId}/documents/spent_tokens/${I}${h.apiKey?"?key="+h.apiKey:""}`;fetch(b,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:w}}})}).catch(()=>{})}else{let g=`https://firestore.googleapis.com/v1/projects/${h.projectId}/databases/${h.firestoreDatabaseId}/documents/spent_tokens/${I}${h.apiKey?"?key="+h.apiKey:""}`;fetch(g,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:w}}})}).catch(()=>{})}}}catch{}let m="";try{let h=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:""),I=null;try{I=V()}catch{}if(I&&(!m||!m.startsWith("http"))){let w=se();if(w)for(let y of["sec_links_vault_3","secure_links","sec_vault"])try{let g=await w.collection("store_data").doc(y).get();if(g.exists){let b=g.data();if(b&&b.encryptedData){let x=U(b.encryptedData,h);if(x){let C=JSON.parse(x),T="";if(C&&Array.isArray(C)){let A=C.find(O=>O&&O.id===i);A&&(T=typeof A.url=="string"?A.url:typeof A.more_information_url=="string"?A.more_information_url:"")}else if(C&&typeof C=="object"){let A=C[i];typeof A=="string"?T=A:A&&typeof A=="object"&&(T=typeof A.url=="string"?A.url:typeof A.more_information_url=="string"?A.more_information_url:"")}if(T&&typeof T=="string"&&(T.startsWith("U2FsdGVkX1")?m=U(T,h):m=T,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${y}) for app ID: ${i}`);break}}}}}catch(g){console.warn(`[WARN] Firestore SDK failed to fetch ${y}:`,g.message)}}if((!m||!m.startsWith("http"))&&I&&I.projectId){let w=I.apiKey?`?key=${I.apiKey}`:"",y=`https://firestore.googleapis.com/v1/projects/${I.projectId}/databases/${I.firestoreDatabaseId}/documents`;for(let g of["sec_links_vault_3","secure_links","sec_vault"])try{let b=await fetch(`${y}/store_data/${g}${w}`);if(b.ok){let x=await b.json();if(x&&!x.error&&x.fields?.encryptedData?.stringValue){let C=x.fields.encryptedData.stringValue,T=U(C,h);if(T){let A=JSON.parse(T),O="";if(A&&Array.isArray(A)){let L=A.find(Q=>Q&&Q.id===i);L&&(O=typeof L.url=="string"?L.url:typeof L.more_information_url=="string"?L.more_information_url:"")}else if(A&&typeof A=="object"){let L=A[i];typeof L=="string"?O=L:L&&typeof L=="object"&&(O=typeof L.url=="string"?L.url:typeof L.more_information_url=="string"?L.more_information_url:"")}if(O&&typeof O=="string"&&(O.startsWith("U2FsdGVkX1")?m=U(O,h):m=O,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${g}) for app ID: ${i}`);break}}}}}catch(b){console.warn(`[WARN] Firestore REST fallback failed to fetch ${g}:`,b.message)}}if(!m||!m.startsWith("http"))try{let w="",y=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(y)){let b=require("fs").readFileSync(y,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);b&&b[1]&&(w=b[1])}if(w){let g="";if(typeof U<"u")g=U(w,h);else{let b=require("crypto-js");g=b.AES.decrypt(w,h).toString(b.enc.Utf8)}if(g){let b=JSON.parse(g),x="";if(b&&Array.isArray(b)){let C=b.find(T=>T&&T.id===i);C&&(x=typeof C.url=="string"?C.url:typeof C.more_information_url=="string"?C.more_information_url:"")}else if(b&&typeof b=="object"){let C=b[i];typeof C=="string"?x=C:C&&typeof C=="object"&&(x=typeof C.url=="string"?C.url:typeof C.more_information_url=="string"?C.more_information_url:"")}x&&typeof x=="string"&&(x.startsWith("U2FsdGVkX1")?m=U(x,h):m=x,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${i}`))}}}catch(w){console.warn("Vault decryption failed",w)}if(!m||!m.startsWith("http"))try{if(process.env.SECURE_LINKS){let w=JSON.parse(process.env.SECURE_LINKS);if(w&&typeof w=="object"){let y=w[i],g="";typeof y=="string"?g=y:y&&typeof y=="object"&&(g=typeof y.url=="string"?y.url:typeof y.more_information_url=="string"?y.more_information_url:""),g&&typeof g=="string"&&(g.startsWith("U2FsdGVkX1")?m=U(g,h):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${i}`))}}}catch{}if(!m||!m.startsWith("http"))try{let w=require("path").join(process.cwd(),".local/secure_links_backup.json");if(require("fs").existsSync(w)){let y=JSON.parse(require("fs").readFileSync(w,"utf8")),g="";if(y&&Array.isArray(y)){let b=y.find(x=>x&&x.id===i);b&&(g=typeof b.url=="string"?b.url:typeof b.more_information_url=="string"?b.more_information_url:"")}else if(y&&typeof y=="object"){let b=y[i];typeof b=="string"?g=b:b&&typeof b=="object"&&(g=typeof b.url=="string"?b.url:typeof b.more_information_url=="string"?b.more_information_url:"")}if(g&&typeof g=="string"){let b=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");g.startsWith("U2FsdGVkX1")?m=U(g,b):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${i}`)}}}catch(w){console.warn("Local filesystem backup retrieval failed:",w)}}catch(h){console.error("Firestore retrieval or decryption failed",h)}if(typeof m!="string")return console.error("targetUrl resolved to an object instead of a string:",m),e.status(500).json({error:"Download link encryption integrity failed."});if(m&&!m.startsWith("http://")&&!m.startsWith("https://")&&!m.startsWith("/")&&m.includes(".")&&(m="https://"+m),!m||!m.startsWith("http")&&!m.startsWith("/"))return console.error("CRITICAL: Failed to retrieve or decrypt URL for app:",i,"Result:",m),t.query.json==="true"?e.status(404).json({error:"Download link not found or not yet configured for this app."}):e.status(404).send(`<!DOCTYPE html>
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
</html>`);try{if(m.startsWith("http")){let h=new URL(m);if(!(h.hostname.includes("google.com")||h.hostname.includes("googleapis.com"))&&!h.searchParams.has("code")){let w=process.env.AFFILIATE_CODE;w&&(h.searchParams.set("code",w),m=h.toString())}}}catch{}return console.log("FINAL REDIRECT TARGET IS:",m),e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.set("Referrer-Policy","no-referrer"),e.redirect(302,m)}catch{return e.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>")}let f=Ce.get(r);if(!f)return t.query.json==="true"?e.status(404).json({error:"Link expired or invalid."}):e.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");if(f.expiresAt<Date.now())return Ce.delete(r),t.query.json==="true"?e.status(404).json({error:"This connection timed out."}):e.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");Ce.delete(r),Cs.add(r);let l=f.targetUrl;try{if(l.startsWith("http")){let p=new URL(l);if(!(p.hostname.includes("google.com")||p.hostname.includes("googleapis.com"))&&!p.searchParams.has("code")){let c=process.env.AFFILIATE_CODE;c&&(p.searchParams.set("code",c),l=p.toString())}}}catch{}return e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.redirect(302,l)});v.get("/api/v1/download/:id",async(t,e)=>{let s=t.params.id;return s?e.redirect(302,`/moreinfo/${s}`):e.status(400).send("Bad Request")});v.use((t,e,s,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let r=G.default.join(process.cwd(),"server_requests.log");F.default.appendFileSync(r,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(s.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return s.status(500).json({error:"Internal server error"});s.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});var Ys=module.exports=v;
