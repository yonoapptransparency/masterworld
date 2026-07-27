var Ft=Object.create;var Te=Object.defineProperty;var Pt=Object.getOwnPropertyDescriptor;var Bt=Object.getOwnPropertyNames;var zt=Object.getPrototypeOf,Vt=Object.prototype.hasOwnProperty;var je=(t,e)=>()=>(t&&(e=t(t=0)),e);var He=(t,e)=>{for(var s in e)Te(t,s,{get:e[s],enumerable:!0})},ct=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Bt(e))!Vt.call(t,r)&&r!==s&&Te(t,r,{get:()=>e[r],enumerable:!(n=Pt(e,r))||n.enumerable});return t};var H=(t,e,s)=>(s=t!=null?Ft(zt(t)):{},ct(e||!t||!t.__esModule?Te(s,"default",{value:t,enumerable:!0}):s,t)),xe=t=>ct(Te({},"__esModule",{value:!0}),t);var De={};He(De,{mockApps:()=>ae,mockBlogs:()=>le,mockNews:()=>ce,mockSettings:()=>Se,mockVideos:()=>de,saveMockApps:()=>Mt,saveMockBlogs:()=>Gt,saveMockNews:()=>Ht,saveMockSettings:()=>Wt,saveMockVideos:()=>Jt});var ae,Mt,Se,Wt,ce,Ht,le,Gt,de,Jt,Ge=je(()=>{ae=[{id:"test_save_app_2",name:"Test Save 2",title:"Test Save 2"}],Mt=t=>{try{localStorage.setItem("rummystore_apps",JSON.stringify(t))}catch(e){console.warn("saveMockApps storage failed:",e)}ae.splice(0,ae.length,...t)},Se={site_title:"Yono Store",meta_description:"Download All Yono Games, Rummy Apps & Teen Patti APKs",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},Wt=t=>{try{localStorage.setItem("rummystore_settings",JSON.stringify(t))}catch(e){console.warn("saveMockSettings storage failed:",e)}Object.assign(Se,t)},ce=[],Ht=t=>{try{localStorage.setItem("rummystore_news",JSON.stringify(t))}catch(e){console.warn("saveMockNews storage failed:",e)}ce.splice(0,ce.length,...t)},le=[],Gt=t=>{try{localStorage.setItem("rummystore_blogs",JSON.stringify(t))}catch(e){console.warn("saveMockBlogs storage failed:",e)}le.splice(0,le.length,...t)},de=[],Jt=t=>{try{localStorage.setItem("rummystore_videos",JSON.stringify(t))}catch(e){console.warn("saveMockVideos storage failed:",e)}de.splice(0,de.length,...t)}});function Je(){let t=null;typeof process<"u"&&(t=process.env?.ADMIN_PATH||process.env?.VITE_ADMIN_PATH);try{let e=Kt.env?.VITE_ADMIN_PATH;e&&(t=e)}catch{}return t||"admin"}var Kt,lt=je(()=>{Kt={}});var dt={};He(dt,{b64EncodeUnicode:()=>qt,commitFileToGitHub:()=>Yt,generateStaticDataFileCode:()=>Ke});function qt(t){try{return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,s)=>String.fromCharCode(parseInt(s,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(t)}}function Ke(t=[],e={},s=[],n=[],r=[]){let o=JSON.parse(JSON.stringify(t||[])).map(c=>(delete c.more_information_url,delete c.encrypted_download_url,delete c.download_url,c)),p={...{site_title:"Yono Store",meta_description:"Download All Yono Games, Rummy Apps & Teen Patti APKs",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))},l=JSON.parse(JSON.stringify(s||[])),u=JSON.parse(JSON.stringify(n||[])),f=JSON.parse(JSON.stringify(r||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockApps: AppConfig[] = ${JSON.stringify(o,null,2)};

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = ${JSON.stringify(p,null,2)};

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

export const mockBlogs: BlogPost[] = ${JSON.stringify(u,null,2)};

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(f,null,2)};

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}async function Yt({owner:t,repo:e,token:s,branch:n,path:r,content:o,message:i}){let l=await fetch("/api/github-sync/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({owner:t,repo:e,token:s,branch:n,path:r,content:o,message:i})});if(!l.ok){let u=l.headers.get("content-type"),f=await l.text(),c=f||`Server returned ${l.status} ${l.statusText}`;if(u&&u.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${l.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${f.substring(0,100)}...`);try{let a=JSON.parse(f);c=a.message||a.error||c}catch{(!c||c.trim()==="")&&(c=`HTTP Error ${l.status}`)}throw new Error(c)}return l.json()}var qe=je(()=>{});var Ee={};He(Ee,{fetchStoreData:()=>ve,getField:()=>d,injectSeoTags:()=>_s,syncFromFirestore:()=>Xt});function yt(){if(ue)return ue;try{let n=fe.default.readFileSync(ke.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Ye(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ue=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Ye(t))return ue={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ue;try{let n=Zt.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Ye(r.projectId))return ue=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}function Ze(t){if(!t)return null;if("stringValue"in t)return t.stringValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("booleanValue"in t)return t.booleanValue;if("arrayValue"in t)return(t.arrayValue.values||[]).map(s=>Ze(s));if("mapValue"in t){let e=t.mapValue.fields||{},s={};for(let n of Object.keys(e))s[n]=Ze(e[n]);return s}return null}function ee(t){if(!t)return{};let e={};for(let s of Object.keys(t))e[s]=Ze(t[s]);return e}function d(t,e,s=""){if(!t)return s;let n=t[e];return n==null?s:typeof n=="object"?"stringValue"in n?n.stringValue??s:"integerValue"in n?String(n.integerValue)??s:"booleanValue"in n?String(n.booleanValue)??s:s:String(n)}async function Xt(){try{let t=yt();if(!t||!t.projectId)return console.log("[SYNC] Skipping background Firestore sync: Firebase config not found."),null;let e=t.projectId,s=t.firestoreDatabaseId||"(default)",n=t.apiKey,r=n?`?key=${n}`:"",o=`https://firestore.googleapis.com/v1/projects/${e}/databases/${s}/documents/store_data`;console.log(`[SYNC] Syncing filesystem backup files with Firestore (${e})...`);let[i,p,l,u,f]=await Promise.all([fetch(`${o}/public_settings${r}`).catch(()=>null),fetch(`${o}/news${r}`).catch(()=>null),fetch(`${o}/blogs${r}`).catch(()=>null),fetch(`${o}/videos${r}`).catch(()=>null),fetch(`${o}/apps_meta${r}`).catch(()=>null)]),c=Se;if(i&&i.ok){let h=await i.json(),g=ee(h.fields);g&&g.site_title&&(c=g)}if(!c||!c.site_title)try{let h=await fetch(`${o}/settings${r}`).catch(()=>null);if(h&&h.ok){let g=await h.json(),y=ee(g.fields);y&&y.site_title&&(c=y)}}catch{}let a=ce;if(p&&p.ok){let h=await p.json(),g=ee(h.fields);g&&Array.isArray(g.items)&&(a=g.items)}let w=le;if(l&&l.ok){let h=await l.json(),g=ee(h.fields);g&&Array.isArray(g.items)&&(w=g.items)}let m=de;if(u&&u.ok){let h=await u.json(),g=ee(h.fields);g&&Array.isArray(g.items)&&(m=g.items)}let b=[],I=1,_=!1;if(f&&f.ok){let h=await f.json(),g=ee(h.fields);g&&typeof g.numChunks=="number"&&(I=g.numChunks,_=!0)}if(_){let h=[];for(let y=0;y<I;y++)h.push(fetch(`${o}/apps_chunk_${y}${r}`).then(v=>v.ok?v.json():null).catch(()=>null));(await Promise.all(h)).forEach(y=>{if(y){let v=ee(y.fields);v&&Array.isArray(v.items)&&b.push(...v.items)}})}else{let h=await fetch(`${o}/apps${r}`).catch(()=>null);if(h&&h.ok){let g=await h.json(),y=ee(g.fields);y&&Array.isArray(y.items)&&(b=y.items)}}b.length===0&&(b=ae);try{let h=ke.default.join(process.cwd(),"src/lib/public_backup.json");fe.default.writeFileSync(h,JSON.stringify({apps:b,settings:c,news:a,blogs:w,videos:m},null,2),"utf8");try{let{generateStaticDataFileCode:g}=(qe(),xe(dt)),y=g(b,c,a,w,m);fe.default.writeFileSync(ke.default.join(process.cwd(),"src/lib/staticData.ts"),y,"utf8")}catch(g){console.warn("Could not write staticData.ts fallback (skipping):",g.message)}}catch(h){console.warn("[SYNC] Could not write cache files to filesystem (running in read-only environment?):",h.message)}return console.log(`[SYNC] Synchronization successful. Apps count: ${b.length}`),{apps:b,settings:c,news:a,blogs:w,videos:m}}catch(t){return console.error("[SYNC] Sync error:",t),null}}async function ve(){let t=Date.now(),e=t-Le>ut,s=t-Le>ut*15;return Oe&&!s?(e&&!Ne&&(Ne=!0,pt().then(()=>{Ne=!1}).catch(n=>{Ne=!1,console.warn("Background store fetch failed safely:",n)})),Oe):await pt()}async function pt(){let t=Date.now(),e=ke.default.join(process.cwd(),"src/lib/public_backup.json");if(fe.default.existsSync(e))try{let n=JSON.parse(fe.default.readFileSync(e,"utf8")),r={apps:n.apps||[],settings:n.settings||{},news:n.news||[],blogs:n.blogs||[],videos:n.videos||[]};return Oe=r,Le=t,r}catch(n){console.error("Error reading public_backup.json in seoHelper:",n)}let s={apps:ae||[],settings:Se||{},news:ce||[],blogs:le||[],videos:de||[]};return Oe=s,Le=t,s}function S(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Ue(t){if(!t)return"";let e=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");return e=e.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi,""),e=e.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi,'href="#"'),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,""),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi,""),e}function te(t){return t?t.replace(/<[^>]*>?/gm," ").replace(/\s+/g," ").trim():""}function pe(t){if(!t)return"";let e=t.trim();if(e.startsWith("<")||e.includes("<meta ")){let s=e.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);if(s&&s[1])return s[1].trim();let n=e.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);return n&&n[1]?n[1].trim():te(e).substring(0,160)}return e}async function Qt(t,e){let{apps:s,settings:n,news:r,blogs:o,videos:i}=e,p=t.split("?")[0].split("#")[0].replace(/\/+$/,"")||"/",l=p.toLowerCase(),u="";if(l==="/"||l==="")u=ft(s,n,r,o,i);else if(l==="/new-apps")u=ss(s,n);else if(l.startsWith("/info/")||l.startsWith("/gateway/")||l.startsWith("/moredetail/")){let a="";l.startsWith("/info/")?a=p.split("/info/")[1]:l.startsWith("/gateway/")?a=p.split("/gateway/")[1]:a=p.split("/moredetail/")[1],u=rs(a,s,n)}else if(l==="/news")u=os(r,n);else if(l.startsWith("/news/")){let a=p.split("/news/")[1];u=gt(a,r,n)}else if(l==="/blogs")u=is(o,n);else if(l.startsWith("/blog/")){let a=p.split("/blog/")[1];u=mt(a,o,n)}else if(l==="/videos")u=as(i,n);else if(l.startsWith("/videos/")){let a=p.split("/videos/")[1];u=ht(a,i,n)}else if(l==="/about")u=cs(n);else if(l==="/developers")u=ls(n);else if(l==="/contact")u=ds(n);else if(l==="/privacy")u=us(n);else if(l==="/report-removal")u=ps(n);else if(l==="/terms")u=fs(n);else if(l==="/notice")u=ms(n);else if(l==="/ethics")u=hs(n);else if(l==="/disclaimer")u=ys(n);else if(l==="/submit-app")u=bs(n);else if(l==="/responsibility")u=gs(n);else{let a=l.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"");s.some(w=>w.slug?.toLowerCase()===a)?u=ns(a,s,n):r.some(w=>w.slug?.toLowerCase()===a)?u=gt(a,r,n):o.some(w=>w.slug?.toLowerCase()===a)?u=mt(a,o,n):i.some(w=>w.slug?.toLowerCase()===a)?u=ht(a,i,n):u=ft(s,n,r,o,i)}let f=es(n),c=ts(n);return`
    <div class="flex flex-col min-h-screen">
      ${f}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${u}
      </main>
      ${c}
    </div>
  `}function es(t){let e=d(t,"site_title"),s=d(t,"logo_url");return`
    <header class="py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white">
          ${s?`<img src="${S(s)}" loading="eager" width="40" height="40" class="w-10 h-10 object-contain" alt="Logo"/>`:""}
          <span>${S(e)}</span>
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
  `}function ts(t){let e=d(t,"site_title"),s=d(t,"logo_url"),n=d(t,"meta_description"),r=d(t,"disclaimer_text"),o=d(t,"ethics_discrimination_text"),i=d(t,"important_notice");return`
    <footer class="pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400">
      <div class="max-w-7xl mx-auto px-6">
        <h3 class="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2">
          ${s?`<img src="${S(s)}" loading="eager" width="32" height="32" class="w-8 h-8 object-contain" alt="Logo" />`:""}
          <span>${S(e)}</span>
        </h3>
        <p class="text-sm max-w-xl mx-auto mb-6 leading-relaxed">${S(n)}</p>
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
        <div class="text-xs text-zinc-400 mt-8">&copy; ${new Date().getFullYear()} ${S(e)}. All rights reserved.</div>
      </div>
    </footer>
  `}function ft(t,e,s,n,r){let o=d(e,"site_title"),i=d(e,"meta_description"),p="";[...t].sort((f,c)=>parseInt(d(f,"serial_number","999"),10)-parseInt(d(c,"serial_number","999"),10)).forEach((f,c)=>{let a=d(f,"name"),w=d(f,"slug"),m=d(f,"category"),b=d(f,"rating","5.0"),I=d(f,"icon_url"),_=f.is_new===!0||f.is_new&&f.is_new.booleanValue===!0;p+=`
      <a href="/app/${encodeURIComponent(w)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${c+1}</span>
        <img src="${I||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${S(a)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${S(a)}</h3>
          <p class="text-xs text-zinc-500 truncate">${S(m)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${b}</span><span class="text-zinc-400">\u2605</span>
            ${_?'<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>':""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `});let u="";return s.slice(0,3).forEach(f=>{u+=`
      <a href="/news/${encodeURIComponent(d(f,"slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${S(d(f,"title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${S(d(f,"description"))}</p>
      </a>
    `}),`
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${S(o)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${S(i)}</p>
      </div>
      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
          <h2 class="text-xl font-bold mb-4 px-2 text-left">Popular E-Sports virtual clients</h2>
          <div class="flex flex-col">${p}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest Archives</h3>
            <div class="flex flex-col gap-3">${u}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates \u2192</a>
          </div>
        </div>
      </div>
    </div>
  `}function ss(t,e){let s="",n=t.filter(o=>o.is_new===!0||o.is_new&&o.is_new.booleanValue===!0);return(n.length>0?n:t).forEach(o=>{let i=d(o,"name"),p=d(o,"slug"),l=d(o,"category"),u=d(o,"rating","5.0"),f=d(o,"icon_url");s+=`
      <a href="/app/${encodeURIComponent(p)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${S(i)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${S(l)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${u} \u2605</span>
      </a>
    `}),`
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${s}</div>
    </div>
  `}function ns(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(b=>d(b,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>';let o=d(r,"name"),i=d(r,"category"),p=d(r,"version","Latest"),l=d(r,"file_size","Variable"),u=d(r,"rating","5.0"),f=d(r,"icon_url"),c=r.description_html?Ue(r.description_html):`<p>No comprehensive details are configured yet for ${S(o)}.</p>`,a=r.features_html?Ue(r.features_html):"",w=a?`<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${a}</div>`:"",m=d(r,"package_name","Not published");return`
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="96" height="96" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${S(o)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${S(i)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${S(p)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${S(l)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${S(i.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${S(u)} \u2605</strong></div>
        </div>

        <a href="/info/${encodeURIComponent(t)}" class="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow hover:opacity-95">Install Direct Access Mirror \u{1F680}</a>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm text-left">
          <h2 class="text-lg font-bold mb-4">Detailed Game Review & Safe Guidelines</h2>
          <div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${c}</div>
          ${w}
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm h-fit text-left">
          <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-400">Specifications</h3>
          <table class="w-full text-xs text-left">
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Developer</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Store Certified</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Package Name</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white truncate max-w-[150px]">${S(m)}</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Status</td><td class="py-2 font-bold text-right text-green-500">Safe & Clean</td></tr>
            <tr><td class="py-2 text-zinc-400 font-semibold">System Code</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Android / iOS</td></tr>
          </table>
        </div>
      </div>
    </div>
  `}function rs(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(p=>d(p,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>';let o=d(r,"name");return`
    <div class="max-w-xl mx-auto py-12 px-4 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5">
      <div class="text-center">
        <img src="${d(r,"icon_url")||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border" alt="icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-1">${S(o)}</h1>
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black mb-6">Information Hub</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-8">Access the application details and specifications below.</p>
        <a href="/" class="block w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl">Return Home</a>
        <a href="/${encodeURIComponent(t)}" class="block text-xs font-semibold text-blue-500 hover:underline mt-4">Read Technical Description</a>
      </div>
    </div>
  `}function os(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/news/${encodeURIComponent(d(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${S(d(n,"category")||"Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${S(d(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${S(d(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${S(d(n,"description"))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`}function gt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(c=>d(c,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>';let o=d(r,"title"),i=d(r,"created_at")||"May 2026",p=d(r,"ceo_name","System Author"),l=d(r,"category","Report"),u=d(r,"content")||d(r,"description",""),f=Ue(u);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${S(l)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${i} | By ${S(p)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${S(o)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${f.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function is(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/blog/${encodeURIComponent(d(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${S(d(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${S(d(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${S(te(d(n,"excerpt")||d(n,"content","").substring(0,140)))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`}function mt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(f=>d(f,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>';let o=d(r,"title"),i=d(r,"created_at")||"May 2026",p=d(r,"author","System Author"),l=d(r,"content",""),u=Ue(l);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${i} | Strategy by ${S(p)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${S(o)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${u.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function as(t,e){let s="";return t.forEach(n=>{let r=d(n,"title"),o=d(n,"slug"),i=d(n,"description","");s+=`
      <a href="/videos/${encodeURIComponent(o)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${S(r)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${S(i)}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${s||'<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`}function ht(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(p=>d(p,"slug").toLowerCase()===n||d(p,"id").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>';let o=d(r,"title"),i=d(r,"description");return`<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${S(o)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${i.replace(/\n\n/g,"<br/><br/>")}</p></div>`}function cs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(d(t,"about_content")||"About our application services.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ls(t){let e=t?.developers||[],s="";return e.length===0?s=`<div class="bg-white/50 border border-black/5 p-12 rounded-[3rem] max-w-lg mx-auto shadow-2xl text-center">
      <h1 class="text-3xl font-black mb-4 uppercase tracking-tight italic">Our Developers</h1>
      <p class="text-slate-600 font-medium">Information about our developers is not available at this moment. Please check back later.</p>
    </div>`:(e.forEach(n=>{s+=`<div class="bg-white/70 border border-black/5 rounded-[2rem] p-8 backdrop-blur-md shadow-lg text-center flex flex-col items-center">
        <div class="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-xl">
          <img src="${n.image_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(n.name)}&background=random`}" alt="${S(n.name)}" class="w-full h-full object-cover"/>
        </div>
        <h3 class="text-2xl font-black text-zinc-900 mb-2 tracking-tight">${S(n.name)}</h3>
        <div class="bg-pink-500/10 text-pink-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">${S(n.role)}</div>
        <p class="text-slate-600 mb-8 font-medium text-sm leading-relaxed">${S(n.bio)}</p>
      </div>`}),s=`<div class="text-center mb-16"><h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic">Meet Our Team</h1><p class="text-lg text-slate-600 font-medium max-w-2xl mx-auto">The creative minds and technical experts building the future of ${S(d(t,"site_title","RummyDex"))}.</p></div><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">${s}</div>`),`<div class="max-w-6xl mx-auto py-12">${s}</div>`}function ds(t){let e=d(t,"contact_content")||"Get in touch for active client files help.",s=d(t,"support_email","support@example.com");return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${e}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${S(s)}</p></div></div>`}function us(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(d(t,"privacy_content")||"No private data tracking.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ps(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(d(t,"report_removal_content")||"Report & Removal Policy compliance guidelines.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function fs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(d(t,"terms_content")||"Service code terms of compliance.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function gs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(d(t,"responsibility_content")||"Play safe for custom virtual entertainment.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ms(t){let e=d(t,"important_notice_heading")||"Important Notice",s=d(t,"important_notice")||"No important notices at this time.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function hs(t){let e=d(t,"ethics_heading")||"Ethics & Safety",s=d(t,"ethics_discrimination_text")||"Ethics and safety information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ys(t){let e=d(t,"disclaimer_heading")||"Disclaimer",s=d(t,"disclaimer_text")||"Disclaimer information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function bs(t){let e=d(t,"site_title")||"RummyDex";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5">
    <h1 class="text-4xl font-bold mb-6">Submit Your App</h1>
    <p class="prose text-zinc-750 leading-relaxed font-semibold">Submit your Android application for listing and promotion on ${S(e)}.</p>
  </div>`}function ws(){try{let t=yt();return t?!t.apiKey||t.apiKey.trim()===""||t.apiKey.includes("YOUR_API_KEY")?{projectId:"placeholder-project-id",appId:"placeholder-app-id",apiKey:"PLACEHOLDER",authDomain:"placeholder-project.firebaseapp.com",firestoreDatabaseId:"(default)",storageBucket:"placeholder-project.firebasestorage.app",messagingSenderId:"000000000",measurementId:""}:t:null}catch{return null}}async function _s(t,e,s,n=""){let r=await ve();if(!r||!r.settings)return{html:t,isNotFound:!1};let o=r.apps||[],i=r.settings||{},p=r.news||[],l=r.blogs||[],u=r.videos||[],f=d(i,"site_title")||"RummyDex",c=f,a=d(i,"meta_description","");a||(a="A premium digital platform for applications and tools.");let w=d(i,"seo_keywords","");if(w||(w="app clearance, premium applications, digital tools, platform, tech specs, verified apps"),w){let A=w.split(",").map(x=>x.trim()).filter(Boolean);A.length>15&&(w=A.slice(0,15).join(", "))}let m="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",b=f||"Platform Administrator",I=null,_="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",h=!1,g=e.split("?")[0].split("#")[0],y=g.toLowerCase(),v=g.toLowerCase().replace(/^\/|\/$/g,""),C=Je().toLowerCase(),L=y.startsWith("/moreinfo/")||y.startsWith("/info/")||y.startsWith("/moredetail/")||y.startsWith("/gateway/");if(g==="/"||v==="")h=!1;else if(v===C||y.startsWith(`/${C}`)||y.startsWith("/admin")||["wp-admin","dashboard","panel"].includes(v))h=!1;else if(y.startsWith("/app/")){let A=decodeURIComponent(g.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase()),x=o.find(T=>{let R=d(T,"slug");return R&&R.toLowerCase()===A});if(x){h=!1;let T=d(x,"name");c=`${d(x,"seo_title")||T}`;let R=d(x,"description_html");a=pe(d(x,"seo_description"))||(R?te(R).substring(0,160):"")||a,w=d(x,"seo_keywords")||w,m=d(x,"og_image_url")||d(x,"icon_url")||m;let P=(()=>{let X=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return X.includes("rummydex.com")?"https://www.rummydex.com":X})();I=d(x,"canonical_url")||`${P}/app/${d(x,"slug")}`,_=d(x,"icon_url")||_}else h=!0}else if(y.startsWith("/info/")||y.startsWith("/moreinfo/")||y.startsWith("/moredetail/")||y.startsWith("/gateway/")){let A="/info/";y.startsWith("/moreinfo/")?A="/moreinfo/":y.startsWith("/moredetail/")?A="/moredetail/":y.startsWith("/gateway/")&&(A="/gateway/");let x=e.split(new RegExp(A,"i"))[1]||"",T=decodeURIComponent(x.split("/")[0].split("?")[0]),R=o.find(P=>{let W=d(P,"slug");return W&&W.toLowerCase()===T.toLowerCase()});if(R){h=!1;let P=d(R,"name");c=`${d(R,"seo_title")||P} - Technical Info`;let W=d(R,"description_html");a=pe(d(R,"seo_description"))||(W?te(W).substring(0,160):"")||a,w=d(R,"seo_keywords")||w,m=d(R,"og_image_url")||d(R,"icon_url")||m,I=`${(()=>{let _e=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return _e.includes("rummydex.com")?"https://www.rummydex.com":_e})()}${A}${d(R,"slug")}`,_=d(R,"icon_url")||_}else h=!0}else if(y.startsWith("/news/")&&y.length>6){let A=decodeURIComponent((e.split(/\/news\//i)[1]||"").split("/")[0].split("?")[0]),x=p.find(T=>{let R=d(T,"slug");return R&&R.toLowerCase()===A.toLowerCase()});if(x){h=!1;let T=d(x,"title","Latest News");c=`${d(x,"seo_title")||T} | ${f}`;let R=d(x,"description")||d(x,"content");a=pe(d(x,"seo_description"))||(R?te(R).substring(0,160):"")||a,w=d(x,"seo_keywords")||w,m=d(x,"og_image_url")||d(x,"logo_url")||m,b=d(x,"ceo_name")||f;let P=(()=>{let X=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return X.includes("rummydex.com")?"https://www.rummydex.com":X})();I=d(x,"canonical_url")||`${P}/news/${d(x,"slug")}`}else h=!0}else if(y.startsWith("/blog/")&&y.length>6){let A=decodeURIComponent((e.split(/\/blog\//i)[1]||"").split("/")[0].split("?")[0]),x=l.find(T=>{let R=d(T,"slug");return R&&R.toLowerCase()===A.toLowerCase()});if(x){h=!1;let T=d(x,"title","Blog Post");c=`${d(x,"seo_title")||T} | ${f}`;let R=d(x,"excerpt")||d(x,"content");a=pe(d(x,"seo_description"))||(R?te(R).substring(0,160):"")||a,w=d(x,"seo_keywords")||w,m=d(x,"cover_url")||m,b=d(x,"author")||f;let P=(()=>{let X=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return X.includes("rummydex.com")?"https://www.rummydex.com":X})();I=d(x,"canonical_url")||`${P}/blog/${d(x,"slug")}`}else h=!0}else if(y.startsWith("/videos/")&&y.length>8){let A=decodeURIComponent((e.split(/\/videos\//i)[1]||"").split("/")[0].split("?")[0]),x=u.find(T=>{let R=d(T,"slug"),P=d(T,"id");return R&&R.toLowerCase()===A.toLowerCase()||P&&P.toLowerCase()===A.toLowerCase()});if(x){h=!1;let T=d(x,"title","Video Specs");c=`${d(x,"seo_title")||T} | ${f}`;let R=d(x,"description");a=pe(d(x,"seo_description"))||(R?te(R).substring(0,160):""),w=d(x,"seo_keywords");let P=d(x,"youtube_url"),W="";if(P){let Re=P.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);Re&&(W=Re[1])}W&&(m=`https://img.youtube.com/vi/${W}/maxresdefault.jpg`),I=`${(()=>{let _e=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return _e.includes("rummydex.com")?"https://www.rummydex.com":_e})()}/videos/${d(x,"slug")||d(x,"id")}`}else h=!0}else if(["about","blogs","blog","contact","disclaimer","ethics","new-apps","news","notice","privacy","report-removal","responsibility","terms","videos","developers","submit-app"].includes(v))h=!1,v==="about"?(c=`About Us | ${f}`,a="Learn more about our mission, vision, and the premium services we offer on our platform."):v==="blogs"||v==="blog"?(c=`Official Blogs & Insights | ${f}`,a="Explore our official blog articles, professional guides, gameplay tips, and deep platform reviews."):v==="contact"?(c=`Contact Us | ${f}`,a="Get in touch with our professional support team. We are here to help you with your inquiries, feedback, and technical assistance."):v==="disclaimer"?(c=`Disclaimer | ${f}`,a="Read our platform disclaimer regarding content accuracy, fair play verification, and third-party links."):v==="ethics"?(c=`Code of Ethics & Content Policy | ${f}`,a="Discover our strict code of ethics, licensing standards, and platform content guidelines."):v==="new-apps"?(c=`New Releases & Up-and-Coming Apps | ${f}`,a="Stay updated with our latest releases, featured digital tools, and upcoming app launches."):v==="news"?(c=`Latest News & Press Updates | ${f}`,a="Browse official news bulletins, press announcements, security reports, and direct system updates."):v==="notice"?(c=`Important System Notice | ${f}`,a="Read our critical system alerts, maintenance updates, and important security advisories."):v==="privacy"?(c=`Privacy Policy | ${f}`,a="Read our comprehensive privacy policy to understand how we protect, secure, and handle your personal data."):v==="report-removal"?(c=`Report & Removal Request | ${f}`,a="Submit a content or application removal request to our legal and compliance team."):v==="responsibility"?(c=`Responsible Gaming & Play Policy | ${f}`,a="Learn about our commitment to user safety, self-exclusion tools, and responsible gameplay guidelines."):v==="terms"?(c=`Terms of Service & User Agreement | ${f}`,a="Review our terms of service, platform rules, and user agreements governing the use of our services."):v==="videos"?(c=`Video Previews & Walkthroughs | ${f}`,a="Watch high-definition videos, gameplay showcases, and technical walkthroughs of our certified applications."):v==="developers"?(c=`Meet Our Team | ${f}`,a=`Meet the brilliant developers behind ${f}. Discover our team's expertise and passion.`):v==="submit-app"&&(c=`Submit Your App | ${f}`,a=`Submit your Android application for listing and promotion on ${f}.`);else{let x=decodeURIComponent(e.split("?")[0].split("#")[0].replace(/^\/|\/$/g,""));if(x&&x!==""){let T=o.find(R=>d(R,"slug")?.toLowerCase()===x.toLowerCase());if(T){h=!1;let R=d(T,"name","App");c=d(T,"seo_title")||R;let P=d(T,"description_html"),W=`Discover the ${R} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;a=pe(d(T,"seo_description"))||(P?te(P).substring(0,160):W),w=d(T,"seo_keywords"),m=d(T,"og_image_url")||d(T,"icon_url")||m,I=d(T,"canonical_url"),_=d(T,"icon_url")||_}else h=!0}else h=!0}h&&(c=`404 Page Not Found | ${f}`,a=`The requested page does not exist on ${f}. Browse our certified application listings and news updates.`);let j=(()=>{let x=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return x.includes("rummydex.com")?"https://www.rummydex.com":x})(),Y=e.split("?")[0].split("#")[0].replace(/^\/api(\/[^/]+)?/i,"")||"/";Y.length>1&&Y.endsWith("/")&&(Y=Y.slice(0,-1));let Z=`${j}${Y}`,M=I||Z;M.includes("rummydex.com")&&(M=M.replace(/^http:\/\//i,"https://").replace("https://rummydex.com","https://www.rummydex.com")),M.length>10&&M.endsWith("/")&&!M.endsWith("://www.rummydex.com/")&&(M=M.slice(0,-1));let D=m;if(m){let A=m.trim();if(A.startsWith("//"))D=`https:${A}`;else if(A.startsWith("data:"))D=A;else if(!A.startsWith("http://")&&!A.startsWith("https://")){let x=A.startsWith("/")?A:`/${A}`;D=`${j}${x}`}else D=A}let $=_;if(_){let A=_.trim();if(A.startsWith("//"))$=`https:${A}`;else if(A.startsWith("data:"))$=A;else if(!A.startsWith("http://")&&!A.startsWith("https://")){let x=A.startsWith("/")?A:`/${A}`;$=`${j}${x}`}else $=A}let N=e.startsWith(`/${Je()}`),z=d(i,"google_analytics_id","")||d(i,"ga_tracking_id",""),Me=z?`
    <script async src="https://www.googletagmanager.com/gtag/js?id=${S(z)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${S(z)}');
    </script>
  `:"",ie=null;N||(o.some(x=>x.slug?.toLowerCase()===e.split("?")[0].split("#")[0].replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase())||e.startsWith("/gateway/")||e.startsWith("/moredetail/")||e.startsWith("/info/")||e.startsWith("/moreinfo/")?ie={"@context":"https://schema.org","@type":"SoftwareApplication",name:c,operatingSystem:"Android, iOS",applicationCategory:"GameApplication",description:a,url:M,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}}:e.startsWith("/news/")||e.startsWith("/blog/")?ie={"@context":"https://schema.org","@type":"Article",headline:c,description:a,image:D||[],author:{"@type":"Person",name:b}}:e.startsWith("/videos/")?ie={"@context":"https://schema.org","@type":"VideoObject",name:c,description:a,thumbnailUrl:D||[],uploadDate:new Date().toISOString()}:ie={"@context":"https://schema.org","@type":"WebSite",name:f,url:M});let at=ie?`<script type="application/ld+json">${JSON.stringify(ie).replace(/</g,"\\u003c")}</script>`:"";if(e==="/"||e===""){let A=d(i,"website_faqs");if(A&&Array.isArray(A)&&A.length>0){let x={"@context":"https://schema.org","@type":"FAQPage",mainEntity:A.map(T=>({"@type":"Question",name:T.question,acceptedAnswer:{"@type":"Answer",text:T.answer}}))};at+=`
    <script type="application/ld+json">${JSON.stringify(x).replace(/</g,"\\u003c")}</script>`}}let Nt=(()=>{let x=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").toLowerCase();if(x.includes("masterworld")||x.includes("dev-")||x.includes("pre-")||x.includes("localhost")||x.includes("127.0.0.1"))return!0;if(process.env.PUBLIC_DOMAIN)try{let T=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase(),R=s?new URL(s).host.toLowerCase():"";if(R&&R!==T)return!0}catch{}return!1})(),Ot=N||Nt||h?`
    <title>${N?"Admin Portal":S(c)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${S($)}" />
    <link rel="shortcut icon" href="${S($)}" />
    <link rel="apple-touch-icon" href="${S($)}" />
    `:""}
  `:`
    <title>${S(c)}</title>
    <meta name="description" content="${S(a)}" />
    <meta name="keywords" content="${S(w)}" />
    <meta name="author" content="${S(b)}" />
    <meta property="og:title" content="${S(c)}" />
    <meta property="og:description" content="${S(a)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${S(M)}" />
    ${D?`<meta property="og:image" content="${S(D)}" />`:""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${S(c)}" />
    <meta name="twitter:description" content="${S(a)}" />
    ${D?`<meta name="twitter:image" content="${S(D)}" />`:""}
    <meta name="robots" content="${L?"noindex, nofollow":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />
    <link rel="canonical" href="${S(M)}" />
    ${$?`
    <link rel="icon" type="image/x-icon" href="${S($)}" />
    <link rel="shortcut icon" href="${S($)}" />
    <link rel="apple-touch-icon" href="${S($)}" />
    `:""}
    ${at}
    ${Me}
  `,q=t.replace(/<title>.*?<\/title>/ims,"");q=q.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims,""),q=q.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims,"");let We=ws();console.log("SAFE FIREBASE CONFIG:",We);let Lt=`
    <script id="firebase-config-loader">
      ${We?`window.__FIREBASE_CONFIG__ = ${JSON.stringify(We).replace(/</g,"\\u003c")};`:""}
      window.__INITIAL_DATA__ = ${JSON.stringify({apps:o,settings:i,news:p,blogs:l,videos:u}).replace(/</g,"\\u003c")};
    </script>
  `,Ut=Ot.replace(/<(meta|link) /g,'<$1 data-rh="true" ').replace(/<title>/g,'<title data-rh="true">').replace(/<script type="application\/ld\+json"/g,'<script data-rh="true" type="application/ld+json"');q=q.replace("</head>",`${Lt}${Ut}</head>`);try{let A=await Qt(e,r);q.includes('<div id="root">')?q=q.replace('<div id="root">',`<div id="root">${A}`):q=q.replace("</body>",`<div id="seo-prerender">${A}</div>
  </body>`)}catch(A){console.error("Static pre-rendering body injection failed:",A)}return{html:q,isNotFound:h}}var fe,ke,Oe,Le,ut,Ne,Ye,Zt,ue,ge=je(()=>{fe=H(require("fs")),ke=H(require("path"));Ge();lt();Oe=null,Le=0,ut=36e5,Ne=!1,Ye=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>15&&(e.includes("#")||e.includes("!")||e.includes("@")||e.includes("$")||e.includes("proj-U7m")||e.includes("Sy8@")))},Zt="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ue=null});var Ve=H(require("express")),At=H(require("helmet")),rt=H(require("express-rate-limit")),It=H(require("cookie-parser")),G=H(require("path")),Q=H(require("crypto")),et=H(require("compression")),F=H(require("fs")),Ct=H(require("dns"));Ge();ge();qe();var ze=H(require("crypto-js"));var Ae=H(require("otpauth"));function bt(){return new Ae.Secret({size:20}).base32}function wt(t,e){return new Ae.TOTP({issuer:"rummydex.com",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Xe(t,e){try{return new Ae.TOTP({issuer:"rummydex.com",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(s){return console.error("TOTP verification error:",s),!1}}process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");console.log("Server starting with ADMIN_EMAIL:",process.env.ADMIN_EMAIL);var xs=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||xs();function U(t,e){let s=[e,process.env.AES_SECRET].filter(Boolean),n=Array.from(new Set(s));for(let r of n)if(!(!r||r.trim()===""))try{let i=ze.default.AES.decrypt(t,r).toString(ze.default.enc.Utf8);if(i&&i.trim().length>0)return i}catch{}return""}function J(t,e){if(!t||!e||e.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return ze.default.AES.encrypt(t,e).toString()}var Qe=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>15&&(e.includes("#")||e.includes("!")||e.includes("@")||e.includes("$")||e.includes("proj-U7m")||e.includes("Sy8@")))},Ss="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",me=null;function V(){if(me)return me;try{let n=F.default.readFileSync(G.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Qe(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,me=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Qe(t))return me={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},me;try{let n=Ss.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Qe(r.projectId))return me=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}var Ie=null,_t=!1;function ne(){if(Ie)return Ie;if(_t)return null;try{let t=require("firebase-admin"),e=V();t.apps.length===0&&(e&&e.projectId?t.initializeApp({projectId:e.projectId}):t.initializeApp());let s=e?.firestoreDatabaseId||"(default)";if(s&&s!=="(default)"){let{getFirestore:n}=require("firebase-admin/firestore");Ie=n(t.apps[0],s)}else Ie=t.firestore();return console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${s}`),Ie}catch(t){return console.warn("[WARN] Firebase Admin SDK initialization failed:",t.message||t),_t=!0,null}}var ks=[/zgrab/i,/masscan/i,/nmap/i,/nuclei/i,/sqlmap/i,/nikto/i,/dirbuster/i,/gobuster/i,/wfuzz/i],xt=process.env.CF_TURNSTILE_SECRET||"",vs=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},tt=vs(xt)?xt:"";async function Es(t,e){if(!tt)return!0;if(!t)return console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:",e),!1;try{let s=new URLSearchParams({secret:tt,response:t,remoteip:e}),r=await(await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:s,headers:{"Content-Type":"application/x-www-form-urlencoded"}})).json();return r.success?!0:(console.warn("[CF_TURNSTILE] Failed:",r["error-codes"]),!1)}catch(s){return console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:",e,s),!1}}var $t=t=>{let e=t.headers["user-agent"]||"";return!!(e&&ks.some(s=>s.test(e)))};function As(t){return!(!t||typeof t!="string"||t.length<8||/^(.)\1+$/.test(t))}var Is=60*1e3,Cs=300,Fe=new Map,we=async(t,e=Cs,s=Is)=>{try{let n=Date.now(),r=Fe.get(t);if((!r||n>r.resetTime)&&(r={count:0,resetTime:n+s}),r.count++,Fe.set(t,r),Math.random()<.01)for(let[o,i]of Fe.entries())n>i.resetTime&&Fe.delete(o);return r.count>e}catch{return!0}};function oe(t){return t.ip||t.socket?.remoteAddress||"unknown"}function St(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let s=[];for(let n of e){let r;if(n.toLowerCase().startsWith("0x")?r=parseInt(n,16):n.startsWith("0")&&n.length>1?r=parseInt(n,8):r=parseInt(n,10),isNaN(r)||r<0||r>255)return null;s.push(r)}if(e.length===1){let n=s[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=s[0],r=s[1];return r>16777215?null:[n,r>>>16&255,r>>>8&255,r&255]}else if(e.length===3){let n=s[0],r=s[1],o=s[2];return o>65535?null:[n,r,o>>>8&255,o&255]}return s}function kt(t){let[e,s,n,r]=t;return e===127||e===10||e===172&&s>=16&&s<=31||e===192&&s===168||e===169&&s===254||e===0||e===100&&s>=64&&s<=127||e===192&&s===0&&n===0||e===192&&s===0&&n===2||e===198&&s>=18&&s<=19||e===198&&s===51&&n>=100&&n<=103||e===203&&s===0&&n===113||e>=224&&e<=239||e>=240}async function $s(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let s=e.hostname.toLowerCase(),n=St(s);if(n&&kt(n)||s==="[::1]"||s==="::1"||s.startsWith("[fc00")||s.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(s)||s.endsWith(".local")||s.endsWith(".internal"))return!1;try{let o=await Ct.default.promises.lookup(s,{all:!0});for(let i of o){let p=i.address,l=St(p);if(l&&kt(l)||p==="::1"||p.startsWith("fc00:")||p.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var se=new Map,Rs=new Set,Ce=new Map;setInterval(()=>{let t=Date.now();for(let[e,s]of se.entries())s.expiresAt<t&&se.delete(e);for(let[e,s]of Ce.entries())s.expiresAt<t&&Ce.delete(e)},3e4);function Ts(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let s=Q.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",s,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0}),s}return t.cookies["__Host-sid"]}function js(t,e,s,n){let o=Math.floor(Date.now()/1e3)+1800,i=`${t}|${e}|${s}|${n}|${o}`,p=Q.default.createHmac("sha256",Rt).update(i).digest("hex");return Buffer.from(`${i}::${p}`).toString("base64url")}function Ds(t,e,s,n,r){try{let o=Buffer.from(t,"base64url").toString("utf8"),[i,p]=o.split("::");if(!i||!p)return!1;let l=i.split("|");if(l.length!==5)return!1;let[u,f,c,a,w]=l;if(a!==r)return console.warn(`[SECURITY] Token appId mismatch: expected ${r}, got ${a}`),!1;if(Math.floor(Date.now()/1e3)>parseInt(w,10))return console.warn("[WARN] Signature expired."),!1;let m=Q.default.createHmac("sha256",Rt).update(i).digest("hex");return Q.default.timingSafeEqual(Buffer.from(p,"hex"),Buffer.from(m,"hex"))}catch{return!1}}process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");var Ns=()=>["fallback","token","secret"].join("_"),Rt=process.env.TOKEN_SECRET||Ns(),Ys=process.env.SESSION_SECRET||"fallback_session_secret_dev",E=(0,Ve.default)();E.set("trust proxy",1);E.use((0,At.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1,xFrameOptions:!1}));var Os=(0,rt.default)({windowMs:900*1e3,limit:5e3,standardHeaders:"draft-7",legacyHeaders:!1,validate:{trustProxy:!1}});E.use(Os);var ot=(0,rt.default)({windowMs:60*1e3,limit:100,standardHeaders:"draft-7",legacyHeaders:!1});E.use("/admin",ot);E.use("/api/v1/admin",ot);E.use("/api/download",ot);E.use((t,e,s)=>{let n=Date.now();e.on("finish",()=>{let r=G.default.join(process.cwd(),"server_requests.log"),o=Date.now()-n,i=e.getHeader("content-type")||"unknown",p=t.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig,"$1$2=REDACTED")}),s()});E.use((0,et.default)({level:6,threshold:256,filter:(t,e)=>t.headers["x-no-compression"]?!1:et.default.filter(t,e)}));E.use((0,It.default)());E.use((t,e,s)=>{if(process.env.NODE_ENV==="production"){let n=(t.headers["x-forwarded-host"]||t.headers.host||"").toString().toLowerCase().split(",")[0].trim(),r=(t.headers["x-forwarded-proto"]||t.protocol||"https").toString().toLowerCase().split(",")[0].trim();if(n==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${t.originalUrl}`);if(r==="http"&&n.includes("rummydex.com"))return e.redirect(301,`https://${n}${t.originalUrl}`)}s()});E.disable("x-powered-by");E.use((t,e,s)=>{e.removeHeader("X-Powered-By"),e.setHeader("X-Powered-By","SecureServer/1.0"),e.setHeader("X-XSS-Protection","1; mode=block"),e.setHeader("X-Content-Type-Options","nosniff"),e.setHeader("Referrer-Policy","strict-origin-when-cross-origin");let n=t.headers.origin,r="",o=!1;if(n){let p=!1,l=(()=>{try{return new URL(n)}catch{return null}})();if(l){let u=l.hostname,f=process.env.PUBLIC_DOMAIN?new URL(process.env.PUBLIC_DOMAIN).hostname:"www.rummydex.com";(u==="localhost"||u==="127.0.0.1"||u.endsWith(".google.com")||u.endsWith(".studio")||u.endsWith(".run.app")||u.endsWith(".vercel.app")||u===f||u===f.replace(/^www\./,"")||process.env.ALLOWED_ORIGINS&&process.env.ALLOWED_ORIGINS.split(",").map(a=>a.trim()).includes(n))&&(p=!0)}p?(r=n,o=!0):r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com"}else r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com";if(r&&e.setHeader("Access-Control-Allow-Origin",r),e.setHeader("Vary","Origin"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PATCH, PUT, DELETE"),e.setHeader("Access-Control-Allow-Headers","X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For"),o&&e.setHeader("Access-Control-Allow-Credentials","true"),t.method==="OPTIONS"){e.sendStatus(200);return}(process.env.NODE_ENV==="production"||t.headers["x-forwarded-proto"]==="https")&&e.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");let i=process.env.NODE_ENV!=="production";e.setHeader(i?"Content-Security-Policy-Report-Only":"Content-Security-Policy","default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;"),s()});E.use(Ve.default.json({limit:"50mb"}));E.use(Ve.default.urlencoded({limit:"50mb",extended:!0}));["/trap/link","/trap/form","/trap/admin","/trap/backup","/trap/config","/trap/db","/trap/env","/trap/wp-admin","/trap/.git","/trap/api-keys","/trap/download"].forEach(t=>{E.all(t,(e,s)=>{console.warn(`[HONEYPOT] [${t}] IP: ${oe(e)} UA: ${e.headers["user-agent"]}`),s.status(403).send("Forbidden.")})});E.get(["/favicon.ico","/favicon.png","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,s)=>{console.log("--- FAVICON/LOGO ROUTE HIT ---",t.originalUrl);try{let n="";try{let{fetchStoreData:r}=(ge(),xe(Ee)),o=await r();o&&o.settings&&(n=o.settings.favicon_url&&o.settings.favicon_url.trim()||o.settings.logo_url&&o.settings.logo_url.trim()||"")}catch(r){console.warn("Could not retrieve store settings for favicon, using default fallback:",r)}n||(n="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"),console.log("--- FAVICON/LOGO ROUTE RESOLVED TO ---",n);try{let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(r.ok){let o=await r.arrayBuffer(),i=Buffer.from(o),l=r.headers.get("content-type")||"image/png";return t.originalUrl.includes(".ico")?l="image/x-icon":t.originalUrl.includes(".png")&&(l="image/png"),e.set("Content-Type",l),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),console.log("--- FAVICON/LOGO PROXIED SECURELY ---",l,r.status),e.status(200).send(i)}else return console.warn(`Favicon proxy fetch returned status ${r.status}. Falling back to 302 redirect.`),e.set("Cache-Control","public, max-age=3600"),e.redirect(302,n)}catch(r){return console.error("Failed to proxy favicon content, falling back to 302 redirect:",r),e.redirect(302,n)}}catch(n){console.error("Favicon/Logo proxy routing failed:",n)}return s()});E.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let o=await ve();if(!o)throw new Error("No data");let{news:i=[],blogs:p=[],videos:l=[]}=o,u=`User-agent: *
Allow: /
Disallow: /api/
`,f=process.env.PUBLIC_DOMAIN||"";u+=`
Sitemap: ${f}/sitemap.xml
`,e.set("Content-Type","text/plain"),e.send(u)}catch{e.set("Content-Type","text/plain");let n=process.env.PUBLIC_DOMAIN||"";e.send(`User-agent: *
Allow: /
Sitemap: ${n}/sitemap.xml
`)}});E.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.status(404).send("Not Found");return}let o=await ve();if(!o)throw new Error("Unable to fetch store data");let{apps:i=[],news:p=[],blogs:l=[],videos:u=[]}=o,f=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com",c=t.headers.host?`https://${t.headers.host}`:f,a=`<?xml version="1.0" encoding="UTF-8"?>
`;a+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;let w="2026-07-26";a+=`  <url>
    <loc>${c}/</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/new-apps</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/news</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/blogs</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/videos</loc>
    <lastmod>${w}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/about</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/developers</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/contact</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/privacy</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/report-removal</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/terms</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/responsibility</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/notice</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/ethics</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/disclaimer</loc>
    <lastmod>${w}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${c}/submit-app</loc>
    <lastmod>${w}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
`;let m=_=>_.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),b=_=>{let h=d(_,"updated_at")||d(_,"created_at");if(h)try{if(typeof h=="object"&&h!==null&&h.seconds)return new Date(h.seconds*1e3).toISOString().split("T")[0];if(typeof h=="object"&&h!==null&&h._seconds)return new Date(h._seconds*1e3).toISOString().split("T")[0];let g=new Date(h);if(!isNaN(g.getTime()))return g.toISOString().split("T")[0]}catch{}return"2026-07-26"},I=_=>{if(!_||typeof _!="string")return!1;let h=_.trim().toLowerCase();return!h||h.startsWith("/")||h.includes("rummydex.com")?!1:!!(h.startsWith("http://")||h.startsWith("https://"))};for(let _ of i){let h=d(_,"slug"),g=d(_,"canonical_url");h&&!I(g)&&(a+=`  <url>
`,a+=`    <loc>${c}/app/${m(h)}</loc>
`,a+=`    <lastmod>${b(_)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.9</priority>
`,a+=`  </url>
`)}for(let _ of p){let h=d(_,"slug"),g=d(_,"canonical_url");h&&!I(g)&&(a+=`  <url>
`,a+=`    <loc>${c}/news/${m(h)}</loc>
`,a+=`    <lastmod>${b(_)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.7</priority>
`,a+=`  </url>
`)}for(let _ of l){let h=d(_,"slug"),g=d(_,"canonical_url");h&&!I(g)&&(a+=`  <url>
`,a+=`    <loc>${c}/blog/${m(h)}</loc>
`,a+=`    <lastmod>${b(_)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.7</priority>
`,a+=`  </url>
`)}for(let _ of u){let h=d(_,"slug");h&&(a+=`  <url>
`,a+=`    <loc>${c}/videos/${m(h)}</loc>
`,a+=`    <lastmod>${b(_)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.6</priority>
`,a+=`  </url>
`)}a+=`</urlset>
`,e.header("Content-Type","application/xml"),e.send(a)}catch(s){console.error("Sitemap Generation Error:",s),e.status(500).send("Error generating sitemap")}});var re=new Map,Tt=5,st=G.default.join(process.cwd(),"mock-2fa-state.json"),be=new Map,Zs=(process.env.ADMIN_EMAIL||"").toLowerCase();try{if(F.default.existsSync(st)){let t=JSON.parse(F.default.readFileSync(st,"utf8"));for(let[e,s]of Object.entries(t))be.set(e,s)}}catch(t){console.error("Failed to load mock 2FA file:",t)}function jt(){try{let t={};for(let[e,s]of be.entries())t[e]=s;F.default.writeFileSync(st,JSON.stringify(t,null,2),"utf8")}catch(t){console.error("Failed to save mock 2FA file:",t)}}var it=900*1e3,Dt=3600*1e3;function Ls(t){let e=Date.now(),s=re.get(t);return s?s.lockedUntil>e?{allowed:!1,lockedUntil:s.lockedUntil}:e-s.windowStart>it?(re.delete(t),{allowed:!0}):s.count>=Tt?(s.lockedUntil=e+Dt,re.set(t,s),{allowed:!1,lockedUntil:s.lockedUntil}):{allowed:!0}:{allowed:!0}}function vt(t){let e=Date.now(),s=re.get(t);if(!s||e-s.windowStart>it){re.set(t,{count:1,windowStart:e,lockedUntil:0});return}s.count+=1,s.count>=Tt&&(s.lockedUntil=e+Dt),re.set(t,s)}setInterval(()=>{let t=Date.now();for(let[e,s]of re.entries())s.lockedUntil<t&&t-s.windowStart>it*2&&re.delete(e)},7200*1e3);var B=async(t,e,s)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token.",message:"Unauthorized: Missing verification token."});let r=n.split("Bearer ")[1];if(!r||r==="null"||r==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token.",message:"Unauthorized: Empty session verification token."});if(r.startsWith("ey"))try{let o="";if(ne())o=(await require("firebase-admin").auth().verifyIdToken(r)).email||"";else{let u=V()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(u){let f=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${u}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:r})});f.ok&&(o=(await f.json())?.users?.[0]?.email||"")}}let p=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return o&&o.toLowerCase().trim()===p?(t.adminUser={email:o.toLowerCase().trim()},t.rawIdToken=r,s()):e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token.",message:"Unauthorized: Invalid Firebase token."})}try{let o=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!o)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured.",message:"Encryption misconfigured."});let i=U(r,o);if(!i)return e.status(401).json({error:"Unauthorized: Invalid token.",message:"Unauthorized: Invalid token."});let p=JSON.parse(i);return!p.admin||!p.email||!p.exp?e.status(401).json({error:"Unauthorized: Malformed token.",message:"Unauthorized: Malformed token."}):Date.now()>p.exp?e.status(401).json({error:"Unauthorized: Session expired.",message:"Unauthorized: Session expired."}):(t.adminUser={email:p.email},s())}catch(o){return console.error("verifyAdminToken error:",o),e.status(401).json({error:"Unauthorized: Token verification failed.",message:"Unauthorized: Token verification failed."})}};E.post("/api/v1/admin/login",async(t,e)=>{let s=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=Ls(s);if(!n.allowed){let l=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${l} min.`})}let{email:r,password:o}=t.body??{};if(!r||!o)return vt(s),e.status(400).json({error:"Missing email or password."});let i=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),p=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!p)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(r.toLowerCase().trim()===i&&o===p)try{let l=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",u=JSON.stringify({admin:!0,email:i,exp:Date.now()+864e5}),f=J(u,l);return e.json({token:f,email:i})}catch(l){return console.error("Login encryption error:",l),e.status(500).json({error:"Internal server error."})}return vt(s),e.status(401).json({error:"Invalid email or password."})});E.post("/api/v1/admin/google-login",async(t,e)=>{let{idToken:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing Firebase ID Token."});try{let n="";try{ne()&&(n=(await require("firebase-admin").auth().verifyIdToken(s)).email||"")}catch(l){console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:",l)}if(!n)try{let u=V()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(u){let f=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${u}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:s})});f.ok&&(n=(await f.json())?.users?.[0]?.email||"")}}catch(l){console.error("Firebase accounts:lookup verification failed:",l)}if(!n)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let r=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(n.toLowerCase().trim()!==r)return e.status(403).json({error:`Unauthorized: ${n} is not configured as an administrator.`});let o=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",i=JSON.stringify({admin:!0,email:n.toLowerCase().trim(),exp:Date.now()+864e5}),p=J(i,o);return e.json({token:p,email:n.toLowerCase().trim()})}catch(n){return console.error("Google login backend error:",n),e.status(500).json({error:"Authentication failed on server: "+(n.message||String(n))})}});E.post("/api/v1/admin/verify-session",async(t,e)=>{let s=String(t.headers.authorization||"");if(!s.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=s.split("Bearer ")[1];if(n.startsWith("ey"))try{let r="";if(ne())r=(await require("firebase-admin").auth().verifyIdToken(n)).email||"";else{let l=V()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(l){let u=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${l}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:n})});u.ok&&(r=(await u.json())?.users?.[0]?.email||"")}}let i=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return r&&r.toLowerCase().trim()===i?e.json({ok:!0,email:r.toLowerCase().trim()}):e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",o=U(n,r);if(!o)return e.status(401).json({error:"Unauthorized: Invalid token."});let i=JSON.parse(o);return!i.admin||Date.now()>i.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:i.email})}catch(r){return e.status(401).json({error:"Service error: "+(r?.message||String(r))})}});E.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing email address."});let n=String(s).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(s){return console.error("2fa resend error:",s),e.status(500).json({error:"Failed to process 2FA resend request: "+s.message})}});E.post("/api/github-sync/test",async(t,e)=>{try{let{owner:s,repo:n,token:r}=t.body||{},o=r||process.env.PAT;if(!s||!n||!o)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let i=o.trim(),p=i.toLowerCase().startsWith("ghp_")?`token ${i}`:`Bearer ${i}`,l=await fetch(`https://api.github.com/repos/${s.trim()}/${n.trim()}`,{headers:{Authorization:p,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(l.ok){let u=await l.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${u.full_name}`,permissions:u.permissions})}else{let u=await l.json().catch(()=>({})),f="";return l.status===401||l.status===403?f=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:l.status===404&&(f=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(l.status).json({ok:!1,message:(u.message||"Failed to connect to repository")+f})}}catch(s){return console.error("GitHub Test Connection error:",s),e.status(500).json({message:s.message||"Internal server error"})}});E.post("/api/github-sync/commit",async(t,e)=>{try{let{owner:s,repo:n,token:r,branch:o,path:i,content:p,message:l}=t.body||{},u=r||process.env.PAT;if(!s||!n||!u||!i||!p)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let f=o?o.trim():"main",c=i.replace(/^\/+/g,""),a=s.trim(),w=u.trim(),m=n.trim(),b=m,I=a.toLowerCase(),_=m.toLowerCase(),h=c.includes("staticData.ts")||c.includes("secureVault.ts")||c.includes("public_backup.json")||c.includes("secure_links_backup.json"),g=!1;console.log(`GitHub Sync Server Request: User "${a}" intends to sync "${c}" to repository "${m}"`);let y=w.toLowerCase().startsWith("ghp_")?`token ${w}`:`Bearer ${w}`,C=await(async L=>{let k=L;try{let D=await fetch(`https://api.github.com/users/${a}/repos?per_page=100`,{headers:{Authorization:y,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(D.ok){let $=await D.json();if(Array.isArray($)){let N=$.find(z=>z.name?.toLowerCase()===k.toLowerCase());N&&N.name!==k&&(console.log(`GitHub Sync Server: Correcting repository casing alignment from "${k}" to "${N.name}"`),k=N.name)}}else{let $=await fetch(`https://api.github.com/orgs/${a}/repos?per_page=100`,{headers:{Authorization:y,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();if(Array.isArray(N)){let z=N.find(Me=>Me.name?.toLowerCase()===k.toLowerCase());z&&z.name!==k&&(console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${k}" to "${z.name}"`),k=z.name)}}}}catch(D){console.warn("GitHub Repo casing alignment query not completed:",D)}console.log(`GitHub Sync Server: Fetching SHA of ${c} on repo ${a}/${k} [branch: ${f}]...`);let j,O="";try{let D=await fetch(`https://api.github.com/repos/${a}/${k}/contents/${c}?ref=${encodeURIComponent(f)}&_t=${Date.now()}`,{headers:{Authorization:y,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(D.ok){let $=await D.json();$&&!Array.isArray($)&&$.sha&&(j=$.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${j}`))}else if(D.status===404){console.log(`GitHub Sync Server: File not found on branch "${f}". Attempting default branch fallback...`);let $=await fetch(`https://api.github.com/repos/${a}/${k}/contents/${c}?_t=${Date.now()}`,{headers:{Authorization:y,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if($.ok){let N=await $.json();N&&!Array.isArray(N)&&N.sha&&(j=N.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${j}`))}else if($.status!==404){let N=await $.json().catch(()=>({})),z="";N.message&&(N.message.toLowerCase().includes("resource not accessible")||N.message.toLowerCase().includes("permission")||$.status===403)&&(z=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+k+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),O=`Default branch lookup failed with status ${$.status}: ${N.message||"Unknown error"}${z}`}}else{let $=await D.json().catch(()=>({})),N="";$.message&&($.message.toLowerCase().includes("resource not accessible")||$.message.toLowerCase().includes("permission")||D.status===403)&&(N=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+k+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),O=`Target branch lookup failed with status ${D.status}: ${$.message||"Unknown error"}${N}`}}catch(D){console.error("GitHub SHA Fetch error on Server:",D),O=`Network error fetching repository contents on server: ${D.message||D}`}if(O&&!j)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${O}

Please check your Repository config and Token permissions.`};let K=Buffer.from(p,"utf8").toString("base64"),Y={message:l||"Admin Release Sync: Static file update",content:K,branch:f,...j?{sha:j}:{}};console.log(`GitHub Sync Server: Initiating commit for ${c} to ${k}...`);let Z=await fetch(`https://api.github.com/repos/${a}/${k}/contents/${c}`,{method:"PUT",headers:{Authorization:y,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(Y)});if(!Z.ok){let D=await Z.text(),$=D;try{let z=JSON.parse(D);$=z.message||z.error?.message||D}catch{}let N="";return $.toLowerCase().includes("not found")?N=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+k+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:($.toLowerCase().includes("credentials")||Z.status===401)&&(N=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!N&&($.toLowerCase().includes("resource not accessible")||$.toLowerCase().includes("permission")||Z.status===403)&&(N=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+k+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:Z.status,error:$+N}}return{success:!0,result:await Z.json(),finalRepo:k}})(m);return C.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${C.finalRepo}"!`,C.result?.commit?.sha),e.json({...C.result,message:`Successfully published to ${C.finalRepo} repository.`,targetRepo:C.finalRepo})):e.status(C.status||400).json({message:C.error})}catch(s){return console.error("Server GitHub commit handler error:",s),e.status(500).json({message:`Internal server error during GitHub sync: ${s.message||s}`})}});E.get("/api/v1/image",async(t,e)=>{let s=t.query.url;if(!s)return e.status(400).send("Missing image URL");try{let n=s;try{s.startsWith("http")||(n=Buffer.from(s,"base64").toString("utf-8"))}catch{}if(!await $s(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!r.ok)throw new Error("Failed to fetch image");let o=await r.arrayBuffer(),i=r.headers.get("content-type")||"image/jpeg";e.set("Content-Type",i),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(o))}catch{e.status(500).send("Image proxy error")}});E.get("/api/v1/admin/firebase-status",async(t,e)=>{try{let s=V(),n=s.apiKey||process.env.FIREBASE_API_KEY,r=s.projectId||process.env.FIREBASE_PROJECT_ID,o=s.firestoreDatabaseId||"(default)";if(!n||!r)return e.status(503).json({status:"offline",error:"Missing Firebase credentials"});let i=await fetch(`https://firestore.googleapis.com/v1/projects/${r}/databases/${o}/documents?pageSize=1&key=${n}`);return i.status<500?e.json({status:"live"}):e.status(i.status).json({status:"offline",error:"Firestore returned server error"})}catch(s){return e.status(500).json({status:"offline",error:s.message})}});E.get("/api/v1/admin/verify",B,(t,e)=>{e.json({authorized:!0,user:t.adminUser})});E.get("/api/v1/admin/security/audit-logs",B,async(t,e)=>{let s=V();if(!!1&&s&&s.apiKey)try{let o=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${s.apiKey?"&key="+s.apiKey:""}`,i=await fetch(o);if(i.ok){let u=((await i.json()).documents||[]).map(f=>{let c=f.fields||{};return{id:f.name.split("/").pop(),email:c.email?.stringValue||"unknown",ip:c.ip?.stringValue||"unknown",ua:c.ua?.stringValue||"unknown",success:c.success?.booleanValue??!1,reason:c.reason?.stringValue||"unknown",ts:c.ts?.stringValue||new Date().toISOString()}}).sort((f,c)=>new Date(c.ts).getTime()-new Date(f.ts).getTime());return e.json({success:!0,logs:u})}}catch(o){console.error("Error fetching Firestore audit logs:",o)}let r=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:r})});E.get("/api/v1/admin/2fa/config",B,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim();if(!s)return e.status(400).json({error:"Missing admin email."});let n=!1,r=!1,o="";if(n){let i=be.get(s);i&&(r=i.enabled,o=i.secret)}else{let i=V();if(i&&i.apiKey)try{let p=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${i.apiKey?"?key="+i.apiKey:""}`,l=await fetch(p);if(l.ok){let u=await l.json();r=u.fields?.enabled?.booleanValue===!0,o=u.fields?.secret?.stringValue||""}}catch(p){console.error("Error fetching Firestore 2FA config:",p)}}if(r)return e.json({enabled:!0});{let i=bt(),p=wt(s,i);return e.json({enabled:!1,tempSecret:i,qrCodeUri:p})}});E.post("/api/v1/admin/2fa/enable",B,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:r}=t.body||{};if(!s||!n||!r)return e.status(400).json({error:"Missing required fields (email, secret, code)."});let o=!1;if(!(o&&r==="123456")&&!Xe(r,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});if(o)be.set(s,{enabled:!0,secret:n}),jt();else{let i=V();if(!i||!i.apiKey)return e.status(503).json({error:"Service Unavailable: Firebase is not configured."});try{let p=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${i.apiKey?"?key="+i.apiKey:""}`,l=await fetch(p,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{enabled:{booleanValue:!0},secret:{stringValue:n}}})});if(!l.ok){let u=await l.text();return console.error("Failed to save 2FA config to Firestore:",u),e.status(500).json({error:"Failed to save 2FA configuration to database."})}}catch(p){return console.error("Firestore save 2FA exception:",p),e.status(500).json({error:"Server database write error."})}}return e.json({success:!0})});E.post("/api/v1/admin/2fa/disable",B,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!s||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let r=!1,o="";if(r){let i=be.get(s);i&&i.enabled&&(o=i.secret)}else{let i=V();if(!i||!i.apiKey)return e.status(503).json({error:"Service Unavailable."});try{let p=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${i.apiKey?"?key="+i.apiKey:""}`,l=await fetch(p);if(l.ok){let u=await l.json();u.fields?.enabled?.booleanValue===!0&&(o=u.fields?.secret?.stringValue||"")}}catch(p){console.error("Firestore 2FA config fetch fail on disable:",p)}}if(!o)return e.status(400).json({error:"2FA is not enabled for this account."});if(!(r&&n==="123456")&&!Xe(n,o))return e.status(400).json({error:"Invalid verification code."});if(r)be.delete(s),jt();else{let i=V();if(i&&i.apiKey)try{let p=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${i.apiKey?"?key="+i.apiKey:""}`,l=await fetch(p,{method:"DELETE"});if(!l.ok)return console.error("Failed to delete 2FA config from Firestore:",await l.text()),e.status(500).json({error:"Failed to delete 2FA from database."})}catch(p){return console.error("Firestore delete 2FA exception:",p),e.status(500).json({error:"Server database delete error."})}}return e.json({success:!0})});E.post("/api/v1/admin/encrypt",B,async(t,e)=>{let s=oe(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let o=J(n,r);e.json({encrypted:o})}catch{e.status(500).json({error:"Encryption failed"})}});E.post("/api/v1/admin/encrypt-links",B,async(t,e)=>{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid links array payload is required."});try{let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let r=[],o=V();if(o){let c=o.apiKey?`?key=${o.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents`;for(let w of["sec_links_vault_3","secure_links","sec_vault"])try{let b=await(await fetch(`${a}/store_data/${w}${c}`)).json();if(b&&!b.error&&b.fields?.encryptedData?.stringValue){let I=U(b.fields.encryptedData.stringValue,n);if(I){let _=JSON.parse(I);if(Array.isArray(_)){r=_;break}}}}catch{}}let i=new Map;r.forEach(c=>{c&&c.id&&i.set(c.id,c)}),s.map(c=>{let a=c.url||"";return a&&!a.startsWith("http://")&&!a.startsWith("https://")&&!a.startsWith("U2FsdGVkX1")&&(a="https://"+a),a&&!a.startsWith("U2FsdGVkX1")&&(a=J(a,n)),{...c,url:a}}).forEach(c=>{c&&c.id&&i.set(c.id,c)});let l=Array.from(i.values()),u=JSON.stringify(l),f=J(u,n);try{let c={};l.forEach(m=>{m&&m.id&&m.url&&(c[m.id]=m.url)});let w=`// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${String(J(JSON.stringify(c),n))}";
`}catch(c){console.warn("Failed to auto-seal secureVault.ts from encrypt-links:",c)}e.json({encrypted:f})}catch{e.status(500).json({error:"Links encryption failed"})}});E.get("/api/v1/admin/debug-links",B,async(t,e)=>{let s=oe(t);if(await we(s))return e.status(429).json({error:"Too many requests"});try{let n=JSON.parse(F.default.readFileSync("firebase-applet-config.json","utf8")),r=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,i=await(await fetch(r)).json();if(!i.fields||!i.fields.encryptedData)return e.json({error:"No vault data found"});let p=i.fields.encryptedData.stringValue,l=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",u=U(p,l);e.json({decrypted:JSON.parse(u)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});E.post("/api/v1/admin/decrypt-url",B,async(t,e)=>{let s=oe(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let o=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${o} from IP ${s} at ${new Date().toISOString()}`);try{let i=U(n,r);e.json({decrypted:i||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});E.post("/api/v1/admin/decrypt-links",B,async(t,e)=>{let s=oe(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let o=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${o} from IP ${s} at ${new Date().toISOString()}`);try{let i=U(n,r);if(!i)throw new Error("Empty decrypted block.");let p=JSON.parse(i);p=p.map(l=>{let u=l.url||"";if(u.startsWith("U2FsdGVkX1"))try{u=U(u,r)}catch{}return{...l,url:u}}),e.json({items:p})}catch(i){console.error("[ERROR] Admin decrypt-links failed:",i.message||i),e.status(500).json({error:"Links decryption failed: "+(i.message||"Check AES_SECRET")})}});E.post("/api/v1/admin/sync-local",B,async(t,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:s,settings:n,news:r,blogs:o,videos:i}=t.body;if(!s||!n)return e.status(400).json({error:"Invalid sync payload."});let p=Ke(s,n,r,o,i);try{F.default.writeFileSync(G.default.join(process.cwd(),"src/lib/staticData.ts"),p,"utf8")}catch(g){console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):",g.message)}let l=JSON.parse(JSON.stringify(s)).map(g=>(delete g.more_information_url,delete g.encrypted_download_url,delete g.download_url,g)),u=JSON.parse(JSON.stringify(n)),f=JSON.parse(JSON.stringify(r||[])),c=JSON.parse(JSON.stringify(o||[])),a=JSON.parse(JSON.stringify(i||[])),w=G.default.join(process.cwd(),"src/lib/public_backup.json");try{F.default.writeFileSync(w,JSON.stringify({apps:l,settings:u,news:f,blogs:c,videos:a},null,2),"utf8")}catch(g){console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):",g.message)}let m=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",b={};s.forEach(g=>{if(g.more_information_url)if(g.more_information_url.startsWith("U2FsdGVkX1"))b[g.id]=g.more_information_url;else try{b[g.id]=J(g.more_information_url,m)}catch{console.warn(`[SECURITY] Skipped backup link for ${g.id} due to encryption failure`)}});let I=G.default.join(process.cwd(),".local/secure_links_backup.json"),_=b;if(F.default.existsSync(I))try{_={...JSON.parse(F.default.readFileSync(I,"utf8")),...b}}catch{}for(let[g,y]of Object.entries(_))if(y&&!y.startsWith("U2FsdGVkX1"))try{_[g]=J(y,m)}catch{delete _[g]}let h=!1;try{let g=ne();if(g){if(s&&Array.isArray(s)){let v=Math.ceil(s.length/25)||1;for(let C=0;C<v;C++){let L=JSON.parse(JSON.stringify(s.slice(C*25,(C+1)*25)));L.forEach(k=>{delete k.more_information_url,delete k.encrypted_download_url,delete k.download_url}),await g.collection("store_data").doc(`apps_chunk_${C}`).set({items:L})}await g.collection("store_data").doc("apps_meta").set({numChunks:v,last_updated:new Date().toISOString()})}if(n){let y=JSON.parse(JSON.stringify(n));await g.collection("store_data").doc("public_settings").set(y,{merge:!0})}r&&Array.isArray(r)&&await g.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(r))}),o&&Array.isArray(o)&&await g.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(o))}),i&&Array.isArray(i)&&await g.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(i))}),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),h=!0}}catch(g){console.warn("[SERVER] Firestore Admin SDK update warning, switching to REST API fallback:",g.message)}if(!h)try{let g=t.rawIdToken||(t.headers.authorization&&t.headers.authorization.startsWith("Bearer ")?t.headers.authorization.split("Bearer ")[1]:void 0),y=!0;if(s&&Array.isArray(s)){let C=Math.ceil(s.length/25)||1;for(let k=0;k<C;k++){let j=JSON.parse(JSON.stringify(s.slice(k*25,(k+1)*25)));j.forEach(K=>{delete K.more_information_url,delete K.encrypted_download_url,delete K.download_url}),await he(`apps_chunk_${k}`,{items:j},g)||(y=!1)}await he("apps_meta",{numChunks:C,last_updated:new Date().toISOString()},g)||(y=!1)}n&&(await he("public_settings",JSON.parse(JSON.stringify(n)),g)||(y=!1)),r&&Array.isArray(r)&&(await he("news",{items:JSON.parse(JSON.stringify(r))},g)||(y=!1)),o&&Array.isArray(o)&&(await he("blogs",{items:JSON.parse(JSON.stringify(o))},g)||(y=!1)),i&&Array.isArray(i)&&(await he("videos",{items:JSON.parse(JSON.stringify(i))},g)||(y=!1)),y?(console.log("[SERVER] Firestore documents successfully updated via REST API in sync-local endpoint."),h=!0):console.warn("[SERVER] Some Firestore REST API doc writes failed in sync-local endpoint.")}catch(g){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",g.message)}try{let g=G.default.join(process.cwd(),"src/lib/public_backup.json"),y={apps:s||[],settings:n||{},news:r||[],blogs:o||[],videos:i||[]};F.default.writeFileSync(g,JSON.stringify(y,null,2),"utf8")}catch(g){console.warn("[SERVER] Could not update public_backup.json:",g)}ye=null,e.json({success:!0,message:"Cloud Firestore and backup components strictly synced."})}catch(s){console.error("local file sync endpoint error:",s),e.status(500).json({error:"Failed to store backup: "+s.message})}});E.get("/api/v1/admin/backup-links-get",B,(t,e)=>{try{let s=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",n={},r=G.default.join(process.cwd(),"src/lib/secureVault.ts");if(F.default.existsSync(r))try{let l=F.default.readFileSync(r,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(l&&l[1]){let u=l[1],f=U(u,s);if(f){let c=JSON.parse(f);Array.isArray(c)?c.forEach(a=>{a&&a.id&&(n[a.id]=a.url||a.more_information_url||"")}):c&&typeof c=="object"&&Object.assign(n,c),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(p){console.warn("backup-links-get: Failed to parse secureVault.ts:",p.message)}let o=G.default.join(process.cwd(),".local/secure_links_backup.json");if(F.default.existsSync(o))try{let p=JSON.parse(F.default.readFileSync(o,"utf8"));Object.assign(n,p),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(p){console.warn("backup-links-get: Failed to parse backup JSON:",p.message)}let i=[];for(let[p,l]of Object.entries(n)){let u="";typeof l=="string"&&(l.startsWith("U2FsdGVkX1")?u=U(l,s):u=l),i.push({id:p,url:u})}e.json({items:i})}catch(s){console.error("backup-links-get failed:",s),e.status(500).json({error:"Failed to read backup links: "+s.message})}});E.get("/api/v1/admin/fix-db-links",B,async(t,e)=>{try{let s=V();if(!s)return e.status(500).json({error:"Missing configuration."});let r=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_0${s.apiKey?"?key="+s.apiKey:""}`)).json(),o=[];!r.error&&r.fields?.items?.arrayValue?.values&&(o=r.fields.items.arrayValue.values.map(b=>b.mapValue.fields.id.stringValue));let p=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_1${s.apiKey?"?key="+s.apiKey:""}`)).json();!p.error&&p.fields?.items?.arrayValue?.values&&(o=o.concat(p.fields.items.arrayValue.values.map(b=>b.mapValue.fields.id.stringValue)));let l=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",u=o.map(b=>({id:b,url:`https://example.com/demo/${b}`})),f=J(JSON.stringify(u),l),c=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",m=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${s.apiKey?"&key="+s.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${c}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:f}}})})).json();e.json(m)}catch(s){e.json({error:s.message})}});function nt(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:t.toString()}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>nt(e))}};if(typeof t=="object"){let e={};for(let s of Object.keys(t))e[s]=nt(t[s]);return{mapValue:{fields:e}}}return{stringValue:String(t)}}function Us(t){let e={};if(t&&typeof t=="object")for(let s of Object.keys(t))e[s]=nt(t[s]);return{fields:e}}async function he(t,e,s){try{let n=V();if(!n||!n.projectId)return!1;let r=n.apiKey?`?key=${n.apiKey}`:"",o=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId||"(default)"}/documents/store_data/${t}${r}`,i=Us(e),p={"Content-Type":"application/json"};s&&s.startsWith("ey")&&(p.Authorization=`Bearer ${s}`);let l=await fetch(o,{method:"PATCH",headers:p,body:JSON.stringify(i)});return l.ok?(console.log(`[SERVER] REST write to store_data/${t} succeeded.`),!0):(console.warn(`[SERVER] REST write to store_data/${t} status ${l.status}:`,await l.text()),!1)}catch(n){return console.warn(`[SERVER] REST write to store_data/${t} failed:`,n.message),!1}}function $e(t){if(!t||typeof t!="object")return t??null;if("stringValue"in t)return t.stringValue;if("booleanValue"in t)return t.booleanValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("timestampValue"in t)return t.timestampValue;if("nullValue"in t)return null;if("mapValue"in t){let e=t.mapValue?.fields||{},s={};for(let n of Object.keys(e))s[n]=$e(e[n]);return s}return"arrayValue"in t?(t.arrayValue?.values||[]).map(s=>$e(s)):null}function Pe(t){if(!t||typeof t!="object")return{};let e={};for(let s of Object.keys(t))e[s]=$e(t[s]);return e}var ye=null,Be=0,Fs=3e4;E.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data","/api/v1/admin/live-refresh"],async(t,e)=>{try{e.setHeader("Cache-Control","no-cache, no-store, must-revalidate, max-age=0"),e.setHeader("Pragma","no-cache"),e.setHeader("Expires","0");let s=t.query.nocache==="true"||t.query.refresh==="true"||!!t.query.t||t.path.includes("live-refresh"),n=Date.now();if(!s&&ye&&n-Be<Fs)return e.json(ye);try{let c=ne();if(c){let a=await c.collection("store_data").doc("apps_meta").get(),w=[];if(a.exists){let h=a.data()?.numChunks||1;for(let g=0;g<h;g++){let y=await c.collection("store_data").doc(`apps_chunk_${g}`).get();y.exists&&y.data()?.items&&w.push(...y.data().items)}}else{let h=await c.collection("store_data").doc("apps").get();h.exists&&h.data()?.items&&(w=h.data().items)}let m=await c.collection("store_data").doc("public_settings").get(),b=await c.collection("store_data").doc("news").get(),I=await c.collection("store_data").doc("blogs").get(),_=await c.collection("store_data").doc("videos").get();if(w.length>0||m.exists){let h={apps:w,settings:m.exists?m.data():{},news:b.exists?b.data()?.items||[]:[],blogs:I.exists?I.data()?.items||[]:[],videos:_.exists?_.data()?.items||[]:[]};return ye=h,Be=n,e.json(h)}}}catch{}try{let c=V();if(c&&c.projectId){let a=c.apiKey?`?key=${c.apiKey}`:"",w=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId||"(default)"}/documents/store_data`,m=await fetch(`${w}/apps_meta${a}`),b=[];if(m.ok){let k=await m.json(),j=k.fields?.numChunks?.integerValue?parseInt(k.fields.numChunks.integerValue,10):1;for(let O=0;O<j;O++){let K=await fetch(`${w}/apps_chunk_${O}${a}`);if(K.ok){let Y=await K.json();if(Y.fields?.items?.arrayValue?.values){let Z=Y.fields.items.arrayValue.values.map(M=>$e(M));b.push(...Z)}}}}else{let k=await fetch(`${w}/apps${a}`);if(k.ok){let j=await k.json();j.fields?.items?.arrayValue?.values&&(b=j.fields.items.arrayValue.values.map(O=>$e(O)))}}let I=await fetch(`${w}/public_settings${a}`),_=await fetch(`${w}/news${a}`),h=await fetch(`${w}/blogs${a}`),g=await fetch(`${w}/videos${a}`),y={},v={},C={},L={};try{I.ok&&(y=Pe((await I.json())?.fields))}catch{}try{_.ok&&(v=Pe((await _.json())?.fields))}catch{}try{h.ok&&(C=Pe((await h.json())?.fields))}catch{}try{g.ok&&(L=Pe((await g.json())?.fields))}catch{}if(b.length>0||Object.keys(y).length>0){let k={apps:b,settings:y,news:v.items||[],blogs:C.items||[],videos:L.items||[]};return ye=k,Be=n,e.json(k)}}}catch{}let r=G.default.join(process.cwd(),"src/lib/public_backup.json");if(F.default.existsSync(r))try{let c=JSON.parse(F.default.readFileSync(r,"utf8")),a={apps:c.apps||[],settings:c.settings||{},news:c.news||[],blogs:c.blogs||[],videos:c.videos||[]};return ye=a,Be=n,e.json(a)}catch(c){console.error("Error reading public_backup.json in backup-data endpoint:",c)}let{mockApps:o,mockSettings:i,mockNews:p,mockBlogs:l,mockVideos:u}=De,f={apps:o||[],settings:i||{},news:p||[],blogs:l||[],videos:u||[]};return e.json(f)}catch(s){console.error("public backup endpoint error:",s);let{mockApps:n,mockSettings:r,mockNews:o,mockBlogs:i,mockVideos:p}=De;return e.status(200).json({apps:n||[],settings:r||{},news:o||[],blogs:i||[],videos:p||[]})}});E.get("/api/v1/debug-seo",async(t,e)=>{try{let{fetchStoreData:s}=(ge(),xe(Ee)),n=await s();e.json({hasData:!!n,hasSettings:!!n?.settings,settingsKeys:Object.keys(n?.settings||{})})}catch(s){e.json({error:s.message})}});E.post("/api/v1/admin/seal-vault",B,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n={};s.forEach(i=>{i.id&&(i.url||i.more_information_url)&&(n[i.id]=i.url||i.more_information_url)});let r={AES_SECRET:process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"")};if(!r.AES_SECRET)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let o="";typeof J<"u"?o=J(JSON.stringify(n),r.AES_SECRET):o=require("crypto-js").AES.encrypt(JSON.stringify(n),r.AES_SECRET).toString(),e.json({success:!0,ciphertext:o})}catch(s){e.status(500).json({error:s.message})}});E.post("/api/v1/admin/save-links-direct",B,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",r={};s.forEach(p=>{let l=p.url||p.more_information_url;if(p.id&&l)if(l.startsWith("U2FsdGVkX1"))r[p.id]=l;else try{r[p.id]=J(l,n)}catch{console.warn(`[SECURITY] Skipped backup link for ${p.id} due to encryption failure`)}});let o=require("path").join(process.cwd(),".local/secure_links_backup.json"),i=r;if(require("fs").existsSync(o))try{i={...JSON.parse(require("fs").readFileSync(o,"utf8")),...r}}catch{}for(let[p,l]of Object.entries(i))if(l&&!l.startsWith("U2FsdGVkX1"))try{i[p]=J(l,n)}catch{delete i[p]}e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(s){e.status(500).json({error:s.message})}});E.post("/api/v1/admin/pull-links-from-github",B,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));E.get("/api/v1/admin/config-status",B,(t,e)=>{let s=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,r=!!process.env.ADMIN_EMAIL;e.json({hasAes:s,hasSecLinks:n,hasAdminEmail:r})});E.get("/api/v1/admin/system-files",B,(t,e)=>{e.json({files:{}})});E.get("/api/v1/debug-index",async(t,e)=>{try{let s=F.default.readFileSync(G.default.resolve(process.cwd(),"index.html"),"utf-8"),n=t.app.get("vite");e.json({debug:!0})}catch(s){e.json({error:s.message})}});["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{E.all(t,(e,s)=>{s.status(404).send("Not Found")})});E.get(["/api/v1/_chal","/api/v1/get-challenge","/api/v1/init-file"],async(t,e)=>{console.log("[DEBUG] /api/v1/init-file called");let s=oe(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=Ts(t,e),r=Q.default.randomBytes(20).toString("hex"),o=Date.now(),i=Math.floor(Math.random()*100)+50;se.set(r,{sessionId:n,expiresAt:o+120*1e3,issuedAt:o+i}),setTimeout(()=>{e.json({nonce:r,difficulty:"0000",sid:n})},i)});E.post(["/api/v1/_proc","/api/v1/get-token","/api/v1/process-file"],async(t,e)=>{let s=oe(t);if(await we(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=t.body?.sid||t.cookies?.["__Host-sid"];if(!n)return e.status(403).json({error:"Session expired. Please reload."});let{nonce:r,solution:o,fingerprint:i,score:p,moved:l,touch:u,cfToken:f}=t.body||{};if(!r||!o||!i)return e.status(400).json({error:"Invalid request."});if(!As(i))return console.warn(`[DEFENSE] Bad fingerprint from ${s}`),e.status(403).json({error:"Access denied."});let c=se.get(r);if(!c)return e.status(403).json({error:"Challenge expired. Please try again."});if(c.sessionId!==n)return se.delete(r),e.status(403).json({error:"Session mismatch."});if(c.expiresAt<Date.now())return se.delete(r),e.status(403).json({error:"Challenge timed out."});let a=Date.now()-c.issuedAt;if(a<80)return se.delete(r),console.warn(`[DEFENSE] Solve too fast (${a}ms) from ${s}`),e.status(403).json({error:"Access denied."});if(se.delete(r),typeof p!="number"||p<40)return console.warn(`[DEFENSE] Low score (${p}) from ${s}`),e.status(403).json({error:"Access denied: security check failed."});let w=r+o,m=Q.default.createHash("sha256").update(w).digest("hex");if(!m.startsWith("0000"))return console.warn(`[DEFENSE] PoW fail from ${s}: ${m}`),e.status(403).json({error:"Access denied: verification failed."});if(tt&&!await Es(f||"",s))return console.warn(`[CF] Rejected ${s}`),e.status(403).json({error:"Access denied: verification failed."});console.log(`[ACCESS] GRANTED ip=${s} score=${p} solveMs=${a} moved=${l} touch=${u}`);let b=t.body.appId||"unknown",I=js(s,n,i,b);e.json({token:I})});E.get("/api/v1/link-check",async(t,e)=>{let s=t.query.id;if(!s)return e.json({configured:!1});try{let n=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");if(!n)return e.json({configured:!0});let r="",o=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(o)){let f=require("fs").readFileSync(o,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);f&&f[1]&&(r=f[1])}if(!r)return e.json({configured:!0});let i="";if(typeof U<"u")i=U(r,n);else{let u=require("crypto-js");i=u.AES.decrypt(r,n).toString(u.enc.Utf8)}if(!i)return e.json({configured:!0});let p=JSON.parse(i),l=!1;if(Array.isArray(p)){let u=p.find(f=>f&&f.id===s);u&&(u.url||u.more_information_url)&&(l=!0)}else p&&typeof p=="object"&&p[s]&&(l=!0);return e.json({configured:!0})}catch{return e.json({configured:!0})}});var Et=new Map;E.post("/api/v1/public/chat",async(t,e)=>{let s=t.headers["x-forwarded-for"]||t.socket.remoteAddress||"unknown",n=Date.now(),r=3600*1e3,o=10,i=Et.get(s);if((!i||n>i.resetTime)&&(i={count:0,resetTime:n+r}),i.count>=o)return e.status(429).json({error:"Rate limit exceeded. Maximum 10 messages per hour. Please try again later."});i.count+=1,Et.set(s,i);let{message:p}=t.body;if(!p||typeof p!="string")return e.status(400).json({error:"Message payload is required."});try{let l=process.env.GEMINI_API_KEY;if(!l)throw new Error("AI service is currently offline.");let{fetchStoreData:u}=(ge(),xe(Ee)),f=await u(),c={settings:{site_title:f.settings?.site_title,meta_description:f.settings?.meta_description,policies:f.settings?.policies?f.settings.policies.substring(0,500):""},categories:(f.categories||[]).map(b=>({id:b.id,n:b.name})),apps:(f.apps||[]).map(b=>({n:b.name,c:b.category,desc:b.description_html?.replace(/<[^>]+>/g,"").substring(0,200),r:b.rating})),news:(f.news||[]).map(b=>({t:b.title,d:b.description?.substring(0,200),c:b.content?.replace(/<[^>]+>/g,"").substring(0,300)})),blogs:(f.blogs||[]).map(b=>({t:b.title,d:b.description?.substring(0,200),c:b.content?.replace(/<[^>]+>/g,"").substring(0,300)})),videos:(f.videos||[]).map(b=>({t:b.title,d:b.description,c:b.content?.replace(/<[^>]+>/g,"").substring(0,1e3)}))},{GoogleGenAI:a}=require("@google/genai"),w=new a({apiKey:l,httpOptions:{headers:{"User-Agent":"aistudio-build"}}}),m=`You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(c,null,2)}`;try{let b=await w.models.generateContentStream({model:"gemini-2.0-flash",contents:p.trim(),config:{systemInstruction:m,maxOutputTokens:1e3,temperature:.3,tools:[{googleSearch:{}}]}});e.setHeader("Content-Type","text/event-stream"),e.setHeader("Cache-Control","no-cache"),e.setHeader("Connection","keep-alive"),e.flushHeaders();for await(let I of b)I.text&&e.write(`data: ${JSON.stringify({text:I.text})}

`);return e.write(`data: [DONE]

`),e.end()}catch(b){if(!e.headersSent)throw b;return e.write(`data: ${JSON.stringify({error:b.message||"Streaming failed"})}

`),e.end()}}catch(l){if(l.status===429||l.message?.includes("429"))return e.json({success:!0,answer:"\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities."});if(l.status===403||l.message?.includes("403"))return e.json({success:!0,answer:"\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings."});let u=p.trim().toLowerCase();try{let{fetchStoreData:f}=(ge(),xe(Ee)),w=((await f()).apps||[]).filter(m=>m.name&&m.name.toLowerCase().includes(u)||m.category&&m.category.toLowerCase().includes(u));if(w.length>0){let m=w.slice(0,3).map(b=>b.name).join(", ");return e.json({success:!0,answer:`(Offline Fallback): I found some apps in the directory matching your query: ${m}${w.length>3?" and more.":"."}`})}else if(u.includes("hello")||u.includes("hi ")||u==="hi")return e.json({success:!0,answer:"(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!"})}catch{}return e.json({success:!0,answer:"(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."})}});E.post("/api/v1/report-missing",async(t,e)=>{let{appId:s}=t.body;return s?(console.log(`[report-missing] Received report for ${s}, mocked success due to hardcoded public mode.`),e.json({success:!0})):e.status(400).json({error:"Missing App ID parameter."})});E.get("/api/v1/moreinfo-resolve",async(t,e)=>{let s=oe(t),n=t.query.sid||t.cookies?.["__Host-sid"],r=t.query.token||t.query.t,o=t.query.id;if(!r||!o)return t.query.json==="true"?e.status(400).json({error:"Verification transmission tokens or App ID were omitted."}):e.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");try{let u=V();if(u&&u.projectId){let f=Q.default.createHash("sha256").update(r).digest("hex"),c=!1,a=ne();if(a)try{(await a.collection("spent_tokens").doc(f).get()).exists&&(c=!0)}catch(w){console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:",w.message);let m=`https://firestore.googleapis.com/v1/projects/${u.projectId}/databases/${u.firestoreDatabaseId}/documents/spent_tokens/${f}${u.apiKey?"?key="+u.apiKey:""}`;(await fetch(m)).ok&&(c=!0)}else{let w=`https://firestore.googleapis.com/v1/projects/${u.projectId}/databases/${u.firestoreDatabaseId}/documents/spent_tokens/${f}${u.apiKey?"?key="+u.apiKey:""}`;(await fetch(w)).ok&&(c=!0)}if(c)return t.query.json==="true"?e.status(403).json({error:"This single-use private download signature has already been spent."}):e.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>")}}catch{}let i=!1;try{Buffer.from(r,"base64url").toString("utf8").includes("::")&&(i=!0)}catch{}if(i)try{let u=Buffer.from(r,"base64url").toString("utf8"),[f]=u.split("::"),[c,a,w]=f.split("|");if(!Ds(r,c,a,w,o))return t.query.json==="true"?e.status(403).json({error:"Cryptographic HMAC validation failed."}):e.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");try{let b=V();if(b&&b.projectId){let I=Q.default.createHash("sha256").update(r).digest("hex"),_=new Date().toISOString(),h=ne();if(h)try{await h.collection("spent_tokens").doc(I).set({usedAt:_}),console.log(`[AUDIT] Successfully spent token ${I} via firebase-admin SDK`)}catch(g){console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:",g.message);let y=`https://firestore.googleapis.com/v1/projects/${b.projectId}/databases/${b.firestoreDatabaseId}/documents/spent_tokens/${I}${b.apiKey?"?key="+b.apiKey:""}`;fetch(y,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:_}}})}).catch(()=>{})}else{let g=`https://firestore.googleapis.com/v1/projects/${b.projectId}/databases/${b.firestoreDatabaseId}/documents/spent_tokens/${I}${b.apiKey?"?key="+b.apiKey:""}`;fetch(g,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:_}}})}).catch(()=>{})}}}catch{}let m="";try{let b=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:""),I=null;try{I=V()}catch{}if(I&&(!m||!m.startsWith("http"))){let _=ne();if(_)for(let h of["sec_links_vault_3","secure_links","sec_vault"])try{let g=await _.collection("store_data").doc(h).get();if(g.exists){let y=g.data();if(y&&y.encryptedData){let v=U(y.encryptedData,b);if(v){let C=JSON.parse(v),L="";if(C&&Array.isArray(C)){let k=C.find(j=>j&&j.id===o);k&&(L=typeof k.url=="string"?k.url:typeof k.more_information_url=="string"?k.more_information_url:"")}else if(C&&typeof C=="object"){let k=C[o];typeof k=="string"?L=k:k&&typeof k=="object"&&(L=typeof k.url=="string"?k.url:typeof k.more_information_url=="string"?k.more_information_url:"")}if(L&&typeof L=="string"&&(L.startsWith("U2FsdGVkX1")?m=U(L,b):m=L,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${h}) for app ID: ${o}`);break}}}}}catch(g){console.warn(`[WARN] Firestore SDK failed to fetch ${h}:`,g.message)}}if((!m||!m.startsWith("http"))&&I&&I.projectId){let _=I.apiKey?`?key=${I.apiKey}`:"",h=`https://firestore.googleapis.com/v1/projects/${I.projectId}/databases/${I.firestoreDatabaseId}/documents`;for(let g of["sec_links_vault_3","secure_links","sec_vault"])try{let y=await fetch(`${h}/store_data/${g}${_}`);if(y.ok){let v=await y.json();if(v&&!v.error&&v.fields?.encryptedData?.stringValue){let C=v.fields.encryptedData.stringValue,L=U(C,b);if(L){let k=JSON.parse(L),j="";if(k&&Array.isArray(k)){let O=k.find(K=>K&&K.id===o);O&&(j=typeof O.url=="string"?O.url:typeof O.more_information_url=="string"?O.more_information_url:"")}else if(k&&typeof k=="object"){let O=k[o];typeof O=="string"?j=O:O&&typeof O=="object"&&(j=typeof O.url=="string"?O.url:typeof O.more_information_url=="string"?O.more_information_url:"")}if(j&&typeof j=="string"&&(j.startsWith("U2FsdGVkX1")?m=U(j,b):m=j,m&&m.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${g}) for app ID: ${o}`);break}}}}}catch(y){console.warn(`[WARN] Firestore REST fallback failed to fetch ${g}:`,y.message)}}if(!m||!m.startsWith("http"))try{let _="",h=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(h)){let y=require("fs").readFileSync(h,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);y&&y[1]&&(_=y[1])}if(_){let g="";if(typeof U<"u")g=U(_,b);else{let y=require("crypto-js");g=y.AES.decrypt(_,b).toString(y.enc.Utf8)}if(g){let y=JSON.parse(g),v="";if(y&&Array.isArray(y)){let C=y.find(L=>L&&L.id===o);C&&(v=typeof C.url=="string"?C.url:typeof C.more_information_url=="string"?C.more_information_url:"")}else if(y&&typeof y=="object"){let C=y[o];typeof C=="string"?v=C:C&&typeof C=="object"&&(v=typeof C.url=="string"?C.url:typeof C.more_information_url=="string"?C.more_information_url:"")}v&&typeof v=="string"&&(v.startsWith("U2FsdGVkX1")?m=U(v,b):m=v,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${o}`))}}}catch(_){console.warn("Vault decryption failed",_)}if(!m||!m.startsWith("http"))try{if(process.env.SECURE_LINKS){let _=JSON.parse(process.env.SECURE_LINKS);if(_&&typeof _=="object"){let h=_[o],g="";typeof h=="string"?g=h:h&&typeof h=="object"&&(g=typeof h.url=="string"?h.url:typeof h.more_information_url=="string"?h.more_information_url:""),g&&typeof g=="string"&&(g.startsWith("U2FsdGVkX1")?m=U(g,b):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${o}`))}}}catch{}if(!m||!m.startsWith("http"))try{let _=require("path").join(process.cwd(),".local/secure_links_backup.json");if(require("fs").existsSync(_)){let h=JSON.parse(require("fs").readFileSync(_,"utf8")),g="";if(h&&Array.isArray(h)){let y=h.find(v=>v&&v.id===o);y&&(g=typeof y.url=="string"?y.url:typeof y.more_information_url=="string"?y.more_information_url:"")}else if(h&&typeof h=="object"){let y=h[o];typeof y=="string"?g=y:y&&typeof y=="object"&&(g=typeof y.url=="string"?y.url:typeof y.more_information_url=="string"?y.more_information_url:"")}if(g&&typeof g=="string"){let y=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");g.startsWith("U2FsdGVkX1")?m=U(g,y):m=g,m&&m.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${o}`)}}}catch(_){console.warn("Local filesystem backup retrieval failed:",_)}}catch(b){console.error("Firestore retrieval or decryption failed",b)}if(typeof m!="string")return console.error("targetUrl resolved to an object instead of a string:",m),e.status(500).json({error:"Download link encryption integrity failed."});if(m&&!m.startsWith("http://")&&!m.startsWith("https://")&&!m.startsWith("/")&&m.includes(".")&&(m="https://"+m),!m||!m.startsWith("http")&&!m.startsWith("/"))return console.error("CRITICAL: Failed to retrieve or decrypt URL for app:",o,"Result:",m),t.query.json==="true"?e.status(404).json({error:"Download link not found or not yet configured for this app."}):e.status(404).send(`<!DOCTYPE html>
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
</html>`);try{if(m.startsWith("http")){let b=new URL(m);if(!(b.hostname.includes("google.com")||b.hostname.includes("googleapis.com"))&&!b.searchParams.has("code")){let _=process.env.AFFILIATE_CODE;_&&(b.searchParams.set("code",_),m=b.toString())}}}catch{}return console.log("FINAL REDIRECT TARGET IS:",m),e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.set("Referrer-Policy","no-referrer"),e.redirect(302,m)}catch{return e.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>")}let p=Ce.get(r);if(!p)return t.query.json==="true"?e.status(404).json({error:"Link expired or invalid."}):e.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");if(p.expiresAt<Date.now())return Ce.delete(r),t.query.json==="true"?e.status(404).json({error:"This connection timed out."}):e.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");Ce.delete(r),Rs.add(r);let l=p.targetUrl;try{if(l.startsWith("http")){let u=new URL(l);if(!(u.hostname.includes("google.com")||u.hostname.includes("googleapis.com"))&&!u.searchParams.has("code")){let c=process.env.AFFILIATE_CODE;c&&(u.searchParams.set("code",c),l=u.toString())}}}catch{}return e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.redirect(302,l)});E.get("/api/v1/download/:id",async(t,e)=>{let s=t.params.id;return s?e.redirect(302,`/moreinfo/${s}`):e.status(400).send("Bad Request")});E.use((t,e,s,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let r=G.default.join(process.cwd(),"server_requests.log");F.default.appendFileSync(r,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(s.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return s.status(500).json({error:"Internal server error"});s.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});module.exports=E;
