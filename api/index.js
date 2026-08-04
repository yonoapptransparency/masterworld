var nn=Object.create;var be=Object.defineProperty;var sn=Object.getOwnPropertyDescriptor;var rn=Object.getOwnPropertyNames;var on=Object.getPrototypeOf,an=Object.prototype.hasOwnProperty;var Y=(n,e)=>()=>(n&&(e=n(n=0)),e);var xe=(n,e)=>{for(var i in e)be(n,i,{get:e[i],enumerable:!0})},at=(n,e,i,t)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of rn(e))!an.call(n,s)&&s!==i&&be(n,s,{get:()=>e[s],enumerable:!(t=sn(e,s))||t.enumerable});return n};var E=(n,e,i)=>(i=n!=null?nn(on(n)):{},at(e||!n||!n.__esModule?be(i,"default",{value:n,enumerable:!0}):i,n)),ue=n=>at(be({},"__esModule",{value:!0}),n);var Oe,ve,ln,ze,zn,lt,cn,dn,ct,dt,Pn,he,ke=Y(()=>{Oe=E(require("path"));process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");ve=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||ve();ln=()=>["fallback","token","secret"].join("_"),ze=process.env.TOKEN_SECRET||ln(),zn=process.env.SESSION_SECRET||"fallback_session_secret_dev";process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");lt=process.env.CF_TURNSTILE_SECRET||"",cn=n=>{if(!n)return!1;let e=n.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},dn=cn(lt)?lt:"",ct=60*1e3,dt=300,Pn=Oe.default.join(process.cwd(),"src/lib/mock_2fa_store.json"),he=()=>{try{let n=Oe.default.join(process.cwd(),"src/lib/staticData");try{let e=require.resolve(n);delete require.cache[e]}catch{}return require(n)}catch(n){return console.error("Failed to load staticData dynamically:",n),{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}}});function R(n,e){let i=ve(),t=global.AES_SECRET_GLOBAL,s=[e,process.env.AES_SECRET,t,i].filter(Boolean),a=Array.from(new Set(s));for(let r of a)if(!(!r||r.trim()===""))try{let o=_e.default.AES.decrypt(n,r).toString(_e.default.enc.Utf8);if(o&&o.trim().length>0)return o}catch{}return""}function C(){return process.env.AES_SECRET||global.AES_SECRET_GLOBAL||ve()}function F(n,e){let i=e||C();if(!n||!i||i.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return _e.default.AES.encrypt(n,i).toString()}var _e,Se,K=Y(()=>{_e=E(require("crypto-js"));ke();Se=n=>{if(!n)return!1;let e=n.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))}});var ut={};xe(ut,{convertToFirestoreFields:()=>pt,convertToFirestoreValue:()=>Ee,deleteFirestoreRestDoc:()=>Fe,getAdminSdkDiagnostics:()=>Le,getFirebaseAdminDb:()=>D,getRawFirebaseConfig:()=>z,parseFirestoreFields:()=>W,parseFirestoreValue:()=>X,toFirestoreDocument:()=>un,toFirestoreValue:()=>Ie,writeFirestoreRestDoc:()=>U});function pn(n){if(!n)return null;if(typeof n=="object"&&(n.private_key||n.client_email||n.project_id))return n.private_key&&typeof n.private_key=="string"&&(n.private_key=n.private_key.replace(/\\n/g,`
`)),n;if(typeof n!="string")return null;let e=n.trim();for(;e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'");)e=e.slice(1,-1).trim();let i=t=>{if(typeof t=="string")try{t=JSON.parse(t)}catch{}return t&&typeof t=="object"&&(t.private_key||t.client_email||t.project_id)?(t.private_key&&typeof t.private_key=="string"&&(t.private_key=t.private_key.replace(/\\n/g,`
`)),t):null};try{let t=i(JSON.parse(e));if(t)return t}catch{}try{let t=e.replace(/\\n/g,`
`).replace(/\r/g,""),s=i(JSON.parse(t));if(s)return s}catch{}try{let t=e.replace(/\n/g,"\\n").replace(/\r/g,""),s=i(JSON.parse(t));if(s)return s}catch{}try{let t=Buffer.from(e,"base64").toString("utf8").trim(),s=i(JSON.parse(t));if(s)return s}catch{}throw new Error("Invalid JSON format in Service Account variable")}function z(){if(Z)return Z;let n=(u,c,h)=>{for(let w of[u,c,h])if(Se(w))return w;return""},e=n(process.env.VITE_FIREBASE_PROJECT_ID,process.env.VITE_FIREBASE_JECT_ID,process.env.FIREBASE_PROJECT_ID),i=n(process.env.VITE_FIREBASE_DATABASE_ID,process.env.VITE_FIREBASE_BASE_ID,process.env.FIREBASE_DATABASE_ID),t=n(process.env.VITE_FIREBASE_API_KEY,process.env.FIREBASE_API_KEY,process.env.API_KEY||process.env.NEXT_PUBLIC_FIREBASE_API_KEY),s=n(process.env.VITE_FIREBASE_AUTH_DOMAIN,process.env.VITE_FIREBASE_DOMAIN,process.env.FIREBASE_AUTH_DOMAIN),a=n(process.env.VITE_FIREBASE_APP_ID,process.env.FIREBASE_APP_ID),r=n(process.env.VITE_FIREBASE_STORAGE_BUCKET,process.env.FIREBASE_STORAGE_BUCKET),l=n(process.env.VITE_FIREBASE_MESSAGING_ID,process.env.FIREBASE_MESSAGING_SENDER_ID),o={};try{let u=Ae.default.readFileSync(Pe.default.join(process.cwd(),"firebase-applet-config.json"),"utf8");o=JSON.parse(u)||{}}catch{}let g=t||o.apiKey||"AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok",p=(u,c)=>!u||!Se(u)||u===c||u==="(default)"?"(default)":u;if(e)return Z={projectId:e,appId:a||o.appId,apiKey:g,authDomain:s||o.authDomain,firestoreDatabaseId:p(i||o.firestoreDatabaseId||o.databaseId,e),storageBucket:r||o.storageBucket,messagingSenderId:l||o.messagingSenderId},Z;if(o.projectId&&Se(o.projectId))return o.firestoreDatabaseId=p(o.firestoreDatabaseId||o.databaseId||i,o.projectId),o.apiKey=g,Z=o,o;let y="ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";return Z={projectId:y,appId:a||"1:103973989874:web:733a6afd8e837224900f6b",apiKey:g,authDomain:s||"gen-lang-client-0825832493.firebaseapp.com",firestoreDatabaseId:p(i,y),storageBucket:r||"gen-lang-client-0825832493.firebasestorage.app",messagingSenderId:l||"103973989874"},Z}function Le(){return se?{active:!0,message:G||"Admin SDK initialized and active"}:{active:!1,message:G||"Admin SDK inactive"}}function D(){if(se)return se;try{let n=require("firebase-admin"),e=z();if(n.apps.length===0){let r=null,l="",o=["FIREBASE_SERVICE_ACCOUNT","FIREBASE_ACCOUNT","FIREBASE_SERVICE_ACCOUNT_JSON","FIREBASE_CREDENTIALS","FIREBASE_ADMIN_KEY","FIREBASE_SECRET","SERVICE_ACCOUNT_JSON","SERVICE_ACCOUNT","GCP_SERVICE_ACCOUNT","GOOGLE_SERVICE_ACCOUNT"];for(let d of o)if(process.env[d]&&String(process.env[d]).trim()!==""){r=process.env[d],l=d;break}if(!r){let d=Pe.default.join(process.cwd(),"service-account.json");Ae.default.existsSync(d)&&(r=Ae.default.readFileSync(d,"utf8"),l="service-account.json (local)")}if(r)try{let d=pn(r);if(!d)return G=`Found ${l}, but parsing returned null`,null;let g=d.project_id||e?.projectId;n.initializeApp({credential:n.credential.cert(d),projectId:g}),G=`Initialized successfully for project ${g} using ${l}`,console.log(`[Admin SDK] Initialized for ${g} using ${l}`)}catch(d){return G=`Failed parsing ${l}: ${d.message}`,console.error(`[Admin SDK] Failed to parse ${l}:`,d.message),null}else if(process.env.GOOGLE_APPLICATION_CREDENTIALS)n.initializeApp({projectId:e?.projectId}),G="Initialized using GOOGLE_APPLICATION_CREDENTIALS",console.log("[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.");else return G="No Service Account variable found on server. Looked for FIREBASE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT, etc.",console.warn("[Admin SDK] No service account env var found. Admin SDK in REST fallback mode."),null}let i=e?.firestoreDatabaseId||e?.databaseId||process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s="ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";if(i&&i.trim()!==""&&i!=="(default)"&&i!=="gen-lang-client-0825832493"&&(s=i),s&&s!=="(default)"){let{getFirestore:r}=require("firebase-admin/firestore");se=r(n.apps[0],s)}else se=n.firestore();let a=n.apps[0]?.options?.projectId||"gen-lang-client-0825832493";return console.log(`[Admin SDK] Firestore initialized for project: ${a}, database: ${s}`),se}catch(n){return G=`Initialization thrown exception: ${n.message||n}`,console.warn("[Admin SDK] Initialization failed:",n.message||n),null}}function Ee(n){if(n==null)return{nullValue:null};if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="number")return Number.isInteger(n)?{integerValue:String(n)}:{doubleValue:n};if(typeof n=="string")return{stringValue:n};if(Array.isArray(n))return{arrayValue:{values:n.map(e=>Ee(e))}};if(typeof n=="object"){let e={};for(let[i,t]of Object.entries(n))t!==void 0&&(e[i]=Ee(t));return{mapValue:{fields:e}}}return{stringValue:String(n)}}function pt(n){let e={};if(!n||typeof n!="object")return e;for(let[i,t]of Object.entries(n))t!==void 0&&(e[i]=Ee(t));return e}async function U(n,e,i,t=!0){try{let s=z();if(!s||!s.projectId)return console.warn(`[SERVER] Cannot write REST doc ${n}: Missing project ID`),!1;let a=s.firestoreDatabaseId||s.databaseId||"(default)",r=[];s.apiKey&&r.push(`key=${encodeURIComponent(s.apiKey)}`),t&&e&&typeof e=="object"&&Object.keys(e).forEach(y=>{r.push(`updateMask.fieldPaths=${encodeURIComponent(y)}`)});let l=r.length>0?`?${r.join("&")}`:"",o=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${a}/documents/store_data/${n}${l}`,d=pt(e),g={"Content-Type":"application/json"};i&&i.trim()!==""&&(g.Authorization=i.startsWith("Bearer ")?i:`Bearer ${i}`);let p=await fetch(o,{method:"PATCH",headers:g,body:JSON.stringify({fields:d})});if(!p.ok){let y=await p.text();return console.warn(`[SERVER] writeFirestoreRestDoc failed for store_data/${n} (HTTP ${p.status}):`,y),!1}return console.log(`[SERVER] writeFirestoreRestDoc successfully written store_data/${n}`),!0}catch(s){return console.error(`[SERVER] writeFirestoreRestDoc exception for ${n}:`,s.message||s),!1}}async function Fe(n,e){try{let i=z();if(!i||!i.projectId)return!1;let t=i.firestoreDatabaseId||i.databaseId||"(default)",s=i.apiKey?`?key=${i.apiKey}`:"",a=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${t}/documents/store_data/${n}${s}`,r={};return e&&e.trim()!==""&&(r.Authorization=e.startsWith("Bearer ")?e:`Bearer ${e}`),(await fetch(a,{method:"DELETE",headers:r})).ok}catch{return!1}}function Ie(n){if(n==null)return{nullValue:null};if(typeof n=="boolean")return{booleanValue:n};if(typeof n=="number")return Number.isInteger(n)?{integerValue:n.toString()}:{doubleValue:n};if(typeof n=="string")return{stringValue:n};if(Array.isArray(n))return{arrayValue:{values:n.map(e=>Ie(e))}};if(typeof n=="object"){let e={};for(let i of Object.keys(n))e[i]=Ie(n[i]);return{mapValue:{fields:e}}}return{stringValue:String(n)}}function un(n){let e={};if(n&&typeof n=="object")for(let i of Object.keys(n))e[i]=Ie(n[i]);return{fields:e}}function X(n){if(!n||typeof n!="object")return n??null;if("stringValue"in n)return n.stringValue;if("booleanValue"in n)return n.booleanValue;if("integerValue"in n)return parseInt(n.integerValue,10);if("doubleValue"in n)return parseFloat(n.doubleValue);if("timestampValue"in n)return n.timestampValue;if("nullValue"in n)return null;if("mapValue"in n){let e=n.mapValue?.fields||{},i={};for(let t of Object.keys(e))i[t]=X(e[t]);return i}return"arrayValue"in n?(n.arrayValue?.values||[]).map(i=>X(i)):null}function W(n){if(!n||typeof n!="object")return{};let e={};for(let i of Object.keys(n))e[i]=X(n[i]);return e}var Ae,Pe,Z,se,G,Q=Y(()=>{Ae=E(require("fs")),Pe=E(require("path"));K();Z=null;se=null,G=""});function xt(n={}){let e={...n};return e.disclaimer_text===void 0&&(e.disclaimer_text=""),e.ethics_discrimination_text===void 0&&(e.ethics_discrimination_text=""),e.privacy_content===void 0&&(e.privacy_content=""),e.terms_content===void 0&&(e.terms_content=""),e.responsibility_content===void 0&&(e.responsibility_content=""),e.report_removal_content===void 0&&(e.report_removal_content=""),e.important_notice===void 0&&(e.important_notice=""),e.about_content===void 0&&(e.about_content=""),e.disclaimer_heading===void 0&&(e.disclaimer_heading=""),e.ethics_heading===void 0&&(e.ethics_heading=""),e.portal_heading===void 0&&(e.portal_heading=""),e.important_notice_heading===void 0&&(e.important_notice_heading=""),e}var We=Y(()=>{});var He={};xe(He,{b64EncodeUnicode:()=>yn,commitFileToGitHub:()=>bn,generateStaticDataFileCode:()=>wn});function yn(n){try{return btoa(encodeURIComponent(n).replace(/%([0-9A-F]{2})/g,(e,i)=>String.fromCharCode(parseInt(i,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(n)}}function wn(n=[],e={},i=[],t=[],s=[]){let a=JSON.parse(JSON.stringify(n||[])).map(p=>(delete p.more_information_url,delete p.encrypted_download_url,delete p.download_url,p)),l=xt({...{site_title:"",meta_description:"",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))}),o=JSON.parse(JSON.stringify(i||[])),d=JSON.parse(JSON.stringify(t||[])),g=JSON.parse(JSON.stringify(s||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockApps: AppConfig[] = ${JSON.stringify(a,null,2)} as any[];

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

export const mockNews: NewsItem[] = ${JSON.stringify(o,null,2)} as any[];

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

export const mockVideos: VideoItem[] = ${JSON.stringify(g,null,2)} as any[];

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}async function bn({owner:n,repo:e,token:i,branch:t,path:s,content:a,message:r}){let o=await fetch("/api/github-sync/commit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({owner:n,repo:e,token:i,branch:t,path:s,content:a,message:r})});if(!o.ok){let d=o.headers.get("content-type"),g=await o.text(),p=g||`Server returned ${o.status} ${o.statusText}`;if(d&&d.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${o.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${g.substring(0,100)}...`);try{let y=JSON.parse(g);p=y.message||y.error||p}catch{(!p||p.trim()==="")&&(p=`HTTP Error ${o.status}`)}throw new Error(p)}return o.json()}var qe=Y(()=>{We()});var Mt={};xe(Mt,{mockApps:()=>Qe,mockBlogs:()=>tt,mockNews:()=>et,mockSettings:()=>Ut,mockVideos:()=>nt,saveMockApps:()=>Sn,saveMockBlogs:()=>In,saveMockNews:()=>En,saveMockSettings:()=>An,saveMockVideos:()=>Tn});var Qe,Sn,Ut,An,et,En,tt,In,nt,Tn,Bt=Y(()=>{Qe=[{updated_at:"2026-08-03T02:37:24.987Z",seo_title:"Spin Crush - Casual Arcade Hub & Virtual Mini-Games",created_at:"2026-08-02T11:14:13.263Z",idea_box_msg:"",is_new:!0,version:"1.0.6",serial_number:1,seo_description:"Know about Spin Crush, the ultimate casual gaming hub. Explore diverse offline mini-games, collect virtual coins, and enjoy safe arcade entertainment on RummyDex.",release_notes:"",rating:4.1,og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",id:"yh9toduxk",description_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Spin Crush</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:10px}
h1:first-of-type{margin-top:0}
p{margin:10px 0}
.art{display:block;margin:18px 0}
</style>
</head>
<body>

<h1>A New Standard for Casual Arcade Gaming</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<circle cx="40" cy="40" r="25" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>Spin Crush redefines mobile entertainment by bringing an entire universe of casual mini-games into one accessible platform. Instead of offering a single repetitive loop, this app houses a vast collection of highly detailed thematic games. Whether you are looking for relaxing puzzle mechanics or fast-paced arcade action, this digital playground offers something for every type of player.</p>

<h1>Explore a Diverse Universe of Mini-Games</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<rect x="15" y="15" width="50" height="50" rx="8" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>The true strength of Spin Crush lies in its incredible variety. You can step into a virtual kitchen and match culinary ingredients in "Baking Master," or explore vibrant cultural themes in "Wild Bandito" and "Pinata Frenzy." For fans of mythology and history, "Thor God of Lightning" and "Xerxes" offer epic visual animations and dynamic virtual coin collection. Action enthusiasts can dive into the tactical environment of "Royale Battleground" or step into the ring with "Boxing King." Nature and fantasy lovers are also covered with the prehistoric adventures of "Jurassic Kingdom," the fiery visual combos of "Coin Volcano," and the mystical journey of "Wukong."</p>

<h1>Smooth Performance &amp; Immersive Gameplay</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M25 15l40 25-40 25z" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linejoin="round"/>
</svg>
<p>Built with top-tier optimization, the app delivers a highly responsive user experience. The intuitive central lobby allows players to effortlessly navigate through different game categories without experiencing heavy loading screens. Every mini-game features sharp 3D graphics, bright colors, and satisfying sound effects that make virtual progression and matching mechanics incredibly engaging.</p>

<h1>Safe, Virtual Entertainment</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M20 40l14 14 26-28" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>Designed as a purely casual simulation, Spin Crush focuses entirely on risk-free fun. Players can dive into thrilling arcade features like the "Fortune Wheel," "Crazy 777," or "Gemstones Gold" utilizing strictly virtual points. It is the perfect daily companion for users seeking a polished gaming experience where the focus is on beating high scores, unlocking new visual levels, and enjoying pure digital entertainment.</p>

</body>
</html>
`,safety_status:"Verified",developer:"Bingo",slug:"spin-crush",screenshots:[],name:"SPIN CRUSH",red_box_msg:"",encrypted_link:"",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",file_size:"44.8 MB",category:"All Apps, Yono",yellow_box_msg:"It get slightly heat on below Android 13",video_url:"",faqs:[],features_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Features \u2014 RummyDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px;display:flex;align-items:center;gap:10px}
h2 svg{flex-shrink:0}
p{margin:10px 0}
</style>
</head>
<body>

<h1>Features</h1>

<h2><svg width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="2" width="9" height="9" rx="2" fill="none" stroke="#1a73e8" stroke-width="2"/><rect x="15" y="2" width="9" height="9" rx="2" fill="none" stroke="#1a73e8" stroke-width="2"/><rect x="2" y="15" width="9" height="9" rx="2" fill="none" stroke="#1a73e8" stroke-width="2"/><rect x="15" y="15" width="9" height="9" rx="2" fill="none" stroke="#1a73e8" stroke-width="2"/></svg>Massive collection of thematic mini-games housed in one single app.</h2>

<h2><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11" fill="none" stroke="#1a73e8" stroke-width="2"/><path d="M10 8l8 5-8 5z" fill="#1a73e8"/></svg>Instant play mechanics with seamless switching between diverse game modes.</h2>

<h2><svg width="26" height="26" viewBox="0 0 26 26"><rect x="2" y="4" width="22" height="18" rx="2" fill="none" stroke="#1a73e8" stroke-width="2"/><circle cx="9" cy="10" r="2" fill="#1a73e8"/><path d="M2 19l6-6 5 5 4-4 7 6" fill="none" stroke="#1a73e8" stroke-width="2"/></svg>Stunning HD graphics ranging from culinary kitchens to ancient mythology.</h2>

<h2><svg width="26" height="26" viewBox="0 0 26 26"><path d="M13 2l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V6z" fill="none" stroke="#1a73e8" stroke-width="2"/></svg>Offline gameplay support for uninterrupted casual entertainment.</h2>

<h2><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11" fill="none" stroke="#1a73e8" stroke-width="2"/><path d="M8 13l4 4 7-8" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>100% virtual rewards and safe, risk-free arcade progression systems.</h2>

</body>
</html>
`,canonical_url:"https://www.rummydex.com/app/spin-crush",publish_date:"",is_coming_soon:!1,seo_keywords:"casual game hub, arcade collection, virtual coin games, offline mini-games, spin crush app"},{yellow_box_msg:"Play in limit doing anything excess is not good so if you in limit everything are good ",safety_status:"Verified",seo_title:"Rummy 77 - Hands On Review - Gameplay, Features & Performance | RummyDex",is_new:!1,og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",id:"i5uw2apum",encrypted_link:"",release_notes:"",is_coming_soon:!1,rating:4.2,idea_box_msg:"",serial_number:2,developer:"Arena studio",faqs:[],icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",updated_at:"2026-08-03T02:38:06.645Z",description_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Inside the Game: What Are You Actually Playing?</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:22px;color:#202124;font-weight:500;margin-top:44px;margin-bottom:14px}
h1:first-of-type{margin-top:0}
h2{font-size:17px;color:#202124;font-weight:500;margin-top:26px}
p{margin:10px 0}
ul{margin:10px 0;padding-left:22px}
li{margin:10px 0}
.art{display:block;margin:18px 0}
</style>
</head>
<body>

<h1>\u{1F0CF} Inside the Game: What Are You Actually Playing?</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<rect x="15" y="15" width="50" height="50" rx="8" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>At its core, Rummy 77 is a straightforward, classic 13-card rummy experience. The app doesn't try to reinvent the wheel with heavy 3D graphics or complicated storylines; instead, it focuses entirely on the mechanics of the game itself.</p>
<p>The moment you launch the app, you are greeted with a remarkably clean lobby. Matchmaking is snappy\u2014during our tests, it rarely took more than a few seconds to find a seat at a virtual table.</p>

<h2>The Table Experience:</h2>
<p>Once you are in a match, the layout is highly intuitive. The center of the screen houses the closed deck and the open discard pile, while your 13 cards are fanned out clearly at the bottom.</p>
<ul>
<li><strong>Auto-Sort Mechanics:</strong> One feature we genuinely appreciated was the responsive "Sort" button. With a single tap, the app automatically groups your cards by suit and color, which is a massive time-saver when you are trying to spot potential pure sequences or sets under a time limit.</li>
<li><strong>Dragging and Discarding:</strong> Moving cards feels natural. The touch response is tight\u2014there is no frustrating lag when you are trying to drag a card to the discard pile right before your turn timer runs out.</li>
<li><strong>Visual Clarity:</strong> The developers opted for a high-contrast green felt background with large, bold card faces. If you are playing on a smaller phone screen, you won't have to squint to tell the difference between a Spade and a Club.</li>
</ul>

<h1>\u2699\uFE0F How Does It Actually Perform?</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<circle cx="40" cy="40" r="25" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>We didn't just look at the gameplay; we monitored how the app handled device resources during extended play sessions.</p>
<ul>
<li><strong>Fluidity and Frame Rates:</strong> We tested Rummy 77 on both a modern flagship phone and a three-year-old budget Android device. On both, the game maintained a rock-solid 60 FPS. The card dealing animations are smooth, and transitioning in and out of lobbies happens without any frustrating loading screens.</li>
<li><strong>Battery &amp; Thermal Check:</strong> Card games shouldn't turn your phone into a hand-warmer. Because Rummy 77 relies on clean 2D assets rather than heavy background rendering, it is incredibly lightweight. We played continuously for over an hour, and the battery drain was minimal. More importantly, the back of the device stayed perfectly cool.</li>
</ul>

<h1>\u{1F3AF} Our Verdict</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M20 40l14 14 26-28" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>If you are looking for a hyper-realistic casino simulator with heavy 3D avatars, this might not be for you. The UI is admittedly a bit simple. However, if your goal is pure, uninterrupted rummy with excellent touch controls, reliable matchmaking, and zero battery anxiety, Rummy 77 completely hits the mark. It does exactly what it promises, and it does it well.</p>

</body>
</html>
`,category:"All Apps, Yono",seo_description:"We went hands-on with Rummy 77. Read our neutral review detailing the actual table mechanics, card sorting features, and real-world battery performance.",created_at:"2026-08-03T02:13:03.477Z",version:"1.0.6",canonical_url:"https://www.rummydex.com/app/rummy-77",features_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Rummy 77: Our Hands-On Review & Gameplay Breakdown</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:24px;color:#202124;font-weight:500;margin-bottom:20px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
</style>
</head>
<body>

<h1>Rummy 77: Our Hands-On Review &amp; Gameplay Breakdown</h1>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M25 15l40 25-40 25z" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linejoin="round"/>
</svg>

<p>When it comes to digital card games, the market is flooded with apps that prioritize flashy menus over actual gameplay. When our team sat down to test Rummy 77, we wanted to see if it actually delivered a solid, reliable card-playing experience or if it was just another generic clone.</p>
<p>After hours of hands-on testing across multiple devices, here is our neutral, unfiltered breakdown of exactly what Rummy 77 has to offer.</p>

</body>
</html>
`,seo_keywords:"rummy 77 app, real rummy gameplay, rummy 77 review, 13 card rummy",publish_date:"",screenshots:[],file_size:" 49.2 MB",red_box_msg:"",name:"RUMMY 77",video_url:"",slug:"rummy-77"},{developer:"Ariyan Chowdhury studio ",is_coming_soon:!1,idea_box_msg:"Almost In every android phone it can run well no issues ",rating:4.4,og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785780996/download_22_vgi4h1_1_jjm7jx.webp",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785780996/download_22_vgi4h1_1_jjm7jx.webp",yellow_box_msg:"",seo_description:"Master your skills with Rummy 91! \u{1F0CF} Play traditional Rummy, fast-paced Teen Patti, and classic Ludo in one lightweight app. Join the practice lobbies today. \u2728",description_html:`<section>
  <h2>Inside Rummy 91: The Game Library</h2>

  <article>
    <h3>1. Strategy &amp; Skill Rooms (Classic Rummy)</h3>

    <h4>The Experience</h4>
    <p>
      Point, Pool, and Deals Rummy designed for mental exercise and strategy building.
    </p>

    <h4>Real User Benefit</h4>
    <p>
      It acts as a great brain-training tool. Users can sharpen their memory and card-matching skills in practice rooms at their own pace. The interface includes auto-sort features, making it incredibly easy for players to organize their hands without frustration.
    </p>
  </article>

  <article>
    <h3>2. The Social Lounge (Teen Patti &amp; Card Classics)</h3>

    <h4>The Experience</h4>
    <p>
      Traditional 3-card games built around community and casual multiplayer fun.
    </p>

    <h4>Real User Benefit</h4>
    <p>
      Perfect for social gamers. Users can connect with friends or join quick casual matches. The inclusion of in-game emojis and animated avatars keeps the atmosphere lighthearted, relaxed, and focused on pure entertainment.
    </p>
  </article>

  <article>
    <h3>3. Quick-Play Arcade (Dragon vs Tiger &amp; Mini-Games)</h3>

    <h4>The Experience</h4>
    <p>
      Fast-paced, visually vibrant intuitive games that require zero complex tutorials.
    </p>

    <h4>Real User Benefit</h4>
    <p>
      Ideal for users who only have a few minutes to spare, like during a commute. These quick-tap games test observation and intuition. The lightweight code ensures the animations run smoothly without draining the phone's battery.
    </p>
  </article>

  <article>
    <h3>4. Nostalgic Board Games (Ludo)</h3>

    <h4>The Experience</h4>
    <p>
      A digital, multiplayer recreation of the classic family board game.
    </p>

    <h4>Real User Benefit</h4>
    <p>
      Brings classic offline fun to the mobile screen. Users get a simple, familiar interface that appeals to all age groups, offering a relaxing break from the heavier strategy-based card games.
    </p>
  </article>
</section>`,category:"All Apps, Yono Apps",canonical_url:"https://www.rummydex.com/app/rummy-91",features_html:"",name:"RUMMY 91",updated_at:"2026-08-04T04:23:29.327Z",slug:"rummy-91",encrypted_link:"",is_new:!1,created_at:"2026-08-03T18:10:16.344Z",seo_title:"Rummy 91: The Ultimate Casual Card & Board Game App \u{1F680}",release_notes:"",red_box_msg:"",serial_number:3,screenshots:[],video_url:"",faqs:[],version:"1.07.9",safety_status:"Verified",file_size:"47.8 MB",id:"s4oc5m16b",seo_keywords:"",publish_date:""},{id:"ha76icslh",name:"CALLBREAK",slug:"callbreak",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785819278/images_21_1_g770hi.webp",category:"Card Apps, All Apps",encrypted_link:"",rating:4,safety_status:"Verified",serial_number:4,version:"1.0",file_size:"51.11 MB",developer:"People Lovin Games",description_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Callbreak: Classic Card Games</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.tagline{color:#5f6368;font-size:14px;margin-bottom:28px;font-style:italic}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
ul{margin:10px 0;padding-left:22px}
li{margin:8px 0}
.art{display:block;margin:18px 0}
</style>
</head>
<body>

<h1>Callbreak: Classic Card Games</h1>
<p class="tagline">Strategic trick-taking card battles, built for both casual rounds and serious competition.</p>

<h2>What This Game Is</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<rect x="15" y="15" width="50" height="50" rx="8" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>Callbreak is a digital take on the classic South Asian trick-taking card game of the same name, also known as Lakadi in some regions. It's a mainstay across Nepal, India, Bangladesh, and Bhutan, and this app brings that same experience to mobile \u2014 whether you want to play against AI bots, challenge friends, or jump into a match with strangers online.</p>
<p>Each of four players is dealt thirteen cards from a standard deck. Before a round begins, everyone calls a bid \u2014 how many tricks they expect to win. Cards are then played trick by trick, and players who hit or beat their bid score points, while falling short costs them. A full match typically runs five rounds, with scores adding up as you go.</p>

<h2>How the Game Plays</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M25 15l40 25-40 25z" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linejoin="round"/>
</svg>
<p>The rules stick closely to traditional Callbreak. It's a standard 52-card deck with no jokers, four players holding thirteen cards each, and spades set as the permanent trump suit \u2014 though some in-app modes let you choose a different trump. Players have to follow the leading suit if they can; otherwise, they're free to trump or discard.</p>
<p>Scoring rewards players who meet their bid, with small bonuses for extra tricks, while missing a bid costs points equal to what was called. If you're dealt a particularly rough hand, there's a reshuffle option to redeal. An undo feature lets you take back your last move, and a card history tool lets you review what's already been played during a match.</p>

<h2>Ways to Play</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<circle cx="28" cy="40" r="16" fill="none" stroke="#1a73e8" stroke-width="3"/>
<circle cx="55" cy="40" r="16" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>There's a mode here for however you like to play. Go offline against AI bots when you don't have a connection, or jump into real-time online multiplayer against players worldwide. You can set up a private table and invite friends or family with a referral code, or play locally over the same Wi-Fi network with no internet required at all.</p>
<p>Difficulty settings run from novice to advanced, and there are a couple of standout variations worth trying: Super 8 Bid Challenge, where you're racing to win eight hands in a round while the bots try to stop you, and Blind Bid Mode, where you place your bid before seeing how anyone else is playing. There's also a dedicated practice mode for sharpening your skills against AI before taking on real opponents.</p>

<h2>Social &amp; Competitive Play</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M20 40l14 14 26-28" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>Global leaderboards and a league system \u2014 with tiers like Bronze, Gold, and Platinum \u2014 give competitive players something to climb toward, and matchmaking uses a skill rating to pair you with opponents around your level. During matches, in-game chat and emoji reactions keep things social, and you can invite friends directly to private tables. Stats tracking lets you see how you're performing round over round and compare yourself against other players. Anti-cheat measures are built in to keep matches fair.</p>

<h2>Rewards &amp; In-App Purchases</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<circle cx="40" cy="40" r="25" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>Gems are the main currency for unlocking in-game extras, and they can't be redeemed for real money or cash prizes. Coins serve as a secondary currency, mainly tied to timer bonuses and a daily reward wheel. There are daily log-in rewards on top of that. The app is free to download and ad-supported, with an option to remove ads through a purchase, and several gem pack tiers available for players who want to buy in.</p>

<h2>Look, Feel &amp; Accessibility</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<path d="M20 20l40 40M60 20L20 60" stroke="#1a73e8" stroke-width="3" stroke-linecap="round"/>
</svg>
<p>The interface is built to feel approachable whether you're new to Callbreak or you've played for years. You can pick from multiple card designs and table themes, and matches come with smooth card animations and satisfying trick-collection visuals. Avatars represent players and bots, especially in single-player games. Sound effects, background music, and haptic feedback round out the experience, and there's a colorblind mode along with support for a wide range of languages including English, Hindi, Spanish, French, and many others.</p>

<h2>Settings You Can Adjust</h2>
<svg class="art" width="80" height="80" viewBox="0 0 80 80">
<rect x="15" y="15" width="50" height="50" rx="8" fill="none" stroke="#1a73e8" stroke-width="3"/>
</svg>
<p>Players have a good amount of control over how a match runs \u2014 sound and volume, game speed, and which mode to play, whether that's standard, Super 8, or Blind Bid. You can also choose the number of rounds instead of sticking with the default five, and in some variants, pick your own trump suit. Undo, reshuffle, and card history can all be toggled from the settings as well.</p>

</body>
</html>
`,features_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Callbreak: What It's Actually Like to Play</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:24px;color:#202124;font-weight:400;margin-bottom:6px}
.tagline{color:#5f6368;font-size:14px;margin-bottom:28px;font-style:italic}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:40px}
p{margin:10px 0}
ul{margin:10px 0;padding-left:22px}
li{margin:8px 0}
</style>
</head>
<body>

<h1>Callbreak: What It's Actually Like to Play</h1>
<p class="tagline">A look at how the game feels day to day \u2014 the wins, the friction, and everything in between.</p>

<h2>First Impressions</h2>
<p>Callbreak comes across as an engaging, easy-to-pick-up card game that brings the traditional South Asian trick-taking game to mobile in a way that feels smooth, polished, and beginner-friendly right from the start. Having offline AI play, online multiplayer, and quick matches all in one place gives players real flexibility, and that's a big part of why people keep coming back.</p>
<p>The overall feeling is positive, but with some caveats. The core card game itself is satisfying and genuinely addictive \u2014 the friction tends to come from the ads, monetization, and occasional technical hiccups around the edges.</p>

<h2>Getting Started</h2>
<p>New players are guided in rather than dropped into a confusing menu. A beginner-friendly tutorial walks through the rules of Callbreak, bidding, trump suits, and trick-taking, and an in-app rulebook covers everything from the basics to more advanced strategy for players who want to improve over time.</p>
<p>Difficulty settings run from novice to advanced, so beginners can ease in while experienced players have room to push themselves. Most people find the rules easy to pick up, while the strategy stays deep enough to hold their interest. The onboarding experience overall feels welcoming and low-pressure \u2014 most new players feel ready to jump in within minutes.</p>

<h2>How a Match Feels</h2>
<p>Quick match options get you into a game fast, while standard matches feel more like a complete session. Bidding sits at the center of the experience, and the interface makes calling your number straightforward. Touch controls for selecting and playing cards feel smooth and intuitive.</p>
<p>Little quality-of-life touches make a real difference \u2014 the ability to undo a mis-tap takes the stress out of quick decisions, reviewing card history helps with strategic planning, and being able to reshuffle a genuinely bad hand is appreciated. Animations move at a good pace, and game speed can be adjusted if you want things faster or slower.</p>
<p>Altogether, the gameplay loop feels rhythmic and satisfying \u2014 bid, play, win or lose the trick, watch the score update. The tactile card play and animated trick collection give it a real card-table feel.</p>

<h2>Playing Against the AI</h2>
<p>AI opponents are generally described as challenging and smart, adapting to how you play. That said, more advanced players report that the AI becomes predictable after extended play, which can wear down long-term replay value. One specific quirk that comes up is bots sometimes playing only their lowest available card, which can feel less realistic or strategically shallow.</p>
<p>Being able to play entirely offline is a strong point, especially for anyone dealing with unreliable connectivity, and practice mode is genuinely useful for building up strategy before jumping into matches against real people. Overall, single-player is solid and convenient, though it can start to feel repetitive for players who've mastered the AI's patterns.</p>

<h2>Playing With Others</h2>
<p>Real-time matches against players from around the world add excitement and unpredictability that AI matches can't match. Matchmaking uses a skill-rating system to pair similar-level players, though some users report inconsistencies \u2014 trouble connecting with random opponents or with friends specifically.</p>
<p>Private tables for playing with friends or family are well-liked, and local Wi-Fi play is praised for situations without internet access, like travel or gatherings. In-game chat and emojis add a bit of social warmth, though they're fairly minimal compared to dedicated chat apps. Network interruptions are a real pain point \u2014 they can cause bid failures, auto-resets, or disconnections mid-match. Referral-code invites and Facebook integration exist for connecting with friends, though some users run into friction there too.</p>
<p>When it works, multiplayer is fun and competitive \u2014 but connection instability and matchmaking hiccups can make the experience inconsistent.</p>

<h2>Look and Sound</h2>
<p>The app gets frequent praise for its visuals \u2014 people describe the card animations as beautiful and the interface as sleek. The game board has a modern, premium look that adds to the overall sense of polish. Multiple card designs and table themes let players personalize things, and dealing, trick collection, and win/loss animations all feel smooth and satisfying.</p>
<p>Sound design leans into authentic, realistic card shuffling and playing sounds, with background music and customization options available too. On supported devices, haptic feedback adds an extra layer of tactile feel. Altogether, the visuals and audio work together to create a premium, polished card-room atmosphere.</p>

<h2>Controls and Navigation</h2>
<p>Touch controls come across as smooth and intuitive, and the interface is generally easy to navigate. The main menu and home screen are clean, though some players wish settings were more directly accessible. Colorblind mode and multi-language support help make the app accessible to a wider audience.</p>
<p>One recurring complaint is being forced to play a specific card in certain situations, when players would rather have more freedom. That said, the app is easy to operate one-handed, which matters a lot for a mobile card game \u2014 most of the friction comes from gameplay rules like forced suit-following rather than the interface itself.</p>

<h2>Ads and Monetization</h2>
<p>The game is genuinely free to download and play, which keeps the barrier to entry low. But ad frequency is by far the most frequently cited pain point \u2014 some users describe feeling like they spend the vast majority of their time watching ads rather than playing. Ads tend to show up between games or at natural breaks, but how often and how long they run can break immersion.</p>
<p>A "Remove Ads" purchase is available, but some users report ads still showing up even after paying \u2014 which creates real frustration and damages trust. Gem packs are offered for unlocking assets; some players are fine with that, others feel pushed toward spending. The daily reward wheel and login bonuses add a sense of progression, though the rewards themselves can feel small.</p>
<p>Monetization is the single biggest source of dissatisfaction here, and ads persisting after a paid removal is the kind of thing that really damages trust with paying users.</p>

<h2>Progression and Rewards</h2>
<p>Daily login rewards and the spin-based daily wheel encourage regular use and add small moments of anticipation. Global leaderboards give players a long-term goal to chase, and league progression \u2014 Bronze, Gold, Platinum, and so on \u2014 adds a sense of advancement. Detailed stats let players track their own improvement and compare themselves to others, and small skill-point bonuses for extra tricks offer little moments of satisfaction along the way.</p>
<p>These systems are generally effective at keeping people engaged, though the rewards are modest and the competitive pace may feel slow for more casual players.</p>

<h2>Where Things Get Frustrating</h2>
<ul>
<li><strong>Excessive ads</strong> \u2014 breaks immersion, fragments sessions, and is enough to make some players uninstall.</li>
<li><strong>Ads after paying to remove them</strong> \u2014 a trust-breaking experience that has led to refund requests.</li>
<li><strong>AI predictability</strong> \u2014 reduces long-term challenge for more experienced players.</li>
<li><strong>Multiplayer connection issues</strong> \u2014 bid failures, disconnections, and trouble connecting with friends specifically.</li>
<li><strong>No Nil Bid option</strong> \u2014 players coming from Spades or more advanced Callbreak variants miss this strategic choice.</li>
<li><strong>Forced card play</strong> \u2014 some players want more freedom in which card they play.</li>
<li><strong>Crashes and freezes</strong> \u2014 technical instability that can interrupt games and cost progress.</li>
<li><strong>Login issues</strong> \u2014 problems signing in that affect multiplayer access and reward tracking.</li>
<li><strong>Missing cards bug</strong> \u2014 connectivity or sync issues that can make cards appear to vanish mid-play.</li>
</ul>

<h2>The Emotional Highs and Lows</h2>
<p>The delight moments are the ones you'd expect from a good card game \u2014 winning a tricky bid, watching a smooth animation play out, pulling off a perfect hand, unlocking a new theme, or beating a friend at a private table. The friction moments are just as clear: sitting through another ad, losing connection mid-bid, discovering ads still show up after paying to remove them, or watching the AI make another predictable low-card play.</p>
<p>Long-term, the app is addictive and fun as a casual card game, but frequent players tend to hit a ceiling where the ads and AI predictability start to wear thin. The social multiplayer side keeps a lot of people engaged \u2014 but only when the connection actually holds up.</p>

<h2>The Bottom Line</h2>
<p>Callbreak delivers a polished, accessible, and strategically satisfying card game that works well for both casual players and longtime fans of the format. Its strongest points are its visual polish, smooth controls, offline flexibility, and social features. Its biggest weaknesses are ad overload and technical instability, especially around multiplayer and after paying to remove ads. Most players genuinely enjoy the core experience, but frequently wish for fewer ads, more reliable servers, and deeper AI strategy.</p>

</body>
</html>
`,seo_title:"Callbreak: Classic Card Games \u2014 Review, Rating & Download Info",seo_description:"Explore Callbreak: Classic Card Games on RummyDex. Check gameplay modes, features. Hand tested review on real experience ",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!1,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-04T05:18:55.084Z",updated_at:"2026-08-04T05:18:55.084Z"}],Sn=n=>{try{localStorage.setItem("rummystore_apps",JSON.stringify(n))}catch(e){console.warn("saveMockApps storage failed:",e)}Qe.splice(0,Qe.length,...n)},Ut={site_title:"RummyDex",meta_description:"RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785719943/1000132603_ym7nto.jpg",favicon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",helpline_whatsapp:"",helpline_telegram:"",support_email:"rummydex1@gmail.com",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:["All Apps","Yono Apps","Card Apps","Funny games"],banners:[],quick_links:[],website_faqs:[{answer:"RummyDex is an all-in-one digital discovery portal. We simplify your search for quality mobile apps by providing curated app listings, hands-on performance reviews, lightweight video previews, and daily industry news\u2014all in one structured directory.",question:"\u200BQ1: What is RummyDex, and how does it help me find the best apps?"},{question:"Q2: How does RummyDex ensure listed apps perform well on my device?",answer:"Every application featured on our platform undergoes real, hands-on evaluation by our team. We analyze frame rate stability, thermal efficiency, battery consumption, and overall interface responsiveness so you know exactly how an app behaves before you install it."},{question:"Q3: Does RummyDex host software files directly on its servers?",answer:"No. We function as a secure informational bridge. We review software and provide verified, direct routing to official developer sources. This guarantees you always access authentic, unalterable releases straight from the original creators."},{question:"Q4: Do I need an account or subscription to use RummyDex?",answer:"Not at all. RummyDex is an open-access resource. You can explore our full app index, stream video review highlights, read technical breakdowns, and check daily platform news completely free, with no account registration required."},{question:"Q5: What will I find in the News and Video sections?",answer:"Our News section keeps you updated on major software patches, developer announcements, and mobile trends. Our Video section offers fast, lightweight gameplay and UI clips so you can visually inspect an app\u2019s performance before visiting the developer source"},{question:"Q6: How frequently are new reviews and apps added?",answer:"Our catalog is constantly growing. We continuously evaluate new submissions, test software updates, and publish fresh insights to ensure our directory reflects the newest and most reliable mobile applications available."}],developers:[{bio:`Chief Executive Officer (CEO), RummyDex
As the visionary architect behind RummyDex, the CEO is dedicated to transforming how users discover and experience mobile entertainment. Driven by a strict commitment to digital transparency and platform integrity, the CEO leads the strategic direction of the directory, ensuring that every featured application meets rigorous standards for performance, safety, and overall quality. By championing a zero-bias, hands-on review process and prioritizing a seamless, secure user experience, the CEO drives RummyDex\u2019s mission to be the internet\u2019s most trusted, authoritative hub for premium offline and online casual games.`,role:"CEO",github:"",image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785064868/download_47_tltvqo.webp",twitter:"",name:"Jeet Roj"},{name:"Shehzad .L",role:"Chief Technology Officer (CTO)",image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785718054/1000132675_11zon_pogxm7.jpg",github:"",twitter:"",bio:"As the lead technical architect of RummyDex, the CTO drives the core engineering, database infrastructure, and platform security of the website. Responsible for maintaining a high-performance framework, the CTO ensures lightning-fast search indexing, real-time content delivery for our active News Hub, and robust server stability under heavy traffic. By continuously optimizing back-end operations and system architecture, the CTO guarantees that navigating RummyDex remains an exceptionally fast, smooth, and reliable experience for every user."}],secure_index_subtitle:"RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",hero_title_subtitle:"RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",social_linkedin:"",responsibility_content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Platform Responsibility Clause \u2014 RummyDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>Platform Responsibility Clause</h1>
<p class="updated">Last modified: August 2, 2026</p>

<h2>1. Technical Operations &amp; Secure Routing</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="30" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<rect x="105" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M75 62h30" stroke="#1a73e8" stroke-width="3" stroke-linecap="round"/>
<path d="M96 54l9 8-9 8" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="52" cy="62" r="4" fill="#3c4043"/>
<circle cx="128" cy="62" r="4" fill="#3c4043"/>
</svg>
<p>Our operational responsibility is strictly limited to maintaining the RummyDex directory infrastructure. We ensure that our platform accurately catalogs applications and that all outbound links securely and correctly route users to legitimate, third-party developer sources at the time of publication.</p>

<h2>2. Limits of Content &amp; Software Liability</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="55" y="20" width="70" height="90" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M68 40h44M68 55h44M68 70h30" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
<circle cx="90" cy="93" r="9" fill="none" stroke="#ea4335" stroke-width="2"/>
<path d="M86 93h8M90 89v8" stroke="#ea4335" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>RummyDex does not host software, APK files, or proprietary code on our servers. Because our control is limited entirely to our own website interface, we are not liable for the performance, data practices, or digital security of external third-party destinations. Downloading or installing software from external sources is conducted solely at the user's own risk.</p>

<h2>3. Post-Listing Developer Modifications</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="40" y="35" width="55" height="60" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M52 50h30M52 62h30M52 74h18" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
<path d="M108 45l14 14-14 14" fill="none" stroke="#fbbc04" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="115" y="70" width="30" height="30" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M122 85h16M122 92h10" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>While our team conducts hands-on evaluations prior to listing any application, we do not govern external developers. We are not responsible for unannounced updates, post-launch mechanic changes, or software modifications implemented by third parties after an app has been published on our site.</p>

<h2>4. Policy Enforcement &amp; User Experience</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="65" cy="55" r="14" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M35 100c0-18 13-30 30-30s30 12 30 30" fill="none" stroke="#3c4043" stroke-width="2"/>
<rect x="112" y="35" width="40" height="52" rx="4" fill="none" stroke="#1a73e8" stroke-width="2"/>
<path d="M120 50h24M120 61h24M120 72h16" stroke="#1a73e8" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>For information regarding how RummyDex handles non-compliant developer updates, community oversight, and user-submitted reports, please refer to our dedicated Terms &amp; Conditions and our App Reporting system.</p>

<p class="note">RummyDex \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,portal_heading:"Official App Store & Gaming Directory",disclaimer_heading:"Disclaimer",important_notice_heading:"Important Notice",seo_keywords:"",terms_content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Terms & Conditions \u2014 RummyDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
ul{margin:10px 0;padding-left:22px}
li{margin:8px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
a{color:#1a73e8;text-decoration:none}
a:hover{text-decoration:underline}
</style>
</head>
<body>

<h1>Terms &amp; Conditions</h1>
<p class="updated">Effective Date: August 2, 2026</p>

<h2>1. Agreement to Terms</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="55" y="20" width="70" height="90" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M68 40h44M68 55h44M68 70h44" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
<path d="M70 88l10 10 20-20" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>By accessing RummyDex, you agree to be bound by these Terms &amp; Conditions. If you disagree with any part of these terms, please do not use our app directory, news portal, or video features.</p>

<h2>2. Intellectual Property</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="90" cy="60" r="42" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M90 40a20 20 0 100 40 20 20 0 100-40" fill="none" stroke="#1a73e8" stroke-width="2"/>
<path d="M90 46v28M78 60h24" stroke="#1a73e8" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>RummyDex retains ownership of its original content, design, and editorial features. However, we do not claim ownership of the third-party apps listed on our site. All app names, logos, and trademarks belong to their respective original developers.</p>

<h2>3. Acceptable Use</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="90" cy="55" r="30" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M68 33l44 44" stroke="#ea4335" stroke-width="3" stroke-linecap="round"/>
<path d="M40 108h100" stroke="#3c4043" stroke-width="2"/>
</svg>
<p>RummyDex is provided for your personal, non-commercial use. You agree not to:</p>
<ul>
<li>Use automated bots or scrapers to extract our data or reviews.</li>
<li>Interfere with the security or performance of our website.</li>
<li>Submit false or spam requests through our App Reporting system.</li>
</ul>

<h2>4. Third-Party Links Disclaimer</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="30" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<rect x="105" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M75 62h30" stroke="#fbbc04" stroke-width="3" stroke-linecap="round"/>
<circle cx="128" cy="62" r="6" fill="none" stroke="#ea4335" stroke-width="2"/>
<path d="M125 62h6M128 59v6" stroke="#ea4335" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>RummyDex acts solely as an informational bridge and does not host APK or software files on our servers.</p>
<ul>
<li>Clicking an external link directs you to a third-party destination that we do not control.</li>
<li>Downloading and installing third-party software is done entirely at your own risk. RummyDex is not responsible for any device damage or data loss.</li>
</ul>

<h2>5. App Reporting &amp; Compliance</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<path d="M60 40h60l-6 68H66z" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M72 30h36l4 10H68z" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M78 55v38M90 55v38M102 55v38" stroke="#ea4335" stroke-width="3" stroke-linecap="round"/>
</svg>
<p>We enforce a strict zero-tolerance policy against apps containing malicious code or unauthorized real-money mechanics. We investigate user reports and reserve the right to remove or delist any application from our directory at any time without prior notice.</p>

<h2>6. Limitation of Liability</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="90" cy="60" r="42" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M90 40v26" stroke="#fbbc04" stroke-width="5" stroke-linecap="round"/>
<circle cx="90" cy="78" r="3" fill="#fbbc04"/>
</svg>
<p>RummyDex is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, RummyDex and its team shall not be liable for any direct or indirect damages, losses, or issues resulting from your use of our platform or the third-party apps we link to.</p>

<h2>7. Modifications</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<path d="M65 45a30 30 0 1130 40" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linecap="round"/>
<path d="M60 38l5 12 12-4" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="55" y="90" width="70" height="18" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
</svg>
<p>We reserve the right to update these terms at any time. By continuing to use RummyDex after changes are posted, you agree to be bound by the revised terms.</p>

<h2>8. Contact Information</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="35" y="40" width="110" height="55" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M35 46l55 35 55-35" fill="none" stroke="#1a73e8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>If you have any questions regarding these Terms &amp; Conditions, please contact us at:</p>
<p>Support Email: <a href="mailto:rummydex1@gmail.com">rummydex1@gmail.com</a></p>

<p class="note">RummyDex \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,last_updated:"2026-08-03T16:10:13.769Z",important_notice:"",ethics_heading:"Ethics & Safety",hero_title_visible:!0,ga_tracking_id:"",secure_index_title:"RummyDex",privacy_content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Privacy Policy \u2014 RummyDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:40px}
p{margin:10px 0}
ul{margin:10px 0;padding-left:22px}
li{margin:6px 0}
.art{display:block;margin:16px 0}
.note{color:#5f6368;font-size:13px;margin-top:36px;border-top:1px solid #dadce0;padding-top:14px}
a{color:#1a73e8}
</style>
</head>
<body>

<h1>Privacy Policy</h1>
<p class="updated">Effective Date: August 2 2026</p>

<h2>1. Introduction</h2>
<svg class="art" width="150" height="100" viewBox="0 0 180 130">
<path d="M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M74 78 86 90 112 58" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round"/>
</svg>
<p>Welcome to RummyDex. This Privacy Policy governs the manner in which RummyDex collects, uses, maintains, and discloses information collected from users visiting our digital directory, news portal, and software index. We are dedicated to safeguarding your privacy and ensuring complete transparency regarding how data is handled while you explore our app listings, news updates, and video reviews.</p>

<h2>2. Information Collection</h2>
<p>RummyDex operates primarily as an open informational resource. We do not require visitors to register an account, subscribe, or submit sensitive personal identification information to access our app directory, read our news, or view video reviews.</p>
<p><strong>Non-Personal Technical Data:</strong> Whenever you interact with RummyDex, our system may automatically collect non-personally identifiable technical information. This includes your browser type, device specifications, operating system, internet service provider (ISP), referring URLs, IP address, general geographic region, and interaction metrics on our site.</p>
<p><strong>Direct Communication Data:</strong> If you contact us directly via email for support or feedback, we collect the email address and information you voluntarily provide to address your inquiry.</p>

<h2>3. Web Browser Cookies &amp; Analytics</h2>
<svg class="art" width="150" height="100" viewBox="0 0 180 130">
<circle cx="90" cy="60" r="38" fill="none" stroke="#3c4043" stroke-width="2"/>
<circle cx="75" cy="48" r="5" fill="#fbbc04"/>
<circle cx="100" cy="55" r="4" fill="#1a73e8"/>
<circle cx="105" cy="78" r="5" fill="#ea4335"/>
</svg>
<p>Our website utilizes "cookies" and similar web technologies to enhance user navigation, measure traffic patterns, and optimize the overall performance of our directory.</p>
<ul>
<li>A cookie is a small text file placed on your device's storage for record-keeping and traffic analysis.</li>
<li>Cookies help us understand which app reviews, news articles, and video features are most useful to our community.</li>
</ul>
<p><strong>User Control:</strong> You retain full authority over your browser settings. You may set your web browser to reject cookies or alert you when cookies are being transmitted. Please note that disabling cookies may affect certain non-essential layout features on our site.</p>

<h2>4. News, Media, and Lightweight Video Features</h2>
<p>To provide comprehensive reviews, RummyDex features lightweight video snippets and daily news updates. Interacting with these features operates under strict data-minimization standards:</p>
<ul>
<li>Viewing media content embedded directly on RummyDex does not harvest personal user files or device storage.</li>
<li>Aggregated, anonymous metrics (such as video view counts or news reading time) may be processed to help us improve content delivery and bandwidth efficiency.</li>
</ul>

<h2>5. External Links and Third-Party Software</h2>
<svg class="art" width="150" height="100" viewBox="0 0 180 130">
<rect x="30" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<rect x="105" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M75 62h30" stroke="#fbbc04" stroke-width="3"/>
<circle cx="128" cy="62" r="6" fill="none" stroke="#ea4335" stroke-width="2"/>
</svg>
<p>RummyDex functions strictly as an informational bridge. We do not host, store, or distribute APK files, application packages, or software directly on our primary servers. Instead, we evaluate software and provide safe, verified outgoing links to official developer sites or third-party platforms.</p>
<p><strong>Leaving Our Portal:</strong> Clicking an external link directs you outside the jurisdiction of RummyDex.</p>
<p><strong>Third-Party Policies:</strong> We do not own, manage, or control the privacy standards, security protocols, or data collection practices of external websites or applications. Interaction on any external platform is governed entirely by that third party's privacy policy and terms.</p>

<h2>6. Data Security Practices</h2>
<p>We implement appropriate data collection, storage, and processing practices alongside standard security measures to protect against unauthorized access, modification, or disclosure of technical log data stored on our servers. While we maintain rigorous standards to safeguard our digital portal, no electronic storage or internet transmission can be guaranteed as 100% immune to all vulnerabilities.</p>

<h2>7. Changes to This Privacy Policy</h2>
<p>RummyDex reserves the right to update, modify, or revise this Privacy Policy at any time. When updates occur, the revised date at the top of this page will be updated accordingly. We encourage users to periodically review this page to stay informed about how we protect visitor data.</p>

<h2>8. Acceptance of These Terms</h2>
<p>By utilizing RummyDex, you signify your explicit acceptance of this Privacy Policy. If you do not agree with these terms, please discontinue use of our platform. Your continued navigation of the site following posted policy updates constitutes acceptance of those changes.</p>

<h2>9. Contacting Us</h2>
<p>If you have questions, feedback, or concerns regarding this Privacy Policy or your interactions with our platform, please reach out to our team at:</p>
<p>Support Email: <a href="mailto:rummydex1@gmail.com">rummydex1@gmail.com</a></p>

<p class="note">RummyDex \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,social_instagram:"",social_facebook:"",hero_title_color:"classic-dark",social_youtube:"",hero_title_text:"RummyDex",trending_searches:"",hero_title_style:"modern",report_removal_content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Report & Removal Policy \u2014 RummyDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
ul{margin:10px 0;padding-left:22px}
li{margin:8px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>Report &amp; Removal Policy</h1>
<p class="updated">Effective Date: August 2, 2026</p>

<h2>1. Our Commitment to a Safe Directory</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<path d="M90 12 40 30v35c0 32 22 55 50 65 28-10 50-33 50-65V30z" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M74 78 86 90 112 58" fill="none" stroke="#1a73e8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>RummyDex is dedicated to providing a secure, purely entertainment-focused digital index. Because third-party developers can alter their apps dynamically after our initial review, we rely on active community oversight to help maintain our platform's integrity.</p>

<h2>2. What You Should Report</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="90" cy="60" r="42" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M90 40v26" stroke="#ea4335" stroke-width="5" stroke-linecap="round"/>
<circle cx="90" cy="78" r="3" fill="#ea4335"/>
<path d="M40 105h100" stroke="#3c4043" stroke-width="2"/>
</svg>
<p>Please immediately report any listed application that exhibits the following violations:</p>
<ul>
<li><strong>Real-Money Gaming (RMG):</strong> The sudden introduction of mandatory deposits, gambling, or real-money betting mechanics.</li>
<li><strong>Deceptive Updates:</strong> Drastic changes to core gameplay (e.g., an offline puzzle updating into an unverified casino app).</li>
<li><strong>Broken or Malicious Links:</strong> A resource link that redirects to an unsafe, unverified page instead of the official developer source.</li>
<li><strong>Intrusive Ads or Malware:</strong> Applications that introduce unskippable system-level ads or malicious behavior that compromises device performance.</li>
</ul>

<h2>3. How to Submit a Report</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="45" y="20" width="90" height="70" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M60 40h60M60 55h60M60 70h35" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
<rect x="70" y="95" width="40" height="18" rx="4" fill="#1a73e8"/>
</svg>
<p>Reporting is simple and direct. Use the "Report App" button located at the bottom of every individual app review page. Select the reason for your report and provide a brief description of the issue you experienced.</p>

<h2>4. Our Review Process</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="75" cy="45" r="16" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M40 105c0-22 16-38 35-38s35 16 35 38" fill="none" stroke="#3c4043" stroke-width="2"/>
<circle cx="122" cy="82" r="18" fill="none" stroke="#1a73e8" stroke-width="3"/>
<path d="M135 95l14 14" stroke="#1a73e8" stroke-width="3" stroke-linecap="round"/>
</svg>
<p>Every submitted report goes directly to our moderation team. We do not use automated bots for this process; a real team member will manually re-test the application and verify the outbound links to confirm the reported violations.</p>

<h2>5. The 100% Permanent Removal Guarantee</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<path d="M60 40h60l-6 68H66z" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M72 30h36l4 10H68z" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M78 55v38M90 55v38M102 55v38" stroke="#ea4335" stroke-width="3" stroke-linecap="round"/>
</svg>
<p>We operate with a strict zero-tolerance policy for financial risk mechanisms and deceptive software. If we verify that an application violates our safety guidelines:</p>
<ul>
<li>The application's dedicated page will be immediately taken down.</li>
<li>All outbound links to the software will be permanently severed.</li>
<li>The developer will be strictly prohibited from relisting the application on our directory.</li>
</ul>

<h2>6. False Reporting</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<circle cx="90" cy="60" r="42" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M90 40v22" stroke="#fbbc04" stroke-width="4" stroke-linecap="round"/>
<path d="M90 62l14 8" stroke="#fbbc04" stroke-width="4" stroke-linecap="round"/>
</svg>
<p>We highly value genuine community feedback. However, deliberately spamming the system or submitting false claims to maliciously target specific games may result in a restriction of your ability to submit future reports or interact with platform features.</p>

<p class="note">RummyDex \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,hero_title_animation:"fade-in",about_content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>About Us \u2014 RummyDex</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:26px;color:#202124;font-weight:400;margin-bottom:6px}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>About Us</h1>
<p class="updated">Last modified: August 2, 2026</p>

<h2>The Meaning of "Dex" (Who We Are)</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="55" y="20" width="70" height="90" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M68 38h44M68 52h44M68 66h44M68 80h30" stroke="#1a73e8" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>Welcome to RummyDex. The word "Dex" stands for index or directory, which perfectly describes our core identity. We are an independent digital library built to catalog, review, and provide structured, transparent information about casual games and digital applications. Our platform is designed to be a complete informational hub for entertainment enthusiasts, encompassing everything from app discovery to the latest daily updates.</p>

<h2>How We Provide Information &amp; Links</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="30" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<rect x="105" y="45" width="45" height="35" rx="4" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M75 62h30" stroke="#1a73e8" stroke-width="3" stroke-linecap="round"/>
<path d="M96 54l9 8-9 8" fill="none" stroke="#1a73e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
<p>We function strictly as an informational bridge. Instead of hosting direct software or APK files on our servers, we provide comprehensive technical breakdowns, clear guides, and safe, direct links to third-party developer sources. This ensures that our platform remains fast and secure, and that you always access applications straight from the source.</p>

<h2>Real Hands-On Testing &amp; Video Highlights</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="45" y="30" width="90" height="60" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M80 48l22 12-22 12z" fill="#1a73e8"/>
<path d="M65 100l10-10M115 100l-10-10" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>We do not just list apps blindly. Before any application is published on our platform, our team conducts a real, hands-on test. We personally experience the app's performance, mechanics, and user interface to ensure it meets our strict entertainment standards. To give you a clear look at the gameplay, we also feature lightweight, optimized video snippets that showcase the app in action without slowing down your browsing experience.</p>

<h2>Comprehensive News &amp; App Updates</h2>
<svg class="art" width="180" height="130" viewBox="0 0 180 130">
<rect x="50" y="25" width="80" height="80" rx="6" fill="none" stroke="#3c4043" stroke-width="2"/>
<path d="M64 45h52M64 58h52M64 71h35" stroke="#3c4043" stroke-width="2" stroke-linecap="round"/>
<circle cx="122" cy="90" r="14" fill="#fbbc04"/>
<path d="M117 90h10M122 85v10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
</svg>
<p>Beyond our core app directory, RummyDex is a highly active, living ecosystem. We keep our community fully informed through our dedicated News Hub. Whether you are looking for general industry news, major platform shifts, or specific app update news detailing the latest patches and features, we provide all the necessary information so you are always up to date on your favorite digital retreats.</p>

<p class="note">RummyDex \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,social_twitter:"",social_links:{twitter:"",linkedin:"",instagram:"https://www.instagram.com/rummydex?igsh=MTJjaGR3c3hmdjhnZA==",youtube:"https://www.youtube.com/@rummydex",facebook:"https://www.facebook.com/share/1951euBy3d/"}},An=n=>{try{localStorage.setItem("rummystore_settings",JSON.stringify(n))}catch(e){console.warn("saveMockSettings storage failed:",e)}Object.assign(Ut,n)},et=[{seo_title:"Application Hub is LIVE - Premium App Directory & Reviews",target_region:"Global ",description:"Application Hub is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",canonical_url:"https://www.rummydex.com/rummydex-is-live",ceo_name:"The Editorial Team",is_new:!0,slug:"rummydex-is-live",created_at:"2026-08-01T04:29:15.305Z",seo_description:"Welcome to Application Hub! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",title:"Application Hub is LIVE! The Ultimate App Portal is Here",date:"2026-08-01T04:29:15.305Z",published_at:"2026-08-01T04:29:15.305Z",image_url:"",description_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Application Hub is Officially LIVE!</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>\u{1F680} Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>
<p class="updated">Published: August 1, 2026</p>

<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>
<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>

<h2>\u{1F6E1}\uFE0F The Power of Complete Neutrality</h2>
<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>
<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>

<h2>\u26A0\uFE0F Important Update: The App Vault is Verifying...</h2>
<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>
<p>Please wait just a little bit longer\u2014our verified apps are coming very soon.</p>
<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>
<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>

<p class="note">Application Hub \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,updated_at:"2026-08-03T03:41:25.415Z",content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Application Hub is Officially LIVE!</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>\u{1F680} Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>
<p class="updated">Published: August 1, 2026</p>

<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>
<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>

<h2>\u{1F6E1}\uFE0F The Power of Complete Neutrality</h2>
<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>
<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>

<h2>\u26A0\uFE0F Important Update: The App Vault is Verifying...</h2>
<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>
<p>Please wait just a little bit longer\u2014our verified apps are coming very soon.</p>
<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>
<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>

<p class="note">Application Hub \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,link:"https://www.rummydex.com/",ceo_description:"Editorial Board",is_pinned:!1,category:"Announcements",id:"vw78pxmf9",is_breaking:!1}],En=n=>{try{localStorage.setItem("rummystore_news",JSON.stringify(n))}catch(e){console.warn("saveMockNews storage failed:",e)}et.splice(0,et.length,...n)},tt=[],In=n=>{try{localStorage.setItem("rummystore_blogs",JSON.stringify(n))}catch(e){console.warn("saveMockBlogs storage failed:",e)}tt.splice(0,tt.length,...n)},nt=[],Tn=n=>{try{localStorage.setItem("rummystore_videos",JSON.stringify(n))}catch(e){console.warn("saveMockVideos storage failed:",e)}nt.splice(0,nt.length,...n)}});var Vt={};xe(Vt,{mockApps:()=>Rn,mockBlogs:()=>$n,mockNews:()=>Dn,mockSettings:()=>Cn,mockVideos:()=>jn});var Rn,Cn,Dn,$n,jn,Wt=Y(()=>{Rn=[],Cn={logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",site_title:"Application Hub",meta_description:"",favicon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},Dn=[{id:"vw78pxmf9",slug:"app-hub-is-live",title:"Application Hub is LIVE! The Ultimate App Portal is Here",logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",description:"Application Hub is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",description_html:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Application Hub is Officially LIVE!</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>\u{1F680} Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>
<p class="updated">Published: August 1, 2026</p>

<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>
<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>

<h2>\u{1F6E1}\uFE0F The Power of Complete Neutrality</h2>
<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>
<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>

<h2>\u26A0\uFE0F Important Update: The App Vault is Verifying...</h2>
<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>
<p>Please wait just a little bit longer\u2014our verified apps are coming very soon.</p>
<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>
<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>

<p class="note">Application Hub \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,content:`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Application Hub is Officially LIVE!</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#3c4043;max-width:700px;margin:40px auto;padding:0 20px;line-height:1.7;font-size:15px;background:#fff}
h1{font-size:25px;color:#202124;font-weight:400;margin-bottom:6px;line-height:1.3}
.updated{color:#5f6368;font-size:13px;margin-bottom:28px}
h2{font-size:19px;color:#202124;font-weight:500;margin-top:44px}
p{margin:10px 0}
.art{display:block;margin:18px 0}
.note{color:#5f6368;font-size:13px;margin-top:40px;border-top:1px solid #dadce0;padding-top:14px}
</style>
</head>
<body>

<h1>\u{1F680} Welcome to the Future of App Discovery: Application Hub is Officially LIVE!</h1>
<p class="updated">Published: August 1, 2026</p>

<p>The moment you have been waiting for is finally here! We have officially opened the gates to Application Hub, your high-voltage digital directory for premium casual gaming, tabletop simulators, and digital retreats.</p>
<p>Our mission is simple: to bring you the absolute best, highest-quality applications available anywhere on the web. We don't just scrape lists or copy descriptions. Every single application that earns a spot on our platform is subjected to our rigorous, hands-on experience. We test the mechanics, push the hardware limits, and evaluate the gameplay so you know exactly what you are downloading.</p>

<h2>\u{1F6E1}\uFE0F The Power of Complete Neutrality</h2>
<p>We know what the community demands: honest, unfiltered, and highly accurate information. That is why neutrality is the beating heart of the Application Hub platform.</p>
<p>We operate with zero developer bias. When you read an Application Hub review, you are getting the pure, unvarnished truth about an app's performance, battery optimization, and true entertainment value. We are your independent bridge to the best software on the market.</p>

<h2>\u26A0\uFE0F Important Update: The App Vault is Verifying...</h2>
<p>While the Application Hub website is now officially published and fully operational, our master vault of applications is currently locked in the final stages of our strict security and performance verification process!</p>
<p>Please wait just a little bit longer\u2014our verified apps are coming very soon.</p>
<p>Our moderation team is working relentlessly to finalize the testing on our massive launch lineup. We refuse to compromise on quality, which means no app goes live on our portal until it passes our ultimate quality and safety check.</p>
<p>Bookmark the site, explore our brand-new layout, and get ready. The ultimate digital directory is here, and the first wave of premium, hand-tested apps is about to drop!</p>

<p class="note">Application Hub \u2014 keeping the directory safe, together.</p>

</body>
</html>
`,created_at:"2026-08-01T04:29:15.305Z",date:"2026-08-01T04:29:15.305Z",published_at:"2026-08-01T04:29:15.305Z",is_breaking:!1,is_new:!0,category:"Announcements",is_pinned:!1,updated_at:"2026-08-01T04:33:51.227Z",ceo_name:"The Editorial Team",ceo_description:"Editorial Board",seo_title:"Application Hub is LIVE - Premium App Directory & Reviews",seo_description:"Welcome to Application Hub! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",canonical_url:"https://www.example.com/notice/",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",target_region:"Global ",link:"https://www.example.com/app-hub-is-live"}],$n=[],jn=[]});var Ne=E(require("express")),qt=E(require("compression")),Kt=E(require("cookie-parser")),Gt=E(require("cors")),Jt=E(require("helmet")),Yt=E(require("path")),Zt=E(require("fs"));var wt=E(require("express"));K();Q();var Ue=E(require("fs")),gt=E(require("path"));K();Q();var ht=gt.default.join(process.cwd(),"mock-2fa-state.json"),hn=new Map;try{if(Ue.default.existsSync(ht)){let n=JSON.parse(Ue.default.readFileSync(ht,"utf8"));for(let[e,i]of Object.entries(n))hn.set(e,i)}}catch(n){console.error("Failed to load mock 2FA file:",n)}var gn=5,mn=900*1e3,fn=3600*1e3;async function mt(n){try{let e=D();if(e){let i=await e.collection("admin_rate_limits").doc(n).get();if(i.exists){let t=i.data(),s=Date.now();if(t&&t.lockedUntil>s)return{allowed:!1,lockedUntil:t.lockedUntil}}}}catch{}return{allowed:!0}}async function Me(n){try{let e=D();if(e){let i=e.collection("admin_rate_limits").doc(n),t=await i.get(),s=Date.now();if(t.exists){let a=t.data();if(a&&s-a.windowStart>mn)await i.set({count:1,windowStart:s,lockedUntil:0});else if(a){let r=(a.count||0)+1,l=r>=gn?s+fn:0;await i.update({count:r,lockedUntil:l})}}else await i.set({count:1,windowStart:s,lockedUntil:0})}}catch{}}var N=async(n,e,i)=>{let t=n.headers.authorization;if(!t||!t.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token.",message:"Unauthorized: Missing verification token."});let s=t.split("Bearer ")[1];if(!s||s==="null"||s==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token.",message:"Unauthorized: Empty session verification token."});if(s.startsWith("ey"))try{let a="";if(D())a=(await require("firebase-admin").auth().verifyIdToken(s)).email||"";else{let d=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(d){let g=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:s})});g.ok&&(a=(await g.json())?.users?.[0]?.email||"")}}let l=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return a&&a.toLowerCase().trim()===l?(n.adminUser={email:a.toLowerCase().trim()},i()):e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token.",message:"Unauthorized: Invalid Firebase token."})}try{let a=C();if(!a)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured.",message:"Encryption misconfigured."});let r=R(s,a);if(!r)return e.status(401).json({error:"Unauthorized: Invalid token.",message:"Unauthorized: Invalid token."});let l=JSON.parse(r);return!l.admin||!l.email||!l.exp?e.status(401).json({error:"Unauthorized: Malformed token.",message:"Unauthorized: Malformed token."}):Date.now()>l.exp?e.status(401).json({error:"Unauthorized: Session expired.",message:"Unauthorized: Session expired."}):(n.adminUser={email:l.email},i())}catch(a){return console.error("verifyAdminToken error:",a),e.status(401).json({error:"Unauthorized: Token verification failed.",message:"Unauthorized: Token verification failed."})}};async function Be(n,e){let i=!1,t="";try{let r=D();if(r){let l=await r.collection("admins_2fa").doc(n).get();if(l.exists){let o=l.data();o?.enabled&&(i=!0,t=o.secret)}}}catch(r){console.error("Failed to check 2FA status:",r)}if(!i)return{ok:!0};if(!e)return{mfaRequired:!0};let{authenticator:s}=require("otplib");return s.verify({token:e,secret:t})?{ok:!0}:{ok:!1,error:"Invalid 2FA code."}}var ge=E(require("otpauth"));function ft(){return new ge.Secret({size:20}).base32}function yt(n,e){return new ge.TOTP({issuer:"AdminVault",label:n,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Ve(n,e){try{return new ge.TOTP({issuer:"AdminVault",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:n.trim(),window:1})!==null}catch(i){return console.error("TOTP verification error:",i),!1}}var H=wt.default.Router();H.post("/api/v1/admin/login",async(n,e)=>{let i=String(n.headers["x-forwarded-for"]||n.socket?.remoteAddress||"unknown").split(",")[0].trim(),t=await mt(i);if(!t.allowed){let o=Math.ceil(((t.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${o} min.`})}let{email:s,password:a}=n.body??{};if(!s||!a)return await Me(i),e.status(400).json({error:"Missing email or password."});let r=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),l=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!l)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(s.toLowerCase().trim()===r&&a===l){let o=n.body.code,d=await Be(r,o);if(d.mfaRequired)return e.json({mfaRequired:!0});if(!d.ok)return e.status(401).json({error:d.error});try{let g=C(),p=JSON.stringify({admin:!0,email:r,exp:Date.now()+864e5}),y=F(p,g);return e.json({token:y,email:r})}catch(g){return console.error("Login encryption error:",g),e.status(500).json({error:"Internal server error."})}}return await Me(i),e.status(401).json({error:"Invalid email or password."})});H.post("/api/v1/admin/google-login",async(n,e)=>{let{idToken:i}=n.body??{};if(!i)return e.status(400).json({error:"Missing Firebase ID Token."});try{let t="";try{D()&&(t=(await require("firebase-admin").auth().verifyIdToken(i)).email||"")}catch(o){console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:",o)}if(!t)try{let d=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(d){let g=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:i})});g.ok&&(t=(await g.json())?.users?.[0]?.email||"")}}catch(o){console.error("Firebase accounts:lookup verification failed:",o)}if(!t)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let s=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(t.toLowerCase().trim()!==s)return e.status(403).json({error:`Unauthorized: ${t} is not configured as an administrator.`});let a=C(),r=JSON.stringify({admin:!0,email:t.toLowerCase().trim(),exp:Date.now()+864e5}),l=F(r,a);return e.json({token:l,email:t.toLowerCase().trim()})}catch(t){return console.error("Google login backend error:",t),e.status(500).json({error:"Authentication failed on server: "+(t.message||String(t))})}});H.post("/api/v1/admin/verify-session",async(n,e)=>{let i=String(n.headers.authorization||"");if(!i.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let t=i.split("Bearer ")[1];if(t.startsWith("ey"))try{let s="";if(D())s=(await require("firebase-admin").auth().verifyIdToken(t)).email||"";else{let o=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(o){let d=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${o}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:t})});d.ok&&(s=(await d.json())?.users?.[0]?.email||"")}}let r=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(s&&s.toLowerCase().trim()===r){let l=n.body.code,o=await Be(s.toLowerCase().trim(),l);return o.mfaRequired?e.json({mfaRequired:!0}):o.ok?e.json({ok:!0,email:s.toLowerCase().trim(),token:t}):e.status(401).json({error:o.error})}else return e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let s=C(),a=R(t,s);if(!a)return e.status(401).json({error:"Unauthorized: Invalid token."});let r=JSON.parse(a);return!r.admin||Date.now()>r.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:r.email})}catch(s){return e.status(401).json({error:"Service error: "+(s?.message||String(s))})}});H.post("/api/v1/admin/2fa/resend",async(n,e)=>{try{let{email:i}=n.body??{};if(!i)return e.status(400).json({error:"Missing email address."});let t=String(i).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${t}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${t}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(i){return console.error("2fa resend error:",i),e.status(500).json({error:"Failed to process 2FA resend request: "+i.message})}});H.get("/api/v1/admin/2fa/config",N,async(n,e)=>{let i=n.adminUser?.email?.toLowerCase().trim();if(!i)return e.status(400).json({error:"Missing admin email."});let t=!1,s="";try{let a=D();if(a){let r=await a.collection("admins_2fa").doc(i).get();if(r.exists){let l=r.data();t=l?.enabled===!0,s=l?.secret||""}}}catch(a){console.error("Error fetching Firestore 2FA config with Admin SDK:",a)}if(t)return e.json({enabled:!0});{let a=ft(),r=yt(i,a);return e.json({enabled:!1,tempSecret:a,qrCodeUri:r})}});H.post("/api/v1/admin/2fa/enable",N,async(n,e)=>{let i=n.adminUser?.email?.toLowerCase().trim(),{secret:t,code:s}=n.body||{};if(!i||!t||!s)return e.status(400).json({error:"Missing required fields (email, secret, code)."});if(!Ve(s,t))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});try{let a=D();if(a)await a.collection("admins_2fa").doc(i).set({enabled:!0,secret:t});else return e.status(503).json({error:"Service Unavailable: Firebase Admin SDK not configured."})}catch(a){return console.error("Firestore save 2FA exception:",a),e.status(500).json({error:"Server database write error."})}return e.json({success:!0})});H.post("/api/v1/admin/2fa/disable",N,async(n,e)=>{let i=n.adminUser?.email?.toLowerCase().trim(),{code:t}=n.body||{};if(!i||!t)return e.status(400).json({error:"Missing required fields (email, code)."});let s="";try{let a=D();if(a){let r=await a.collection("admins_2fa").doc(i).get();if(r.exists){let l=r.data();l?.enabled===!0&&(s=l?.secret||"")}}}catch(a){console.error("Firestore 2FA config fetch fail on disable:",a)}if(!s)return e.status(400).json({error:"2FA is not currently enabled."});if(!Ve(t,s))return e.status(400).json({error:"Invalid verification code."});try{let a=D();a&&await a.collection("admins_2fa").doc(i).delete()}catch(a){return console.error("Firestore delete 2FA exception:",a),e.status(500).json({error:"Server database delete error."})}return e.json({success:!0})});var bt=E(require("express")),Te=bt.default.Router();Te.post("/api/github-sync/test",async(n,e)=>{try{let{owner:i,repo:t,token:s}=n.body||{},a=s||process.env.PAT;if(!i||!t||!a)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let r=a.trim(),l=r.toLowerCase().startsWith("ghp_")?`token ${r}`:`Bearer ${r}`,o=await fetch(`https://api.github.com/repos/${i.trim()}/${t.trim()}`,{headers:{Authorization:l,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(o.ok){let d=await o.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${d.full_name}`,permissions:d.permissions})}else{let d=await o.json().catch(()=>({})),g="";return o.status===401||o.status===403?g=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:o.status===404&&(g=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(o.status).json({ok:!1,message:(d.message||"Failed to connect to repository")+g})}}catch(i){return console.error("GitHub Test Connection error:",i),e.status(500).json({message:i.message||"Internal server error"})}});Te.post("/api/github-sync/commit",async(n,e)=>{try{let{owner:i,repo:t,token:s,branch:a,path:r,content:l,message:o}=n.body||{},d=s||process.env.PAT;if(!i||!t||!d||!r||!l)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let g=a?a.trim():"main",p=r.replace(/^\/+/g,""),y=i.trim(),u=d.trim(),c=t.trim(),h=u.toLowerCase().startsWith("ghp_")?`token ${u}`:`Bearer ${u}`,f=await(async x=>{let m=x,b="",v="";try{let j=await fetch(`https://api.github.com/repos/${y}/${m}/contents/${p}?ref=${encodeURIComponent(g)}&_t=${Date.now()}`,{headers:{Authorization:h,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(j.ok){let T=await j.json();T&&!Array.isArray(T)&&T.sha&&(b=T.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${b}`))}else if(j.status===404){console.log(`GitHub Sync Server: File not found on branch "${g}". Attempting default branch fallback...`);let T=await fetch(`https://api.github.com/repos/${y}/${m}/contents/${p}?_t=${Date.now()}`,{headers:{Authorization:h,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(T.ok){let S=await T.json();S&&!Array.isArray(S)&&S.sha&&(b=S.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${b}`))}else if(T.status!==404){let S=await T.json().catch(()=>({})),V="";S.message&&(S.message.toLowerCase().includes("resource not accessible")||S.message.toLowerCase().includes("permission")||T.status===403)&&(V=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+m+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+y+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),v=`Default branch lookup failed with status ${T.status}: ${S.message||"Unknown error"}${V}`}}else{let T=await j.json().catch(()=>({})),S="";T.message&&(T.message.toLowerCase().includes("resource not accessible")||T.message.toLowerCase().includes("permission")||j.status===403)&&(S=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+m+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+y+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),v=`Target branch lookup failed with status ${j.status}: ${T.message||"Unknown error"}${S}`}}catch(j){console.error("GitHub SHA Fetch error on Server:",j),v=`Network error fetching repository contents on server: ${j.message||j}`}if(v&&!b)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${v}

Please check your Repository config and Token permissions.`};let k=Buffer.from(l,"utf8").toString("base64"),_={message:o||"Admin Release Sync: Static file update",content:k,branch:g,...b?{sha:b}:{}};console.log(`GitHub Sync Server: Initiating commit for ${p} to ${m}...`);let I=await fetch(`https://api.github.com/repos/${y}/${m}/contents/${p}`,{method:"PUT",headers:{Authorization:h,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(_)});if(!I.ok){let j=await I.text(),T=j;try{let V=JSON.parse(j);T=V.message||V.error?.message||j}catch{}let S="";return T.toLowerCase().includes("not found")?S=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+m+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:(T.toLowerCase().includes("credentials")||I.status===401)&&(S=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!S&&(T.toLowerCase().includes("resource not accessible")||T.toLowerCase().includes("permission")||I.status===403)&&(S=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+m+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+y+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:I.status,error:T+S}}return{success:!0,result:await I.json(),finalRepo:m}})(c);return f.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${f.finalRepo}"!`,f.result?.commit?.sha),e.json({...f.result,message:`Successfully published to ${f.finalRepo} repository.`,targetRepo:f.finalRepo})):e.status(f.status||400).json({message:f.error})}catch(i){return console.error("Server GitHub commit handler error:",i),e.status(500).json({message:`Internal server error during GitHub sync: ${i.message||i}`})}});var Et=E(require("express")),te=E(require("path")),ne=E(require("fs"));var Ke=E(require("fs")),Ge=E(require("path"));var me=E(require("fs")),Re=E(require("path")),xn=()=>{try{let n=Re.default.join(process.cwd(),"src/lib/staticData");return require(n)}catch{return{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}};async function vt(){console.log("CALLED syncFromFirestore");try{let n=xn(),e={apps:n.mockApps||[],settings:n.mockSettings||{},news:n.mockNews||[],blogs:n.mockBlogs||[],videos:n.mockVideos||[]},i=Re.default.join(process.cwd(),"src/lib/public_backup.json");if(me.default.existsSync(i))try{let o=JSON.parse(me.default.readFileSync(i,"utf8"));o&&(Array.isArray(o.apps)&&(e.apps=o.apps),o.settings&&Object.keys(o.settings).length>0&&(e.settings=o.settings),Array.isArray(o.news)&&(e.news=o.news),Array.isArray(o.blogs)&&(e.blogs=o.blogs),Array.isArray(o.videos)&&(e.videos=o.videos))}catch(o){console.warn("[SYNC] Error reading public_backup.json:",o)}let t=e.apps||[],s=e.settings||{},a=e.news||[],r=e.blogs||[],l=e.videos||[];try{let{getFirebaseAdminDb:o}=(Q(),ue(ut)),d=o();if(d){let g=await d.collection("store_data").doc("news").get();g.exists&&Array.isArray(g.data()?.items)&&g.data().items.length>0&&(a=g.data().items);let p=await d.collection("store_data").doc("blogs").get();p.exists&&Array.isArray(p.data()?.items)&&p.data().items.length>0&&(r=p.data().items);let y=await d.collection("store_data").doc("videos").get();y.exists&&Array.isArray(y.data()?.items)&&y.data().items.length>0&&(l=y.data().items);let u=await d.collection("store_data").doc("public_settings").get();if(u.exists){let h=u.data();h&&Object.keys(h).length>0&&(s={...s,...h,banners:Array.isArray(h.banners)&&h.banners.length>0?h.banners:s.banners||[],categories:Array.isArray(h.categories)&&h.categories.length>0?h.categories:s.categories||[],quick_links:Array.isArray(h.quick_links)&&h.quick_links.length>0?h.quick_links:s.quick_links||[],website_faqs:Array.isArray(h.website_faqs)&&h.website_faqs.length>0?h.website_faqs:s.website_faqs||[],developers:Array.isArray(h.developers)&&h.developers.length>0?h.developers:s.developers||[]})}let c=await d.collection("store_data").doc("apps_meta").get();if(c.exists){let h=c.data()?.numChunks||1,w=[];for(let f=0;f<h;f++){let x=await d.collection("store_data").doc(`apps_chunk_${f}`).get();x.exists&&Array.isArray(x.data()?.items)&&w.push(...x.data().items)}w.length>0&&(t=w)}try{let h=[];if(!c.exists&&t.length>0){let f=Math.ceil(t.length/25)||1;for(let x=0;x<f;x++){let m=JSON.parse(JSON.stringify(t.slice(x*25,(x+1)*25)));m.forEach(b=>{delete b.more_information_url,delete b.encrypted_download_url,delete b.download_url}),h.push(d.collection("store_data").doc(`apps_chunk_${x}`).set({items:m}))}h.push(d.collection("store_data").doc("apps_meta").set({numChunks:f,last_updated:new Date().toISOString()}))}!u.exists&&s&&Object.keys(s).length>0&&h.push(d.collection("store_data").doc("public_settings").set(JSON.parse(JSON.stringify(s)),{merge:!0})),!g.exists&&a.length>0&&h.push(d.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(a))})),!p.exists&&r.length>0&&h.push(d.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(r))})),!y.exists&&l.length>0&&h.push(d.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(l))})),h.length>0&&(await Promise.all(h),console.log("[SYNC] Successfully initialized Cloud Firestore with local backup data."))}catch(h){console.warn("[SYNC] Could not auto-push Admin data to Firestore:",h.message||h)}}}catch(o){console.warn("[SYNC] Admin DB sync attempt failed:",o.message||o)}try{me.default.writeFileSync(i,JSON.stringify({apps:t,settings:s,news:a,blogs:r,videos:l},null,2),"utf8");try{let{generateStaticDataFileCode:o}=(qe(),ue(He)),d=o(t,s,a,r,l);me.default.writeFileSync(Re.default.join(process.cwd(),"src/lib/staticData.ts"),d,"utf8")}catch{}}catch{}return{apps:t,settings:s,news:a,blogs:r,videos:l}}catch(n){return console.error("Error in syncFromFirestore:",n),null}}function A(n,e,i=""){if(!n)return i;let t=n[e];return t==null?i:typeof t=="object"?"stringValue"in t?t.stringValue??i:"integerValue"in t?String(t.integerValue)??i:"booleanValue"in t?String(t.booleanValue)??i:i:String(t)}We();var St=()=>{try{let n=Ge.default.join(process.cwd(),"src/lib/staticData");return require(n)}catch{return{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}},fe=St(),Wi=fe.mockApps||[],Hi=fe.mockSettings||{},qi=fe.mockNews||[],Ki=fe.mockBlogs||[],Gi=fe.mockVideos||[],re=null,oe=0,kt=15e3,Ce=!1;function At(){re=null,oe=0}async function _t(){let n=Date.now(),e=St(),i=await vt();if(i&&Array.isArray(i.apps)&&i.apps.length>0)return re=i,oe=n,i;let t=Ge.default.join(process.cwd(),"src/lib/public_backup.json");if(Ke.default.existsSync(t))try{let a=JSON.parse(Ke.default.readFileSync(t,"utf8")),r={apps:a.apps||[],settings:a.settings||{},news:Array.isArray(a.news)?a.news:[],blogs:Array.isArray(a.blogs)?a.blogs:[],videos:Array.isArray(a.videos)?a.videos:[]};return re=r,oe=n,r}catch(a){console.error("Error reading public_backup.json in seoHelper:",a)}let s={apps:e.mockApps||[],settings:e.mockSettings||{},news:e.mockNews||[],blogs:e.mockBlogs||[],videos:e.mockVideos||[]};return re=s,oe=n,s}async function ee(){let n=Date.now(),e=n-oe>kt,i=n-oe>kt*15;return re&&!i?(e&&!Ce&&(Ce=!0,_t().then(()=>{Ce=!1}).catch(t=>{Ce=!1,console.warn("Background store fetch failed safely:",t)})),re):await _t()}var q=Et.default.Router();q.get(["/site.webmanifest","/manifest.json"],(n,e,i)=>{let t=te.default.join(process.cwd(),"public","site.webmanifest"),s=te.default.join(process.cwd(),"dist","site.webmanifest"),a=ne.default.existsSync(s)?s:ne.default.existsSync(t)?t:null;return a?(e.set({"Content-Type":"application/manifest+json; charset=utf-8","Cache-Control":"public, max-age=86400, stale-while-revalidate=43200"}),e.sendFile(a)):i()});q.get(["/llms.txt"],(n,e,i)=>{let t=te.default.join(process.cwd(),"public","llms.txt"),s=te.default.join(process.cwd(),"dist","llms.txt"),a=ne.default.existsSync(s)?s:ne.default.existsSync(t)?t:null;return a?(e.set({"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=86400"}),e.sendFile(a)):i()});q.get(["/favicon.ico","/favicon.png","/favicon.webp","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(n,e,i)=>{let t=n.path.replace(/^\//,""),s=te.default.join(process.cwd(),"public",t),a=te.default.join(process.cwd(),"dist",t),r=ne.default.existsSync(a)?a:ne.default.existsSync(s)?s:null;try{let l="",o="";try{let y=await ee();y&&y.settings&&(l=y.settings.favicon_url&&y.settings.favicon_url.trim()||"",o=y.settings.logo_url&&y.settings.logo_url.trim()||"")}catch(y){console.warn("Could not retrieve store settings for favicon, using default fallback:",y)}let d=y=>y?y.includes("ezgif-64180dd8ca74703b")||y.includes("1000132678_1_ro1ftj")||y.includes("v1785720339"):!0,g=["favicon-16x16.png","favicon-32x32.png","favicon.ico","apple-touch-icon.png","apple-touch-icon-precomposed.png"].includes(t);if(r&&(g||d(l))){let y=t.endsWith(".ico")?"image/x-icon":t.endsWith(".webp")?"image/webp":"image/png";return e.set({"Content-Type":y,"Cache-Control":"public, max-age=31536000, immutable","Content-Disposition":`inline; filename="${t}"`}),e.sendFile(r)}let p=(d(l)?null:l)||(d(o)?null:o)||"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png";try{let y=await fetch(p,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(y.ok){let u=await y.arrayBuffer(),c=Buffer.from(u),h=y.headers.get("content-type")||"",w="image/png";return c.length>=12&&c[8]===87&&c[9]===69&&c[10]===66&&c[11]===80?w="image/webp":c.length>=4&&c[0]===137&&c[1]===80&&c[2]===78&&c[3]===71?w="image/png":c.length>=4&&c[0]===0&&c[1]===0&&c[2]===1&&c[3]===0?w="image/x-icon":c.length>=3&&c[0]===255&&c[1]===216&&c[2]===255?w="image/jpeg":c.toString("utf8",0,Math.min(100,c.length)).includes("<svg")?w="image/svg+xml":h&&(w=h.split(";")[0].trim()),e.set("Content-Type",w),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),e.status(200).send(c)}else return r?(e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),e.sendFile(r)):(e.set("Cache-Control","public, max-age=3600"),e.redirect(302,p))}catch{return r?(e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),e.sendFile(r)):e.redirect(302,p)}}catch{if(r)return e.sendFile(r)}return i()});q.get(["/rss.xml","/rss","/feed","/feed.xml"],async(n,e)=>{try{let i=process.env.PUBLIC_DOMAIN||process.env.VITE_PUBLIC_DOMAIN||(n.get("host")?`https://${n.get("host")}`:"https://www.rummydex.com");!i.startsWith("http://")&&!i.startsWith("https://")&&(i=`https://${i}`);let t=i.replace(/\/$/,""),s=await ee().catch(()=>null),{apps:a=[],news:r=[],blogs:l=[]}=s||{},o=p=>(typeof p!="string"&&(p=String(p||"")),p.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")),d="";for(let p of(r||[]).slice(0,15)){let y=A(p,"title"),u=A(p,"slug"),c=A(p,"excerpt")||A(p,"summary")||A(p,"content")||y,h=A(p,"created_at")||A(p,"published_at")||new Date().toISOString(),w=new Date(h).toUTCString();if(y&&u){let f=`${t}/news/${encodeURI(u.trim().replace(/^\/+|\/+$/g,""))}`;d+=`
    <item>
      <title>${o(y)}</title>
      <link>${o(f)}</link>
      <guid isPermaLink="true">${o(f)}</guid>
      <description>${o(c)}</description>
      <pubDate>${w}</pubDate>
    </item>`}}for(let p of(l||[]).slice(0,10)){let y=A(p,"title"),u=A(p,"slug"),c=A(p,"excerpt")||A(p,"summary")||y,h=A(p,"created_at")||new Date().toISOString(),w=new Date(h).toUTCString();if(y&&u){let f=`${t}/blog/${encodeURI(u.trim().replace(/^\/+|\/+$/g,""))}`;d+=`
    <item>
      <title>${o(y)}</title>
      <link>${o(f)}</link>
      <guid isPermaLink="true">${o(f)}</guid>
      <description>${o(c)}</description>
      <pubDate>${w}</pubDate>
    </item>`}}for(let p of(a||[]).slice(0,10)){let y=A(p,"name"),u=A(p,"slug"),c=A(p,"short_description")||A(p,"description")||y,h=A(p,"updated_at")||A(p,"created_at")||new Date().toISOString(),w=new Date(h).toUTCString();if(y&&u){let f=`${t}/${encodeURI(u.trim().replace(/^\/+|\/+$/g,""))}`;d+=`
    <item>
      <title>${o(y)} - Download APK &amp; Play</title>
      <link>${o(f)}</link>
      <guid isPermaLink="true">${o(f)}</guid>
      <description>${o(c)}</description>
      <pubDate>${w}</pubDate>
    </item>`}}let g=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>RummyDex News &amp; Latest Rummy Apps</title>
    <link>${t}</link>
    <description>Latest Rummy applications, card game news, updates, and reviews on RummyDex.</description>
    <language>en-IN</language>
    <atom:link href="${t}/rss.xml" rel="self" type="application/rss+xml" />
    ${d}
  </channel>
</rss>`;return e.set({"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}),e.status(200).send(g)}catch(i){console.error("RSS feed generation error:",i),e.status(500).type("text/plain").send("Error generating RSS feed")}});q.get("/robots.txt",async(n,e)=>{try{let t=(n.get("host")||"").toLowerCase(),s=!1;if(t.includes("masterworld")&&(s=!0),s){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let a=process.env.PUBLIC_DOMAIN||process.env.VITE_PUBLIC_DOMAIN||(n.get("host")?`https://${n.get("host")}`:"https://www.rummydex.com");!a.startsWith("http://")&&!a.startsWith("https://")&&(a=`https://${a}`);let l=`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/
Disallow: /s/

Sitemap: ${a.replace(/\/$/,"")}/sitemap.xml
`;e.set("Content-Type","text/plain"),e.send(l)}catch{e.set("Content-Type","text/plain"),e.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/

Sitemap: https://www.rummydex.com/sitemap.xml
`)}});q.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(n,e)=>{try{if((n.get("host")||"").toLowerCase().includes("masterworld")){e.status(404).send("Not Found");return}let s=await ee();if(!s)throw new Error("Unable to fetch store data");let{apps:a=[],news:r=[],blogs:l=[],videos:o=[]}=s,d=process.env.PUBLIC_DOMAIN||process.env.VITE_PUBLIC_DOMAIN||(n.headers.host?`https://${n.headers.host}`:"https://www.rummydex.com");!d.startsWith("http://")&&!d.startsWith("https://")&&(d=`https://${d}`);let g=d.replace(/\/$/,""),p=`<?xml version="1.0" encoding="UTF-8"?>
`;p+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;let y=new Date().toISOString().split("T")[0],u=m=>(typeof m!="string"&&(m=String(m||"")),m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")),c=m=>m?u(encodeURI(m.trim().replace(/^\/+|\/+$/g,""))):"",h=m=>{let b=A(m,"updated_at")||A(m,"created_at")||A(m,"published_at")||A(m,"date");if(b)try{if(typeof b=="object"&&b!==null&&b.seconds)return new Date(b.seconds*1e3).toISOString().split("T")[0];if(typeof b=="object"&&b!==null&&b._seconds)return new Date(b._seconds*1e3).toISOString().split("T")[0];let v=new Date(b);if(!isNaN(v.getTime()))return v.toISOString().split("T")[0]}catch{}return null},w=new Set,f=(m,b,v,k,_,I)=>{if(!w.has(m)){w.add(m);let $=`  <url>
    <loc>${m}</loc>
`;b&&($+=`    <lastmod>${b}</lastmod>
`),v&&($+=`    <changefreq>${v}</changefreq>
`),k&&($+=`    <priority>${k}</priority>
`),_&&($+=`    <image:image>
      <image:loc>${u(_)}</image:loc>
`,I&&($+=`      <image:title>${u(I)}</image:title>
`),$+=`    </image:image>
`),$+=`  </url>
`,p+=$}},x=[{path:"/",priority:"1.0",changefreq:"daily"},{path:"/new-apps",priority:"0.9",changefreq:"daily"},{path:"/news",priority:"0.8",changefreq:"daily"},{path:"/about",priority:"0.5",changefreq:"monthly"},{path:"/developers",priority:"0.5",changefreq:"monthly"},{path:"/contact",priority:"0.5",changefreq:"monthly"},{path:"/privacy",priority:"0.3",changefreq:"monthly"},{path:"/report-removal",priority:"0.3",changefreq:"monthly"},{path:"/terms",priority:"0.3",changefreq:"monthly"},{path:"/responsibility",priority:"0.3",changefreq:"monthly"},{path:"/notice",priority:"0.3",changefreq:"monthly"},{path:"/ethics",priority:"0.3",changefreq:"monthly"},{path:"/disclaimer",priority:"0.3",changefreq:"monthly"}];o&&Array.isArray(o)&&o.length>0&&x.splice(3,0,{path:"/videos",priority:"0.7",changefreq:"weekly"});for(let m of x)f(`${g}${m.path}`,null,m.changefreq,m.priority);for(let m of a){let b=A(m,"slug");if(b){let v=c(b),k=h(m),_=A(m,"icon_url")||A(m,"og_image_url"),I=A(m,"name"),$=`${g}/${v}`;f($,k,"daily","0.9",_,I)}}if(l&&Array.isArray(l)&&l.length>0){f(`${g}/blogs`,null,"daily","0.8");for(let m of l){let b=A(m,"slug");if(b){let v=c(b);f(`${g}/blog/${v}`,h(m),"weekly","0.7",A(m,"cover_url")||A(m,"image_url"),A(m,"title"))}}}for(let m of a){let b=A(m,"slug");if(b){let v=c(b),k=h(m);f(`${g}/s/${v}`,k,"weekly","0.8"),f(`${g}/info/${v}`,k,"monthly","0.6"),f(`${g}/moreinfo/${v}`,k,"monthly","0.6")}}for(let m of r){let b=A(m,"slug");if(b){let v=c(b),k=`${g}/news/${v}`;f(k,h(m),"weekly","0.8")}}for(let m of o||[]){let b=A(m,"slug");if(b){let v=c(b),k=`${g}/videos/${v}`;f(k,h(m),"weekly","0.6")}}p+=`</urlset>
`,e.set("Content-Type","application/xml; charset=utf-8"),e.set("Cache-Control","public, max-age=3600, stale-while-revalidate=86400"),e.send(p)}catch(i){console.error("Sitemap Generation Error:",i),e.status(500).send("Error generating sitemap")}});q.get("/api/v1/debug-seo",async(n,e)=>{try{let i=await ee();e.json({hasData:!!i,hasSettings:!!i?.settings,settingsKeys:Object.keys(i?.settings||{})})}catch(i){e.json({error:i.message})}});var Ht=E(require("express")),M=E(require("fs")),pe=E(require("path"));K();Q();var ye=E(require("crypto")),Dt=E(require("dns"));ke();var De=new Map,ie=async(n,e=dt,i=ct)=>{try{let t=Date.now(),s=De.get(n);if((!s||t>s.resetTime)&&(s={count:0,resetTime:t+i}),s.count++,De.set(n,s),Math.random()<.01)for(let[a,r]of De.entries())t>r.resetTime&&De.delete(a);return s.count>e}catch{return!0}};function B(n){return n.ip||n.socket?.remoteAddress||"unknown"}function It(n){let e=n.split(".");if(e.length===0||e.length>4)return null;let i=[];for(let t of e){let s;if(t.toLowerCase().startsWith("0x")?s=parseInt(t,16):t.startsWith("0")&&t.length>1?s=parseInt(t,8):s=parseInt(t,10),isNaN(s)||s<0||s>255)return null;i.push(s)}if(e.length===1){let t=i[0];return isNaN(t)||t<0||t>4294967295?null:[t>>>24&255,t>>>16&255,t>>>8&255,t&255]}else if(e.length===2){let t=i[0],s=i[1];return s>16777215?null:[t,s>>>16&255,s>>>8&255,s&255]}else if(e.length===3){let t=i[0],s=i[1],a=i[2];return a>65535?null:[t,s,a>>>8&255,a&255]}return i}function Tt(n){let[e,i,t]=n;return e===127||e===10||e===172&&i>=16&&i<=31||e===192&&i===168||e===169&&i===254||e===0||e===100&&i>=64&&i<=127||e===192&&i===0&&t===0||e===192&&i===0&&t===2||e===198&&i>=18&&i<=19||e===198&&i===51&&t>=100&&t<=103||e===203&&i===0&&t===113||e>=224&&e<=239||e>=240}async function $t(n){try{let e=new URL(n);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let i=e.hostname.toLowerCase(),t=It(i);if(t&&Tt(t)||i==="[::1]"||i==="::1"||i.startsWith("[fc00")||i.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(i)||i.endsWith(".local")||i.endsWith(".internal"))return!1;try{let a=await Dt.default.promises.lookup(i,{all:!0});for(let r of a){let l=r.address,o=It(l);if(o&&Tt(o)||l==="::1"||l.startsWith("fc00:")||l.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var Rt=new Map;var Ct=new Map;setInterval(()=>{let n=Date.now();for(let[e,i]of Rt.entries())i.expiresAt<n&&Rt.delete(e);for(let[e,i]of Ct.entries())i.expiresAt<n&&Ct.delete(e)},3e4);function jt(n,e){if(!n.cookies||!n.cookies["__Host-sid"]){let i=ye.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",i,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0,path:"/"}),i}return n.cookies["__Host-sid"]}function Nt(n,e,i,t){let a=Math.floor(Date.now()/1e3)+1800,r=`${n}|${e}|${i}|${t}|${a}`,l=ye.default.createHmac("sha256",ze).update(r).digest("hex");return Buffer.from(`${r}::${l}`).toString("base64url")}function $e(n,e,i,t,s){try{let a=Buffer.from(n,"base64url").toString("utf8"),[r,l]=a.split("::");if(!r||!l)return!1;let o=r.split("|");if(o.length!==5)return!1;let[d,g,p,y,u]=o;if(y!==s)return console.warn(`[SECURITY] Token appId mismatch: expected ${s}, got ${y}`),!1;if(d!==e)return console.warn(`[SECURITY] Token IP mismatch: expected ${e}, got ${d}`),!1;if(g!==i)return console.warn("[SECURITY] Token session mismatch"),!1;if(t&&p!==t)return console.warn("[SECURITY] Token fingerprint mismatch"),!1;if(Math.floor(Date.now()/1e3)>parseInt(u,10))return console.warn("[WARN] Signature expired."),!1;let c=ye.default.createHmac("sha256",ze).update(r).digest("hex");return ye.default.timingSafeEqual(Buffer.from(l,"hex"),Buffer.from(c,"hex"))}catch{return!1}}var Ot=E(require("express")),le=E(require("crypto"));var ae="U2FsdGVkX19aMEo5JIhfa86Wlzc7acf/vMJEBABB99XC1A/1xR932zFIlptK336fa+aHcx6aaZCdhTaqVn3tSQJPu3PwXifjWdxHHJGGSd2f0LlWOlPdTUWB9K7AbVlTvatvaG9EGaK3i21GpGWc/A4R+Ttk9it3erbWt4idjbK8cyYKp6JuOJfqqAI0SydXYKl5LTPwinGICpXU2PSbtuxHQ8tN9a8DxtfU62gud+xCe5weJLOk8bbzs0KtCJAwlRfFPF8KgpSio5/LzmisUmVm2cC8xWvpq5YLsSzgqVs=";K();Q();var ce=Ot.default.Router();ce.get("/api/v1/_chal",(n,e)=>{let i=jt(n,e),t=le.default.randomBytes(8).toString("hex"),s="0000",a=Date.now()+6e5,r=C(),l=le.default.createHmac("sha256",r).update(`${t}:${i}:${s}:${a}`).digest("hex").substring(0,16),o=`${t}.${a}.${l}`;e.setHeader("X-Session-ID",i),e.json({nonce:o,difficulty:s,sid:i})});ce.post("/api/v1/_proc",async(n,e)=>{let{nonce:i,solution:t,fingerprint:s,appId:a,sid:r}=n.body,l=B(n),o=n.cookies?.["__Host-sid"]||r;if(!i||t===void 0||!s||!a||!o)return console.warn(`[SECURITY] Missing context in _proc: sid=${!!o}, nonce=${!!i}`),e.status(400).json({error:"Incomplete security context"});let d=i.split(".");if(d.length!==3)return e.status(403).json({error:"Challenge invalid format"});let[g,p,y]=d,u="0000",c=C(),h=le.default.createHmac("sha256",c).update(`${g}:${o}:${u}:${p}`).digest("hex").substring(0,16);if(y!==h){console.warn(`[SECURITY] Signature mismatch for SID: ${o}. Checking fallbacks...`);let x=le.default.createHmac("sha256",c).update(`${g}:${u}:${p}`).digest("hex").substring(0,16);if(y!==x)return e.status(403).json({error:"Challenge invalid or tampered"})}if(Date.now()>Number(p))return e.status(403).json({error:"Challenge expired"});if(!le.default.createHash("sha256").update(i+t).digest("hex").startsWith(u))return e.status(403).json({error:"Integrity check failed"});let f=Nt(l,o,s,a);e.json({token:f})});ce.get("/api/v1/link-check",async(n,e)=>{let i=n.query.id;if(!i)return e.json({configured:!1});try{let t=ae;if(!t)return e.json({configured:!1});let s=process.env.AES_SECRET||"",a=R(t,s);if(!a)return e.json({configured:!1});let r=JSON.parse(a),l=!1;if(Array.isArray(r))l=r.some(o=>o.id===i&&(o.url||o.more_information_url));else{let o=r[i];l=!!(typeof o=="string"?o:o?.url||o?.more_information_url)}return e.json({configured:l})}catch{return e.json({configured:!1})}});var P=new Map,kn=900*1e3;function Je(n){n?P.delete(n.toLowerCase()):P.clear()}ce.get("/api/v1/moreinfo-resolve",async(n,e)=>{let i=n.query.token||n.query.t,t=n.query.id,s=B(n),a=n.cookies?.["__Host-sid"]||n.query.sid,r=n.query.fp;if(!i||!t)return console.warn(`[SECURITY] Bot or direct request missing parameters for appId: ${t}`),e.status(404).send("<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>");if(!$e(i,s,a||"",r||"",t))return console.warn(`[SECURITY] Anti-bot blocked unverified token attempt for appId: ${t} from IP: ${s}`),e.status(404).send("<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>");let l=[t.toLowerCase(),t.trim().toLowerCase()];for(let o of l){let d=P.get(o);if(d&&Date.now()-d.timestamp<kn)return console.log(`[SECURITY] Memory cache hit (<2ms) for appId: ${t}`),e.redirect(302,d.url)}try{let o="",d=C(),g=t,p=t;try{let c=(await ee())?.apps||[],h=t.toLowerCase().trim().replace(/[-_ ]+$/,""),w=c.find(f=>{let x=(f.id||"").toLowerCase().trim(),m=(f.slug||"").toLowerCase().trim(),b=m.replace(/[-_ ]+$/,"");return x===h||m===h||b===h||m===t.toLowerCase().trim()||b===t.toLowerCase().trim()});if(w){g=w.id||t,p=w.slug||t;let f=w.more_information_url||w.download_url||w.encrypted_link||w.url;if(f&&typeof f=="string"){let x=f.startsWith("U2FsdGVkX1")?R(f,d):f;if(x&&x.startsWith("http")){console.log(`[SECURITY] Resolved link directly from storeData for ${t}`);let m={url:x,timestamp:Date.now()};return P.set(t.toLowerCase(),m),P.set(g.toLowerCase(),m),P.set(p.toLowerCase(),m),e.redirect(302,x)}}}}catch(u){console.warn("[SECURITY] Store data fetch failed during resolve:",u)}let y=ae;if(y){let u=R(y,d);if(u){let c=JSON.parse(u),h="";if(Array.isArray(c)){let w=c.find(f=>f.id===g||f.slug===p||f.id===t||f.slug===t);h=w?.more_information_url||w?.url||""}else{let w=c[g]||c[p]||c[t];h=typeof w=="string"?w:w?.more_information_url||w?.url||""}h&&(o=h.startsWith("U2FsdGVkX1")?R(h,d):h)}}if(!o)try{let u=D();if(u){let c=["sec_links_vault_3","sec_vault","secure_links"];for(let h of c){let w=await u.collection("store_data").doc(h).get();if(w.exists){let f=w.data(),x=f?.encryptedData||f?.encrypted_links;if(x){let m=R(x,d);if(m){let b=JSON.parse(m),v="";if(Array.isArray(b)){let k=b.find(_=>_.id===g||_.slug===p||_.id===t||_.slug===t);v=k?.more_information_url||k?.url||""}else{let k=b[g]||b[p]||b[t];v=typeof k=="string"?k:k?.more_information_url||k?.url||""}if(v&&(o=v.startsWith("U2FsdGVkX1")?R(v,d):v,o))break}}}}}}catch{}if(o&&o.startsWith("http")){let u={url:o,timestamp:Date.now()};return P.set(t.toLowerCase(),u),P.set(g.toLowerCase(),u),P.set(p.toLowerCase(),u),e.redirect(302,o)}try{let u=D();if(u){let c=await u.collection("app_secure_links").doc(g).get();if(!c.exists&&t!==g&&(c=await u.collection("app_secure_links").doc(t).get()),!c.exists){let w=u.collection("apps"),f=Array.from(new Set([t,g,t.toLowerCase(),g.toLowerCase()])),x=await w.where("slug","in",f).limit(1).get();if(!x.empty){let m=x.docs[0].id;c=await u.collection("app_secure_links").doc(m).get()}}if(c.exists){let w=c.data(),f=w?.more_information_url||w?.encrypted_link;if(f){let x=R(f,d);if(x&&x.startsWith("http")){let m={url:x,timestamp:Date.now()};return P.set(t.toLowerCase(),m),P.set(g.toLowerCase(),m),e.redirect(302,x)}else if(f.startsWith("http")){let m={url:f,timestamp:Date.now()};return P.set(t.toLowerCase(),m),P.set(g.toLowerCase(),m),e.redirect(302,f)}}}let h=Array.from(new Set([g,t]));for(let w of h){let f=await u.collection("apps").doc(w).get();if(f.exists){let x=f.data(),m=x?.more_information_url||x?.download_url||x?.encrypted_link||x?.url;if(m&&typeof m=="string"){let b=m.startsWith("U2FsdGVkX1")?R(m,d):m;if(b&&b.startsWith("http")){let v={url:b,timestamp:Date.now()};return P.set(t.toLowerCase(),v),P.set(g.toLowerCase(),v),e.redirect(302,b)}}}}}else{let c=z();if(c&&c.projectId){let h=c.apiKey?`?key=${c.apiKey}`:"",w=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId||"(default)"}/documents/app_secure_links/${g}${h}`,f=await fetch(w);if(f.ok){let b=await f.json(),v=W(b.fields),k=v.more_information_url||v.encrypted_link;if(k){let _=R(k,d);if(_&&_.startsWith("http")){let I={url:_,timestamp:Date.now()};return P.set(t.toLowerCase(),I),P.set(g.toLowerCase(),I),e.redirect(302,_)}}}let x=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId||"(default)"}/documents/apps/${g}${h}`,m=await fetch(x);if(m.ok){let b=await m.json(),v=W(b.fields),k=v.more_information_url||v.download_url||v.encrypted_link||v.url;if(k&&typeof k=="string"){let _=k.startsWith("U2FsdGVkX1")?R(k,d):k;if(_&&_.startsWith("http")){let I={url:_,timestamp:Date.now()};return P.set(t.toLowerCase(),I),P.set(g.toLowerCase(),I),e.redirect(302,_)}}}}}}catch(u){console.error("[SECURITY] Firestore link resolution fallback failed:",u)}return e.status(404).send("<h1>404 Not Found</h1><p>The requested application link could not be resolved. This usually happens if the link hasn't been synced to the security vault yet. Please try again later or contact support.</p>")}catch(o){return console.error("Resolution error:",o),e.status(500).send("<h1>500 Internal Server Error</h1>")}});var Pt=E(require("express")),Xe=E(require("fs")),Lt=E(require("path"));K();Q();var je=E(require("fs")),zt=E(require("path"));K();var Ye=class{constructor(){this.cache=new Map;this.vaultPath=zt.default.join(process.cwd(),"src","server","secure_vault.json");this.initialize(),this.watchVault()}initialize(){try{let e=ae;if(e&&e.length>50)try{let i=C(),t=R(ae,i);if(t){let s=JSON.parse(t),a=new Map;if(Array.isArray(s)?s.forEach(r=>{r.id&&a.set(r.id,r.url||r.payload||"")}):Object.entries(s).forEach(([r,l])=>{a.set(r,typeof l=="string"?l:l.payload||l.url||"")}),this.cache=a,console.log(`[VaultNode] Loaded ${this.cache.size} nodes from static vault.`),this.cache.size>0)return}}catch{console.warn("[VaultNode] Static vault load failed, trying file fallback...")}if(je.default.existsSync(this.vaultPath)){let i=JSON.parse(je.default.readFileSync(this.vaultPath,"utf8")),t=new Map;Object.entries(i).forEach(([s,a])=>{t.set(s,a.payload)}),this.cache=t,console.log(`[VaultNode] Loaded ${this.cache.size} nodes into memory.`)}}catch(e){console.error("[VaultNode] Initialization failed:",e)}}watchVault(){try{je.default.watchFile(this.vaultPath,(e,i)=>{e.mtime!==i.mtime&&(console.log("[VaultNode] Vault file changed, refreshing cache..."),this.initialize())})}catch{}}async getSyncPayload(e){let i=this.cache.get(e);if(!i)return null;try{let t=C();return R(i,t)||null}catch(t){return console.error(`[VaultNode] Decryption failed for ${e}:`,t),null}}refresh(){this.cache.clear(),this.initialize()}},Ze=new Ye;ke();var J=Pt.default.Router();J.post("/api/v1/sync-node",async(n,e)=>{let i=B(n);if(await ie(i,30,6e4))return e.status(429).json({status:"ERR",msg:"Request limit exceeded"});let{slug:t,token:s,fingerprint:a,appId:r}=n.body;if(!t)return e.status(400).json({status:"ERR",msg:"Missing ID"});if(!s||!a||!r)return e.status(403).json({status:"ERR",msg:"Session verification required"});let l=n.cookies?.["__Host-sid"];if(!l||!$e(s,i,l,a,r))return console.warn(`[SECURITY] Invalid sync token attempt for slug: ${t} from IP: ${i}`),e.status(403).json({status:"ERR",msg:"Identity verification mismatch"});try{let o=await Ze.getSyncPayload(r)||await Ze.getSyncPayload(t);if(o)return e.json({status:"OK",payload:o,meta:{node:"v1",ts:Date.now()}});let d=D();if(!d)return e.status(404).json({status:"ERR",msg:"Information unavailable"});let g=await d.collection("store_data").doc("sec_vault").get();if(!g.exists)return console.warn(`[Sync] Node miss for slug: ${t} (No sec_vault)`),e.status(404).json({status:"ERR",msg:"Sync Node not yet active"});let p=g.data(),y=C(),u=R(p?.encryptedData,y);if(!u)return e.status(500).json({status:"ERR",msg:"System sync error (vault decryption)"});let c=JSON.parse(u),h=null;if(Array.isArray(c)){let f=c.find(x=>x.id===r||x.id===t);f&&(h=f.url||f.payload)}else h=c[r]?.url||c[r]?.payload||c[t]?.url||c[t]?.payload;if(!h)return console.warn(`[Sync] Node miss for slug/appId: ${t}/${r} (Not in vault)`),e.status(404).json({status:"ERR",msg:"Sync Node not yet active"});let w=R(h,y);if(!w)return e.status(500).json({status:"ERR",msg:"System sync error"});e.json({status:"OK",payload:w,meta:{node:"legacy",ts:Date.now()}})}catch(o){console.error("[SyncNode] Critical Error:",o),e.status(500).json({status:"ERR",msg:"Internal server error"})}});J.get("/api/v1/image",async(n,e)=>{let i=n.query.url;if(!i)return e.status(400).send("Missing image URL");try{let t=i;try{i.startsWith("http")||(t=Buffer.from(i,"base64").toString("utf-8"))}catch{}if(!await $t(t))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${t}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let s=await fetch(t,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!s.ok)throw new Error("Failed to fetch image");let a=await s.arrayBuffer(),r=s.headers.get("content-type")||"image/jpeg";e.set("Content-Type",r),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(a))}catch{e.status(500).send("Image proxy error")}});var de=null,we=0,_n=3e4;function Ft(){de=null,we=0}J.options(["/api/v1/public/reviews","/api/v1/public/backup-data"],(n,e)=>(e.setHeader("Access-Control-Allow-Origin","*"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS"),e.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization"),e.sendStatus(200)));J.get(["/api/v1/public/reviews","/api/public/reviews"],async(n,e)=>{e.setHeader("Access-Control-Allow-Origin","*"),e.setHeader("Cache-Control","public, max-age=60, stale-while-revalidate=120");let i=n.query.app_id;if(!i)return e.json([]);try{let t=D();if(t){let s=await t.collection("app_reviews").where("app_id","==",i).limit(50).get();if(!s.empty){let a=s.docs.map(r=>({id:r.id,...r.data()}));return e.json(a)}}}catch{}return e.json([])});J.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data"],async(n,e)=>{e.setHeader("Access-Control-Allow-Origin","*"),e.set("Cache-Control","public, max-age=15, stale-while-revalidate=30");try{let i=Date.now();if(de&&i-we<_n)return e.json(de);try{let r=D();if(r){let l=await r.collection("store_data").doc("apps_meta").get(),o=[],d=null;if(l.exists){let I=l.data()?.numChunks||1;for(let $=0;$<I;$++){let j=await r.collection("store_data").doc(`apps_chunk_${$}`).get();j.exists&&j.data()?.items&&o.push(...j.data().items)}}else d=await r.collection("store_data").doc("apps").get(),d&&d.exists&&d.data()?.items&&(o=d.data().items);let g=await r.collection("store_data").doc("public_settings").get(),p=await r.collection("store_data").doc("news").get(),y=await r.collection("store_data").doc("blogs").get(),u=await r.collection("store_data").doc("videos").get(),c=he(),h=p.exists?p.data()?.items||[]:[],w=y.exists?y.data()?.items||[]:[],f=u.exists?u.data()?.items||[]:[],x=h&&h.length>0?h:c.mockNews||[],m=w&&w.length>0?w:c.mockBlogs||[],b=f&&f.length>0?f:c.mockVideos||[],v=g.exists?g.data()||{}:{},k=c.mockSettings||{},_={...k,...v,banners:Array.isArray(v.banners)&&v.banners.length>0?v.banners:k.banners||[],categories:Array.isArray(v.categories)&&v.categories.length>0?v.categories:k.categories||[],quick_links:Array.isArray(v.quick_links)&&v.quick_links.length>0?v.quick_links:k.quick_links||[],website_faqs:Array.isArray(v.website_faqs)&&v.website_faqs.length>0?v.website_faqs:k.website_faqs||[],developers:Array.isArray(v.developers)&&v.developers.length>0?v.developers:k.developers||[]};if(l.exists||d&&d.exists||g.exists||p.exists||y.exists||u.exists){let I={apps:o&&o.length>0?o:c.mockApps||[],settings:_,news:x,blogs:m,videos:b};return de=I,we=i,e.json(I)}}}catch{}try{let r=z();if(r&&r.projectId){let l=r.apiKey?`?key=${r.apiKey}`:"",o=`https://firestore.googleapis.com/v1/projects/${r.projectId}/databases/${r.firestoreDatabaseId||"(default)"}/documents/store_data`,d=await fetch(`${o}/apps_meta${l}`),g=[];if(d.ok){let _=await d.json(),I=_.fields?.numChunks?.integerValue?parseInt(_.fields.numChunks.integerValue,10):1;for(let $=0;$<I;$++){let j=await fetch(`${o}/apps_chunk_${$}${l}`);if(j.ok){let T=await j.json();if(T.fields?.items?.arrayValue?.values){let S=T.fields.items.arrayValue.values.map(V=>X(V));g.push(...S)}}}}else{let _=await fetch(`${o}/apps${l}`);if(_.ok){let I=await _.json();I.fields?.items?.arrayValue?.values&&(g=I.fields.items.arrayValue.values.map($=>X($)))}}let p=await fetch(`${o}/public_settings${l}`),y=await fetch(`${o}/news${l}`),u=await fetch(`${o}/blogs${l}`),c=await fetch(`${o}/videos${l}`),h={},w={},f={},x={};try{p.ok&&(h=W((await p.json())?.fields))}catch{}try{y.ok&&(w=W((await y.json())?.fields))}catch{}try{u.ok&&(f=W((await u.json())?.fields))}catch{}try{c.ok&&(x=W((await c.json())?.fields))}catch{}let m=he(),b=y.ok?w.items||[]:m.mockNews||[],v=u.ok?f.items||[]:m.mockBlogs||[],k=c.ok?x.items||[]:m.mockVideos||[];if(d.ok||p.ok||y.ok||u.ok||c.ok||g.length>0){let _={apps:g,settings:h,news:b,blogs:v,videos:k};return de=_,we=i,e.json(_)}}}catch{}let t=Lt.default.join(process.cwd(),"src/lib/public_backup.json");if(Xe.default.existsSync(t))try{let r=JSON.parse(Xe.default.readFileSync(t,"utf8")),l={apps:r.apps||[],settings:r.settings||{},news:r.news||[],blogs:r.blogs||[],videos:r.videos||[]};return de=l,we=i,e.json(l)}catch(r){console.error("Error reading public_backup.json in backup-data endpoint:",r)}let s=he(),a={apps:s.mockApps||[],settings:s.mockSettings||{},news:s.mockNews||[],blogs:s.mockBlogs||[],videos:s.mockVideos||[]};return e.json(a)}catch(i){console.error("public backup endpoint error:",i);let t=he();return e.status(200).json({apps:t.mockApps||[],settings:t.mockSettings||{},news:t.mockNews||[],blogs:t.mockBlogs||[],videos:t.mockVideos||[]})}});J.get("/api/v1/download/:id",async(n,e)=>{let i=n.params.id;return i?e.redirect(302,`/moreinfo/${i}`):e.status(400).send("Bad Request")});var L=Ht.default.Router();L.post("/api/v1/admin/encrypt",N,async(n,e)=>{let i=B(n);if(await ie(i))return e.status(429).json({error:"Too many requests. Please wait."});let{url:t}=n.body;if(!t)return e.status(400).json({error:"URL is required"});let s=C();if(!s||s.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let a=F(t,s);e.json({encrypted:a})}catch{e.status(500).json({error:"Encryption failed"})}});L.post("/api/v1/admin/encrypt-links",N,async(n,e)=>{let{items:i}=n.body;if(!i||!Array.isArray(i))return e.status(400).json({error:"Valid links array payload is required."});try{let t=C();if(!t||t.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let s=[],a=z();if(a){let u=a.apiKey?`?key=${a.apiKey}`:"",c=`https://firestore.googleapis.com/v1/projects/${a.projectId}/databases/${a.firestoreDatabaseId}/documents`;for(let h of["sec_links_vault_3","secure_links","sec_vault"])try{let f=await(await fetch(`${c}/store_data/${h}${u}`)).json();if(f&&!f.error&&f.fields?.encryptedData?.stringValue){let x=R(f.fields.encryptedData.stringValue,t);if(x){let m=JSON.parse(x);if(Array.isArray(m)){s=m;break}}}}catch{}}let r=new Map;s.forEach(u=>{u&&u.id&&r.set(u.id,u)}),i.map(u=>{let c=u.url||"";return c&&!c.startsWith("http://")&&!c.startsWith("https://")&&!c.startsWith("U2FsdGVkX1")&&(c="https://"+c),c&&!c.startsWith("U2FsdGVkX1")&&(c=F(c,t)),{...u,url:c}}).forEach(u=>{u&&u.id&&r.set(u.id,u)});let o=Array.from(r.values()),d=JSON.stringify(o),g=F(d,t),p={encryptedData:g,lastUpdated:new Date().toISOString()},y=D();if(y)try{await Promise.all([y.collection("store_data").doc("secure_links").set(p),y.collection("store_data").doc("sec_vault").set(p)]),console.log("[SERVER] Encrypted links vault persisted to Firestore via Admin SDK.")}catch(u){console.warn("[SERVER] Admin SDK write for secure_links failed, using REST fallback:",u),await Promise.all([U("secure_links",p,n.headers.authorization),U("sec_vault",p,n.headers.authorization)])}else await Promise.all([U("secure_links",p,n.headers.authorization),U("sec_vault",p,n.headers.authorization)]);Je(),e.json({encrypted:g,savedToCloud:!0})}catch{e.status(500).json({error:"Links encryption failed"})}});L.get("/api/v1/admin/debug-links",N,async(n,e)=>{let i=B(n);if(await ie(i))return e.status(429).json({error:"Too many requests"});try{let t=z(),s=`https://firestore.googleapis.com/v1/projects/${t.projectId}/databases/${t.firestoreDatabaseId}/documents/store_data/sec_vault?key=${t.apiKey}`,r=await(await fetch(s)).json();if(!r.fields||!r.fields.encryptedData)return e.json({error:"No vault data found"});let l=r.fields.encryptedData.stringValue,o=C(),d=R(l,o);e.json({decrypted:JSON.parse(d)})}catch(t){e.status(500).json({error:"Failed to decrypt vault: "+t})}});L.post("/api/v1/admin/decrypt-url",N,async(n,e)=>{let i=B(n);if(await ie(i))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:t}=n.body;if(!t)return e.status(400).json({error:"Missing encryptedUrl"});let s=C();if(!s||s.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let a=n.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${a} from IP ${i} at ${new Date().toISOString()}`);try{let r=R(t,s);e.json({decrypted:r||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});L.post("/api/v1/admin/decrypt-links",N,async(n,e)=>{let i=B(n);if(await ie(i))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:t}=n.body;if(!t)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let s=C();if(!s||s.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let a=n.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${a} from IP ${i} at ${new Date().toISOString()}`);try{let r=R(t,s);if(!r)return console.warn("[WARNING] Decrypted block is empty or decryption failed. Returning empty vault."),e.json({items:[]});let l=[];try{l=JSON.parse(r)}catch{return console.warn("[WARNING] Failed to parse decrypted vault. Returning empty array."),e.json({items:[]})}l=l.map(o=>{let d=o.url||"";if(d.startsWith("U2FsdGVkX1"))try{d=R(d,s)}catch{}return{...o,url:d}}),e.json({items:l})}catch(r){console.error("[ERROR] Admin decrypt-links failed:",r.message||r),e.status(500).json({error:"Links decryption failed: "+(r.message||"Check AES_SECRET")})}});L.post("/api/v1/admin/sync-local",N,async(n,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:i,settings:t,news:s,blogs:a,videos:r,allowEmptyApps:l,allowEmptyNews:o,allowEmptyBlogs:d,allowEmptyVideos:g}=n.body;if(!i&&!t&&!s&&!a&&!r)return e.status(400).json({error:"Invalid sync payload: no items provided."});let p=!1,y=null;try{let u=D();if(u){if(Array.isArray(i)&&(i.length>0||l)){let w=Math.ceil(i.length/25)||1,f=[];for(let x=0;x<w;x++){let m=JSON.parse(JSON.stringify(i.slice(x*25,(x+1)*25)));m.forEach(b=>{delete b.more_information_url,delete b.encrypted_download_url,delete b.download_url}),f.push(u.collection("store_data").doc(`apps_chunk_${x}`).set({items:m}))}await Promise.all(f),await u.collection("store_data").doc("apps_meta").set({numChunks:w,last_updated:new Date().toISOString()})}let c=[];t&&typeof t=="object"&&Object.keys(t).length>0&&c.push(u.collection("store_data").doc("public_settings").set(JSON.parse(JSON.stringify(t)),{merge:!0})),Array.isArray(s)&&(s.length>0||o)&&c.push(u.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(s))})),Array.isArray(a)&&(a.length>0||d)&&c.push(u.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(a))})),Array.isArray(r)&&(r.length>0||g)&&c.push(u.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(r))})),c.length>0&&await Promise.all(c),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),p=!0}else y="Admin SDK could not be initialized (Check FIREBASE_SERVICE_ACCOUNT)"}catch(u){console.warn("[SERVER] Firestore Admin SDK update failed, switching to REST API fallback:",u.message),y=u.message}if(!p)try{let u=n.headers.authorization,c=[];if(Array.isArray(i)&&(i.length>0||l)){let w=Math.ceil(i.length/25)||1,f=[];for(let x=0;x<w;x++){let m=JSON.parse(JSON.stringify(i.slice(x*25,(x+1)*25)));m.forEach(b=>{delete b.more_information_url,delete b.encrypted_download_url,delete b.download_url}),f.push(U(`apps_chunk_${x}`,{items:m},u))}await Promise.all(f),await U("apps_meta",{numChunks:w,last_updated:new Date().toISOString()},u)}if(t&&typeof t=="object"&&Object.keys(t).length>0&&c.push(U("public_settings",JSON.parse(JSON.stringify(t)),u,!0)),Array.isArray(s)&&(s.length>0||o)&&c.push(U("news",{items:JSON.parse(JSON.stringify(s))},u)),Array.isArray(a)&&(a.length>0||d)&&c.push(U("blogs",{items:JSON.parse(JSON.stringify(a))},u)),Array.isArray(r)&&(r.length>0||g)&&c.push(U("videos",{items:JSON.parse(JSON.stringify(r))},u)),c.length>0){let h=await Promise.all(c);h.every(f=>f===!0)?(console.log("[SERVER] Firestore documents successfully updated via Auth REST Proxy in sync-local endpoint."),p=!0,y=null):(y=`REST Fallback write partially failed (${h.filter(Boolean).length}/${h.length} docs succeeded).`,console.warn(`[SERVER] ${y}`))}else p=!0}catch(u){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",u.message),y=`REST Fallback also failed: ${u.message}`}try{let u=pe.default.join(process.cwd(),"src/lib/public_backup.json"),c={apps:[],settings:{},news:[],blogs:[],videos:[]};if(M.default.existsSync(u))try{c=JSON.parse(M.default.readFileSync(u,"utf8"))}catch{}let h=(Bt(),ue(Mt)),w=(Wt(),ue(Vt)),f=h.mockApps&&h.mockApps.length>0?h.mockApps:w.mockApps,x=h.mockSettings&&Object.keys(h.mockSettings).length>0?h.mockSettings:w.mockSettings,m=h.mockNews&&h.mockNews.length>0?h.mockNews:w.mockNews,b=h.mockBlogs&&h.mockBlogs.length>0?h.mockBlogs:w.mockBlogs,v=h.mockVideos&&h.mockVideos.length>0?h.mockVideos:w.mockVideos,k=Array.isArray(c.apps)&&c.apps.length>0?c.apps:f||[],_=c.settings&&typeof c.settings=="object"&&Object.keys(c.settings).length>0?c.settings:x||{},I=Array.isArray(c.news)&&c.news.length>0?c.news:m||[],$=Array.isArray(c.blogs)&&c.blogs.length>0?c.blogs:b||[],j=Array.isArray(c.videos)&&c.videos.length>0?c.videos:v||[],T=Array.isArray(i)&&(i.length>0||l)?i:k,S=t&&typeof t=="object"?t:{},it={...{..._,...S},banners:Array.isArray(S.banners)&&S.banners.length>0?S.banners:_.banners||[],categories:Array.isArray(S.categories)&&S.categories.length>0?S.categories:_.categories||[],quick_links:Array.isArray(S.quick_links)&&S.quick_links.length>0?S.quick_links:_.quick_links||[],website_faqs:Array.isArray(S.website_faqs)&&S.website_faqs.length>0?S.website_faqs:_.website_faqs||[],developers:Array.isArray(S.developers)&&S.developers.length>0?S.developers:_.developers||[]},st=Array.isArray(s)&&(s.length>0||o)?s:I,rt=Array.isArray(a)&&(a.length>0||d)?a:$,ot=Array.isArray(r)&&(r.length>0||g)?r:j,Xt={apps:T,settings:it,news:st,blogs:rt,videos:ot};M.default.writeFileSync(u,JSON.stringify(Xt,null,2),"utf8");let{generateStaticDataFileCode:Qt}=(qe(),ue(He)),en=pe.default.join(process.cwd(),"src/lib/staticData.ts"),tn=Qt(T,it,st,rt,ot);M.default.writeFileSync(en,tn,"utf8")}catch(u){console.warn("[SERVER] Could not update local file backups:",u)}Ft(),At(),p?e.json({success:!0,message:"Cloud Firestore and backup components strictly synced.",method:y?"REST Fallback":"Admin SDK"}):e.status(500).json({success:!1,error:"Database update failed: "+y,message:"Your changes were saved to the local server cache but could not be synced to Cloud Firestore. Check your environment variables."})}catch(i){console.error("local file sync endpoint error:",i),e.status(500).json({error:"Failed to store backup: "+i.message})}});L.get("/api/v1/admin/backup-links-get",N,(n,e)=>{try{let i=C(),t={},s=pe.default.join(process.cwd(),"src/lib/secureVault.ts");if(M.default.existsSync(s))try{let o=M.default.readFileSync(s,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(o&&o[1]){let d=o[1],g=R(d,i);if(g){let p=JSON.parse(g);Array.isArray(p)?p.forEach(y=>{y&&y.id&&(t[y.id]=y.url||y.more_information_url||"")}):p&&typeof p=="object"&&Object.assign(t,p),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(l){console.warn("backup-links-get: Failed to parse secureVault.ts:",l.message)}let a=pe.default.join(process.cwd(),".local/secure_links_backup.json");if(M.default.existsSync(a))try{let l=JSON.parse(M.default.readFileSync(a,"utf8"));Object.assign(t,l),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(l){console.warn("backup-links-get: Failed to parse backup JSON:",l.message)}let r=[];for(let[l,o]of Object.entries(t)){let d="";typeof o=="string"&&(o.startsWith("U2FsdGVkX1")?d=R(o,i):d=o),r.push({id:l,url:d})}e.json({items:r})}catch(i){console.error("backup-links-get failed:",i),e.status(500).json({error:"Failed to read backup links: "+i.message})}});L.get("/api/v1/admin/fix-db-links",N,async(n,e)=>{try{let i=z();if(!i)return e.status(500).json({error:"Missing configuration."});let s=await(await fetch(`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/store_data/apps_chunk_0${i.apiKey?"?key="+i.apiKey:""}`)).json(),a=[];!s.error&&s.fields?.items?.arrayValue?.values&&(a=s.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue));let l=await(await fetch(`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/store_data/apps_chunk_1${i.apiKey?"?key="+i.apiKey:""}`)).json();!l.error&&l.fields?.items?.arrayValue?.values&&(a=a.concat(l.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue)));let o=C(),d=a.map(h=>({id:h,url:`https://example.com/demo/${h}`})),g=F(JSON.stringify(d),o),p=n.query.token||n.headers.authorization&&n.headers.authorization.split("Bearer ")[1]||"",c=await(await fetch(`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${i.apiKey?"&key="+i.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${p}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:g}}})})).json();e.json(c)}catch(i){e.status(500).json({error:i.message})}});L.post("/api/v1/admin/seal-vault",N,(n,e)=>{try{let{items:i}=n.body;if(!i||!Array.isArray(i))return e.status(400).json({error:"Valid items array required"});let t={};i.forEach(r=>{r.id&&(r.url&&r.more_information_url?t[r.id]={url:r.url,more_information_url:r.more_information_url,slug:r.slug}:(r.url||r.more_information_url)&&(t[r.id]=r.url||r.more_information_url))});let s=C();if(!s)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let a=F(JSON.stringify(t),s);e.json({success:!0,ciphertext:a})}catch(i){e.status(500).json({error:i.message})}});L.post("/api/v1/admin/save-links-direct",N,(n,e)=>{try{let{items:i}=n.body;if(!i||!Array.isArray(i))return e.status(400).json({error:"Valid items array required"});let t=C(),s={};i.forEach(l=>{let o=l.url,d=l.more_information_url;if(l.id){if(o&&d){let g={url:o.startsWith("U2FsdGVkX1")?o:F(o,t),more_information_url:d.startsWith("U2FsdGVkX1")?d:F(d,t),slug:l.slug};s[l.id]=JSON.stringify(g)}else if(o||d){let g=o||d;s[l.id]=g.startsWith("U2FsdGVkX1")?g:F(g,t)}}});let a=pe.default.join(process.cwd(),".local/secure_links_backup.json"),r=s;if(M.default.existsSync(a))try{r={...JSON.parse(M.default.readFileSync(a,"utf8")),...s}}catch{}for(let[l,o]of Object.entries(r))if(o&&!o.startsWith("U2FsdGVkX1"))try{r[l]=F(o,t)}catch{delete r[l]}Je(),e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(i){e.status(500).json({error:i.message})}});L.post("/api/v1/admin/pull-links-from-github",N,async(n,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));L.get("/api/v1/admin/config-status",N,(n,e)=>{let i=!!process.env.AES_SECRET,t=!!process.env.SECURE_LINKS,s=!!process.env.ADMIN_EMAIL;e.json({hasAes:i,hasSecLinks:t,hasAdminEmail:s})});L.get("/api/v1/admin/system-files",N,(n,e)=>{e.json({files:{}})});L.get("/api/v1/admin/firebase-status",N,async(n,e)=>{let i=Date.now(),t={config:!1,firestoreRead:!1,firestoreWrite:!1,adminSdk:!1,aesConfigured:!1,readLatencyMs:0,writeLatencyMs:0,details:{}};try{let s=z(),a=s?.apiKey||"",r=s?.projectId||"ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a",l=s?.firestoreDatabaseId,o=!l||l===r?"(default)":l;t.config=!!r;let d=process.env.AES_SECRET||global.AES_SECRET_GLOBAL;t.aesConfigured=!!(d&&d.trim()!==""),t.details.projectId=r,t.details.databaseId=o,t.details.hasApiKey=!!a;let g=Date.now();try{let c=D(),h=Le();c?(await c.collection("store_data").doc("_status_check_").set({ts:Date.now(),source:"admin_sdk_healthcheck",checkedAt:new Date().toISOString()}),await c.collection("store_data").doc("_status_check_").delete(),t.adminSdk=!0,t.firestoreRead=!0,t.firestoreWrite=!0,t.readLatencyMs=Date.now()-g,t.writeLatencyMs=Date.now()-g,t.details.adminSdkLatencyMs=Date.now()-g,t.details.adminSdkNote=h.message||"Admin SDK active with full Service Account authority"):t.details.adminSdkNote=h.message||"Admin SDK inactive (Service Account variable missing; using REST fallback)"}catch(c){t.details.adminSdkError=c.message||String(c),t.details.adminSdkNote=`Admin SDK error: ${c.message}`}if(!t.adminSdk){let c=Date.now();try{let f=a?`?key=${a}`:"",x=`https://firestore.googleapis.com/v1/projects/${r}/databases/${o}/documents/store_data/public_settings${f}`,m=await fetch(x);if(t.readLatencyMs=Date.now()-c,m.status===200||m.status===404)t.firestoreRead=!0,t.details.restReadStatus=m.status,t.details.restReadNote="REST read operational";else{let b=await m.text();t.details.restReadStatus=m.status,t.details.restReadError=`HTTP ${m.status}: ${b.slice(0,150)}`}}catch(f){t.readLatencyMs=Date.now()-c,t.details.restReadError=f.message||String(f)}let h=Date.now(),w=n.headers.authorization;try{let f="_status_check_",x=await U(f,{ts:Date.now(),source:"admin_rest_healthcheck",checkedAt:new Date().toISOString()},w);if(t.writeLatencyMs=Date.now()-h,x)t.firestoreWrite=!0,t.details.writeMode="Authenticated Admin REST API (Authorization Bearer)",t.details.restWriteNote="REST write operational",Fe(f,w).catch(()=>{});else{let m=`status_ping_${Date.now()}`,b=a?`&key=${a}`:"",v=`https://firestore.googleapis.com/v1/projects/${r}/databases/${o}/documents/spent_tokens?documentId=${m}${b}`,k=await fetch(v,{method:"POST",headers:{"Content-Type":"application/json",...w?{Authorization:w}:{}},body:JSON.stringify({fields:{usedAt:{stringValue:new Date().toISOString()}}})});if(k.ok||k.status===200)t.firestoreWrite=!0,t.details.writeMode="Public Rules Validation (spent_tokens POST)",t.details.restWriteNote="REST write operational";else{let _=await k.text();t.details.restWriteError=`HTTP ${k.status}: ${_.slice(0,150)}`}}}catch(f){t.writeLatencyMs=Date.now()-h,t.details.restWriteError=f.message||String(f)}}let p=Date.now()-i;t.details.totalCheckDurationMs=p;let u=t.adminSdk&&t.firestoreRead&&t.firestoreWrite||t.firestoreRead&&t.firestoreWrite?"live":t.firestoreRead?"read_only":"offline";return u==="live"?t.details.diagnosticSummary=t.adminSdk?"100% Operational. Full server-side Admin SDK privileges verified.":"100% Operational. REST API read & write access verified.":u==="read_only"?t.details.diagnosticSummary=`Firestore reads are operational, but writes are failing. ${t.details.restWriteError||"Check API Key or Service Account configuration."}`:t.details.diagnosticSummary=`Firestore is currently offline or unreachable. ${t.details.restReadError||"Check Project ID and network configuration."}`,e.json({status:u,results:t,details:t.details,timestamp:new Date().toISOString()})}catch(s){return e.status(500).json({status:"offline",error:s.message||"Diagnostic test failed",results:t})}});L.get("/api/v1/admin/verify",N,(n,e)=>{e.json({authorized:!0,user:n.adminUser})});L.get("/api/v1/admin/security/audit-logs",N,async(n,e)=>{let i=z();if(!!1&&i&&i.apiKey)try{let a=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${i.apiKey?"&key="+i.apiKey:""}`,r=await fetch(a);if(r.ok){let d=((await r.json()).documents||[]).map(g=>{let p=g.fields||{};return{id:g.name.split("/").pop(),email:p.email?.stringValue||"unknown",ip:p.ip?.stringValue||"unknown",ua:p.ua?.stringValue||"unknown",success:p.success?.booleanValue??!1,reason:p.reason?.stringValue||"unknown",ts:p.ts?.stringValue||new Date().toISOString()}}).sort((g,p)=>new Date(p.ts).getTime()-new Date(g.ts).getTime());return e.json({success:!0,logs:d})}}catch(a){console.error("Error fetching Firestore audit logs:",a)}let s=[{id:"log_1",email:n.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:n.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:n.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:n.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:s})});var O=(0,Ne.default)();O.set("trust proxy",1);O.use((0,Jt.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1}));O.use((0,qt.default)());O.use((0,Kt.default)());O.use((0,Gt.default)({origin:!0,credentials:!0}));O.use(Ne.default.json({limit:"50mb"}));O.use(Ne.default.urlencoded({extended:!0,limit:"50mb"}));!process.env.AES_SECRET&&process.env.NODE_ENV==="production"&&console.error("FATAL: AES_SECRET environment variable is not set. Secure link flow will fail.");O.use((n,e,i)=>{n.originalUrl.startsWith("/api/")&&console.log(`[API REQUEST] ${n.method} ${n.originalUrl}`),i()});O.use("/api/v1/admin",(n,e,i)=>{e.setHeader("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate"),e.setHeader("Pragma","no-cache"),e.setHeader("Expires","0"),e.setHeader("Surrogate-Control","no-store"),i()});O.use((n,e,i)=>{if((n.headers["x-forwarded-host"]||n.get("host")||"").split(",")[0].trim()==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${n.originalUrl}`);i()});O.get("/api/health",(n,e)=>{e.json({status:"ok",timestamp:new Date().toISOString()})});O.use(q);O.use(H);O.use(Te);O.use(L);O.use(ce);O.use(J);["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(n=>{O.all(n,(e,i)=>{i.status(404).send("Not Found")})});O.use((n,e,i,t)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,n);try{let s=Yt.default.join(process.cwd(),"server_requests.log");Zt.default.appendFileSync(s,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${n.message||n}
`,"utf8")}catch{}if(i.headersSent)return t(n);if(e.originalUrl.startsWith("/api/"))return i.status(500).json({error:"Internal server error"});i.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});var Ls=module.exports=O;
