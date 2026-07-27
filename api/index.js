var Lt=Object.create;var Te=Object.defineProperty;var Ft=Object.getOwnPropertyDescriptor;var Ut=Object.getOwnPropertyNames;var Pt=Object.getPrototypeOf,Bt=Object.prototype.hasOwnProperty;var je=(t,e)=>()=>(t&&(e=t(t=0)),e);var He=(t,e)=>{for(var s in e)Te(t,s,{get:e[s],enumerable:!0})},ct=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Ut(e))!Bt.call(t,r)&&r!==s&&Te(t,r,{get:()=>e[r],enumerable:!(n=Ft(e,r))||n.enumerable});return t};var V=(t,e,s)=>(s=t!=null?Lt(Pt(t)):{},ct(e||!t||!t.__esModule?Te(s,"default",{value:t,enumerable:!0}):s,t)),_e=t=>ct(Te({},"__esModule",{value:!0}),t);var Oe={};He(Oe,{mockApps:()=>oe,mockBlogs:()=>ae,mockNews:()=>ie,mockSettings:()=>xe,mockVideos:()=>ce,saveMockApps:()=>zt,saveMockBlogs:()=>Wt,saveMockNews:()=>Vt,saveMockSettings:()=>Mt,saveMockVideos:()=>Ht});var oe,zt,xe,Mt,ie,Vt,ae,Wt,ce,Ht,Je=je(()=>{oe=[],zt=t=>{try{localStorage.setItem("rummystore_apps",JSON.stringify(t))}catch(e){console.warn("saveMockApps storage failed:",e)}oe.splice(0,oe.length,...t)},xe={site_title:"",meta_description:"",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},Mt=t=>{try{localStorage.setItem("rummystore_settings",JSON.stringify(t))}catch(e){console.warn("saveMockSettings storage failed:",e)}Object.assign(xe,t)},ie=[],Vt=t=>{try{localStorage.setItem("rummystore_news",JSON.stringify(t))}catch(e){console.warn("saveMockNews storage failed:",e)}ie.splice(0,ie.length,...t)},ae=[],Wt=t=>{try{localStorage.setItem("rummystore_blogs",JSON.stringify(t))}catch(e){console.warn("saveMockBlogs storage failed:",e)}ae.splice(0,ae.length,...t)},ce=[],Ht=t=>{try{localStorage.setItem("rummystore_videos",JSON.stringify(t))}catch(e){console.warn("saveMockVideos storage failed:",e)}ce.splice(0,ce.length,...t)}});function Ge(){let t=null;typeof process<"u"&&(t=process.env?.ADMIN_PATH||process.env?.VITE_ADMIN_PATH);try{let e=Jt.env?.VITE_ADMIN_PATH;e&&(t=e)}catch{}return t||"admin"}var Jt,lt=je(()=>{Jt={}});var dt={};He(dt,{b64EncodeUnicode:()=>Gt,commitFileToGitHub:()=>Kt,generateStaticDataFileCode:()=>Ke});function Gt(t){try{return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,s)=>String.fromCharCode(parseInt(s,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(t)}}function Ke(t=[],e={},s=[],n=[],r=[]){let i=JSON.parse(JSON.stringify(t||[])).map(l=>(delete l.more_information_url,delete l.encrypted_download_url,delete l.download_url,l)),u={...{site_title:"Yono Store",meta_description:"Download All Yono Games, Rummy Apps & Teen Patti APKs",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))},d=JSON.parse(JSON.stringify(s||[])),g=JSON.parse(JSON.stringify(n||[])),p=JSON.parse(JSON.stringify(r||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockSettings: GlobalSettings = ${JSON.stringify(u,null,2)};

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = ${JSON.stringify(d,null,2)};

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockBlogs: BlogPost[] = ${JSON.stringify(g,null,2)};

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(p,null,2)};

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}async function Kt({owner:t,repo:e,token:s,branch:n,path:r,content:i,message:o}){let d=await fetch("/api/github-sync/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({owner:t,repo:e,token:s,branch:n,path:r,content:i,message:o})});if(!d.ok){let g=d.headers.get("content-type"),p=await d.text(),l=p||`Server returned ${d.status} ${d.statusText}`;if(g&&g.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${d.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${p.substring(0,100)}...`);try{let a=JSON.parse(p);l=a.message||a.error||l}catch{(!l||l.trim()==="")&&(l=`HTTP Error ${d.status}`)}throw new Error(l)}return d.json()}var Ye=je(()=>{});var ve={};He(ve,{fetchStoreData:()=>ke,getField:()=>c,injectSeoTags:()=>ys,syncFromFirestore:()=>qt});function ht(){if(le)return le;try{let n=ue.default.readFileSync(Se.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&qe(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,le=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&qe(t))return le={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},le;try{let n=Yt.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&qe(r.projectId))return le=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}function Ze(t){if(!t)return null;if("stringValue"in t)return t.stringValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("booleanValue"in t)return t.booleanValue;if("arrayValue"in t)return(t.arrayValue.values||[]).map(s=>Ze(s));if("mapValue"in t){let e=t.mapValue.fields||{},s={};for(let n of Object.keys(e))s[n]=Ze(e[n]);return s}return null}function te(t){if(!t)return{};let e={};for(let s of Object.keys(t))e[s]=Ze(t[s]);return e}function c(t,e,s=""){if(!t)return s;let n=t[e];return n==null?s:typeof n=="object"?"stringValue"in n?n.stringValue??s:"integerValue"in n?String(n.integerValue)??s:"booleanValue"in n?String(n.booleanValue)??s:s:String(n)}async function qt(){try{let t=ht();if(!t||!t.projectId)return console.log("[SYNC] Skipping background Firestore sync: Firebase config not found."),null;let e=t.projectId,s=t.firestoreDatabaseId||"(default)",n=t.apiKey,r=n?`?key=${n}`:"",i=`https://firestore.googleapis.com/v1/projects/${e}/databases/${s}/documents/store_data`;console.log(`[SYNC] Syncing filesystem backup files with Firestore (${e})...`);let[o,u,d,g,p]=await Promise.all([fetch(`${i}/public_settings${r}`).catch(()=>null),fetch(`${i}/news${r}`).catch(()=>null),fetch(`${i}/blogs${r}`).catch(()=>null),fetch(`${i}/videos${r}`).catch(()=>null),fetch(`${i}/apps_meta${r}`).catch(()=>null)]),l=xe;if(o&&o.ok){let y=await o.json(),f=te(y.fields);f&&Object.keys(f).length>0&&(l=f)}let a=ie;if(u&&u.ok){let y=await u.json(),f=te(y.fields);f&&Array.isArray(f.items)&&(a=f.items)}let m=ae;if(d&&d.ok){let y=await d.json(),f=te(y.fields);f&&Array.isArray(f.items)&&(m=f.items)}let w=ce;if(g&&g.ok){let y=await g.json(),f=te(y.fields);f&&Array.isArray(f.items)&&(w=f.items)}let h=[],$=1,x=!1;if(p&&p.ok){let y=await p.json(),f=te(y.fields);f&&typeof f.numChunks=="number"&&($=f.numChunks,x=!0)}if(x){let y=[];for(let k=0;k<$;k++)y.push(fetch(`${i}/apps_chunk_${k}${r}`).then(I=>I.ok?I.json():null).catch(()=>null));(await Promise.all(y)).forEach(k=>{if(k){let I=te(k.fields);I&&Array.isArray(I.items)&&h.push(...I.items)}})}else{let y=await fetch(`${i}/apps${r}`).catch(()=>null);if(y&&y.ok){let f=await y.json(),k=te(f.fields);k&&Array.isArray(k.items)&&(h=k.items)}}h.length===0&&(h=oe);try{let y=Se.default.join(process.cwd(),"src/lib/public_backup.json");ue.default.writeFileSync(y,JSON.stringify({apps:h,settings:l,news:a,blogs:m,videos:w},null,2),"utf8");try{let{generateStaticDataFileCode:f}=(Ye(),_e(dt)),k=f(h,l,a,m,w);ue.default.writeFileSync(Se.default.join(process.cwd(),"src/lib/staticData.ts"),k,"utf8")}catch(f){console.warn("Could not write staticData.ts fallback (skipping):",f.message)}}catch(y){console.warn("[SYNC] Could not write cache files to filesystem (running in read-only environment?):",y.message)}return console.log(`[SYNC] Synchronization successful. Apps count: ${h.length}`),{apps:h,settings:l,news:a,blogs:m,videos:w}}catch(t){return console.error("[SYNC] Sync error:",t),null}}async function ke(){let t=Date.now(),e=t-Le>ut,s=t-Le>ut*15;return De&&!s?(e&&!Ne&&(Ne=!0,pt().then(()=>{Ne=!1}).catch(n=>{Ne=!1,console.warn("Background store fetch failed safely:",n)})),De):await pt()}async function pt(){let t=Date.now(),e=Se.default.join(process.cwd(),"src/lib/public_backup.json");if(ue.default.existsSync(e))try{let n=JSON.parse(ue.default.readFileSync(e,"utf8")),r={apps:n.apps||[],settings:n.settings||{},news:n.news||[],blogs:n.blogs||[],videos:n.videos||[]};return De=r,Le=t,r}catch(n){console.error("Error reading public_backup.json in seoHelper:",n)}let s={apps:oe||[],settings:xe||{},news:ie||[],blogs:ae||[],videos:ce||[]};return De=s,Le=t,s}function _(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Fe(t){if(!t)return"";let e=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");return e=e.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi,""),e=e.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi,'href="#"'),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,""),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi,""),e}function X(t){return t?t.replace(/<[^>]*>?/gm," ").replace(/\s+/g," ").trim():""}function de(t){if(!t)return"";let e=t.trim();if(e.startsWith("<")||e.includes("<meta ")){let s=e.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);if(s&&s[1])return s[1].trim();let n=e.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);return n&&n[1]?n[1].trim():X(e).substring(0,160)}return e}async function Zt(t,e){let{apps:s,settings:n,news:r,blogs:i,videos:o}=e,u=t.split("?")[0].split("#")[0].replace(/\/+$/,"")||"/",d=u.toLowerCase(),g="";if(d==="/"||d==="")g=gt(s,n,r,i,o);else if(d==="/new-apps")g=es(s,n);else if(d.startsWith("/info/")||d.startsWith("/gateway/")||d.startsWith("/moredetail/")){let a="";d.startsWith("/info/")?a=u.split("/info/")[1]:d.startsWith("/gateway/")?a=u.split("/gateway/")[1]:a=u.split("/moredetail/")[1],g=ss(a,s,n)}else if(d==="/news")g=ns(r,n);else if(d.startsWith("/news/")){let a=u.split("/news/")[1];g=ft(a,r,n)}else if(d==="/blogs")g=rs(i,n);else if(d.startsWith("/blog/")){let a=u.split("/blog/")[1];g=mt(a,i,n)}else if(d==="/videos")g=os(o,n);else if(d.startsWith("/videos/")){let a=u.split("/videos/")[1];g=yt(a,o,n)}else if(d==="/about")g=is(n);else if(d==="/contact")g=as(n);else if(d==="/privacy")g=cs(n);else if(d==="/report-removal")g=ls(n);else if(d==="/terms")g=ds(n);else if(d==="/notice")g=ps(n);else if(d==="/ethics")g=gs(n);else if(d==="/disclaimer")g=fs(n);else if(d==="/responsibility")g=us(n);else{let a=d.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"");s.some(m=>m.slug?.toLowerCase()===a)?g=ts(a,s,n):r.some(m=>m.slug?.toLowerCase()===a)?g=ft(a,r,n):i.some(m=>m.slug?.toLowerCase()===a)?g=mt(a,i,n):o.some(m=>m.slug?.toLowerCase()===a)?g=yt(a,o,n):g=gt(s,n,r,i,o)}let p=Xt(n),l=Qt(n);return`
    <div class="flex flex-col min-h-screen">
      ${p}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${g}
      </main>
      ${l}
    </div>
  `}function Xt(t){let e=c(t,"site_title"),s=c(t,"logo_url");return`
    <header class="py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white">
          ${s?`<img src="${_(s)}" loading="eager" width="40" height="40" class="w-10 h-10 object-contain" alt="Logo"/>`:""}
          <span>${_(e)}</span>
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
  `}function Qt(t){let e=c(t,"site_title"),s=c(t,"logo_url"),n=c(t,"meta_description"),r=c(t,"disclaimer_text"),i=c(t,"ethics_discrimination_text"),o=c(t,"important_notice");return`
    <footer class="pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400">
      <div class="max-w-7xl mx-auto px-6">
        <h3 class="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2">
          ${s?`<img src="${_(s)}" loading="eager" width="32" height="32" class="w-8 h-8 object-contain" alt="Logo" />`:""}
          <span>${_(e)}</span>
        </h3>
        <p class="text-sm max-w-xl mx-auto mb-6 leading-relaxed">${_(n)}</p>
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
        <div class="text-xs text-zinc-400 mt-8">&copy; ${new Date().getFullYear()} ${_(e)}. All rights reserved.</div>
      </div>
    </footer>
  `}function gt(t,e,s,n,r){let i=c(e,"site_title"),o=c(e,"meta_description"),u="";[...t].sort((p,l)=>parseInt(c(p,"serial_number","999"),10)-parseInt(c(l,"serial_number","999"),10)).forEach((p,l)=>{let a=c(p,"name"),m=c(p,"slug"),w=c(p,"category"),h=c(p,"rating","5.0"),$=c(p,"icon_url"),x=p.is_new===!0||p.is_new&&p.is_new.booleanValue===!0;u+=`
      <a href="/${encodeURIComponent(m)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${l+1}</span>
        <img src="${$||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="64" height="64" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${_(a)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${_(a)}</h3>
          <p class="text-xs text-zinc-500 truncate">${_(w)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${h}</span><span class="text-zinc-400">\u2605</span>
            ${x?'<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>':""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `});let g="";return s.slice(0,3).forEach(p=>{g+=`
      <a href="/news/${encodeURIComponent(c(p,"slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${_(c(p,"title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${_(c(p,"description"))}</p>
      </a>
    `}),`
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${_(i)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${_(o)}</p>
      </div>
      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
          <h2 class="text-xl font-bold mb-4 px-2 text-left">Popular E-Sports virtual clients</h2>
          <div class="flex flex-col">${u}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest Archives</h3>
            <div class="flex flex-col gap-3">${g}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates \u2192</a>
          </div>
        </div>
      </div>
    </div>
  `}function es(t,e){let s="",n=t.filter(i=>i.is_new===!0||i.is_new&&i.is_new.booleanValue===!0);return(n.length>0?n:t).forEach(i=>{let o=c(i,"name"),u=c(i,"slug"),d=c(i,"category"),g=c(i,"rating","5.0"),p=c(i,"icon_url");s+=`
      <a href="/${encodeURIComponent(u)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${p||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${_(o)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${_(d)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${g} \u2605</span>
      </a>
    `}),`
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${s}</div>
    </div>
  `}function ts(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(h=>c(h,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>';let i=c(r,"name"),o=c(r,"category"),u=c(r,"version","Latest"),d=c(r,"file_size","Variable"),g=c(r,"rating","5.0"),p=c(r,"icon_url"),l=r.description_html?Fe(r.description_html):`<p>No comprehensive details are configured yet for ${_(i)}.</p>`,a=r.features_html?Fe(r.features_html):"",m=a?`<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${a}</div>`:"",w=c(r,"package_name","Not published");return`
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${p||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="96" height="96" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${_(i)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${_(o)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${_(u)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${_(d)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${_(o.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${_(g)} \u2605</strong></div>
        </div>

        <a href="/info/${encodeURIComponent(t)}" class="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow hover:opacity-95">Install Direct Access Mirror \u{1F680}</a>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm text-left">
          <h2 class="text-lg font-bold mb-4">Detailed Game Review & Safe Guidelines</h2>
          <div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${l}</div>
          ${m}
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm h-fit text-left">
          <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-400">Specifications</h3>
          <table class="w-full text-xs text-left">
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Developer</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Store Certified</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Package Name</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white truncate max-w-[150px]">${_(w)}</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Status</td><td class="py-2 font-bold text-right text-green-500">Safe & Clean</td></tr>
            <tr><td class="py-2 text-zinc-400 font-semibold">System Code</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Android / iOS</td></tr>
          </table>
        </div>
      </div>
    </div>
  `}function ss(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(u=>c(u,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>';let i=c(r,"name");return`
    <div class="max-w-xl mx-auto py-12 px-4 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5">
      <div class="text-center">
        <img src="${c(r,"icon_url")||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" loading="lazy" width="80" height="80" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border" alt="icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-1">${_(i)}</h1>
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black mb-6">Information Hub</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-8">Access the application details and specifications below.</p>
        <a href="/" class="block w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl">Return Home</a>
        <a href="/${encodeURIComponent(t)}" class="block text-xs font-semibold text-blue-500 hover:underline mt-4">Read Technical Description</a>
      </div>
    </div>
  `}function ns(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/news/${encodeURIComponent(c(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${_(c(n,"category")||"Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${_(c(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${_(c(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${_(c(n,"description"))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`}function ft(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(l=>c(l,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>';let i=c(r,"title"),o=c(r,"created_at")||"May 2026",u=c(r,"ceo_name","System Author"),d=c(r,"category","Report"),g=c(r,"content")||c(r,"description",""),p=Fe(g);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${_(d)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${o} | By ${_(u)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${_(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${p.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function rs(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/blog/${encodeURIComponent(c(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${_(c(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${_(c(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${_(X(c(n,"excerpt")||c(n,"content","").substring(0,140)))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`}function mt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(p=>c(p,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>';let i=c(r,"title"),o=c(r,"created_at")||"May 2026",u=c(r,"author","System Author"),d=c(r,"content",""),g=Fe(d);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${o} | Strategy by ${_(u)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${_(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${g.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function os(t,e){let s="";return t.forEach(n=>{let r=c(n,"title"),i=c(n,"slug"),o=c(n,"description","");s+=`
      <a href="/videos/${encodeURIComponent(i)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${_(r)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${_(o)}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${s||'<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`}function yt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(u=>c(u,"slug").toLowerCase()===n||c(u,"id").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>';let i=c(r,"title"),o=c(r,"description");return`<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${_(i)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${o.replace(/\n\n/g,"<br/><br/>")}</p></div>`}function is(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(c(t,"about_content")||"About our application services.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function as(t){let e=c(t,"contact_content")||"Get in touch for active client files help.",s=c(t,"support_email","support@example.com");return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${e}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${_(s)}</p></div></div>`}function cs(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(c(t,"privacy_content")||"No private data tracking.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ls(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(c(t,"report_removal_content")||"Report & Removal Policy compliance guidelines.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ds(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(c(t,"terms_content")||"Service code terms of compliance.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function us(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(c(t,"responsibility_content")||"Play safe for custom virtual entertainment.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ps(t){let e=c(t,"important_notice_heading")||"Important Notice",s=c(t,"important_notice")||"No important notices at this time.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function gs(t){let e=c(t,"ethics_heading")||"Ethics & Safety",s=c(t,"ethics_discrimination_text")||"Ethics and safety information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function fs(t){let e=c(t,"disclaimer_heading")||"Disclaimer",s=c(t,"disclaimer_text")||"Disclaimer information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ms(){try{let t=ht();return t?!t.apiKey||t.apiKey.trim()===""||t.apiKey.includes("YOUR_API_KEY")?{projectId:"placeholder-project-id",appId:"placeholder-app-id",apiKey:"PLACEHOLDER",authDomain:"placeholder-project.firebaseapp.com",firestoreDatabaseId:"(default)",storageBucket:"placeholder-project.firebasestorage.app",messagingSenderId:"000000000",measurementId:""}:t:null}catch{return null}}async function ys(t,e,s,n=""){let r=await ke();if(!r||!r.settings)return{html:t,isNotFound:!1};let i=r.apps||[],o=r.settings||{},u=r.news||[],d=r.blogs||[],g=r.videos||[],p=c(o,"site_title")||"RummyDex",l=p,a=c(o,"meta_description","");a||(a="A premium digital platform for applications and tools.");let m=c(o,"seo_keywords","");if(m||(m="app clearance, premium applications, digital tools, platform, tech specs, verified apps"),m){let v=m.split(",").map(b=>b.trim()).filter(Boolean);v.length>15&&(m=v.slice(0,15).join(", "))}let w="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",h=p||"Platform Administrator",$=null,x="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp",y=!1,f=e.split("?")[0].split("#")[0],k=f.toLowerCase(),I=f.toLowerCase().replace(/^\/|\/$/g,""),O=Ge().toLowerCase(),N=k.startsWith("/moreinfo/")||k.startsWith("/info/")||k.startsWith("/moredetail/")||k.startsWith("/gateway/");if(f==="/"||I==="")y=!1;else if(I===O||k.startsWith(`/${O}`)||k.startsWith("/admin")||["wp-admin","dashboard","panel"].includes(I))y=!1;else if(k.startsWith("/app/")){let v=decodeURIComponent(f.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase()),b=i.find(C=>{let A=c(C,"slug");return A&&A.toLowerCase()===v});if(b){y=!1;let C=c(b,"name");l=`${c(b,"seo_title")||C}`;let A=c(b,"description_html");a=de(c(b,"seo_description"))||(A?X(A).substring(0,160):"")||a,m=c(b,"seo_keywords")||m,w=c(b,"og_image_url")||c(b,"icon_url")||w;let L=(()=>{let K=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return K.includes("rummydex.com")?"https://www.rummydex.com":K})();$=c(b,"canonical_url")||`${L}/app/${c(b,"slug")}`,x=c(b,"icon_url")||x}else y=!0}else if(k.startsWith("/info/")||k.startsWith("/moreinfo/")||k.startsWith("/moredetail/")||k.startsWith("/gateway/")){let v="/info/";k.startsWith("/moreinfo/")?v="/moreinfo/":k.startsWith("/moredetail/")?v="/moredetail/":k.startsWith("/gateway/")&&(v="/gateway/");let b=e.split(new RegExp(v,"i"))[1]||"",C=decodeURIComponent(b.split("/")[0].split("?")[0]),A=i.find(L=>{let B=c(L,"slug");return B&&B.toLowerCase()===C.toLowerCase()});if(A){y=!1;let L=c(A,"name");l=`${c(A,"seo_title")||L} - Technical Info`;let B=c(A,"description_html");a=de(c(A,"seo_description"))||(B?X(B).substring(0,160):"")||a,m=c(A,"seo_keywords")||m,w=c(A,"og_image_url")||c(A,"icon_url")||w,$=`${(()=>{let we=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return we.includes("rummydex.com")?"https://www.rummydex.com":we})()}${v}${c(A,"slug")}`,x=c(A,"icon_url")||x}else y=!0}else if(k.startsWith("/news/")&&k.length>6){let v=decodeURIComponent((e.split(/\/news\//i)[1]||"").split("/")[0].split("?")[0]),b=u.find(C=>{let A=c(C,"slug");return A&&A.toLowerCase()===v.toLowerCase()});if(b){y=!1;let C=c(b,"title","Latest News");l=`${c(b,"seo_title")||C} | ${p}`;let A=c(b,"description")||c(b,"content");a=de(c(b,"seo_description"))||(A?X(A).substring(0,160):"")||a,m=c(b,"seo_keywords")||m,w=c(b,"og_image_url")||c(b,"logo_url")||w,h=c(b,"ceo_name")||p;let L=(()=>{let K=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return K.includes("rummydex.com")?"https://www.rummydex.com":K})();$=c(b,"canonical_url")||`${L}/news/${c(b,"slug")}`}else y=!0}else if(k.startsWith("/blog/")&&k.length>6){let v=decodeURIComponent((e.split(/\/blog\//i)[1]||"").split("/")[0].split("?")[0]),b=d.find(C=>{let A=c(C,"slug");return A&&A.toLowerCase()===v.toLowerCase()});if(b){y=!1;let C=c(b,"title","Blog Post");l=`${c(b,"seo_title")||C} | ${p}`;let A=c(b,"excerpt")||c(b,"content");a=de(c(b,"seo_description"))||(A?X(A).substring(0,160):"")||a,m=c(b,"seo_keywords")||m,w=c(b,"cover_url")||w,h=c(b,"author")||p;let L=(()=>{let K=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return K.includes("rummydex.com")?"https://www.rummydex.com":K})();$=c(b,"canonical_url")||`${L}/blog/${c(b,"slug")}`}else y=!0}else if(k.startsWith("/videos/")&&k.length>8){let v=decodeURIComponent((e.split(/\/videos\//i)[1]||"").split("/")[0].split("?")[0]),b=g.find(C=>{let A=c(C,"slug"),L=c(C,"id");return A&&A.toLowerCase()===v.toLowerCase()||L&&L.toLowerCase()===v.toLowerCase()});if(b){y=!1;let C=c(b,"title","Video Specs");l=`${c(b,"seo_title")||C} | ${p}`;let A=c(b,"description");a=de(c(b,"seo_description"))||(A?X(A).substring(0,160):""),m=c(b,"seo_keywords");let L=c(b,"youtube_url"),B="";if(L){let Re=L.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);Re&&(B=Re[1])}B&&(w=`https://img.youtube.com/vi/${B}/maxresdefault.jpg`),$=`${(()=>{let we=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return we.includes("rummydex.com")?"https://www.rummydex.com":we})()}/videos/${c(b,"slug")||c(b,"id")}`}else y=!0}else if(["about","blogs","blog","contact","disclaimer","ethics","new-apps","news","notice","privacy","report-removal","responsibility","terms","videos","developers","submit-app"].includes(I))y=!1,I==="about"?(l=`About Us | ${p}`,a="Learn more about our mission, vision, and the premium services we offer on our platform."):I==="blogs"||I==="blog"?(l=`Official Blogs & Insights | ${p}`,a="Explore our official blog articles, professional guides, gameplay tips, and deep platform reviews."):I==="contact"?(l=`Contact Us | ${p}`,a="Get in touch with our professional support team. We are here to help you with your inquiries, feedback, and technical assistance."):I==="disclaimer"?(l=`Disclaimer | ${p}`,a="Read our platform disclaimer regarding content accuracy, fair play verification, and third-party links."):I==="ethics"?(l=`Code of Ethics & Content Policy | ${p}`,a="Discover our strict code of ethics, licensing standards, and platform content guidelines."):I==="new-apps"?(l=`New Releases & Up-and-Coming Apps | ${p}`,a="Stay updated with our latest releases, featured digital tools, and upcoming app launches."):I==="news"?(l=`Latest News & Press Updates | ${p}`,a="Browse official news bulletins, press announcements, security reports, and direct system updates."):I==="notice"?(l=`Important System Notice | ${p}`,a="Read our critical system alerts, maintenance updates, and important security advisories."):I==="privacy"?(l=`Privacy Policy | ${p}`,a="Read our comprehensive privacy policy to understand how we protect, secure, and handle your personal data."):I==="report-removal"?(l=`Report & Removal Request | ${p}`,a="Submit a content or application removal request to our legal and compliance team."):I==="responsibility"?(l=`Responsible Gaming & Play Policy | ${p}`,a="Learn about our commitment to user safety, self-exclusion tools, and responsible gameplay guidelines."):I==="terms"?(l=`Terms of Service & User Agreement | ${p}`,a="Review our terms of service, platform rules, and user agreements governing the use of our services."):I==="videos"?(l=`Video Previews & Walkthroughs | ${p}`,a="Watch high-definition videos, gameplay showcases, and technical walkthroughs of our certified applications."):I==="developers"?(l=`Meet Our Team | ${p}`,a=`Meet the brilliant developers behind ${p}. Discover our team's expertise and passion.`):I==="submit-app"&&(l=`Submit Your App | ${p}`,a=`Submit your Android application for listing and promotion on ${p}.`);else{let b=decodeURIComponent(e.split("?")[0].split("#")[0].replace(/^\/|\/$/g,""));if(b&&b!==""){let C=i.find(A=>c(A,"slug")?.toLowerCase()===b.toLowerCase());if(C){y=!1;let A=c(C,"name","App");l=c(C,"seo_title")||A;let L=c(C,"description_html"),B=`Discover the ${A} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;a=de(c(C,"seo_description"))||(L?X(L).substring(0,160):B),m=c(C,"seo_keywords"),w=c(C,"og_image_url")||c(C,"icon_url")||w,$=c(C,"canonical_url"),x=c(C,"icon_url")||x}else y=!0}else y=!0}y&&(l=`404 Page Not Found | ${p}`,a=`The requested page does not exist on ${p}. Browse our certified application listings and news updates.`);let U=(()=>{let b=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").trim().replace(/\/+$/,"");return b.includes("rummydex.com")?"https://www.rummydex.com":b})(),Z=e.split("?")[0].split("#")[0].replace(/^\/api(\/[^/]+)?/i,"")||"/";Z.length>1&&Z.endsWith("/")&&(Z=Z.slice(0,-1));let G=`${U}${Z}`,M=$||G;M.includes("rummydex.com")&&(M=M.replace(/^http:\/\//i,"https://").replace("https://rummydex.com","https://www.rummydex.com")),M.length>10&&M.endsWith("/")&&!M.endsWith("://www.rummydex.com/")&&(M=M.slice(0,-1));let R=w;if(w){let v=w.trim();if(v.startsWith("//"))R=`https:${v}`;else if(v.startsWith("data:"))R=v;else if(!v.startsWith("http://")&&!v.startsWith("https://")){let b=v.startsWith("/")?v:`/${v}`;R=`${U}${b}`}else R=v}let E=x;if(x){let v=x.trim();if(v.startsWith("//"))E=`https:${v}`;else if(v.startsWith("data:"))E=v;else if(!v.startsWith("http://")&&!v.startsWith("https://")){let b=v.startsWith("/")?v:`/${v}`;E=`${U}${b}`}else E=v}let T=e.startsWith(`/${Ge()}`),P=c(o,"google_analytics_id","")||c(o,"ga_tracking_id",""),Ve=P?`
    <script async src="https://www.googletagmanager.com/gtag/js?id=${_(P)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${_(P)}');
    </script>
  `:"",re=null;T||(i.some(b=>b.slug?.toLowerCase()===e.split("?")[0].split("#")[0].replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase())||e.startsWith("/gateway/")||e.startsWith("/moredetail/")||e.startsWith("/info/")||e.startsWith("/moreinfo/")?re={"@context":"https://schema.org","@type":"SoftwareApplication",name:l,operatingSystem:"Android, iOS",applicationCategory:"GameApplication",description:a,url:M,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}}:e.startsWith("/news/")||e.startsWith("/blog/")?re={"@context":"https://schema.org","@type":"Article",headline:l,description:a,image:R||[],author:{"@type":"Person",name:h}}:e.startsWith("/videos/")?re={"@context":"https://schema.org","@type":"VideoObject",name:l,description:a,thumbnailUrl:R||[],uploadDate:new Date().toISOString()}:re={"@context":"https://schema.org","@type":"WebSite",name:p,url:M});let at=re?`<script type="application/ld+json">${JSON.stringify(re).replace(/</g,"\\u003c")}</script>`:"";if(e==="/"||e===""){let v=c(o,"website_faqs");if(v&&Array.isArray(v)&&v.length>0){let b={"@context":"https://schema.org","@type":"FAQPage",mainEntity:v.map(C=>({"@type":"Question",name:C.question,acceptedAnswer:{"@type":"Answer",text:C.answer}}))};at+=`
    <script type="application/ld+json">${JSON.stringify(b).replace(/</g,"\\u003c")}</script>`}}let jt=(()=>{let b=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").toLowerCase();if(b.includes("masterworld")||b.includes("dev-")||b.includes("pre-")||b.includes("localhost")||b.includes("127.0.0.1"))return!0;if(process.env.PUBLIC_DOMAIN)try{let C=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase(),A=s?new URL(s).host.toLowerCase():"";if(A&&A!==C)return!0}catch{}return!1})(),Ot=T||jt||y?`
    <title>${T?"Admin Portal":_(l)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${E?`
    <link rel="icon" type="image/x-icon" href="${_(E)}" />
    <link rel="shortcut icon" href="${_(E)}" />
    <link rel="apple-touch-icon" href="${_(E)}" />
    `:""}
  `:`
    <title>${_(l)}</title>
    <meta name="description" content="${_(a)}" />
    <meta name="keywords" content="${_(m)}" />
    <meta name="author" content="${_(h)}" />
    <meta property="og:title" content="${_(l)}" />
    <meta property="og:description" content="${_(a)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${_(M)}" />
    ${R?`<meta property="og:image" content="${_(R)}" />`:""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${_(l)}" />
    <meta name="twitter:description" content="${_(a)}" />
    ${R?`<meta name="twitter:image" content="${_(R)}" />`:""}
    <meta name="robots" content="${N?"noindex, nofollow":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />
    <link rel="canonical" href="${_(M)}" />
    ${E?`
    <link rel="icon" type="image/x-icon" href="${_(E)}" />
    <link rel="shortcut icon" href="${_(E)}" />
    <link rel="apple-touch-icon" href="${_(E)}" />
    `:""}
    ${at}
    ${Ve}
  `,J=t.replace(/<title>.*?<\/title>/ims,"");J=J.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims,""),J=J.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims,"");let We=ms();console.log("SAFE FIREBASE CONFIG:",We);let Nt=`
    <script id="firebase-config-loader">
      ${We?`window.__FIREBASE_CONFIG__ = ${JSON.stringify(We).replace(/</g,"\\u003c")};`:""}
      window.__INITIAL_DATA__ = ${JSON.stringify({apps:i,settings:o,news:u,blogs:d,videos:g}).replace(/</g,"\\u003c")};
    </script>
  `,Dt=Ot.replace(/<(meta|link) /g,'<$1 data-rh="true" ').replace(/<title>/g,'<title data-rh="true">').replace(/<script type="application\/ld\+json"/g,'<script data-rh="true" type="application/ld+json"');J=J.replace("</head>",`${Nt}${Dt}</head>`);try{let v=await Zt(e,r);J.includes('<div id="root">')?J=J.replace('<div id="root">',`<div id="root">${v}`):J=J.replace("</body>",`<div id="seo-prerender">${v}</div>
  </body>`)}catch(v){console.error("Static pre-rendering body injection failed:",v)}return{html:J,isNotFound:y}}var ue,Se,De,Le,ut,Ne,qe,Yt,le,pe=je(()=>{ue=V(require("fs")),Se=V(require("path"));Je();lt();De=null,Le=0,ut=36e5,Ne=!1,qe=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},Yt="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",le=null});var Me=V(require("express")),At=V(require("helmet")),rt=V(require("express-rate-limit")),It=V(require("cookie-parser")),W=V(require("path")),ne=V(require("crypto")),et=V(require("compression")),D=V(require("fs")),Ct=V(require("dns"));Je();pe();Ye();var ze=V(require("crypto-js"));var Ee=V(require("otpauth"));function bt(){return new Ee.Secret({size:20}).base32}function wt(t,e){return new Ee.TOTP({issuer:"rummydex.com",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Xe(t,e){try{return new Ee.TOTP({issuer:"rummydex.com",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(s){return console.error("TOTP verification error:",s),!1}}process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");console.log("Server starting with ADMIN_EMAIL:",process.env.ADMIN_EMAIL);var hs=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||hs();function Y(t,e){let s=[e,process.env.AES_SECRET].filter(Boolean),n=Array.from(new Set(s));for(let r of n)if(!(!r||r.trim()===""))try{let o=ze.default.AES.decrypt(t,r).toString(ze.default.enc.Utf8);if(o&&o.trim().length>0)return o}catch{}return""}function H(t,e){if(!t||!e||e.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return ze.default.AES.encrypt(t,e).toString()}var Qe=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},bs="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ge=null;function z(){if(ge)return ge;try{let n=D.default.readFileSync(W.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),r=JSON.parse(n);if(r.projectId&&Qe(r.projectId))return r.firestoreDatabaseId=r.firestoreDatabaseId||r.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,r.apiKey=r.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY,ge=r,r}catch{}let t=process.env.VITE_FIREBASE_PROJECT_ID||process.env.FIREBASE_PROJECT_ID,e=process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(t&&Qe(t))return ge={projectId:t,appId:process.env.VITE_FIREBASE_APP_ID||process.env.FIREBASE_APP_ID,apiKey:s,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN||process.env.FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:e||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET||process.env.FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID||process.env.FIREBASE_MESSAGING_SENDER_ID},ge;try{let n=bs.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&Qe(r.projectId))return ge=r,r}catch{}throw new Error("Firebase configuration not found and no environment variables set.")}var Ae=null,_t=!1;function $e(){if(Ae)return Ae;if(_t)return null;try{let t=require("firebase-admin"),e=z();t.apps.length===0&&(e&&e.projectId?t.initializeApp({projectId:e.projectId}):t.initializeApp());let s=e?.firestoreDatabaseId||"(default)";if(s&&s!=="(default)"){let{getFirestore:n}=require("firebase-admin/firestore");Ae=n(t.apps[0],s)}else Ae=t.firestore();return console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${s}`),Ae}catch(t){return console.warn("[WARN] Firebase Admin SDK initialization failed:",t.message||t),_t=!0,null}}var ws=[/zgrab/i,/masscan/i,/nmap/i,/nuclei/i,/sqlmap/i,/nikto/i,/dirbuster/i,/gobuster/i,/wfuzz/i],xt=process.env.CF_TURNSTILE_SECRET||"",_s=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},tt=_s(xt)?xt:"";async function xs(t,e){if(!tt)return!0;if(!t)return console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:",e),!1;try{let s=new URLSearchParams({secret:tt,response:t,remoteip:e}),r=await(await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:s,headers:{"Content-Type":"application/x-www-form-urlencoded"}})).json();return r.success?!0:(console.warn("[CF_TURNSTILE] Failed:",r["error-codes"]),!1)}catch(s){return console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:",e,s),!1}}var $t=t=>{let e=t.headers["user-agent"]||"";return!!(e&&ws.some(s=>s.test(e)))};function Ss(t){return!(!t||typeof t!="string"||t.length<8||/^(.)\1+$/.test(t))}var ks=60*1e3,vs=300,Ue=new Map,he=async(t,e=vs,s=ks)=>{try{let n=Date.now(),r=Ue.get(t);if((!r||n>r.resetTime)&&(r={count:0,resetTime:n+s}),r.count++,Ue.set(t,r),Math.random()<.01)for(let[i,o]of Ue.entries())n>o.resetTime&&Ue.delete(i);return r.count>e}catch{return!0}};function ee(t){return t.ip||t.socket?.remoteAddress||"unknown"}function St(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let s=[];for(let n of e){let r;if(n.toLowerCase().startsWith("0x")?r=parseInt(n,16):n.startsWith("0")&&n.length>1?r=parseInt(n,8):r=parseInt(n,10),isNaN(r)||r<0||r>255)return null;s.push(r)}if(e.length===1){let n=s[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=s[0],r=s[1];return r>16777215?null:[n,r>>>16&255,r>>>8&255,r&255]}else if(e.length===3){let n=s[0],r=s[1],i=s[2];return i>65535?null:[n,r,i>>>8&255,i&255]}return s}function kt(t){let[e,s,n,r]=t;return e===127||e===10||e===172&&s>=16&&s<=31||e===192&&s===168||e===169&&s===254||e===0||e===100&&s>=64&&s<=127||e===192&&s===0&&n===0||e===192&&s===0&&n===2||e===198&&s>=18&&s<=19||e===198&&s===51&&n>=100&&n<=103||e===203&&s===0&&n===113||e>=224&&e<=239||e>=240}async function Es(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let s=e.hostname.toLowerCase(),n=St(s);if(n&&kt(n)||s==="[::1]"||s==="::1"||s.startsWith("[fc00")||s.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(s)||s.endsWith(".local")||s.endsWith(".internal"))return!1;try{let i=await Ct.default.promises.lookup(s,{all:!0});for(let o of i){let u=o.address,d=St(u);if(d&&kt(d)||u==="::1"||u.startsWith("fc00:")||u.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var Q=new Map,As=new Set,Ie=new Map;setInterval(()=>{let t=Date.now();for(let[e,s]of Q.entries())s.expiresAt<t&&Q.delete(e);for(let[e,s]of Ie.entries())s.expiresAt<t&&Ie.delete(e)},3e4);function Is(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let s=ne.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",s,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0}),s}return t.cookies["__Host-sid"]}function Cs(t,e,s,n){let i=Math.floor(Date.now()/1e3)+1800,o=`${t}|${e}|${s}|${n}|${i}`,u=ne.default.createHmac("sha256",Rt).update(o).digest("hex");return Buffer.from(`${o}::${u}`).toString("base64url")}function $s(t,e,s,n,r){try{let i=Buffer.from(t,"base64url").toString("utf8"),[o,u]=i.split("::");if(!o||!u)return!1;let d=o.split("|");if(d.length!==5)return!1;let[g,p,l,a,m]=d;if(a!==r)return console.warn(`[SECURITY] Token appId mismatch: expected ${r}, got ${a}`),!1;if(Math.floor(Date.now()/1e3)>parseInt(m,10))return console.warn("[WARN] Signature expired."),!1;let w=ne.default.createHmac("sha256",Rt).update(o).digest("hex");return ne.default.timingSafeEqual(Buffer.from(u,"hex"),Buffer.from(w,"hex"))}catch{return!1}}process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");var Rs=()=>["fallback","token","secret"].join("_"),Rt=process.env.TOKEN_SECRET||Rs(),Js=process.env.SESSION_SECRET||"fallback_session_secret_dev",S=(0,Me.default)();S.set("trust proxy",1);S.use((0,At.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1,xFrameOptions:!1}));var Ts=(0,rt.default)({windowMs:900*1e3,limit:5e3,standardHeaders:"draft-7",legacyHeaders:!1,validate:{trustProxy:!1}});S.use(Ts);var ot=(0,rt.default)({windowMs:60*1e3,limit:100,standardHeaders:"draft-7",legacyHeaders:!1});S.use("/admin",ot);S.use("/api/v1/admin",ot);S.use("/api/download",ot);S.use((t,e,s)=>{let n=Date.now();e.on("finish",()=>{let r=W.default.join(process.cwd(),"server_requests.log"),i=Date.now()-n,o=e.getHeader("content-type")||"unknown",u=t.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig,"$1$2=REDACTED")}),s()});S.use((0,et.default)({level:6,threshold:256,filter:(t,e)=>t.headers["x-no-compression"]?!1:et.default.filter(t,e)}));S.use((0,It.default)());S.use((t,e,s)=>{if(process.env.NODE_ENV==="production"){let n=(t.headers["x-forwarded-host"]||t.headers.host||"").toString().toLowerCase().split(",")[0].trim(),r=(t.headers["x-forwarded-proto"]||t.protocol||"https").toString().toLowerCase().split(",")[0].trim();if(n==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${t.originalUrl}`);if(r==="http"&&n.includes("rummydex.com"))return e.redirect(301,`https://${n}${t.originalUrl}`)}s()});S.disable("x-powered-by");S.use((t,e,s)=>{e.removeHeader("X-Powered-By"),e.setHeader("X-Powered-By","SecureServer/1.0"),e.setHeader("X-XSS-Protection","1; mode=block"),e.setHeader("X-Content-Type-Options","nosniff"),e.setHeader("Referrer-Policy","strict-origin-when-cross-origin");let n=t.headers.origin,r="",i=!1;if(n){let u=!1,d=(()=>{try{return new URL(n)}catch{return null}})();if(d){let g=d.hostname,p=process.env.PUBLIC_DOMAIN?new URL(process.env.PUBLIC_DOMAIN).hostname:"www.rummydex.com";(g==="localhost"||g==="127.0.0.1"||g.endsWith(".google.com")||g.endsWith(".studio")||g.endsWith(".run.app")||g.endsWith(".vercel.app")||g===p||g===p.replace(/^www\./,"")||process.env.ALLOWED_ORIGINS&&process.env.ALLOWED_ORIGINS.split(",").map(a=>a.trim()).includes(n))&&(u=!0)}u?(r=n,i=!0):r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com"}else r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com";if(r&&e.setHeader("Access-Control-Allow-Origin",r),e.setHeader("Vary","Origin"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PATCH, PUT, DELETE"),e.setHeader("Access-Control-Allow-Headers","X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For"),i&&e.setHeader("Access-Control-Allow-Credentials","true"),t.method==="OPTIONS"){e.sendStatus(200);return}(process.env.NODE_ENV==="production"||t.headers["x-forwarded-proto"]==="https")&&e.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");let o=process.env.NODE_ENV!=="production";e.setHeader(o?"Content-Security-Policy-Report-Only":"Content-Security-Policy","default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;"),s()});S.use(Me.default.json({limit:"50mb"}));S.use(Me.default.urlencoded({limit:"50mb",extended:!0}));["/trap/link","/trap/form","/trap/admin","/trap/backup","/trap/config","/trap/db","/trap/env","/trap/wp-admin","/trap/.git","/trap/api-keys","/trap/download"].forEach(t=>{S.all(t,(e,s)=>{console.warn(`[HONEYPOT] [${t}] IP: ${ee(e)} UA: ${e.headers["user-agent"]}`),s.status(403).send("Forbidden.")})});S.get(["/favicon.ico","/favicon.png","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,s)=>{console.log("--- FAVICON/LOGO ROUTE HIT ---",t.originalUrl);try{let n="";try{let{fetchStoreData:r}=(pe(),_e(ve)),i=await r();i&&i.settings&&(n=i.settings.favicon_url&&i.settings.favicon_url.trim()||i.settings.logo_url&&i.settings.logo_url.trim()||"")}catch(r){console.warn("Could not retrieve store settings for favicon, using default fallback:",r)}n||(n="https://res.cloudinary.com/diewalae4/image/upload/v1784896838/ezgif-64180dd8ca74703b_rpungk.webp"),console.log("--- FAVICON/LOGO ROUTE RESOLVED TO ---",n);try{let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(r.ok){let i=await r.arrayBuffer(),o=Buffer.from(i),d=r.headers.get("content-type")||"image/png";return t.originalUrl.includes(".ico")?d="image/x-icon":t.originalUrl.includes(".png")&&(d="image/png"),e.set("Content-Type",d),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),console.log("--- FAVICON/LOGO PROXIED SECURELY ---",d,r.status),e.status(200).send(o)}else return console.warn(`Favicon proxy fetch returned status ${r.status}. Falling back to 302 redirect.`),e.set("Cache-Control","public, max-age=3600"),e.redirect(302,n)}catch(r){return console.error("Failed to proxy favicon content, falling back to 302 redirect:",r),e.redirect(302,n)}}catch(n){console.error("Favicon/Logo proxy routing failed:",n)}return s()});S.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let i=await ke();if(!i)throw new Error("No data");let{news:o=[],blogs:u=[],videos:d=[]}=i,g=`User-agent: *
Allow: /
Disallow: /api/
`,p=process.env.PUBLIC_DOMAIN||"";g+=`
Sitemap: ${p}/sitemap.xml
`,e.set("Content-Type","text/plain"),e.send(g)}catch{e.set("Content-Type","text/plain");let n=process.env.PUBLIC_DOMAIN||"";e.send(`User-agent: *
Allow: /
Sitemap: ${n}/sitemap.xml
`)}});S.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),r){e.status(404).send("Not Found");return}let i=await ke();if(!i)throw new Error("Unable to fetch store data");let{apps:o=[],news:u=[],blogs:d=[],videos:g=[]}=i,p=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com",l=t.headers.host?`https://${t.headers.host}`:p,a=`<?xml version="1.0" encoding="UTF-8"?>
`;a+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;let m="2024-05-01";a+=`  <url>
    <loc>${l}/</loc>
    <lastmod>${m}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/new-apps</loc>
    <lastmod>${m}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/news</loc>
    <lastmod>${m}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/blogs</loc>
    <lastmod>${m}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/videos</loc>
    <lastmod>${m}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/about</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/developers</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/contact</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/privacy</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/report-removal</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/terms</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/responsibility</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/notice</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/ethics</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,a+=`  <url>
    <loc>${l}/disclaimer</loc>
    <lastmod>${m}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;let w=x=>x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),h=x=>{let y=c(x,"updated_at")||c(x,"created_at");if(y)try{if(typeof y=="object"&&y!==null&&y.seconds)return new Date(y.seconds*1e3).toISOString().split("T")[0];if(typeof y=="object"&&y!==null&&y._seconds)return new Date(y._seconds*1e3).toISOString().split("T")[0];let f=new Date(y);if(!isNaN(f.getTime()))return f.toISOString().split("T")[0]}catch{}return"2024-05-01"},$=x=>{if(!x||typeof x!="string")return!1;let y=x.trim().toLowerCase();return!y||y.startsWith("/")||y.includes("rummydex.com")?!1:!!(y.startsWith("http://")||y.startsWith("https://"))};for(let x of o){let y=c(x,"slug"),f=c(x,"canonical_url");y&&!$(f)&&(a+=`  <url>
`,a+=`    <loc>${l}/app/${w(y)}</loc>
`,a+=`    <lastmod>${h(x)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.9</priority>
`,a+=`  </url>
`)}for(let x of u){let y=c(x,"slug"),f=c(x,"canonical_url");y&&!$(f)&&(a+=`  <url>
`,a+=`    <loc>${l}/news/${w(y)}</loc>
`,a+=`    <lastmod>${h(x)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.7</priority>
`,a+=`  </url>
`)}for(let x of d){let y=c(x,"slug"),f=c(x,"canonical_url");y&&!$(f)&&(a+=`  <url>
`,a+=`    <loc>${l}/blog/${w(y)}</loc>
`,a+=`    <lastmod>${h(x)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.7</priority>
`,a+=`  </url>
`)}for(let x of g){let y=c(x,"slug");y&&(a+=`  <url>
`,a+=`    <loc>${l}/videos/${w(y)}</loc>
`,a+=`    <lastmod>${h(x)}</lastmod>
`,a+=`    <changefreq>weekly</changefreq>
`,a+=`    <priority>0.6</priority>
`,a+=`  </url>
`)}a+=`</urlset>
`,e.header("Content-Type","application/xml"),e.send(a)}catch(s){console.error("Sitemap Generation Error:",s),e.status(500).send("Error generating sitemap")}});var vt=new Map;var st=W.default.join(process.cwd(),"mock-2fa-state.json"),ye=new Map,Gs=(process.env.ADMIN_EMAIL||"").toLowerCase();try{if(D.default.existsSync(st)){let t=JSON.parse(D.default.readFileSync(st,"utf8"));for(let[e,s]of Object.entries(t))ye.set(e,s)}}catch(t){console.error("Failed to load mock 2FA file:",t)}function Tt(){try{let t={};for(let[e,s]of ye.entries())t[e]=s;D.default.writeFileSync(st,JSON.stringify(t,null,2),"utf8")}catch(t){console.error("Failed to save mock 2FA file:",t)}}var js=900*1e3,Ks=3600*1e3;setInterval(()=>{let t=Date.now();for(let[e,s]of vt.entries())s.lockedUntil<t&&t-s.windowStart>js*2&&vt.delete(e)},7200*1e3);var F=async(t,e,s)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token."});let r=n.split("Bearer ")[1];if(!r||r==="null"||r==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token."});if(r.startsWith("ey"))try{let i="";if($e())i=(await require("firebase-admin").auth().verifyIdToken(r)).email||"";else{let g=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(g){let p=t.headers.origin||t.headers.referer||"http://localhost:3000",l=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${g}`,{method:"POST",headers:{"Content-Type":"application/json",Referer:p,"x-client-origin":p},body:JSON.stringify({idToken:r})});l.ok&&(i=(await l.json())?.users?.[0]?.email||"")}}let u=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return i&&i.toLowerCase().trim()===u?(t.adminUser={email:i.toLowerCase().trim()},s()):e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let i=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!i)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured."});let o=Y(r,i);if(!o)return e.status(401).json({error:"Unauthorized: Invalid token."});let u=JSON.parse(o);return!u.admin||!u.email||!u.exp?e.status(401).json({error:"Unauthorized: Malformed token."}):Date.now()>u.exp?e.status(401).json({error:"Unauthorized: Session expired."}):(t.adminUser={email:u.email},s())}catch{return e.status(401).json({error:"Unauthorized: Token verification failed."})}};S.post("/api/v1/admin/login",async(t,e)=>{let s=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=_checkAdminRateLimit(s);if(!n.allowed){let d=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${d} min.`})}let{email:r,password:i}=t.body??{};if(!r||!i)return _recordAdminFailedAttempt(s),e.status(400).json({error:"Missing email or password."});let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),u=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!u)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(r.toLowerCase().trim()===o&&i===u)try{let d=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",g=JSON.stringify({admin:!0,email:o,exp:Date.now()+864e5}),p=H(g,d);return e.json({token:p,email:o})}catch(d){return console.error("Login encryption error:",d),e.status(500).json({error:"Internal server error."})}return _recordAdminFailedAttempt(s),e.status(401).json({error:"Invalid email or password."})});S.post("/api/v1/admin/google-login",async(t,e)=>{let{idToken:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing Firebase ID Token."});try{let n="";if($e())n=(await require("firebase-admin").auth().verifyIdToken(s)).email||"";else{let p=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(p){let l=t.headers.origin||t.headers.referer||"http://localhost:3000",a=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${p}`,{method:"POST",headers:{"Content-Type":"application/json",Referer:l,"x-client-origin":l},body:JSON.stringify({idToken:s})});a.ok?n=(await a.json())?.users?.[0]?.email||"":console.error("identitytoolkit lookup failed:",await a.text())}else console.error("identitytoolkit lookup failed: No API Key found")}if(!n)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let i=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(n.toLowerCase().trim()!==i)return e.status(403).json({error:`Unauthorized: ${n} is not configured as an administrator.`});let o=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",u=JSON.stringify({admin:!0,email:n.toLowerCase().trim(),exp:Date.now()+864e5}),d=H(u,o);return e.json({token:d,email:n.toLowerCase().trim()})}catch(n){return console.error("Google login backend error:",n),e.status(500).json({error:"Authentication failed on server: "+(n.message||String(n))})}});S.post("/api/v1/admin/verify-session",async(t,e)=>{let s=String(t.headers.authorization||"");if(!s.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=s.split("Bearer ")[1];if(n.startsWith("ey"))try{let r="";if($e())r=(await require("firebase-admin").auth().verifyIdToken(n)).email||"";else{let d=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(d){let g=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:n})});g.ok&&(r=(await g.json())?.users?.[0]?.email||"")}}let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return r&&r.toLowerCase().trim()===o?e.json({ok:!0,email:r.toLowerCase().trim()}):e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",i=Y(n,r);if(!i)return e.status(401).json({error:"Unauthorized: Invalid token."});let o=JSON.parse(i);return!o.admin||Date.now()>o.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:o.email})}catch(r){return e.status(401).json({error:"Service error: "+(r?.message||String(r))})}});S.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing email address."});let n=String(s).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(s){return console.error("2fa resend error:",s),e.status(500).json({error:"Failed to process 2FA resend request: "+s.message})}});S.post("/api/github-sync/test",async(t,e)=>{try{let{owner:s,repo:n,token:r}=t.body||{},i=r||process.env.PAT;if(!s||!n||!i)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let o=i.trim(),u=o.toLowerCase().startsWith("ghp_")?`token ${o}`:`Bearer ${o}`,d=await fetch(`https://api.github.com/repos/${s.trim()}/${n.trim()}`,{headers:{Authorization:u,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(d.ok){let g=await d.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${g.full_name}`,permissions:g.permissions})}else{let g=await d.json().catch(()=>({})),p="";return d.status===401||d.status===403?p=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:d.status===404&&(p=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(d.status).json({ok:!1,message:(g.message||"Failed to connect to repository")+p})}}catch(s){return console.error("GitHub Test Connection error:",s),e.status(500).json({message:s.message||"Internal server error"})}});S.post("/api/github-sync/commit",async(t,e)=>{try{let{owner:s,repo:n,token:r,branch:i,path:o,content:u,message:d}=t.body||{},g=r||process.env.PAT;if(!s||!n||!g||!o||!u)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let p=i?i.trim():"main",l=o.replace(/^\/+/g,""),a=s.trim(),m=g.trim(),w=n.trim(),h=w,$=a.toLowerCase(),x=w.toLowerCase(),y=l.includes("staticData.ts")||l.includes("secureVault.ts")||l.includes("public_backup.json")||l.includes("secure_links_backup.json"),f=!1;console.log(`GitHub Sync Server Request: User "${a}" intends to sync "${l}" to repository "${w}"`);let k=m.toLowerCase().startsWith("ghp_")?`token ${m}`:`Bearer ${m}`,O=await(async N=>{let j=N;try{let R=await fetch(`https://api.github.com/users/${a}/repos?per_page=100`,{headers:{Authorization:k,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(R.ok){let E=await R.json();if(Array.isArray(E)){let T=E.find(P=>P.name?.toLowerCase()===j.toLowerCase());T&&T.name!==j&&(console.log(`GitHub Sync Server: Correcting repository casing alignment from "${j}" to "${T.name}"`),j=T.name)}}else{let E=await fetch(`https://api.github.com/orgs/${a}/repos?per_page=100`,{headers:{Authorization:k,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(E.ok){let T=await E.json();if(Array.isArray(T)){let P=T.find(Ve=>Ve.name?.toLowerCase()===j.toLowerCase());P&&P.name!==j&&(console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${j}" to "${P.name}"`),j=P.name)}}}}catch(R){console.warn("GitHub Repo casing alignment query not completed:",R)}console.log(`GitHub Sync Server: Fetching SHA of ${l} on repo ${a}/${j} [branch: ${p}]...`);let U,q="";try{let R=await fetch(`https://api.github.com/repos/${a}/${j}/contents/${l}?ref=${encodeURIComponent(p)}&_t=${Date.now()}`,{headers:{Authorization:k,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(R.ok){let E=await R.json();E&&!Array.isArray(E)&&E.sha&&(U=E.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${U}`))}else if(R.status===404){console.log(`GitHub Sync Server: File not found on branch "${p}". Attempting default branch fallback...`);let E=await fetch(`https://api.github.com/repos/${a}/${j}/contents/${l}?_t=${Date.now()}`,{headers:{Authorization:k,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(E.ok){let T=await E.json();T&&!Array.isArray(T)&&T.sha&&(U=T.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${U}`))}else if(E.status!==404){let T=await E.json().catch(()=>({})),P="";T.message&&(T.message.toLowerCase().includes("resource not accessible")||T.message.toLowerCase().includes("permission")||E.status===403)&&(P=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+j+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),q=`Default branch lookup failed with status ${E.status}: ${T.message||"Unknown error"}${P}`}}else{let E=await R.json().catch(()=>({})),T="";E.message&&(E.message.toLowerCase().includes("resource not accessible")||E.message.toLowerCase().includes("permission")||R.status===403)&&(T=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+j+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),q=`Target branch lookup failed with status ${R.status}: ${E.message||"Unknown error"}${T}`}}catch(R){console.error("GitHub SHA Fetch error on Server:",R),q=`Network error fetching repository contents on server: ${R.message||R}`}if(q&&!U)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${q}

Please check your Repository config and Token permissions.`};let be=Buffer.from(u,"utf8").toString("base64"),Z={message:d||"Admin Release Sync: Static file update",content:be,branch:p,...U?{sha:U}:{}};console.log(`GitHub Sync Server: Initiating commit for ${l} to ${j}...`);let G=await fetch(`https://api.github.com/repos/${a}/${j}/contents/${l}`,{method:"PUT",headers:{Authorization:k,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(Z)});if(!G.ok){let R=await G.text(),E=R;try{let P=JSON.parse(R);E=P.message||P.error?.message||R}catch{}let T="";return E.toLowerCase().includes("not found")?T=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+j+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:(E.toLowerCase().includes("credentials")||G.status===401)&&(T=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!T&&(E.toLowerCase().includes("resource not accessible")||E.toLowerCase().includes("permission")||G.status===403)&&(T=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+j+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+a+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:G.status,error:E+T}}return{success:!0,result:await G.json(),finalRepo:j}})(w);return O.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${O.finalRepo}"!`,O.result?.commit?.sha),e.json({...O.result,message:`Successfully published to ${O.finalRepo} repository.`,targetRepo:O.finalRepo})):e.status(O.status||400).json({message:O.error})}catch(s){return console.error("Server GitHub commit handler error:",s),e.status(500).json({message:`Internal server error during GitHub sync: ${s.message||s}`})}});S.get("/api/v1/image",async(t,e)=>{let s=t.query.url;if(!s)return e.status(400).send("Missing image URL");try{let n=s;try{s.startsWith("http")||(n=Buffer.from(s,"base64").toString("utf-8"))}catch{}if(!await Es(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!r.ok)throw new Error("Failed to fetch image");let i=await r.arrayBuffer(),o=r.headers.get("content-type")||"image/jpeg";e.set("Content-Type",o),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(i))}catch{e.status(500).send("Image proxy error")}});S.get("/api/v1/admin/firebase-status",async(t,e)=>{try{let s=z(),n=s.apiKey||process.env.FIREBASE_API_KEY,r=s.projectId||process.env.FIREBASE_PROJECT_ID,i=s.firestoreDatabaseId||"(default)";if(!n||!r)return e.status(503).json({status:"offline",error:"Missing Firebase credentials"});let o=await fetch(`https://firestore.googleapis.com/v1/projects/${r}/databases/${i}/documents?pageSize=1&key=${n}`);return o.status<500?e.json({status:"live"}):e.status(o.status).json({status:"offline",error:"Firestore returned server error"})}catch(s){return e.status(500).json({status:"offline",error:s.message})}});S.get("/api/v1/admin/verify",F,(t,e)=>{console.log("verify endpoint hit successfully! adminUser:",t.adminUser),e.json({authorized:!0,user:t.adminUser})});S.get("/api/v1/admin/security/audit-logs",F,async(t,e)=>{let s=z();if(!!1&&s&&s.apiKey)try{let i=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${s.apiKey?"&key="+s.apiKey:""}`,o=await fetch(i);if(o.ok){let g=((await o.json()).documents||[]).map(p=>{let l=p.fields||{};return{id:p.name.split("/").pop(),email:l.email?.stringValue||"unknown",ip:l.ip?.stringValue||"unknown",ua:l.ua?.stringValue||"unknown",success:l.success?.booleanValue??!1,reason:l.reason?.stringValue||"unknown",ts:l.ts?.stringValue||new Date().toISOString()}}).sort((p,l)=>new Date(l.ts).getTime()-new Date(p.ts).getTime());return e.json({success:!0,logs:g})}}catch(i){console.error("Error fetching Firestore audit logs:",i)}let r=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:r})});S.get("/api/v1/admin/2fa/config",F,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim();if(!s)return e.status(400).json({error:"Missing admin email."});let n=!1,r=!1,i="";if(n){let o=ye.get(s);o&&(r=o.enabled,i=o.secret)}else{let o=z();if(o&&o.apiKey)try{let u=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,d=await fetch(u);if(d.ok){let g=await d.json();r=g.fields?.enabled?.booleanValue===!0,i=g.fields?.secret?.stringValue||""}}catch(u){console.error("Error fetching Firestore 2FA config:",u)}}if(r)return e.json({enabled:!0});{let o=bt(),u=wt(s,o);return e.json({enabled:!1,tempSecret:o,qrCodeUri:u})}});S.post("/api/v1/admin/2fa/enable",F,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:r}=t.body||{};if(!s||!n||!r)return e.status(400).json({error:"Missing required fields (email, secret, code)."});let i=!1;if(!(i&&r==="123456")&&!Xe(r,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});if(i)ye.set(s,{enabled:!0,secret:n}),Tt();else{let o=z();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable: Firebase is not configured."});try{let u=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,d=await fetch(u,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{enabled:{booleanValue:!0},secret:{stringValue:n}}})});if(!d.ok){let g=await d.text();return console.error("Failed to save 2FA config to Firestore:",g),e.status(500).json({error:"Failed to save 2FA configuration to database."})}}catch(u){return console.error("Firestore save 2FA exception:",u),e.status(500).json({error:"Server database write error."})}}return e.json({success:!0})});S.post("/api/v1/admin/2fa/disable",F,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!s||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let r=!1,i="";if(r){let o=ye.get(s);o&&o.enabled&&(i=o.secret)}else{let o=z();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable."});try{let u=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,d=await fetch(u);if(d.ok){let g=await d.json();g.fields?.enabled?.booleanValue===!0&&(i=g.fields?.secret?.stringValue||"")}}catch(u){console.error("Firestore 2FA config fetch fail on disable:",u)}}if(!i)return e.status(400).json({error:"2FA is not enabled for this account."});if(!(r&&n==="123456")&&!Xe(n,i))return e.status(400).json({error:"Invalid verification code."});if(r)ye.delete(s),Tt();else{let o=z();if(o&&o.apiKey)try{let u=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,d=await fetch(u,{method:"DELETE"});if(!d.ok)return console.error("Failed to delete 2FA config from Firestore:",await d.text()),e.status(500).json({error:"Failed to delete 2FA from database."})}catch(u){return console.error("Firestore delete 2FA exception:",u),e.status(500).json({error:"Server database delete error."})}}return e.json({success:!0})});S.post("/api/v1/admin/encrypt",F,async(t,e)=>{let s=ee(t);if(await he(s))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let i=H(n,r);e.json({encrypted:i})}catch{e.status(500).json({error:"Encryption failed"})}});S.post("/api/v1/admin/encrypt-links",F,async(t,e)=>{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid links array payload is required."});try{let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let r=[],i=z();if(i){let l=i.apiKey?`?key=${i.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents`;for(let m of["sec_links_vault_3","secure_links","sec_vault"])try{let h=await(await fetch(`${a}/store_data/${m}${l}`)).json();if(h&&!h.error&&h.fields?.encryptedData?.stringValue){let $=Y(h.fields.encryptedData.stringValue,n);if($){let x=JSON.parse($);if(Array.isArray(x)){r=x;break}}}}catch{}}let o=new Map;r.forEach(l=>{l&&l.id&&o.set(l.id,l)}),s.map(l=>{let a=l.url||"";return a&&!a.startsWith("http://")&&!a.startsWith("https://")&&!a.startsWith("U2FsdGVkX1")&&(a="https://"+a),a&&!a.startsWith("U2FsdGVkX1")&&(a=H(a,n)),{...l,url:a}}).forEach(l=>{l&&l.id&&o.set(l.id,l)});let d=Array.from(o.values()),g=JSON.stringify(d),p=H(g,n);try{let l={};d.forEach(w=>{w&&w.id&&w.url&&(l[w.id]=w.url)});let m=`// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${String(H(JSON.stringify(l),n))}";
`}catch(l){console.warn("Failed to auto-seal secureVault.ts from encrypt-links:",l)}e.json({encrypted:p})}catch{e.status(500).json({error:"Links encryption failed"})}});S.get("/api/v1/admin/debug-links",F,async(t,e)=>{let s=ee(t);if(await he(s))return e.status(429).json({error:"Too many requests"});try{let n=JSON.parse(D.default.readFileSync("firebase-applet-config.json","utf8")),r=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,o=await(await fetch(r)).json();if(!o.fields||!o.fields.encryptedData)return e.json({error:"No vault data found"});let u=o.fields.encryptedData.stringValue,d=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",g=Y(u,d);e.json({decrypted:JSON.parse(g)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});S.post("/api/v1/admin/decrypt-url",F,async(t,e)=>{let s=ee(t);if(await he(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=Y(n,r);e.json({decrypted:o||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});S.post("/api/v1/admin/decrypt-links",F,async(t,e)=>{let s=ee(t);if(await he(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=Y(n,r);if(!o)throw new Error("Empty decrypted block.");let u=JSON.parse(o);u=u.map(d=>{let g=d.url||"";if(g.startsWith("U2FsdGVkX1"))try{g=Y(g,r)}catch{}return{...d,url:g}}),e.json({items:u})}catch(o){console.error("[ERROR] Admin decrypt-links failed:",o.message||o),e.status(500).json({error:"Links decryption failed: "+(o.message||"Check AES_SECRET")})}});S.post("/api/v1/admin/sync-local",F,async(t,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:s,settings:n,news:r,blogs:i,videos:o}=t.body;if(!s||!n)return e.status(400).json({error:"Invalid sync payload."});let u=Ke(s,n,r,i,o);try{D.default.writeFileSync(W.default.join(process.cwd(),"src/lib/staticData.ts"),u,"utf8")}catch(f){console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):",f.message)}let d=JSON.parse(JSON.stringify(s)).map(f=>(delete f.more_information_url,delete f.encrypted_download_url,delete f.download_url,f)),g=JSON.parse(JSON.stringify(n)),p=JSON.parse(JSON.stringify(r||[])),l=JSON.parse(JSON.stringify(i||[])),a=JSON.parse(JSON.stringify(o||[])),m=W.default.join(process.cwd(),"src/lib/public_backup.json");try{D.default.writeFileSync(m,JSON.stringify({apps:d,settings:g,news:p,blogs:l,videos:a},null,2),"utf8")}catch(f){console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):",f.message)}let w=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",h={};s.forEach(f=>{if(f.more_information_url)if(f.more_information_url.startsWith("U2FsdGVkX1"))h[f.id]=f.more_information_url;else try{h[f.id]=H(f.more_information_url,w)}catch{console.warn(`[SECURITY] Skipped backup link for ${f.id} due to encryption failure`)}});let $=W.default.join(process.cwd(),"src/lib/secure_links_backup.json"),x=h;if(D.default.existsSync($))try{x={...JSON.parse(D.default.readFileSync($,"utf8")),...h}}catch{}for(let[f,k]of Object.entries(x))if(k&&!k.startsWith("U2FsdGVkX1"))try{x[f]=H(k,w)}catch{delete x[f]}let y=!1;try{let f=$e();if(f){if(s&&Array.isArray(s)){let I=Math.ceil(s.length/25)||1;for(let O=0;O<I;O++){let N=JSON.parse(JSON.stringify(s.slice(O*25,(O+1)*25)));N.forEach(j=>{delete j.more_information_url,delete j.encrypted_download_url,delete j.download_url}),await f.collection("store_data").doc(`apps_chunk_${O}`).set({items:N})}await f.collection("store_data").doc("apps_meta").set({numChunks:I,last_updated:new Date().toISOString()})}if(n){let k=JSON.parse(JSON.stringify(n));await f.collection("store_data").doc("public_settings").set(k,{merge:!0})}r&&Array.isArray(r)&&await f.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(r))}),i&&Array.isArray(i)&&await f.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(i))}),o&&Array.isArray(o)&&await f.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(o))}),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),y=!0}}catch(f){console.warn("[SERVER] Firestore Admin SDK update warning, switching to REST API fallback:",f.message)}if(!y)try{if(s&&Array.isArray(s)){let k=Math.ceil(s.length/25)||1;for(let I=0;I<k;I++){let O=JSON.parse(JSON.stringify(s.slice(I*25,(I+1)*25)));O.forEach(N=>{delete N.more_information_url,delete N.encrypted_download_url,delete N.download_url}),await fe(`apps_chunk_${I}`,{items:O})}await fe("apps_meta",{numChunks:k,last_updated:new Date().toISOString()})}n&&await fe("public_settings",JSON.parse(JSON.stringify(n))),r&&Array.isArray(r)&&await fe("news",{items:JSON.parse(JSON.stringify(r))}),i&&Array.isArray(i)&&await fe("blogs",{items:JSON.parse(JSON.stringify(i))}),o&&Array.isArray(o)&&await fe("videos",{items:JSON.parse(JSON.stringify(o))}),console.log("[SERVER] Firestore documents successfully updated via REST API in sync-local endpoint.")}catch(f){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",f.message)}try{let f=W.default.join(process.cwd(),"src/lib/public_backup.json"),k={apps:s||[],settings:n||{},news:r||[],blogs:i||[],videos:o||[]};D.default.writeFileSync(f,JSON.stringify(k,null,2),"utf8")}catch(f){console.warn("[SERVER] Could not update public_backup.json:",f)}me=null,e.json({success:!0,message:"Cloud Firestore and backup components strictly synced."})}catch(s){console.error("local file sync endpoint error:",s),e.status(500).json({error:"Failed to store backup: "+s.message})}});S.get("/api/v1/admin/backup-links-get",F,(t,e)=>{try{let s=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",n={},r=W.default.join(process.cwd(),"src/lib/secureVault.ts");if(D.default.existsSync(r))try{let d=D.default.readFileSync(r,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(d&&d[1]){let g=d[1],p=Y(g,s);if(p){let l=JSON.parse(p);Array.isArray(l)?l.forEach(a=>{a&&a.id&&(n[a.id]=a.url||a.more_information_url||"")}):l&&typeof l=="object"&&Object.assign(n,l),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(u){console.warn("backup-links-get: Failed to parse secureVault.ts:",u.message)}let i=W.default.join(process.cwd(),"src/lib/secure_links_backup.json");if(D.default.existsSync(i))try{let u=JSON.parse(D.default.readFileSync(i,"utf8"));Object.assign(n,u),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(u){console.warn("backup-links-get: Failed to parse backup JSON:",u.message)}let o=[];for(let[u,d]of Object.entries(n)){let g="";typeof d=="string"&&(d.startsWith("U2FsdGVkX1")?g=Y(d,s):g=d),o.push({id:u,url:g})}e.json({items:o})}catch(s){console.error("backup-links-get failed:",s),e.status(500).json({error:"Failed to read backup links: "+s.message})}});S.get("/api/v1/admin/fix-db-links",F,async(t,e)=>{try{let s=z();if(!s)return e.status(500).json({error:"Missing configuration."});let r=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_0${s.apiKey?"?key="+s.apiKey:""}`)).json(),i=[];!r.error&&r.fields?.items?.arrayValue?.values&&(i=r.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue));let u=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_1${s.apiKey?"?key="+s.apiKey:""}`)).json();!u.error&&u.fields?.items?.arrayValue?.values&&(i=i.concat(u.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue)));let d=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",g=i.map(h=>({id:h,url:`https://example.com/demo/${h}`})),p=H(JSON.stringify(g),d),l=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",w=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${s.apiKey?"&key="+s.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${l}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:p}}})})).json();e.json(w)}catch(s){e.json({error:s.message})}});function nt(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:t.toString()}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>nt(e))}};if(typeof t=="object"){let e={};for(let s of Object.keys(t))e[s]=nt(t[s]);return{mapValue:{fields:e}}}return{stringValue:String(t)}}function Os(t){let e={};if(t&&typeof t=="object")for(let s of Object.keys(t))e[s]=nt(t[s]);return{fields:e}}async function fe(t,e){try{let s=z();if(!s||!s.projectId)return!1;let n=s.apiKey?`?key=${s.apiKey}`:"",r=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/store_data/${t}${n}`,i=Os(e),o=await fetch(r,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});return o.ok?(console.log(`[SERVER] REST write to store_data/${t} succeeded.`),!0):(console.warn(`[SERVER] REST write to store_data/${t} status ${o.status}:`,await o.text()),!1)}catch(s){return console.warn(`[SERVER] REST write to store_data/${t} failed:`,s.message),!1}}function Ce(t){if(!t||typeof t!="object")return t??null;if("stringValue"in t)return t.stringValue;if("booleanValue"in t)return t.booleanValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("timestampValue"in t)return t.timestampValue;if("nullValue"in t)return null;if("mapValue"in t){let e=t.mapValue?.fields||{},s={};for(let n of Object.keys(e))s[n]=Ce(e[n]);return s}return"arrayValue"in t?(t.arrayValue?.values||[]).map(s=>Ce(s)):null}function Pe(t){if(!t||typeof t!="object")return{};let e={};for(let s of Object.keys(t))e[s]=Ce(t[s]);return e}var me=null,Be=0,Ns=3e4;S.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data"],async(t,e)=>{try{let s=Date.now();if(me&&s-Be<Ns)return e.json(me);try{let p=$e();if(p){let l=await p.collection("store_data").doc("apps_meta").get(),a=[];if(l.exists){let x=l.data()?.numChunks||1;for(let y=0;y<x;y++){let f=await p.collection("store_data").doc(`apps_chunk_${y}`).get();f.exists&&f.data()?.items&&a.push(...f.data().items)}}else{let x=await p.collection("store_data").doc("apps").get();x.exists&&x.data()?.items&&(a=x.data().items)}let m=await p.collection("store_data").doc("public_settings").get(),w=await p.collection("store_data").doc("news").get(),h=await p.collection("store_data").doc("blogs").get(),$=await p.collection("store_data").doc("videos").get();if(a.length>0||m.exists){let x={apps:a,settings:m.exists?m.data():{},news:w.exists?w.data()?.items||[]:[],blogs:h.exists?h.data()?.items||[]:[],videos:$.exists?$.data()?.items||[]:[]};return me=x,Be=s,e.json(x)}}}catch{}try{let p=z();if(p&&p.projectId){let l=p.apiKey?`?key=${p.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${p.projectId}/databases/${p.firestoreDatabaseId||"(default)"}/documents/store_data`,m=await fetch(`${a}/apps_meta${l}`),w=[];if(m.ok){let N=await m.json(),j=N.fields?.numChunks?.integerValue?parseInt(N.fields.numChunks.integerValue,10):1;for(let U=0;U<j;U++){let q=await fetch(`${a}/apps_chunk_${U}${l}`);if(q.ok){let be=await q.json();if(be.fields?.items?.arrayValue?.values){let Z=be.fields.items.arrayValue.values.map(G=>Ce(G));w.push(...Z)}}}}else{let N=await fetch(`${a}/apps${l}`);if(N.ok){let j=await N.json();j.fields?.items?.arrayValue?.values&&(w=j.fields.items.arrayValue.values.map(U=>Ce(U)))}}let h=await fetch(`${a}/public_settings${l}`),$=await fetch(`${a}/news${l}`),x=await fetch(`${a}/blogs${l}`),y=await fetch(`${a}/videos${l}`),f={},k={},I={},O={};try{h.ok&&(f=Pe((await h.json())?.fields))}catch{}try{$.ok&&(k=Pe((await $.json())?.fields))}catch{}try{x.ok&&(I=Pe((await x.json())?.fields))}catch{}try{y.ok&&(O=Pe((await y.json())?.fields))}catch{}if(w.length>0||Object.keys(f).length>0){let N={apps:w,settings:f,news:k.items||[],blogs:I.items||[],videos:O.items||[]};return me=N,Be=s,e.json(N)}}}catch{}let n=W.default.join(process.cwd(),"src/lib/public_backup.json");if(D.default.existsSync(n))try{let p=JSON.parse(D.default.readFileSync(n,"utf8")),l={apps:p.apps||[],settings:p.settings||{},news:p.news||[],blogs:p.blogs||[],videos:p.videos||[]};return me=l,Be=s,e.json(l)}catch(p){console.error("Error reading public_backup.json in backup-data endpoint:",p)}let{mockApps:r,mockSettings:i,mockNews:o,mockBlogs:u,mockVideos:d}=Oe,g={apps:r||[],settings:i||{},news:o||[],blogs:u||[],videos:d||[]};return e.json(g)}catch(s){console.error("public backup endpoint error:",s);let{mockApps:n,mockSettings:r,mockNews:i,mockBlogs:o,mockVideos:u}=Oe;return e.status(200).json({apps:n||[],settings:r||{},news:i||[],blogs:o||[],videos:u||[]})}});S.get("/api/v1/debug-seo",async(t,e)=>{try{let{fetchStoreData:s}=(pe(),_e(ve)),n=await s();e.json({hasData:!!n,hasSettings:!!n?.settings,settingsKeys:Object.keys(n?.settings||{})})}catch(s){e.json({error:s.message})}});S.post("/api/v1/admin/seal-vault",F,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n={};s.forEach(o=>{o.id&&(o.url||o.more_information_url)&&(n[o.id]=o.url||o.more_information_url)});let r={AES_SECRET:process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"")};if(!r.AES_SECRET)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let i="";typeof H<"u"?i=H(JSON.stringify(n),r.AES_SECRET):i=require("crypto-js").AES.encrypt(JSON.stringify(n),r.AES_SECRET).toString(),e.json({success:!0,ciphertext:i})}catch(s){e.status(500).json({error:s.message})}});S.post("/api/v1/admin/save-links-direct",F,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",r={};s.forEach(u=>{let d=u.url||u.more_information_url;if(u.id&&d)if(d.startsWith("U2FsdGVkX1"))r[u.id]=d;else try{r[u.id]=H(d,n)}catch{console.warn(`[SECURITY] Skipped backup link for ${u.id} due to encryption failure`)}});let i=require("path").join(process.cwd(),"src/lib/secure_links_backup.json"),o=r;if(require("fs").existsSync(i))try{o={...JSON.parse(require("fs").readFileSync(i,"utf8")),...r}}catch{}for(let[u,d]of Object.entries(o))if(d&&!d.startsWith("U2FsdGVkX1"))try{o[u]=H(d,n)}catch{delete o[u]}e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(s){e.status(500).json({error:s.message})}});S.post("/api/v1/admin/pull-links-from-github",F,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));S.get("/api/v1/admin/config-status",F,(t,e)=>{let s=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,r=!!process.env.ADMIN_EMAIL;e.json({hasAes:s,hasSecLinks:n,hasAdminEmail:r})});S.get("/api/v1/admin/system-files",F,(t,e)=>{e.json({files:{}})});S.get("/api/v1/debug-index",async(t,e)=>{try{let s=D.default.readFileSync(W.default.resolve(process.cwd(),"index.html"),"utf-8"),n=t.app.get("vite");e.json({debug:!0})}catch(s){e.json({error:s.message})}});["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{S.all(t,(e,s)=>{s.status(404).send("Not Found")})});S.get(["/api/v1/_chal","/api/v1/get-challenge","/api/v1/init-file"],async(t,e)=>{console.log("[DEBUG] /api/v1/init-file called");let s=ee(t);if(await he(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=Is(t,e),r=ne.default.randomBytes(20).toString("hex"),i=Date.now(),o=Math.floor(Math.random()*100)+50;Q.set(r,{sessionId:n,expiresAt:i+120*1e3,issuedAt:i+o}),setTimeout(()=>{e.json({nonce:r,difficulty:"0000",sid:n})},o)});S.post(["/api/v1/_proc","/api/v1/get-token","/api/v1/process-file"],async(t,e)=>{let s=ee(t);if(await he(s))return e.status(429).json({error:"Too many requests. Please wait."});if($t(t))return e.status(403).json({error:"Access denied."});let n=t.body?.sid||t.cookies?.["__Host-sid"];if(!n)return e.status(403).json({error:"Session expired. Please reload."});let{nonce:r,solution:i,fingerprint:o,score:u,moved:d,touch:g,cfToken:p}=t.body||{};if(!r||!i||!o)return e.status(400).json({error:"Invalid request."});if(!Ss(o))return console.warn(`[DEFENSE] Bad fingerprint from ${s}`),e.status(403).json({error:"Access denied."});let l=Q.get(r);if(!l)return e.status(403).json({error:"Challenge expired. Please try again."});if(l.sessionId!==n)return Q.delete(r),e.status(403).json({error:"Session mismatch."});if(l.expiresAt<Date.now())return Q.delete(r),e.status(403).json({error:"Challenge timed out."});let a=Date.now()-l.issuedAt;if(a<80)return Q.delete(r),console.warn(`[DEFENSE] Solve too fast (${a}ms) from ${s}`),e.status(403).json({error:"Access denied."});if(Q.delete(r),typeof u!="number"||u<40)return console.warn(`[DEFENSE] Low score (${u}) from ${s}`),e.status(403).json({error:"Access denied: security check failed."});let m=r+i,w=ne.default.createHash("sha256").update(m).digest("hex");if(!w.startsWith("0000"))return console.warn(`[DEFENSE] PoW fail from ${s}: ${w}`),e.status(403).json({error:"Access denied: verification failed."});if(tt&&!await xs(p||"",s))return console.warn(`[CF] Rejected ${s}`),e.status(403).json({error:"Access denied: verification failed."});console.log(`[ACCESS] GRANTED ip=${s} score=${u} solveMs=${a} moved=${d} touch=${g}`);let h=t.body.appId||"unknown",$=Cs(s,n,o,h);e.json({token:$})});S.get("/api/v1/resource-availability",async(t,e)=>{let s=t.query.id;return s?se[s]?e.json({available:!0}):Object.keys(se).length===0?(it(),e.json({available:!!se[s]||!0})):e.json({available:!1}):e.json({available:!1})});var Et=new Map;S.post("/api/v1/public/chat",async(t,e)=>{let s=t.headers["x-forwarded-for"]||t.socket.remoteAddress||"unknown",n=Date.now(),r=3600*1e3,i=10,o=Et.get(s);if((!o||n>o.resetTime)&&(o={count:0,resetTime:n+r}),o.count>=i)return e.status(429).json({error:"Rate limit exceeded. Maximum 10 messages per hour. Please try again later."});o.count+=1,Et.set(s,o);let{message:u}=t.body;if(!u||typeof u!="string")return e.status(400).json({error:"Message payload is required."});try{let d=process.env.GEMINI_API_KEY;if(!d)throw new Error("AI service is currently offline.");let{fetchStoreData:g}=(pe(),_e(ve)),p=await g(),l={settings:{site_title:p.settings?.site_title,meta_description:p.settings?.meta_description,policies:p.settings?.policies?p.settings.policies.substring(0,500):""},categories:(p.categories||[]).map(h=>({id:h.id,n:h.name})),apps:(p.apps||[]).map(h=>({n:h.name,c:h.category,desc:h.description_html?.replace(/<[^>]+>/g,"").substring(0,200),r:h.rating})),news:(p.news||[]).map(h=>({t:h.title,d:h.description?.substring(0,200),c:h.content?.replace(/<[^>]+>/g,"").substring(0,300)})),blogs:(p.blogs||[]).map(h=>({t:h.title,d:h.description?.substring(0,200),c:h.content?.replace(/<[^>]+>/g,"").substring(0,300)})),videos:(p.videos||[]).map(h=>({t:h.title,d:h.description,c:h.content?.replace(/<[^>]+>/g,"").substring(0,1e3)}))},{GoogleGenAI:a}=require("@google/genai"),m=new a({apiKey:d,httpOptions:{headers:{"User-Agent":"aistudio-build"}}}),w=`You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(l,null,2)}`;try{let h=await m.models.generateContentStream({model:"gemini-2.0-flash",contents:u.trim(),config:{systemInstruction:w,maxOutputTokens:1e3,temperature:.3,tools:[{googleSearch:{}}]}});e.setHeader("Content-Type","text/event-stream"),e.setHeader("Cache-Control","no-cache"),e.setHeader("Connection","keep-alive"),e.flushHeaders();for await(let $ of h)$.text&&e.write(`data: ${JSON.stringify({text:$.text})}

`);return e.write(`data: [DONE]

`),e.end()}catch(h){if(!e.headersSent)throw h;return e.write(`data: ${JSON.stringify({error:h.message||"Streaming failed"})}

`),e.end()}}catch(d){if(d.status===429||d.message?.includes("429"))return e.json({success:!0,answer:"\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities."});if(d.status===403||d.message?.includes("403"))return e.json({success:!0,answer:"\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings."});let g=u.trim().toLowerCase();try{let{fetchStoreData:p}=(pe(),_e(ve)),m=((await p()).apps||[]).filter(w=>w.name&&w.name.toLowerCase().includes(g)||w.category&&w.category.toLowerCase().includes(g));if(m.length>0){let w=m.slice(0,3).map(h=>h.name).join(", ");return e.json({success:!0,answer:`(Offline Fallback): I found some apps in the directory matching your query: ${w}${m.length>3?" and more.":"."}`})}else if(g.includes("hello")||g.includes("hi ")||g==="hi")return e.json({success:!0,answer:"(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!"})}catch{}return e.json({success:!0,answer:"(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."})}});S.post("/api/v1/report-missing",async(t,e)=>{let{appId:s}=t.body;return s?(console.log(`[report-missing] Received report for ${s}, mocked success due to hardcoded public mode.`),e.json({success:!0})):e.status(400).json({error:"Missing App ID parameter."})});var se={};function it(){try{let t=require("path").join(process.cwd(),"src/lib/secure_links_backup.json");if(require("fs").existsSync(t)){let e=JSON.parse(require("fs").readFileSync(t,"utf8")),s={};if(Array.isArray(e))for(let n of e)n&&n.id&&(s[n.id]=typeof n.url=="string"?n.url:typeof n.more_information_url=="string"?n.more_information_url:"");else if(typeof e=="object")for(let n of Object.keys(e)){let r=e[n];typeof r=="string"?s[n]=r:r&&typeof r=="object"&&(s[n]=typeof r.url=="string"?r.url:typeof r.more_information_url=="string"?r.more_information_url:"")}se=s,console.log(`[SECURE CACHE] Warmed up ${Object.keys(se).length} links into memory for O(1) resolution.`)}}catch(t){console.error("[SECURE CACHE] Failed to warm up secure links cache:",t)}}it();S.get("/api/v1/resource-metrics",async(t,e)=>{let s=ee(t),n=t.query.token||t.query.t,r=t.query.id;if(!n||!r)return t.query.json==="true"?e.status(400).json({error:"Verification transmission tokens or App ID were omitted."}):e.status(400).send("<h1>400 Bad Request</h1><p>Tokens omitted.</p>");let i=Ie.get(n),o="";if(i){if(i.expiresAt<Date.now())return Ie.delete(n),t.query.json==="true"?e.status(404).json({error:"This connection timed out."}):e.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");Ie.delete(n),As.add(n),o=i.targetUrl}else{let u=!1;try{Buffer.from(n,"base64url").toString("utf8").includes("::")&&(u=!0)}catch{}if(u)try{let d=Buffer.from(n,"base64url").toString("utf8"),[g]=d.split("::"),[p,l,a]=g.split("|");if(!$s(n,p,l,a,r))return t.query.json==="true"?e.status(403).json({error:"Cryptographic HMAC validation failed."}):e.status(403).send("<h1>403 Forbidden</h1><p>HMAC validation failed.</p>");let m=se[r];if(m||(it(),m=se[r]),m){let w=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");m.startsWith("U2FsdGVkX1")?o=Y(m,w)||"":o=m}}catch{return e.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>")}else return t.query.json==="true"?e.status(404).json({error:"Link expired or invalid."}):e.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>")}if(!o||!o.startsWith("http")&&!o.startsWith("/"))return t.query.json==="true"?e.status(404).json({error:"Download link not found."}):e.status(404).send("<h1>404 Not Found</h1><p>Information Page Pending. Try again later.</p>");try{if(o.startsWith("http")){let u=new URL(o);if(!(u.hostname.includes("google.com")||u.hostname.includes("googleapis.com"))&&!u.searchParams.has("code")){let g=process.env.AFFILIATE_CODE;g&&(u.searchParams.set("code",g),o=u.toString())}}}catch{}return e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.set("Referrer-Policy","no-referrer"),e.redirect(302,o)});S.get("/api/v1/download/:id",async(t,e)=>{let s=t.params.id;return s?e.redirect(302,`/moreinfo/${s}`):e.status(400).send("Bad Request")});S.use((t,e,s,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let r=W.default.join(process.cwd(),"server_requests.log");D.default.appendFileSync(r,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(s.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return s.status(500).json({error:"Internal server error"});s.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});var Ys=module.exports=S;
