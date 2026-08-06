var gn=Object.create;var ve=Object.defineProperty;var fn=Object.getOwnPropertyDescriptor;var yn=Object.getOwnPropertyNames;var wn=Object.getPrototypeOf,bn=Object.prototype.hasOwnProperty;var H=(t,e)=>()=>(t&&(e=t(t=0)),e);var xe=(t,e)=>{for(var i in e)ve(t,i,{get:e[i],enumerable:!0})},ut=(t,e,i,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of yn(e))!bn.call(t,s)&&s!==i&&ve(t,s,{get:()=>e[s],enumerable:!(n=fn(e,s))||n.enumerable});return t};var E=(t,e,i)=>(i=t!=null?gn(wn(t)):{},ut(e||!t||!t.__esModule?ve(i,"default",{value:t,enumerable:!0}):i,t)),me=t=>ut(ve({},"__esModule",{value:!0}),t);var Fe,ke,_n,Me,ni,mt,vn,xn,ht,gt,ii,he,Ae=H(()=>{Fe=E(require("path"));process.env.AES_SECRET||console.warn("WARNING: AES_SECRET is not set. Using local development fallback.");process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");ke=()=>["fallback","aes","secret","for","local","dev","only"].join("_");global.AES_SECRET_GLOBAL=process.env.AES_SECRET||ke();_n=()=>["fallback","token","secret"].join("_"),Me=process.env.TOKEN_SECRET||_n(),ni=process.env.SESSION_SECRET||"fallback_session_secret_dev";process.env.TOKEN_SECRET||console.warn("WARNING: TOKEN_SECRET is not set. Using local development fallback.");process.env.SESSION_SECRET||console.warn("WARNING: SESSION_SECRET is not set. Using local development fallback.");mt=process.env.CF_TURNSTILE_SECRET||"",vn=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},xn=vn(mt)?mt:"",ht=60*1e3,gt=300,ii=Fe.default.join(process.cwd(),"src/lib/mock_2fa_store.json"),he=()=>{try{let t=Fe.default.join(process.cwd(),"src/lib/staticData");try{let e=require.resolve(t);delete require.cache[e]}catch{}return require(t)}catch(t){return console.error("Failed to load staticData dynamically:",t),{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}}});function T(t,e){let i=ke(),n=global.AES_SECRET_GLOBAL,s=[e,process.env.AES_SECRET,n,i].filter(Boolean),r=Array.from(new Set(s));for(let a of r)if(!(!a||a.trim()===""))try{let o=Se.default.AES.decrypt(t,a).toString(Se.default.enc.Utf8);if(o&&o.trim().length>0)return o}catch{}return""}function C(){return process.env.AES_SECRET||global.AES_SECRET_GLOBAL||ke()}function F(t,e){let i=e||C();if(!t||!i||i.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return Se.default.AES.encrypt(t,i).toString()}var Se,Ee,J=H(()=>{Se=E(require("crypto-js"));Ae();Ee=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))}});var yt={};xe(yt,{convertToFirestoreFields:()=>ft,convertToFirestoreValue:()=>Ie,deleteFirestoreRestDoc:()=>Ve,getAdminSdkDiagnostics:()=>Be,getFirebaseAdminDb:()=>O,getRawFirebaseConfig:()=>z,parseFirestoreFields:()=>q,parseFirestoreValue:()=>Q,toFirestoreDocument:()=>An,toFirestoreValue:()=>Re,writeFirestoreRestDoc:()=>M});function kn(t){if(!t)return null;if(typeof t=="object"&&(t.private_key||t.client_email||t.project_id))return t.private_key&&typeof t.private_key=="string"&&(t.private_key=t.private_key.replace(/\\n/g,`
`)),t;if(typeof t!="string")return null;let e=t.trim();for(;e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'");)e=e.slice(1,-1).trim();let i=n=>{if(typeof n=="string")try{n=JSON.parse(n)}catch{}return n&&typeof n=="object"&&(n.private_key||n.client_email||n.project_id)?(n.private_key&&typeof n.private_key=="string"&&(n.private_key=n.private_key.replace(/\\n/g,`
`)),n):null};try{let n=i(JSON.parse(e));if(n)return n}catch{}try{let n=e.replace(/\\n/g,`
`).replace(/\r/g,""),s=i(JSON.parse(n));if(s)return s}catch{}try{let n=e.replace(/\n/g,"\\n").replace(/\r/g,""),s=i(JSON.parse(n));if(s)return s}catch{}try{let n=Buffer.from(e,"base64").toString("utf8").trim(),s=i(JSON.parse(n));if(s)return s}catch{}throw new Error("Invalid JSON format in Service Account variable")}function z(){if(X)return X;let t=(m,d,h)=>{for(let w of[m,d,h])if(Ee(w))return w;return""},e=t(process.env.VITE_FIREBASE_PROJECT_ID,process.env.VITE_FIREBASE_JECT_ID,process.env.FIREBASE_PROJECT_ID),i=t(process.env.VITE_FIREBASE_DATABASE_ID,process.env.VITE_FIREBASE_BASE_ID,process.env.FIREBASE_DATABASE_ID),n=t(process.env.VITE_FIREBASE_API_KEY,process.env.FIREBASE_API_KEY,process.env.API_KEY||process.env.NEXT_PUBLIC_FIREBASE_API_KEY),s=t(process.env.VITE_FIREBASE_AUTH_DOMAIN,process.env.VITE_FIREBASE_DOMAIN,process.env.FIREBASE_AUTH_DOMAIN),r=t(process.env.VITE_FIREBASE_APP_ID,process.env.FIREBASE_APP_ID),a=t(process.env.VITE_FIREBASE_STORAGE_BUCKET,process.env.FIREBASE_STORAGE_BUCKET),l=t(process.env.VITE_FIREBASE_MESSAGING_ID,process.env.FIREBASE_MESSAGING_SENDER_ID),o={};try{let m=Te.default.readFileSync(Ue.default.join(process.cwd(),"firebase-applet-config.json"),"utf8");o=JSON.parse(m)||{}}catch{}let p=n||o.apiKey||"AIzaSyBey9sUbeWrcXS2kl4ewOzkTy4arg03Ok",u=(m,d)=>!m||!Ee(m)||m===d||m==="(default)"?"(default)":m;if(e)return X={projectId:e,appId:r||o.appId,apiKey:p,authDomain:s||o.authDomain,firestoreDatabaseId:u(i||o.firestoreDatabaseId||o.databaseId,e),storageBucket:a||o.storageBucket,messagingSenderId:l||o.messagingSenderId},X;if(o.projectId&&Ee(o.projectId))return o.firestoreDatabaseId=u(o.firestoreDatabaseId||o.databaseId||i,o.projectId),o.apiKey=p,X=o,o;let y="ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";return X={projectId:y,appId:r||"1:103973989874:web:733a6afd8e837224900f6b",apiKey:p,authDomain:s||"gen-lang-client-0825832493.firebaseapp.com",firestoreDatabaseId:u(i,y),storageBucket:a||"gen-lang-client-0825832493.firebasestorage.app",messagingSenderId:l||"103973989874"},X}function Be(){return ae?{active:!0,message:K||"Admin SDK initialized and active"}:{active:!1,message:K||"Admin SDK inactive"}}function O(){if(ae)return ae;try{let t=require("firebase-admin"),e=z();if(t.apps.length===0){let a=null,l="",o=["FIREBASE_SERVICE_ACCOUNT","FIREBASE_ACCOUNT","FIREBASE_SERVICE_ACCOUNT_JSON","FIREBASE_CREDENTIALS","FIREBASE_ADMIN_KEY","FIREBASE_SECRET","SERVICE_ACCOUNT_JSON","SERVICE_ACCOUNT","GCP_SERVICE_ACCOUNT","GOOGLE_SERVICE_ACCOUNT"];for(let c of o)if(process.env[c]&&String(process.env[c]).trim()!==""){a=process.env[c],l=c;break}if(!a){let c=Ue.default.join(process.cwd(),"service-account.json");Te.default.existsSync(c)&&(a=Te.default.readFileSync(c,"utf8"),l="service-account.json (local)")}if(a)try{let c=kn(a);if(!c)return K=`Found ${l}, but parsing returned null`,null;let p=c.project_id||e?.projectId;t.initializeApp({credential:t.credential.cert(c),projectId:p}),K=`Initialized successfully for project ${p} using ${l}`,console.log(`[Admin SDK] Initialized for ${p} using ${l}`)}catch(c){return K=`Failed parsing ${l}: ${c.message}`,console.error(`[Admin SDK] Failed to parse ${l}:`,c.message),null}else if(process.env.GOOGLE_APPLICATION_CREDENTIALS)t.initializeApp({projectId:e?.projectId}),K="Initialized using GOOGLE_APPLICATION_CREDENTIALS",console.log("[Admin SDK] Initialized with GOOGLE_APPLICATION_CREDENTIALS.");else return K="No Service Account variable found on server. Looked for FIREBASE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT, etc.",console.warn("[Admin SDK] No service account env var found. Admin SDK in REST fallback mode."),null}let i=e?.firestoreDatabaseId||e?.databaseId||process.env.VITE_FIREBASE_DATABASE_ID||process.env.FIREBASE_DATABASE_ID,s="ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a";if(i&&i.trim()!==""&&i!=="(default)"&&i!=="gen-lang-client-0825832493"&&(s=i),s&&s!=="(default)"){let{getFirestore:a}=require("firebase-admin/firestore");ae=a(t.apps[0],s)}else ae=t.firestore();let r=t.apps[0]?.options?.projectId||"gen-lang-client-0825832493";return console.log(`[Admin SDK] Firestore initialized for project: ${r}, database: ${s}`),ae}catch(t){return K=`Initialization thrown exception: ${t.message||t}`,console.warn("[Admin SDK] Initialization failed:",t.message||t),null}}function Ie(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:String(t)}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>Ie(e))}};if(typeof t=="object"){let e={};for(let[i,n]of Object.entries(t))n!==void 0&&(e[i]=Ie(n));return{mapValue:{fields:e}}}return{stringValue:String(t)}}function ft(t){let e={};if(!t||typeof t!="object")return e;for(let[i,n]of Object.entries(t))n!==void 0&&(e[i]=Ie(n));return e}async function M(t,e,i,n=!0){try{let s=z();if(!s||!s.projectId)return console.warn(`[SERVER] Cannot write REST doc ${t}: Missing project ID`),!1;let r=s.firestoreDatabaseId||s.databaseId||"(default)",a=[];s.apiKey&&a.push(`key=${encodeURIComponent(s.apiKey)}`),n&&e&&typeof e=="object"&&Object.keys(e).forEach(y=>{a.push(`updateMask.fieldPaths=${encodeURIComponent(y)}`)});let l=a.length>0?`?${a.join("&")}`:"",o=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${r}/documents/store_data/${t}${l}`,c=ft(e),p={"Content-Type":"application/json"};i&&i.trim()!==""&&(p.Authorization=i.startsWith("Bearer ")?i:`Bearer ${i}`);let u=await fetch(o,{method:"PATCH",headers:p,body:JSON.stringify({fields:c})});if(!u.ok){let y=await u.text();return console.warn(`[SERVER] writeFirestoreRestDoc failed for store_data/${t} (HTTP ${u.status}):`,y),!1}return console.log(`[SERVER] writeFirestoreRestDoc successfully written store_data/${t}`),!0}catch(s){return console.error(`[SERVER] writeFirestoreRestDoc exception for ${t}:`,s.message||s),!1}}async function Ve(t,e){try{let i=z();if(!i||!i.projectId)return!1;let n=i.firestoreDatabaseId||i.databaseId||"(default)",s=i.apiKey?`?key=${i.apiKey}`:"",r=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${n}/documents/store_data/${t}${s}`,a={};return e&&e.trim()!==""&&(a.Authorization=e.startsWith("Bearer ")?e:`Bearer ${e}`),(await fetch(r,{method:"DELETE",headers:a})).ok}catch{return!1}}function Re(t){if(t==null)return{nullValue:null};if(typeof t=="boolean")return{booleanValue:t};if(typeof t=="number")return Number.isInteger(t)?{integerValue:t.toString()}:{doubleValue:t};if(typeof t=="string")return{stringValue:t};if(Array.isArray(t))return{arrayValue:{values:t.map(e=>Re(e))}};if(typeof t=="object"){let e={};for(let i of Object.keys(t))e[i]=Re(t[i]);return{mapValue:{fields:e}}}return{stringValue:String(t)}}function An(t){let e={};if(t&&typeof t=="object")for(let i of Object.keys(t))e[i]=Re(t[i]);return{fields:e}}function Q(t){if(!t||typeof t!="object")return t??null;if("stringValue"in t)return t.stringValue;if("booleanValue"in t)return t.booleanValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("timestampValue"in t)return t.timestampValue;if("nullValue"in t)return null;if("mapValue"in t){let e=t.mapValue?.fields||{},i={};for(let n of Object.keys(e))i[n]=Q(e[n]);return i}return"arrayValue"in t?(t.arrayValue?.values||[]).map(i=>Q(i)):null}function q(t){if(!t||typeof t!="object")return{};let e={};for(let i of Object.keys(t))e[i]=Q(t[i]);return e}var Te,Ue,X,ae,K,ee=H(()=>{Te=E(require("fs")),Ue=E(require("path"));J();X=null;ae=null,K=""});function St(t={}){let e={...t};return e.disclaimer_text===void 0&&(e.disclaimer_text=""),e.ethics_discrimination_text===void 0&&(e.ethics_discrimination_text=""),e.privacy_content===void 0&&(e.privacy_content=""),e.terms_content===void 0&&(e.terms_content=""),e.responsibility_content===void 0&&(e.responsibility_content=""),e.report_removal_content===void 0&&(e.report_removal_content=""),e.important_notice===void 0&&(e.important_notice=""),e.about_content===void 0&&(e.about_content=""),e.disclaimer_heading===void 0&&(e.disclaimer_heading=""),e.ethics_heading===void 0&&(e.ethics_heading=""),e.portal_heading===void 0&&(e.portal_heading=""),e.important_notice_heading===void 0&&(e.important_notice_heading=""),e}var Je=H(()=>{});var Tt,Et=H(()=>{Tt={}});function De(t){try{localStorage.setItem(Ke,JSON.stringify(t))}catch{}}function fe(){try{let t=localStorage.getItem(Ke);if(!t)return null;let e=JSON.parse(t);return!e.idToken||!e.expiresAt?null:e}catch{return null}}function Nn(){try{localStorage.removeItem(Ke)}catch{}}async function Ct(t){let e=fe();if((t==="MOCK_ADMIN_REFRESH"||t==="SERVER_SESSION"||!t||!On)&&e&&e.idToken){try{let i=await fetch("/api/v1/admin/refresh-token",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e.idToken}`},body:JSON.stringify({idToken:e.idToken})});if(i.ok){let n=await i.json();if(n.token)return{idToken:n.token,expiresAt:Date.now()+te}}}catch{}return{idToken:e.idToken,expiresAt:Date.now()+te}}try{let i=await fetch(`https://securetoken.googleapis.com/v1/token?key=${Rt}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`grant_type=refresh_token&refresh_token=${encodeURIComponent(t)}`});return i.ok?{idToken:(await i.json()).id_token,expiresAt:Date.now()+te}:e&&e.idToken?{idToken:e.idToken,expiresAt:Date.now()+te}:null}catch{return e&&e.idToken?{idToken:e.idToken,expiresAt:Date.now()+te}:null}}async function $n(){let t=fe();if(!t)return null;if(Date.now()<t.expiresAt-120*1e3)return t.idToken;let e=await Ct(t.refreshToken);if(!e)return Nn(),null;let i={...t,idToken:e.idToken,expiresAt:e.expiresAt};return De(i),i.idToken}async function Dt(t,e={}){let i=await $n(),n=e.headers?.Authorization||e.headers?.authorization;if(!i&&!n){let l=fe();if(l?.idToken){let o=await Ct(l.refreshToken);o?.idToken&&(i=o.idToken,De({...l,idToken:o.idToken,expiresAt:o.expiresAt}))}if(!i&&!n)return new Response(JSON.stringify({error:"Unauthorized: Session expired. Please log in again."}),{status:401,headers:{"Content-Type":"application/json"}})}let s={...e.headers,"Content-Type":"application/json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache",Expires:"0"};i&&(s.Authorization=`Bearer ${i}`);let r=await fetch(t,{...e,headers:s,cache:"no-store"}),a=r.headers.get("X-Refreshed-Admin-Token");if(a){let l=fe();l&&De({...l,idToken:a,expiresAt:Date.now()+te})}if(r.status===401){let l=fe();if(l?.idToken)try{let o=await fetch("/api/v1/admin/refresh-token",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${l.idToken}`},body:JSON.stringify({idToken:l.idToken})});if(o.ok){let c=await o.json();c.token&&(De({...l,idToken:c.token,expiresAt:Date.now()+te}),s.Authorization=`Bearer ${c.token}`,r=await fetch(t,{...e,headers:s,cache:"no-store"}))}}catch{}}return r}var jn,Ke,te,It,Cn,Rt,Dn,On,Ot=H(()=>{Et();jn={},Ke="__adm_session",te=3300*1e3,It="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",Cn=()=>{let t;if(typeof process<"u"&&process.env&&(t=process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY),!t)try{let n=globalThis.importMetaEnv||(typeof jn<"u"?process.env:void 0);n&&(t=n.VITE_FIREBASE_API_KEY||n.FIREBASE_API_KEY)}catch{}let e=Tt?.apiKey||"",i=n=>{if(!n)return!1;let s=n.trim();return!(s===""||s==="PLACEHOLDER"||s.includes("REPLACE_WITH_YOUR_REAL_KEY")||s.includes("YOUR_API_KEY"))};if(i(t))return t;if(i(e))return e;try{let n=typeof atob=="function"?atob(It):Buffer.from(It,"base64").toString("utf8"),s=JSON.parse(n);if(s&&i(s.apiKey))return s.apiKey}catch{}return""},Rt=Cn(),Dn=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY"))},On=Dn(Rt)});var Ye={};xe(Ye,{b64EncodeUnicode:()=>zn,commitFileToGitHub:()=>Pn,generateStaticDataFileCode:()=>Ln});function zn(t){try{return btoa(encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,i)=>String.fromCharCode(parseInt(i,16))))}catch(e){return console.error("Base64 unicode encoding error:",e),btoa(t)}}function Ln(t=[],e={},i=[],n=[],s=[]){let r=JSON.parse(JSON.stringify(t||[])).map(u=>(delete u.more_information_url,delete u.encrypted_download_url,delete u.download_url,u)),l=St({...{site_title:"",meta_description:"",logo_url:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},...JSON.parse(JSON.stringify(e||{}))}),o=JSON.parse(JSON.stringify(i||[])),c=JSON.parse(JSON.stringify(n||[])),p=JSON.parse(JSON.stringify(s||[]));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockApps: AppConfig[] = ${JSON.stringify(r,null,2)} as any[];

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

export const mockBlogs: BlogPost[] = ${JSON.stringify(c,null,2)} as any[];

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(p,null,2)} as any[];

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}async function Pn({owner:t,repo:e,token:i,branch:n,path:s,content:r,message:a}){let l=await Dt("/api/github-sync/commit",{method:"POST",body:JSON.stringify({owner:t,repo:e,token:i,branch:n,path:s,content:r,message:a})});if(!l.ok){let o=l.headers.get("content-type"),c=await l.text(),p=c||`Server returned ${l.status} ${l.statusText}`;if(o&&o.includes("text/html"))throw new Error(`Server returned HTML instead of JSON (${l.status}). This usually indicates a routing issue or a backend crash. Check if the /api routes are correctly deployed. Details: ${c.substring(0,100)}...`);try{let u=JSON.parse(c);p=u.message||u.error||p}catch{(!p||p.trim()==="")&&(p=`HTTP Error ${l.status}`)}throw new Error(p)}return l.json()}var Ze=H(()=>{Je();Ot()});var Qt={};xe(Qt,{mockApps:()=>st,mockBlogs:()=>ot,mockNews:()=>at,mockSettings:()=>Xt,mockVideos:()=>rt,saveMockApps:()=>Wn,saveMockBlogs:()=>Gn,saveMockNews:()=>qn,saveMockSettings:()=>Hn,saveMockVideos:()=>Jn});var st,Wn,Xt,Hn,at,qn,ot,Gn,rt,Jn,en=H(()=>{st=[{screenshots:[],developer:"Bingo",category:"All Apps, Yono Apps",faqs:[],safety_status:"Verified",publish_date:"",seo_description:"Know about Spin Crush, the ultimate casual gaming hub. Explore diverse offline mini-games, collect virtual coins, and enjoy safe arcade entertainment on RummyDex.",id:"yh9toduxk",file_size:"44.8 MB",release_notes:"",seo_title:"Spin Crush - Casual Arcade Hub & Virtual Mini-Games",features_html:`<!DOCTYPE html>
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
`,encrypted_link:"",rating:4.1,created_at:"2026-08-02T11:14:13.263Z",name:"SPIN CRUSH",updated_at:"2026-08-06T05:58:04.453Z",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",slug:"spin-crush",red_box_msg:"",description_html:`<!DOCTYPE html>
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
`,video_url:"",is_coming_soon:!1,is_new:!0,icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785670352/ezgif-82a15987d682a1a8_sdzpjc.webp",version:"1.0.6",yellow_box_msg:"It get slightly heat on below Android 13",serial_number:6,canonical_url:"https://www.rummydex.com/app/spin-crush",seo_keywords:"casual game hub, arcade collection, virtual coin games, offline mini-games, spin crush app",idea_box_msg:"",custom_admin_box_heading:"",custom_admin_box_html:""},{yellow_box_msg:"Play in limit doing anything excess is not good so if you in limit everything are good ",seo_description:"We went hands-on with Rummy 77. Read our neutral review detailing the actual table mechanics, card sorting features, and real-world battery performance.",is_coming_soon:!1,description_html:`<!DOCTYPE html>
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
`,red_box_msg:"",serial_number:2,id:"i5uw2apum",canonical_url:"https://www.rummydex.com/app/rummy-77",encrypted_link:"",video_url:"",faqs:[],version:"1.0.6",publish_date:"",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",name:"RUMMY 77",screenshots:[],created_at:"2026-08-03T02:13:03.477Z",category:"All Apps, Yono",slug:"rummy-77",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785722974/1000132690_11zon_1_l43qhv.jpg",updated_at:"2026-08-03T02:38:06.645Z",seo_title:"Rummy 77 - Hands On Review - Gameplay, Features & Performance | RummyDex",is_new:!1,file_size:" 49.2 MB",idea_box_msg:"",release_notes:"",features_html:`<!DOCTYPE html>
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
`,seo_keywords:"rummy 77 app, real rummy gameplay, rummy 77 review, 13 card rummy",developer:"Arena studio",safety_status:"Verified",rating:4.2},{screenshots:[],idea_box_msg:"Almost In every android phone it can run well no issues ",encrypted_link:"",seo_keywords:"",faqs:[],seo_title:"Rummy 91: The Ultimate Casual Card & Board Game App \u{1F680}",description_html:`<section>
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
</section>`,file_size:"47.8 MB",yellow_box_msg:"",version:"1.07.9",is_coming_soon:!1,id:"s4oc5m16b",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785780996/download_22_vgi4h1_1_jjm7jx.webp",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785780996/download_22_vgi4h1_1_jjm7jx.webp",serial_number:3,developer:"Ariyan Chowdhury studio ",canonical_url:"https://www.rummydex.com/app/rummy-91",updated_at:"2026-08-04T04:23:29.327Z",category:"All Apps, Yono Apps",rating:4.4,red_box_msg:"",seo_description:"Master your skills with Rummy 91! \u{1F0CF} Play traditional Rummy, fast-paced Teen Patti, and classic Ludo in one lightweight app. Join the practice lobbies today. \u2728",created_at:"2026-08-03T18:10:16.344Z",publish_date:"",name:"RUMMY 91",is_new:!1,safety_status:"Verified",slug:"rummy-91",release_notes:"",features_html:"",video_url:""},{release_notes:"",publish_date:"",rating:4,icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785819278/images_21_1_g770hi.webp",features_html:`<!DOCTYPE html>
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
`,faqs:[{answer:"Yes. Callbreak features robust offline AI single-player matches as well as local Wi-Fi connectivity, allowing you to play anywhere without an internet connection.",question:"Q1: Can I play Callbreak fully offline without mobile data?"},{answer:"Yes. Callbreak features robust offline AI single-player matches as well as local Wi-Fi connectivity, allowing you to play anywhere without an internet connection.",question:"Q2: Are the in-game Gems and Coins tied to real-money rewards?"},{answer:"Because the app utilizes clean 2D graphics and lightweight processing, it runs smoothly at 60 FPS on older devices while keeping battery drain and heat output very low.",question:"Q3: How does Callbreak perform on older or lower-spec smartphones?"},{question:"Q4: What extra game modes are included besides standard 5-round matches?",answer:"The platform includes Super 8 Bid Challenge (racing to win eight hands against aggressive AI) and Blind Bid Mode (bidding before viewing player hands)."}],safety_status:"Verified",video_url:"",is_new:!1,id:"ha76icslh",screenshots:[],serial_number:1,canonical_url:"https://www.rummydex.com/app/callbreak",version:"1.0",developer:"People Lovin Games",idea_box_msg:"",seo_keywords:"",encrypted_link:"",red_box_msg:"",name:"CALLBREAK",seo_description:"Explore Callbreak: Classic Card Games on RummyDex. Check gameplay modes, features. Hand tested review on real experience ",slug:"callbreak",created_at:"2026-08-04T05:18:55.084Z",description_html:`<!DOCTYPE html>
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
`,yellow_box_msg:"",file_size:"51.11 MB",category:"Card Apps, All Apps",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785819278/images_21_1_g770hi.webp",updated_at:"2026-08-06T05:57:42.651Z",is_coming_soon:!1,seo_title:"Callbreak: Classic Card Games \u2014 Review, Rating & Download Info",custom_admin_box_heading:"",custom_admin_box_html:""},{id:"colrcaih7",name:"Card Game 29",slug:"card-game-29",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785935258/1000133067_11zon_1_n04bav.jpg",category:"All Apps, Card Apps",encrypted_link:"",rating:4.1,safety_status:"Verified",serial_number:5,version:"1.0",file_size:"23.2 MB",developer:"ZLEVEL LABS LLP",description_html:`<section class="content-section">
  <h2>About the Application (Deep Dive)</h2>

  <p>
    Card Game 29 is not just a digital pastime; it is a massive, widely established platform dedicated to preserving and modernizing a beloved South Asian card game.
    Developed and maintained by Z Level Labs (also known as ZLEVEL LABS LLP), the application has built a massive community since its initial launch over a decade ago on September 2, 2014.
  </p>

  <h3>What the Application Provides</h3>

  <p>
    The primary goal of the application is to offer a comprehensive, portable version of "29" (or Twenty-Nine), a highly strategic trick-taking game famous across India, Bangladesh, Nepal, and other parts of South Asia.
  </p>

  <div class="feature-item">
    <h4>The Core Experience</h4>
    <p>
      The app provides a virtual card table where you can play against AI, connect with local friends, or match up with a global player base.
    </p>
  </div>

  <div class="feature-item">
    <h4>Language Accessibility</h4>
    <p>
      To ensure it reaches its core demographic natively, the app features full language support for English, Hindi, Bengali, and Spanish.
    </p>
  </div>

  <div class="feature-item">
    <h4>Constant Evolution</h4>
    <p>
      The developers actively maintain the game, with recent updates rolling out as late as August 2026 to introduce modernized menus, smoother multiplayer sessions, and critical bug fixes.
    </p>
  </div>

  <h3>Technical Footprint and Accessibility</h3>

  <p>
    For an application that offers real-time multiplayer, Card Game 29 is remarkably lightweight and accessible for a wide range of devices.
  </p>

  <div class="feature-item">
    <h4>Device Requirements</h4>
    <p>
      It is built for Android (though the developer publishes similar games for iOS) and requires Android version 5.0/6.0 or higher.
    </p>
  </div>

  <div class="feature-item">
    <h4>Storage Space</h4>
    <p>
      The installation size varies slightly depending on your specific device and version, generally taking up only 26.4 MB to 42.5 MB of space.
    </p>
  </div>

  <div class="feature-item">
    <h4>Global Reach</h4>
    <p>
      This accessibility has translated into massive success, boasting over 10 million downloads and maintaining a solid 4.13 out of 5.0 rating from over 105,000 user reviews.
    </p>
  </div>

  <h3>Monetization and the In-App Economy</h3>

  <p>
    The app operates on a "freemium" model, meaning it is completely free to download and play, but it is heavily ad-supported.
  </p>

  <div class="feature-item">
    <h4>Premium Options</h4>
    <p>
      For players who want a cleaner experience or extra features, the app offers a premium pass and various in-app purchases.
    </p>
  </div>

  <div class="feature-item">
    <h4>Pricing Structure</h4>
    <p>
      These optional purchases range from as low as $0.49 to a massive $129.99 for premium bundles, which can be used to remove advertisements, unlock cosmetic items, or access special features.
    </p>
  </div>

  <h3>Behind the Scenes: Privacy and Permissions</h3>

  <p>
    To facilitate its online and local multiplayer features, as well as its advertising model, the app requires a robust set of device permissions.
  </p>

  <div class="feature-item">
    <h4>System Access</h4>
    <p>
      The app asks for access to your camera, internet network state, vibration functions, external storage (for saving data), and wake lock (to keep your screen from turning off mid-game).
    </p>
  </div>

  <div class="feature-item">
    <h4>Data Handling</h4>
    <p>
      According to the game's privacy policy, it does collect personal information, device identifiers, and performance data.
      This data is shared with trusted third parties, primarily to deliver targeted advertisements and ensure the app functions correctly across different devices.
    </p>
  </div>
</section>`,features_html:`<section class="content-section">
  <h2>Key Features and Deep Dive into Card Game 29</h2>

  <p>
    Card Game 29 isn't just a simple mobile game; it is a meticulous digital recreation of the beloved South Asian trick-taking classic.
    The app is designed to bring the traditional flavor of the game to your smartphone, blending memory, intense strategy, and partnership coordination.
  </p>

  <h3>The Core Game Mechanics</h3>

  <p>
    At its heart, the app authentically replicates the traditional rules.
    You play in a four-player setup with two fixed partnerships sitting across from one another.
  </p>

  <div class="feature-item">
    <h4>The Stripped Deck</h4>
    <p>
      The game removes the lower cards, utilizing a specific 32-card deck consisting only of the
      7, 8, 9, 10, Jack, Queen, King, and Ace.
    </p>
  </div>

  <div class="feature-item">
    <h4>Unique Card Values</h4>
    <p>
      Unlike standard games, the Jack is the ultimate powerhouse worth 3 points, followed by the 9
      (worth 2 points), and the Ace and 10 (worth 1 point each). The total deck holds 28 points,
      and winning the final trick grants the namesake 29th point.
    </p>
  </div>

  <div class="feature-item">
    <h4>The Bidding War</h4>
    <p>
      The app beautifully captures the tension of the bidding phase. Players must bid between
      16 and 28 points based on their hand's strength, and the highest bidder earns the crucial
      right to set the trump suit.
    </p>
  </div>

  <h3>Customizable House Rules</h3>

  <p>
    One of the most impressive features of the app is its "Rules Popup" configuration panel,
    which respects that different regions have their own local variations. You can deeply
    customize your match by enabling:
  </p>

  <div class="feature-item">
    <h4>Double &amp; Re-Double</h4>
    <p>
      To aggressively increase the stakes and score multipliers of a single hand.
    </p>
  </div>

  <div class="feature-item">
    <h4>Pair / Marriage</h4>
    <p>
      A system that rewards bonus points if you are lucky enough to hold both the King and Queen
      of the active trump suit.
    </p>
  </div>

  <div class="feature-item">
    <h4>Specialized Trumping</h4>
    <p>
      Options like the "7th Card Trump" (where your 7th dealt card dictates the suit) or using
      a Joker as a designated trump card.
    </p>
  </div>

  <div class="feature-item">
    <h4>Single Hand &amp; Tenny</h4>
    <p>
      Niche modes where a solo player attempts to win the hand under special conditions,
      or tries to sweep all four tricks without even relying on a trump card.
    </p>
  </div>

  <h3>Versatile Play Modes</h3>

  <p>
    The application caters to exactly how you want to play at any given moment:
  </p>

  <div class="feature-item">
    <h4>Offline AI Mode</h4>
    <p>
      Perfect for offline practice, allowing you to play against computer-controlled opponents
      without needing any internet connection.
    </p>
  </div>

  <div class="feature-item">
    <h4>Online Multiplayer</h4>
    <p>
      You can jump into public matches or create private rooms with shareable links to play
      with friends worldwide.
    </p>
  </div>

  <div class="feature-item">
    <h4>Local Bluetooth</h4>
    <p>
      A standout feature that lets you connect locally with friends in the same room without
      consuming any mobile data.
    </p>
  </div>
</section>`,seo_title:"Card Game 29 \u2014 Challenge Friends & Master the Bids | RummyDex",seo_description:"Join RummyDex to play Card Game 29: sharpen your bidding, team up with partners, and win against players worldwide in fast, competitive rounds.",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!1,is_coming_soon:!1,screenshots:[],faqs:[{answer:"Yes. Card Game 29 is free to download and play. The app also offers optional in-app purchases and displays advertisements, allowing users to unlock additional features or enjoy a more streamlined experience if they choose.",question:"1. Is Card Game 29 free to download and play?"},{question:"2. Can I play Card Game 29 without an internet connection?",answer:"Yes. The game includes an offline mode where you can play against AI opponents without an internet connection. However, online multiplayer features require an active internet connection."},{answer:"Yes. Card Game 29 supports multiple ways to play, including online multiplayer, private rooms with friends, and local multiplayer options on supported devices, depending on the available features in your version of the app.",question:"3. Does Card Game 29 support multiplayer gameplay?"},{question:"4. Is Card Game 29 suitable for beginners?",answer:"Yes. While the game is based on the traditional rules of Twenty-Nine, its straightforward interface and offline practice mode make it accessible for new players. Experienced players can also enjoy advanced gameplay through bidding, partnerships, and customizable rule variations."}],created_at:"2026-08-05T14:01:20.004Z",updated_at:"2026-08-05T14:04:44.286Z"},{id:"e1qcs5ik7",name:"JOY RUMMY",slug:"joy-rummy",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784879087/download_32_cyvkev.webp",category:"All Apps, Yono Apps",encrypted_link:"",rating:4.3,safety_status:"Verified",serial_number:4,version:"1.0",file_size:"35 MB",developer:"Pixel Card Studios",description_html:`<section class="content-section">
  <h2>Technical Architecture and Application Details</h2>

  <p>
    Featured prominently on RummyDex, Joy Rummy combines a lightweight system footprint with a robust multiplayer architecture to ensure accessibility across a wide array of mobile devices.
  </p>

  <h3>System Specifications and Footprint</h3>

  <div class="feature-item">
    <h4>Device Compatibility</h4>
    <p>
      Optimized for modern operating standards, requiring Android 6.0 or higher for stable background synchronization.
    </p>
  </div>

  <div class="feature-item">
    <h4>Storage Efficiency</h4>
    <p>
      The application package maintains a streamlined download size of approximately 35 MB, ensuring rapid installation even on limited network bandwidth.
    </p>
  </div>

  <div class="feature-item">
    <h4>Content Governance</h4>
    <p>
      Rated "Everyone" on major app distribution channels, ensuring compliance with broad family-friendly content guidelines.
    </p>
  </div>

  <h3>Monetization Framework and App Economy</h3>

  <div class="feature-item">
    <h4>Freemium Model</h4>
    <p>
      The core application is freely accessible, sustained via integrated digital advertisements.
    </p>
  </div>

  <div class="feature-item">
    <h4>Cosmetic Enhancements</h4>
    <p>
      Optional in-app purchases (ranging from minor customization packs to extensive visual upgrades) are strictly restricted to aesthetic elements\u2014such as unique card back designs, custom table felt colors, and avatar portraits\u2014ensuring zero pay-to-win mechanics.
    </p>
  </div>

  <h3>Essential Permissions</h3>

  <p>
    The application requests minimal system permissions strictly required for core functionality.
  </p>

  <div class="feature-item">
    <h4>Network State Access</h4>
    <p>
      Necessary for maintaining real-time lobby synchronization, global leaderboard updates, and multiplayer packet delivery.
    </p>
  </div>

  <div class="feature-item">
    <h4>Haptic Integration</h4>
    <p>
      Interfaces with device vibration hardware to deliver tactile feedback during card draws and turn notifications.
    </p>
  </div>
</section>`,features_html:`<section class="content-section">
  <h2>Key Features</h2>

  <p>
    Joy Rummy is a meticulously crafted, skill-based mobile card application designed to bring the traditional 13-card strategy experience directly to digital screens. Built as an interactive hub for cognitive engagement and casual entertainment, the platform serves enthusiasts seeking a structured, immersive environment to test their memory, pattern recognition, and tactical decision-making.
  </p>

  <h3>Comprehensive Application Purpose and Educational Value</h3>

  <p>
    Beyond simple entertainment, the application functions as an interactive digital academy for card game strategy, helping users sharpen their analytical skills.
  </p>

  <div class="feature-item">
    <h4>Cognitive Skill Enhancement</h4>
    <p>
      Players naturally develop advanced probability calculations by tracking discarded cards and evaluating the statistical likelihood of drawing missing sequences.
    </p>
  </div>

  <div class="feature-item">
    <h4>Strategic Planning</h4>
    <p>
      The app teaches disciplined resource management, requiring participants to balance defensive melding with offensive card collection under strict turn-based constraints.
    </p>
  </div>

  <div class="feature-item">
    <h4>Accessibility to Traditional Rules</h4>
    <p>
      By digitizing classic South Asian card mechanics, the platform acts as an educational bridge, allowing younger generations to learn traditional cultural card games in an organized, modern format.
    </p>
  </div>

  <h3>The Core Game Mechanics</h3>

  <p>
    The application faithfully models traditional rummy architecture, ensuring an authentic experience across every digital match.
  </p>

  <div class="feature-item">
    <h4>The Table Setup</h4>
    <p>
      Matches accommodate 2 to 6 players per virtual table. Each participant receives a starting hand of 13 cards dealt from standard decks, while remaining cards populate the central draw and discard pools.
    </p>
  </div>

  <div class="feature-item">
    <h4>The Primary Objective</h4>
    <p>
      Participants must systematically draw and discard cards on each sequential turn to organize their hand into valid structural configurations, specifically "Sets" (three or four matching rank cards) and "Runs" (consecutive sequences of the same suit).
    </p>
  </div>

  <div class="feature-item">
    <h4>Point Evaluation and Resolution</h4>
    <p>
      A round successfully concludes when a player completes all required melds and declares their hand. Scoring calculates penalties based strictly on unmelded cards remaining in opponent hands, rewarding efficient tactical play.
    </p>
  </div>

  <h3>Engaging Play Modes</h3>

  <p>
    To accommodate diverse user schedules and strategic goals, Joy Rummy incorporates multiple distinct operational environments.
  </p>

  <div class="feature-item">
    <h4>AI Practice Arena</h4>
    <p>
      An offline sandbox environment where users can experiment with unconventional card combinations and refine their strategies against computer-controlled opponents featuring adjustable difficulty scaling.
    </p>
  </div>

  <div class="feature-item">
    <h4>Custom Friend Lobbies</h4>
    <p>
      A dedicated social architecture allowing hosts to generate secure, private room codes for seamless, remote multiplayer sessions with family and friends.
    </p>
  </div>

  <div class="feature-item">
    <h4>Global Matchmaking</h4>
    <p>
      An automated quick-play queue pairing users globally with opponents of comparable skill tiers, complemented by a monthly competitive leaderboard tracking overall strategic milestones.
    </p>
  </div>
</section>`,seo_title:"Joy Rummy App Review: Features, Gameplay, and User Guide | RummyDex",seo_description:"Explore a comprehensive review of Joy Rummy on RummyDex. Discover core 13-card gameplay mechanics, engaging play modes, and user experiences",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!1,is_coming_soon:!1,screenshots:[],faqs:[{question:"1. What type of rummy gameplay does Joy Rummy offer?",answer:"Joy Rummy is built around the traditional 13-card rummy format, where players organize cards into valid sequences and sets before declaring their hand. The gameplay emphasizes strategic planning, memory, and decision-making rather than relying solely on chance."},{question:"2. Does Joy Rummy include both practice and competitive game modes?",answer:"Yes. The application offers offline AI practice for learning strategies and improving gameplay, along with online matchmaking and private multiplayer rooms for users who want to compete with friends or players from around the world."},{answer:"No. The core gameplay is available without making any purchases. Optional in-app purchases primarily focus on cosmetic enhancements and personalization features, allowing players to customize their experience without affecting competitive balance.",question:"3. Are in-app purchases required to enjoy the complete gameplay experience?"},{question:"4. What makes Joy Rummy suitable for long-term players?",answer:"Joy Rummy combines skill-based gameplay with features such as global matchmaking, private rooms, AI practice, and regular content improvements. These features provide both new and experienced players with a consistent and engaging environment to refine their strategies over time."}],created_at:"2026-08-05T15:42:57.962Z",updated_at:"2026-08-06T05:58:39.493Z",custom_admin_box_heading:"Hands-On Review",custom_admin_box_html:`<section class="content-section">
  <h2>The Hands-On User Experience</h2>

  <p>
    The user interface of Joy Rummy is purposefully engineered to eliminate visual clutter, allowing players to focus entirely on tactical execution and board awareness.
  </p>

  <h3>Visual Design and Interaction Dynamics</h3>

  <div class="feature-item">
    <h4>Fluid Drag-and-Drop Controls</h4>
    <p>
      Card movement relies on a responsive physics-based system where cards snap securely into position, offering satisfying tactile feedback during fast-paced turns.
    </p>
  </div>

  <div class="feature-item">
    <h4>Smart Organization Tools</h4>
    <p>
      To alleviate screen-space limitations on smaller mobile displays, the app includes an "Auto-Group" feature that instantly categorizes hand components by suit and color.
    </p>
  </div>

  <div class="feature-item">
    <h4>Distraction-Free Signaling</h4>
    <p>
      The digital table utilizes minimalist, high-contrast aesthetics, featuring subtle visual glows that indicate valid meld formations without pulling focus from the broader game state.
    </p>
  </div>

  <div class="feature-item">
    <h4>Structured Communication</h4>
    <p>
      To maintain a positive community atmosphere, open text chat is replaced by a curated suite of animated emotes and quick phrases, enabling efficient expression without interrupting match pacing.
    </p>
  </div>

  <h3>Player Engagement and Community Feedback</h3>

  <p>
    User interaction patterns and reviews highlight several core operational strengths alongside areas for continuous technical refinement.
  </p>

  <div class="feature-item">
    <h4>Rapid Match Initiation</h4>
    <p>
      Players frequently praise the speed of the global matchmaking queue, noting an average transition time of under ten seconds from the home screen to an active table.
    </p>
  </div>

  <div class="feature-item">
    <h4>Pacing and Advertisement Flow</h4>
    <p>
      As a freemium platform, video advertisements are displayed between completed rounds. While necessary for platform maintenance, some users observe that ad frequency can occasionally disrupt long gaming sessions.
    </p>
  </div>

  <div class="feature-item">
    <h4>Interface Density</h4>
    <p>
      While the responsive layout adapts well to modern devices, users operating older, compact smartphones occasionally report that managing 13 stacked cards requires precise touch inputs to avoid accidental discards.
    </p>
  </div>
</section>`},{id:"to56xasfo",name:"JAIHO 91",slug:"jaiho-91",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784877512/download_16_fznggx.webp",category:"All Apps, Yono Apps",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:7,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:22:37.662Z",updated_at:"2026-08-06T06:22:37.662Z"},{id:"x1mivt2cj",name:"OK RUMMY",slug:"ok-rummy",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784877617/download_19_w2sxhp.webp",category:"All Apps, Yono Apps",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:8,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:23:32.759Z",updated_at:"2026-08-06T06:23:32.759Z"},{id:"ozhj4pz5s",name:"JAIHO SLOTS",slug:"jaiho-slots",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784877660/download_20_x106v3.webp",category:"All Apps, Yono Apps",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:9,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:24:15.614Z",updated_at:"2026-08-06T06:24:15.614Z"},{id:"l7e8oyo9m",name:"YONO ARCADE",slug:"yono-arcade",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784877459/download_14_krbwrv.webp",category:"All Apps, Yono Apps",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:10,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:25:01.322Z",updated_at:"2026-08-06T06:25:01.322Z"},{id:"jr5xf2b1s",name:"BINGO 101",slug:"bingo-101",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784877567/download_18_lljdaa.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:11,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:25:34.518Z",updated_at:"2026-08-06T06:25:34.518Z"},{id:"08exxq5q9",name:"ABC RUMMY",slug:"abc-rummy",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784878050/download_26_awtrna.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:12,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:25:57.922Z",updated_at:"2026-08-06T06:25:57.922Z"},{id:"kc3u0sl2h",name:"EVER 777",slug:"ever-777",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784878592/download_28_mhxps5.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:13,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:26:23.645Z",updated_at:"2026-08-06T06:26:23.645Z"},{id:"v9ky6l07h",name:"LOVE RUMMY",slug:"love-rummy",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784878950/download_31_s7fonv.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:14,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:26:53.266Z",updated_at:"2026-08-06T06:26:53.266Z"},{id:"0jfvh7lrx",name:"SHARE SLOTS",slug:"share-slots",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784879544/download_36_zeiyxs.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:15,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:27:21.563Z",updated_at:"2026-08-06T06:27:21.563Z"},{id:"89d79z398",name:"YONO VIP",slug:"yono-vip",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784879809/download_39_znq2ql.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:16,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:28:39.740Z",updated_at:"2026-08-06T06:28:39.740Z"},{id:"m6bwb6cnb",name:"MAHA GAMES",slug:"maha-games",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784879172/download_33_d1pgy0.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:17,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:29:16.107Z",updated_at:"2026-08-06T06:29:16.107Z"},{id:"y7lefyq14",name:"RUMMY LUDO",slug:"rummy-ludo",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784879252/download_34_wrdzdw.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:18,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:29:45.975Z",updated_at:"2026-08-06T06:29:45.975Z"},{id:"lzcn7ehst",name:"789 JACKPORTS",slug:"789-jackports",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784879711/download_38_pmpbnu.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:19,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:30:34.425Z",updated_at:"2026-08-06T06:30:34.425Z"},{id:"jl9bx9llw",name:"777 GAME",slug:"777-game",icon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1784878294/download_27_ex1vzp.webp",category:"General",encrypted_link:"",rating:5,safety_status:"Verified",serial_number:20,version:"1.0",file_size:"Unknown",developer:"Admin",description_html:"",features_html:"",custom_admin_box_heading:"",custom_admin_box_html:"",seo_title:"",seo_description:"",seo_keywords:"",og_image_url:"",canonical_url:"",video_url:"",publish_date:"",release_notes:"",red_box_msg:"",yellow_box_msg:"",idea_box_msg:"",is_new:!0,is_coming_soon:!1,screenshots:[],faqs:[],created_at:"2026-08-06T06:31:18.240Z",updated_at:"2026-08-06T06:31:18.240Z"}],Wn=t=>{try{localStorage.setItem("rummystore_apps",JSON.stringify(t))}catch(e){console.warn("saveMockApps storage failed:",e)}st.splice(0,st.length,...t)},Xt={site_title:"RummyDex",meta_description:"RummyDex is the ultimate game directory. Access hand-tested reviews, verified secure links, and daily news to elevate your mobile experience.",logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785719943/1000132603_ym7nto.jpg",favicon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",helpline_whatsapp:"",helpline_telegram:"",support_email:"rummydex1@gmail.com",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:["All Apps","Yono Apps","Card Apps","Funny games"],banners:[],quick_links:[],website_faqs:[{answer:"RummyDex is an all-in-one digital discovery portal. We simplify your search for quality mobile apps by providing curated app listings, hands-on performance reviews, lightweight video previews, and daily industry news\u2014all in one structured directory.",question:"\u200BQ1: What is RummyDex, and how does it help me find the best apps?"},{question:"Q2: How does RummyDex ensure listed apps perform well on my device?",answer:"Every application featured on our platform undergoes real, hands-on evaluation by our team. We analyze frame rate stability, thermal efficiency, battery consumption, and overall interface responsiveness so you know exactly how an app behaves before you install it."},{question:"Q3: Does RummyDex host software files directly on its servers?",answer:"No. We function as a secure informational bridge. We review software and provide verified, direct routing to official developer sources. This guarantees you always access authentic, unalterable releases straight from the original creators."},{question:"Q4: Do I need an account or subscription to use RummyDex?",answer:"Not at all. RummyDex is an open-access resource. You can explore our full app index, stream video review highlights, read technical breakdowns, and check daily platform news completely free, with no account registration required."},{question:"Q5: What will I find in the News and Video sections?",answer:"Our News section keeps you updated on major software patches, developer announcements, and mobile trends. Our Video section offers fast, lightweight gameplay and UI clips so you can visually inspect an app\u2019s performance before visiting the developer source"},{question:"Q6: How frequently are new reviews and apps added?",answer:"Our catalog is constantly growing. We continuously evaluate new submissions, test software updates, and publish fresh insights to ensure our directory reflects the newest and most reliable mobile applications available."}],developers:[{bio:`Chief Executive Officer (CEO), RummyDex
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
`,social_twitter:"",social_links:{twitter:"",linkedin:"",instagram:"https://www.instagram.com/rummydex?igsh=MTJjaGR3c3hmdjhnZA==",youtube:"https://www.youtube.com/@rummydex",facebook:"https://www.facebook.com/share/1951euBy3d/"}},Hn=t=>{try{localStorage.setItem("rummystore_settings",JSON.stringify(t))}catch(e){console.warn("saveMockSettings storage failed:",e)}Object.assign(Xt,t)},at=[{content:`<!DOCTYPE html>
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
`,ceo_name:"The Editorial Team",id:"vw78pxmf9",description_html:`<!DOCTYPE html>
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
`,target_region:"Global ",created_at:"2026-08-01T04:29:15.305Z",title:"Application Hub is LIVE! The Ultimate App Portal is Here",date:"2026-08-01T04:29:15.305Z",canonical_url:"https://www.example.com/notice/",is_breaking:!1,seo_description:"Welcome to Application Hub! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",seo_title:"Application Hub is LIVE - Premium App Directory & Reviews",is_pinned:!1,link:"https://www.example.com/app-hub-is-live",description:"Application Hub is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",ceo_description:"Editorial Board",image_url:"",published_at:"2026-08-01T04:29:15.305Z",is_new:!0,category:"Announcements",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",updated_at:"2026-08-01T04:33:51.227Z",slug:"app-hub-is-live"},{slug:"callbreak-live-on-rummydex",description_html:`Callbreak Joins the RummyDex Vault: Full Hands-On Breakdown Now Live
We are excited to announce that Callbreak: Classic Card Games has officially been added to our growing digital directory!
Our benchmark and review team spent hours putting Callbreak through real-world testing across multiple devices. Whether you are a seasoned player familiar with trick-taking strategy or a casual gamer looking for a smooth mobile experience, our full listing gives you an unfiltered look at what it is actually like to play.
What We Tested in Our Callbreak Review
Instead of just listing game features, our newly published review breaks down the actual day-to-day feel of the application, including:
Gameplay Flexibility: How the game handles offline single-player AI matches, local Wi-Fi tables, and global real-time multiplayer.
Tactical Quality-of-Life Tools: A close look at in-game features like the Undo button, Reshuffle option, and Card History logs that make matches smoother for strategic players.
Special Game Modes: Details on unique variants featured in the app, including the high-stakes Blind Bid Mode and the fast-paced Super 8 Bid Challenge.
Hardware & Battery Benchmarks: Real data on frame rate stability (60 FPS), thermal output, and battery consumption on standard mobile devices.
Unfiltered Friction Points: Honest feedback on ad frequency between matches, AI predictability patterns, and server stability during peak multiplayer times.
Explore the Full Review Today
Before you download or sit down at a virtual table, get the full breakdown on RummyDex. We tell you exactly how the game plays, where it shines, and where it gets frustrating\u2014so you can decide if it\u2019s the right fit for your mobile setup.`,created_at:"2026-08-04T17:08:11.833Z",is_new:!0,logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785865490/1000133006_11zon_fvsjpe.webp",image_url:"",description:"The popular South Asian trick-taking card game Callbreak has officially arrived on RummyDex. Explore our neutral, hand-tested review covering offline AI performance, table mechanics, and real-world friction points.",category:"Card Apps ",title:"Callbreak is Now Live on RummyDex: Read Our Full Hands-On Review",updated_at:"2026-08-04T17:54:21.650Z",is_breaking:!1,related_app_id:"ha76icslh",published_at:"2026-08-04T17:08:11.833Z",date:"2026-08-04T17:08:11.833Z",id:"5hc6ok8fj",is_pinned:!1,seo_title:": Callbreak Review - Technical Performance & Gameplay | RummyDex",seo_description:"Read our neutral, hand-tested review of Callbreak. Discover battery usage, thermal efficiency, multiplayer stability, and friction points before downloading",content:`Callbreak Joins the RummyDex Vault: Full Hands-On Breakdown Now Live
We are excited to announce that Callbreak: Classic Card Games has officially been added to our growing digital directory!
Our benchmark and review team spent hours putting Callbreak through real-world testing across multiple devices. Whether you are a seasoned player familiar with trick-taking strategy or a casual gamer looking for a smooth mobile experience, our full listing gives you an unfiltered look at what it is actually like to play.
What We Tested in Our Callbreak Review
Instead of just listing game features, our newly published review breaks down the actual day-to-day feel of the application, including:
Gameplay Flexibility: How the game handles offline single-player AI matches, local Wi-Fi tables, and global real-time multiplayer.
Tactical Quality-of-Life Tools: A close look at in-game features like the Undo button, Reshuffle option, and Card History logs that make matches smoother for strategic players.
Special Game Modes: Details on unique variants featured in the app, including the high-stakes Blind Bid Mode and the fast-paced Super 8 Bid Challenge.
Hardware & Battery Benchmarks: Real data on frame rate stability (60 FPS), thermal output, and battery consumption on standard mobile devices.
Unfiltered Friction Points: Honest feedback on ad frequency between matches, AI predictability patterns, and server stability during peak multiplayer times.
Explore the Full Review Today
Before you download or sit down at a virtual table, get the full breakdown on RummyDex. We tell you exactly how the game plays, where it shines, and where it gets frustrating\u2014so you can decide if it\u2019s the right fit for your mobile setup.`,canonical_url:"https://www.rummydex.com/news/callbreak-live-on-rummydex",link:"https://www.rummydex.com/app/callbreak"}],qn=t=>{try{localStorage.setItem("rummystore_news",JSON.stringify(t))}catch(e){console.warn("saveMockNews storage failed:",e)}at.splice(0,at.length,...t)},ot=[],Gn=t=>{try{localStorage.setItem("rummystore_blogs",JSON.stringify(t))}catch(e){console.warn("saveMockBlogs storage failed:",e)}ot.splice(0,ot.length,...t)},rt=[],Jn=t=>{try{localStorage.setItem("rummystore_videos",JSON.stringify(t))}catch(e){console.warn("saveMockVideos storage failed:",e)}rt.splice(0,rt.length,...t)}});var tn={};xe(tn,{mockApps:()=>Kn,mockBlogs:()=>Xn,mockNews:()=>Zn,mockSettings:()=>Yn,mockVideos:()=>Qn});var Kn,Yn,Zn,Xn,Qn,nn=H(()=>{Kn=[],Yn={logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",site_title:"Application Hub",meta_description:"",favicon_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},Zn=[{id:"vw78pxmf9",slug:"app-hub-is-live",title:"Application Hub is LIVE! The Ultimate App Portal is Here",logo_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",description:"Application Hub is officially published! We are bringing you the absolute best in hand-tested mobile entertainment. Read our launch update while our first wave of premium apps undergoes final verification!",description_html:`<!DOCTYPE html>
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
`,created_at:"2026-08-01T04:29:15.305Z",date:"2026-08-01T04:29:15.305Z",published_at:"2026-08-01T04:29:15.305Z",is_breaking:!1,is_new:!0,category:"Announcements",is_pinned:!1,updated_at:"2026-08-01T04:33:51.227Z",ceo_name:"The Editorial Team",ceo_description:"Editorial Board",seo_title:"Application Hub is LIVE - Premium App Directory & Reviews",seo_description:"Welcome to Application Hub! Explore our newly launched platform dedicated to neutral, hand-tested app reviews. Our verified app vault is opening very soon.",canonical_url:"https://www.example.com/notice/",og_image_url:"https://res.cloudinary.com/diewalae4/image/upload/v1785428224/ezgif-8cbbc4a0aaeb367e_s4k2nb.webp",target_region:"Global ",link:"https://www.example.com/app-hub-is-live"}],Xn=[],Qn=[]});var Pe=E(require("express")),an=E(require("compression")),on=E(require("cookie-parser")),rn=E(require("cors")),ln=E(require("helmet")),cn=E(require("path")),dn=E(require("fs"));var kt=E(require("express"));J();ee();var We=E(require("fs")),bt=E(require("path"));J();ee();var wt=bt.default.join(process.cwd(),"mock-2fa-state.json"),Sn=new Map;try{if(We.default.existsSync(wt)){let t=JSON.parse(We.default.readFileSync(wt,"utf8"));for(let[e,i]of Object.entries(t))Sn.set(e,i)}}catch(t){console.error("Failed to load mock 2FA file:",t)}var En=5,Tn=900*1e3,In=3600*1e3;async function _t(t){try{let e=O();if(e){let i=await e.collection("admin_rate_limits").doc(t).get();if(i.exists){let n=i.data(),s=Date.now();if(n&&n.lockedUntil>s)return{allowed:!1,lockedUntil:n.lockedUntil}}}}catch{}return{allowed:!0}}async function He(t){try{let e=O();if(e){let i=e.collection("admin_rate_limits").doc(t),n=await i.get(),s=Date.now();if(n.exists){let r=n.data();if(r&&s-r.windowStart>Tn)await i.set({count:1,windowStart:s,lockedUntil:0});else if(r){let a=(r.count||0)+1,l=a>=En?s+In:0;await i.update({count:a,lockedUntil:l})}}else await i.set({count:1,windowStart:s,lockedUntil:0})}}catch{}}var D=async(t,e,i)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token.",message:"Unauthorized: Missing verification token."});let s=n.split("Bearer ")[1];if(!s||s==="null"||s==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token.",message:"Unauthorized: Empty session verification token."});if(s.startsWith("ey"))try{let r="";if(O())r=(await require("firebase-admin").auth().verifyIdToken(s)).email||"";else{let c=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(c){let p=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:s})});p.ok&&(r=(await p.json())?.users?.[0]?.email||"")}}let l=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();return r&&r.toLowerCase().trim()===l?(t.adminUser={email:r.toLowerCase().trim()},i()):e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token.",message:"Unauthorized: Invalid Firebase token."})}try{let r=C();if(!r)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured.",message:"Encryption misconfigured."});let a=T(s,r);if(!a)return e.status(401).json({error:"Unauthorized: Invalid token.",message:"Unauthorized: Invalid token."});let l=JSON.parse(a);if(!l.admin||!l.email)return e.status(401).json({error:"Unauthorized: Malformed token.",message:"Unauthorized: Malformed token."});let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),c=String(l.email||"").toLowerCase().trim();if(c!==o)return e.status(403).json({error:"Unauthorized: Admin access required.",message:"Unauthorized: Admin access required."});let p=720*60*60*1e3,u=Number(l.exp)||0;if(u>0&&Date.now()>u+p)return e.status(401).json({error:"Unauthorized: Session expired.",message:"Unauthorized: Session expired."});if(u===0||Date.now()>u-3600*1e3)try{let y=JSON.stringify({admin:!0,email:c,exp:Date.now()+6048e5}),m=F(y,r);e.setHeader("X-Refreshed-Admin-Token",m),e.setHeader("Access-Control-Expose-Headers","X-Refreshed-Admin-Token")}catch{}return t.adminUser={email:c},i()}catch(r){return console.error("verifyAdminToken error:",r),e.status(401).json({error:"Unauthorized: Token verification failed.",message:"Unauthorized: Token verification failed."})}};async function qe(t,e){let i=!1,n="";try{let a=O();if(a){let l=await a.collection("admins_2fa").doc(t).get();if(l.exists){let o=l.data();o?.enabled&&(i=!0,n=o.secret)}}}catch(a){console.error("Failed to check 2FA status:",a)}if(!i)return{ok:!0};if(!e)return{mfaRequired:!0};let{authenticator:s}=require("otplib");return s.verify({token:e,secret:n})?{ok:!0}:{ok:!1,error:"Invalid 2FA code."}}var ge=E(require("otpauth"));function vt(){return new ge.Secret({size:20}).base32}function xt(t,e){return new ge.TOTP({issuer:"AdminVault",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Ge(t,e){try{return new ge.TOTP({issuer:"AdminVault",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(i){return console.error("TOTP verification error:",i),!1}}var V=kt.default.Router();V.post("/api/v1/admin/login",async(t,e)=>{let i=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=await _t(i);if(!n.allowed){let o=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${o} min.`})}let{email:s,password:r}=t.body??{};if(!s||!r)return await He(i),e.status(400).json({error:"Missing email or password."});let a=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),l=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!l)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(s.toLowerCase().trim()===a&&r===l){let o=t.body.code,c=await qe(a,o);if(c.mfaRequired)return e.json({mfaRequired:!0});if(!c.ok)return e.status(401).json({error:c.error});try{let p=C(),u=JSON.stringify({admin:!0,email:a,exp:Date.now()+864e5}),y=F(u,p);return e.json({token:y,email:a})}catch(p){return console.error("Login encryption error:",p),e.status(500).json({error:"Internal server error."})}}return await He(i),e.status(401).json({error:"Invalid email or password."})});V.post("/api/v1/admin/google-login",async(t,e)=>{let{idToken:i}=t.body??{};if(!i)return e.status(400).json({error:"Missing Firebase ID Token."});try{let n="";try{O()&&(n=(await require("firebase-admin").auth().verifyIdToken(i)).email||"")}catch(o){console.warn("Firebase Admin SDK verification failed, falling back to HTTPS lookup:",o)}if(!n)try{let c=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(c){let p=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${c}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:i})});p.ok&&(n=(await p.json())?.users?.[0]?.email||"")}}catch(o){console.error("Firebase accounts:lookup verification failed:",o)}if(!n)return e.status(401).json({error:"Unauthorized: Could not verify identity token."});let s=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(n.toLowerCase().trim()!==s)return e.status(403).json({error:`Unauthorized: ${n} is not configured as an administrator.`});let r=C(),a=JSON.stringify({admin:!0,email:n.toLowerCase().trim(),exp:Date.now()+864e5}),l=F(a,r);return e.json({token:l,email:n.toLowerCase().trim()})}catch(n){return console.error("Google login backend error:",n),e.status(500).json({error:"Authentication failed on server: "+(n.message||String(n))})}});V.post("/api/v1/admin/verify-session",async(t,e)=>{let i=String(t.headers.authorization||"");if(!i.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=i.split("Bearer ")[1];if(n.startsWith("ey"))try{let s="";if(O())s=(await require("firebase-admin").auth().verifyIdToken(n)).email||"";else{let o=z()?.apiKey||process.env.VITE_FIREBASE_API_KEY||process.env.FIREBASE_API_KEY;if(o){let c=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${o}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:n})});c.ok&&(s=(await c.json())?.users?.[0]?.email||"")}}let a=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase();if(s&&s.toLowerCase().trim()===a){let l=t.body.code,o=await qe(s.toLowerCase().trim(),l);return o.mfaRequired?e.json({mfaRequired:!0}):o.ok?e.json({ok:!0,email:s.toLowerCase().trim(),token:n}):e.status(401).json({error:o.error})}else return e.status(403).json({error:"Unauthorized: Admin access required."})}catch{return e.status(401).json({error:"Unauthorized: Invalid Firebase token."})}try{let s=C(),r=T(n,s);if(!r)return e.status(401).json({error:"Unauthorized: Invalid token."});let a=JSON.parse(r);if(!a.admin||!a.email)return e.status(401).json({error:"Unauthorized: Session expired."});let l=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),o=String(a.email||"").toLowerCase().trim();if(o!==l)return e.status(403).json({error:"Unauthorized: Admin access required."});let c=720*60*60*1e3,p=Number(a.exp)||0;if(p>0&&Date.now()>p+c)return e.status(401).json({error:"Unauthorized: Session expired."});let u=JSON.stringify({admin:!0,email:o,exp:Date.now()+10080*60*1e3}),y=F(u,s);return e.json({ok:!0,email:o,token:y})}catch(s){return e.status(401).json({error:"Service error: "+(s?.message||String(s))})}});V.post("/api/v1/admin/refresh-token",async(t,e)=>{let i=String(t.headers.authorization||""),n=t.body?.idToken||(i.startsWith("Bearer ")?i.split("Bearer ")[1]:"");if(!n||n==="null"||n==="undefined")return e.status(401).json({error:"Unauthorized: Missing token to refresh."});try{let s=C(),r=T(n,s);if(!r)return e.status(401).json({error:"Unauthorized: Invalid token signature."});let a=JSON.parse(r),l=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),o=String(a.email||"").toLowerCase().trim();if(!a.admin||o!==l)return e.status(403).json({error:"Unauthorized: Access denied."});let c=720*60*60*1e3,p=Number(a.exp)||0;if(p>0&&Date.now()>p+c)return e.status(401).json({error:"Unauthorized: Session expired beyond grace limit."});let u=JSON.stringify({admin:!0,email:o,exp:Date.now()+10080*60*1e3}),y=F(u,s);return e.json({success:!0,token:y,email:o})}catch(s){return e.status(401).json({error:"Failed to refresh token: "+(s?.message||String(s))})}});V.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:i}=t.body??{};if(!i)return e.status(400).json({error:"Missing email address."});let n=String(i).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(i){return console.error("2fa resend error:",i),e.status(500).json({error:"Failed to process 2FA resend request: "+i.message})}});V.get("/api/v1/admin/2fa/config",D,async(t,e)=>{let i=t.adminUser?.email?.toLowerCase().trim();if(!i)return e.status(400).json({error:"Missing admin email."});let n=!1,s="";try{let r=O();if(r){let a=await r.collection("admins_2fa").doc(i).get();if(a.exists){let l=a.data();n=l?.enabled===!0,s=l?.secret||""}}}catch(r){console.error("Error fetching Firestore 2FA config with Admin SDK:",r)}if(n)return e.json({enabled:!0});{let r=vt(),a=xt(i,r);return e.json({enabled:!1,tempSecret:r,qrCodeUri:a})}});V.post("/api/v1/admin/2fa/enable",D,async(t,e)=>{let i=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:s}=t.body||{};if(!i||!n||!s)return e.status(400).json({error:"Missing required fields (email, secret, code)."});if(!Ge(s,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});try{let r=O();if(r)await r.collection("admins_2fa").doc(i).set({enabled:!0,secret:n});else return e.status(503).json({error:"Service Unavailable: Firebase Admin SDK not configured."})}catch(r){return console.error("Firestore save 2FA exception:",r),e.status(500).json({error:"Server database write error."})}return e.json({success:!0})});V.post("/api/v1/admin/2fa/disable",D,async(t,e)=>{let i=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!i||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let s="";try{let r=O();if(r){let a=await r.collection("admins_2fa").doc(i).get();if(a.exists){let l=a.data();l?.enabled===!0&&(s=l?.secret||"")}}}catch(r){console.error("Firestore 2FA config fetch fail on disable:",r)}if(!s)return e.status(400).json({error:"2FA is not currently enabled."});if(!Ge(n,s))return e.status(400).json({error:"Invalid verification code."});try{let r=O();r&&await r.collection("admins_2fa").doc(i).delete()}catch(r){return console.error("Firestore delete 2FA exception:",r),e.status(500).json({error:"Server database delete error."})}return e.json({success:!0})});var At=E(require("express"));var Ce=At.default.Router();Ce.post("/api/github-sync/test",D,async(t,e)=>{try{let{owner:i,repo:n,token:s}=t.body||{},r=s||process.env.PAT;if(!i||!n||!r)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let a=r.trim(),l=a.toLowerCase().startsWith("ghp_")?`token ${a}`:`Bearer ${a}`,o=await fetch(`https://api.github.com/repos/${i.trim()}/${n.trim()}`,{headers:{Authorization:l,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(o.ok){let c=await o.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${c.full_name}`,permissions:c.permissions})}else{let c=await o.json().catch(()=>({})),p="";return o.status===401||o.status===403?p=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:o.status===404&&(p=`

\u{1F4A1} Tip: Repository not found (or your token lacks permissions to see it). Double check that the Owner and Repository Name are spelled exactly right (e.g. Dex, not Dez), and that your Personal Access Token has access to this repository.`),e.status(o.status).json({ok:!1,message:(c.message||"Failed to connect to repository")+p})}}catch(i){return console.error("GitHub Test Connection error:",i),e.status(500).json({message:i.message||"Internal server error"})}});Ce.post("/api/github-sync/commit",D,async(t,e)=>{try{let{owner:i,repo:n,token:s,branch:r,path:a,content:l,message:o}=t.body||{},c=s||process.env.PAT;if(!i||!n||!c||!a||!l)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let p=r?r.trim():"main",u=a.replace(/^\/+/g,""),y=i.trim(),m=c.trim(),d=n.trim(),h=m.toLowerCase().startsWith("ghp_")?`token ${m}`:`Bearer ${m}`,f=await(async _=>{let g=_,b="",v="";try{let $=await fetch(`https://api.github.com/repos/${y}/${g}/contents/${u}?ref=${encodeURIComponent(p)}&_t=${Date.now()}`,{headers:{Authorization:h,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if($.ok){let R=await $.json();R&&!Array.isArray(R)&&R.sha&&(b=R.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${b}`))}else if($.status===404){console.log(`GitHub Sync Server: File not found on branch "${p}". Attempting default branch fallback...`);let R=await fetch(`https://api.github.com/repos/${y}/${g}/contents/${u}?_t=${Date.now()}`,{headers:{Authorization:h,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(R.ok){let A=await R.json();A&&!Array.isArray(A)&&A.sha&&(b=A.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${b}`))}else if(R.status!==404){let A=await R.json().catch(()=>({})),W="";A.message&&(A.message.toLowerCase().includes("resource not accessible")||A.message.toLowerCase().includes("permission")||R.status===403)&&(W=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+g+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+y+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),v=`Default branch lookup failed with status ${R.status}: ${A.message||"Unknown error"}${W}`}}else{let R=await $.json().catch(()=>({})),A="";R.message&&(R.message.toLowerCase().includes("resource not accessible")||R.message.toLowerCase().includes("permission")||$.status===403)&&(A=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+g+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+y+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),v=`Target branch lookup failed with status ${$.status}: ${R.message||"Unknown error"}${A}`}}catch($){console.error("GitHub SHA Fetch error on Server:",$),v=`Network error fetching repository contents on server: ${$.message||$}`}if(v&&!b)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${v}

Please check your Repository config and Token permissions.`};let x=Buffer.from(l,"utf8").toString("base64"),k={message:o||"Admin Release Sync: Static file update",content:x,branch:p,...b?{sha:b}:{}};console.log(`GitHub Sync Server: Initiating commit for ${u} to ${g}...`);let I=await fetch(`https://api.github.com/repos/${y}/${g}/contents/${u}`,{method:"PUT",headers:{Authorization:h,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(k)});if(!I.ok){let $=await I.text(),R=$;try{let W=JSON.parse($);R=W.message||W.error?.message||$}catch{}let A="";return R.toLowerCase().includes("not found")?A=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+g+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:(R.toLowerCase().includes("credentials")||I.status===401)&&(A=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!A&&(R.toLowerCase().includes("resource not accessible")||R.toLowerCase().includes("permission")||I.status===403)&&(A=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+g+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+y+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:I.status,error:R+A}}return{success:!0,result:await I.json(),finalRepo:g}})(d);return f.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${f.finalRepo}"!`,f.result?.commit?.sha),e.json({...f.result,message:`Successfully published to ${f.finalRepo} repository.`,targetRepo:f.finalRepo})):e.status(f.status||400).json({message:f.error})}catch(i){return console.error("Server GitHub commit handler error:",i),e.status(500).json({message:`Internal server error during GitHub sync: ${i.message||i}`})}});var Pt=E(require("express")),ie=E(require("path")),se=E(require("fs"));var Xe=E(require("fs")),Qe=E(require("path"));var ye=E(require("fs")),Oe=E(require("path")),Fn=()=>{try{let t=Oe.default.join(process.cwd(),"src/lib/staticData");return require(t)}catch{return{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}};async function Nt(){console.log("CALLED syncFromFirestore");try{let t=Fn(),e={apps:t.mockApps||[],settings:t.mockSettings||{},news:t.mockNews||[],blogs:t.mockBlogs||[],videos:t.mockVideos||[]},i=Oe.default.join(process.cwd(),"src/lib/public_backup.json");if(ye.default.existsSync(i))try{let o=JSON.parse(ye.default.readFileSync(i,"utf8"));o&&(Array.isArray(o.apps)&&(e.apps=o.apps),o.settings&&Object.keys(o.settings).length>0&&(e.settings=o.settings),Array.isArray(o.news)&&(e.news=o.news),Array.isArray(o.blogs)&&(e.blogs=o.blogs),Array.isArray(o.videos)&&(e.videos=o.videos))}catch(o){console.warn("[SYNC] Error reading public_backup.json:",o)}let n=e.apps||[],s=e.settings||{},r=e.news||[],a=e.blogs||[],l=e.videos||[];try{let{getFirebaseAdminDb:o}=(ee(),me(yt)),c=o();if(c){let p=await c.collection("store_data").doc("news").get();p.exists&&Array.isArray(p.data()?.items)&&p.data().items.length>0&&(r=p.data().items);let u=await c.collection("store_data").doc("blogs").get();u.exists&&Array.isArray(u.data()?.items)&&u.data().items.length>0&&(a=u.data().items);let y=await c.collection("store_data").doc("videos").get();y.exists&&Array.isArray(y.data()?.items)&&y.data().items.length>0&&(l=y.data().items);let m=await c.collection("store_data").doc("public_settings").get();if(m.exists){let h=m.data();h&&Object.keys(h).length>0&&(s={...s,...h,banners:Array.isArray(h.banners)&&h.banners.length>0?h.banners:s.banners||[],categories:Array.isArray(h.categories)&&h.categories.length>0?h.categories:s.categories||[],quick_links:Array.isArray(h.quick_links)&&h.quick_links.length>0?h.quick_links:s.quick_links||[],website_faqs:Array.isArray(h.website_faqs)&&h.website_faqs.length>0?h.website_faqs:s.website_faqs||[],developers:Array.isArray(h.developers)&&h.developers.length>0?h.developers:s.developers||[]})}let d=await c.collection("store_data").doc("apps_meta").get();if(d.exists){let h=d.data()?.numChunks||1,w=[];for(let f=0;f<h;f++){let _=await c.collection("store_data").doc(`apps_chunk_${f}`).get();_.exists&&Array.isArray(_.data()?.items)&&w.push(..._.data().items)}w.length>0&&(n=w)}try{let h=[];if(!d.exists&&n.length>0){let f=Math.ceil(n.length/25)||1;for(let _=0;_<f;_++){let g=JSON.parse(JSON.stringify(n.slice(_*25,(_+1)*25)));g.forEach(b=>{delete b.more_information_url,delete b.encrypted_download_url,delete b.download_url}),h.push(c.collection("store_data").doc(`apps_chunk_${_}`).set({items:g}))}h.push(c.collection("store_data").doc("apps_meta").set({numChunks:f,last_updated:new Date().toISOString()}))}!m.exists&&s&&Object.keys(s).length>0&&h.push(c.collection("store_data").doc("public_settings").set(JSON.parse(JSON.stringify(s)),{merge:!0})),!p.exists&&r.length>0&&h.push(c.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(r))})),!u.exists&&a.length>0&&h.push(c.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(a))})),!y.exists&&l.length>0&&h.push(c.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(l))})),h.length>0&&(await Promise.all(h),console.log("[SYNC] Successfully initialized Cloud Firestore with local backup data."))}catch(h){console.warn("[SYNC] Could not auto-push Admin data to Firestore:",h.message||h)}}}catch(o){console.warn("[SYNC] Admin DB sync attempt failed:",o.message||o)}try{ye.default.writeFileSync(i,JSON.stringify({apps:n,settings:s,news:r,blogs:a,videos:l},null,2),"utf8");try{let{generateStaticDataFileCode:o}=(Ze(),me(Ye)),c=o(n,s,r,a,l);ye.default.writeFileSync(Oe.default.join(process.cwd(),"src/lib/staticData.ts"),c,"utf8")}catch{}}catch{}return{apps:n,settings:s,news:r,blogs:a,videos:l}}catch(t){return console.error("Error in syncFromFirestore:",t),null}}function S(t,e,i=""){if(!t)return i;let n=t[e];return n==null?i:typeof n=="object"?"stringValue"in n?n.stringValue??i:"integerValue"in n?String(n.integerValue)??i:"booleanValue"in n?String(n.booleanValue)??i:i:String(n)}function Mn(t,e="https://www.rummydex.com"){return t?t.startsWith("http://")||t.startsWith("https://")||t.startsWith("data:")?t:`${e}${t.startsWith("/")?"":"/"}${t}`:""}function Ne(t,e="https://www.rummydex.com"){if(!t)return"";let i=Mn(t,e);return i.includes("res.cloudinary.com")&&i.includes("/upload/")&&(i.includes("f_webp")||i.includes("f_auto")?i=i.replace(/f_webp|f_auto/,"f_jpg"):i.includes("f_jpg")||(i=i.replace("/upload/","/upload/f_jpg,q_auto/"))),i}Je();var zt=()=>{try{let t=Qe.default.join(process.cwd(),"src/lib/staticData");return require(t)}catch{return{mockApps:[],mockSettings:{},mockNews:[],mockBlogs:[],mockVideos:[]}}},we=zt(),fs=we.mockApps||[],ys=we.mockSettings||{},ws=we.mockNews||[],bs=we.mockBlogs||[],_s=we.mockVideos||[],oe=null,re=0,$t=15e3,$e=!1;function Lt(){oe=null,re=0}async function jt(){let t=Date.now(),e=zt(),i=await Nt();if(i&&Array.isArray(i.apps)&&i.apps.length>0)return oe=i,re=t,i;let n=Qe.default.join(process.cwd(),"src/lib/public_backup.json");if(Xe.default.existsSync(n))try{let r=JSON.parse(Xe.default.readFileSync(n,"utf8")),a={apps:r.apps||[],settings:r.settings||{},news:Array.isArray(r.news)?r.news:[],blogs:Array.isArray(r.blogs)?r.blogs:[],videos:Array.isArray(r.videos)?r.videos:[]};return oe=a,re=t,a}catch(r){console.error("Error reading public_backup.json in seoHelper:",r)}let s={apps:e.mockApps||[],settings:e.mockSettings||{},news:e.mockNews||[],blogs:e.mockBlogs||[],videos:e.mockVideos||[]};return oe=s,re=t,s}async function ne(){let t=Date.now(),e=t-re>$t,i=t-re>$t*15;return oe&&!i?(e&&!$e&&($e=!0,jt().then(()=>{$e=!1}).catch(n=>{$e=!1,console.warn("Background store fetch failed safely:",n)})),oe):await jt()}var G=Pt.default.Router();G.get(["/site.webmanifest","/manifest.json"],(t,e,i)=>{let n=ie.default.join(process.cwd(),"public","site.webmanifest"),s=ie.default.join(process.cwd(),"dist","site.webmanifest"),r=se.default.existsSync(s)?s:se.default.existsSync(n)?n:null;return r?(e.set({"Content-Type":"application/manifest+json; charset=utf-8","Cache-Control":"public, max-age=86400, stale-while-revalidate=43200"}),e.sendFile(r)):i()});G.get(["/llms.txt"],(t,e,i)=>{let n=ie.default.join(process.cwd(),"public","llms.txt"),s=ie.default.join(process.cwd(),"dist","llms.txt"),r=se.default.existsSync(s)?s:se.default.existsSync(n)?n:null;return r?(e.set({"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=86400"}),e.sendFile(r)):i()});G.get(["/favicon.ico","/favicon.png","/favicon.webp","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,i)=>{let n=t.path.replace(/^\//,""),s=ie.default.join(process.cwd(),"public",n),r=ie.default.join(process.cwd(),"dist",n),a=se.default.existsSync(r)?r:se.default.existsSync(s)?s:null;try{let l="",o="";try{let y=await ne();y&&y.settings&&(l=y.settings.favicon_url&&y.settings.favicon_url.trim()||"",o=y.settings.logo_url&&y.settings.logo_url.trim()||"")}catch(y){console.warn("Could not retrieve store settings for favicon, using default fallback:",y)}let c=y=>y?y.includes("ezgif-64180dd8ca74703b")||y.includes("1000132678_1_ro1ftj")||y.includes("v1785720339"):!0,p=["favicon-16x16.png","favicon-32x32.png","favicon.ico","apple-touch-icon.png","apple-touch-icon-precomposed.png"].includes(n);if(a&&(p||c(l))){let y=n.endsWith(".ico")?"image/x-icon":n.endsWith(".webp")?"image/webp":"image/png";return e.set({"Content-Type":y,"Cache-Control":"public, max-age=31536000, immutable","Content-Disposition":`inline; filename="${n}"`}),e.sendFile(a)}let u=(c(l)?null:l)||(c(o)?null:o)||"https://res.cloudinary.com/diewalae4/image/upload/v1785720339/1000132678_1_ro1ftj.png";try{let y=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(y.ok){let m=await y.arrayBuffer(),d=Buffer.from(m),h=y.headers.get("content-type")||"",w="image/png";return d.length>=12&&d[8]===87&&d[9]===69&&d[10]===66&&d[11]===80?w="image/webp":d.length>=4&&d[0]===137&&d[1]===80&&d[2]===78&&d[3]===71?w="image/png":d.length>=4&&d[0]===0&&d[1]===0&&d[2]===1&&d[3]===0?w="image/x-icon":d.length>=3&&d[0]===255&&d[1]===216&&d[2]===255?w="image/jpeg":d.toString("utf8",0,Math.min(100,d.length)).includes("<svg")?w="image/svg+xml":h&&(w=h.split(";")[0].trim()),e.set("Content-Type",w),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),e.status(200).send(d)}else return a?(e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),e.sendFile(a)):(e.set("Cache-Control","public, max-age=3600"),e.redirect(302,u))}catch{return a?(e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),e.sendFile(a)):e.redirect(302,u)}}catch{if(a)return e.sendFile(a)}return i()});G.get(["/rss.xml","/rss","/feed","/feed.xml"],async(t,e)=>{try{let i=process.env.PUBLIC_DOMAIN||process.env.VITE_PUBLIC_DOMAIN||(t.get("host")?`https://${t.get("host")}`:"https://www.rummydex.com");!i.startsWith("http://")&&!i.startsWith("https://")&&(i=`https://${i}`);let n=i.replace(/\/$/,""),s=await ne().catch(()=>null),{apps:r=[],news:a=[],blogs:l=[]}=s||{},o=u=>(typeof u!="string"&&(u=String(u||"")),u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")),c="";for(let u of(a||[]).slice(0,15)){let y=S(u,"title"),m=S(u,"slug"),d=S(u,"excerpt")||S(u,"summary")||S(u,"content")||y,h=S(u,"created_at")||S(u,"published_at")||new Date().toISOString(),w=new Date(h).toUTCString();if(y&&m){let f=`${n}/news/${encodeURI(m.trim().replace(/^\/+|\/+$/g,""))}`;c+=`
    <item>
      <title>${o(y)}</title>
      <link>${o(f)}</link>
      <guid isPermaLink="true">${o(f)}</guid>
      <description>${o(d)}</description>
      <pubDate>${w}</pubDate>
    </item>`}}for(let u of(l||[]).slice(0,10)){let y=S(u,"title"),m=S(u,"slug"),d=S(u,"excerpt")||S(u,"summary")||y,h=S(u,"created_at")||new Date().toISOString(),w=new Date(h).toUTCString();if(y&&m){let f=`${n}/blog/${encodeURI(m.trim().replace(/^\/+|\/+$/g,""))}`;c+=`
    <item>
      <title>${o(y)}</title>
      <link>${o(f)}</link>
      <guid isPermaLink="true">${o(f)}</guid>
      <description>${o(d)}</description>
      <pubDate>${w}</pubDate>
    </item>`}}for(let u of(r||[]).slice(0,10)){let y=S(u,"name"),m=S(u,"slug"),d=S(u,"short_description")||S(u,"description")||y,h=S(u,"updated_at")||S(u,"created_at")||new Date().toISOString(),w=new Date(h).toUTCString();if(y&&m){let f=`${n}/${encodeURI(m.trim().replace(/^\/+|\/+$/g,""))}`;c+=`
    <item>
      <title>${o(y)} - Download APK &amp; Play</title>
      <link>${o(f)}</link>
      <guid isPermaLink="true">${o(f)}</guid>
      <description>${o(d)}</description>
      <pubDate>${w}</pubDate>
    </item>`}}let p=`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>RummyDex News &amp; Latest Rummy Apps</title>
    <link>${n}</link>
    <description>Latest Rummy applications, card game news, updates, and reviews on RummyDex.</description>
    <language>en-IN</language>
    <atom:link href="${n}/rss.xml" rel="self" type="application/rss+xml" />
    ${c}
  </channel>
</rss>`;return e.set({"Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"}),e.status(200).send(p)}catch(i){console.error("RSS feed generation error:",i),e.status(500).type("text/plain").send("Error generating RSS feed")}});G.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),s=!1;if(n.includes("masterworld")&&(s=!0),s){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let r=process.env.PUBLIC_DOMAIN||process.env.VITE_PUBLIC_DOMAIN||(t.get("host")?`https://${t.get("host")}`:"https://www.rummydex.com");!r.startsWith("http://")&&!r.startsWith("https://")&&(r=`https://${r}`);let l=`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/
Disallow: /s/

Sitemap: ${r.replace(/\/$/,"")}/sitemap.xml
`;e.set("Content-Type","text/plain"),e.send(l)}catch{e.set("Content-Type","text/plain"),e.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /login/

Sitemap: https://www.rummydex.com/sitemap.xml
`)}});G.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{if((t.get("host")||"").toLowerCase().includes("masterworld")){e.status(404).send("Not Found");return}let s=await ne();if(!s)throw new Error("Unable to fetch store data");let{apps:r=[],news:a=[],blogs:l=[],videos:o=[]}=s,c=process.env.PUBLIC_DOMAIN||process.env.VITE_PUBLIC_DOMAIN||(t.headers.host?`https://${t.headers.host}`:"https://www.rummydex.com");!c.startsWith("http://")&&!c.startsWith("https://")&&(c=`https://${c}`);let p=c.replace(/\/$/,""),u=`<?xml version="1.0" encoding="UTF-8"?>
`;u+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;let y=new Date().toISOString().split("T")[0],m=g=>(typeof g!="string"&&(g=String(g||"")),g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")),d=g=>g?m(encodeURI(g.trim().replace(/^\/+|\/+$/g,""))):"",h=g=>{let b=S(g,"updated_at")||S(g,"created_at")||S(g,"published_at")||S(g,"date");if(b)try{if(typeof b=="object"&&b!==null&&b.seconds)return new Date(b.seconds*1e3).toISOString().split("T")[0];if(typeof b=="object"&&b!==null&&b._seconds)return new Date(b._seconds*1e3).toISOString().split("T")[0];let v=new Date(b);if(!isNaN(v.getTime()))return v.toISOString().split("T")[0]}catch{}return null},w=new Set,f=(g,b,v,x,k,I)=>{if(!w.has(g)){w.add(g);let N=`  <url>
    <loc>${g}</loc>
`;b&&(N+=`    <lastmod>${b}</lastmod>
`),v&&(N+=`    <changefreq>${v}</changefreq>
`),x&&(N+=`    <priority>${x}</priority>
`),k&&(N+=`    <image:image>
      <image:loc>${m(k)}</image:loc>
`,I&&(N+=`      <image:title>${m(I)}</image:title>
`),N+=`    </image:image>
`),N+=`  </url>
`,u+=N}},_=[{path:"/",priority:"1.0",changefreq:"daily"},{path:"/new-apps",priority:"0.9",changefreq:"daily"},{path:"/news",priority:"0.8",changefreq:"daily"},{path:"/about",priority:"0.5",changefreq:"monthly"},{path:"/developers",priority:"0.5",changefreq:"monthly"},{path:"/contact",priority:"0.5",changefreq:"monthly"},{path:"/privacy",priority:"0.3",changefreq:"monthly"},{path:"/report-removal",priority:"0.3",changefreq:"monthly"},{path:"/terms",priority:"0.3",changefreq:"monthly"},{path:"/responsibility",priority:"0.3",changefreq:"monthly"},{path:"/notice",priority:"0.3",changefreq:"monthly"},{path:"/ethics",priority:"0.3",changefreq:"monthly"},{path:"/disclaimer",priority:"0.3",changefreq:"monthly"}];o&&Array.isArray(o)&&o.length>0&&_.splice(3,0,{path:"/videos",priority:"0.7",changefreq:"weekly"});for(let g of _)f(`${p}${g.path}`,null,g.changefreq,g.priority);for(let g of r){let b=S(g,"slug");if(b){let v=d(b),x=h(g),k=Ne(S(g,"og_image_url")||S(g,"icon_url")),I=S(g,"name"),N=`${p}/app/${v}`;f(N,x,"daily","0.9",k,I)}}if(l&&Array.isArray(l)&&l.length>0){f(`${p}/blogs`,null,"daily","0.8");for(let g of l){let b=S(g,"slug");if(b){let v=d(b);f(`${p}/blog/${v}`,h(g),"weekly","0.7",S(g,"cover_url")||S(g,"image_url"),S(g,"title"))}}}for(let g of r){let b=S(g,"slug");if(b){let v=d(b),x=h(g);f(`${p}/s/${v}`,x,"weekly","0.8"),f(`${p}/info/${v}`,x,"monthly","0.6"),f(`${p}/moreinfo/${v}`,x,"monthly","0.6"),f(`${p}/moredetail/${v}`,x,"monthly","0.6")}}for(let g of a){let b=S(g,"slug");if(b){let v=d(b),x=`${p}/news/${v}`;f(x,h(g),"weekly","0.8")}}for(let g of o||[]){let b=S(g,"slug");if(b){let v=d(b),x=`${p}/videos/${v}`;f(x,h(g),"weekly","0.6")}}u+=`</urlset>
`,e.set("Content-Type","application/xml; charset=utf-8"),e.set("Cache-Control","public, max-age=3600, stale-while-revalidate=86400"),e.send(u)}catch(i){console.error("Sitemap Generation Error:",i),e.status(500).send("Error generating sitemap")}});G.get("/api/v1/debug-seo",async(t,e)=>{try{let i=await ne();e.json({hasData:!!i,hasSettings:!!i?.settings,settingsKeys:Object.keys(i?.settings||{})})}catch(i){e.json({error:i.message})}});var sn=E(require("express")),B=E(require("fs")),ue=E(require("path"));J();ee();var be=E(require("crypto")),Vt=E(require("dns"));Ae();var je=new Map,Y=async(t,e=gt,i=ht)=>{try{let n=Date.now(),s=je.get(t);if((!s||n>s.resetTime)&&(s={count:0,resetTime:n+i}),s.count++,je.set(t,s),Math.random()<.01)for(let[r,a]of je.entries())n>a.resetTime&&je.delete(r);return s.count>e}catch{return!0}};function U(t){return t.ip||t.socket?.remoteAddress||"unknown"}function Ft(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let i=[];for(let n of e){let s;if(n.toLowerCase().startsWith("0x")?s=parseInt(n,16):n.startsWith("0")&&n.length>1?s=parseInt(n,8):s=parseInt(n,10),isNaN(s)||s<0||s>255)return null;i.push(s)}if(e.length===1){let n=i[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=i[0],s=i[1];return s>16777215?null:[n,s>>>16&255,s>>>8&255,s&255]}else if(e.length===3){let n=i[0],s=i[1],r=i[2];return r>65535?null:[n,s,r>>>8&255,r&255]}return i}function Mt(t){let[e,i,n]=t;return e===127||e===10||e===172&&i>=16&&i<=31||e===192&&i===168||e===169&&i===254||e===0||e===100&&i>=64&&i<=127||e===192&&i===0&&n===0||e===192&&i===0&&n===2||e===198&&i>=18&&i<=19||e===198&&i===51&&n>=100&&n<=103||e===203&&i===0&&n===113||e>=224&&e<=239||e>=240}async function Wt(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let i=e.hostname.toLowerCase(),n=Ft(i);if(n&&Mt(n)||i==="[::1]"||i==="::1"||i.startsWith("[fc00")||i.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(i)||i.endsWith(".local")||i.endsWith(".internal"))return!1;try{let r=await Vt.default.promises.lookup(i,{all:!0});for(let a of r){let l=a.address,o=Ft(l);if(o&&Mt(o)||l==="::1"||l.startsWith("fc00:")||l.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var Ut=new Map;var Bt=new Map;setInterval(()=>{let t=Date.now();for(let[e,i]of Ut.entries())i.expiresAt<t&&Ut.delete(e);for(let[e,i]of Bt.entries())i.expiresAt<t&&Bt.delete(e)},3e4);function Ht(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let i=be.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",i,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0,path:"/"}),i}return t.cookies["__Host-sid"]}function qt(t,e,i,n){let r=Math.floor(Date.now()/1e3)+1800,a=`${t}|${e}|${i}|${n}|${r}`,l=be.default.createHmac("sha256",Me).update(a).digest("hex");return Buffer.from(`${a}::${l}`).toString("base64url")}function ze(t,e,i,n,s){try{let r=Buffer.from(t,"base64url").toString("utf8"),[a,l]=r.split("::");if(!a||!l)return!1;let o=a.split("|");if(o.length!==5)return!1;let[c,p,u,y,m]=o;if(y!==s)return console.warn(`[SECURITY] Token appId mismatch: expected ${s}, got ${y}`),!1;if(c!==e)return console.warn(`[SECURITY] Token IP mismatch: expected ${e}, got ${c}`),!1;if(p!==i)return console.warn("[SECURITY] Token session mismatch"),!1;if(n&&u!==n)return console.warn("[SECURITY] Token fingerprint mismatch"),!1;if(Math.floor(Date.now()/1e3)>parseInt(m,10))return console.warn("[WARN] Signature expired."),!1;let d=be.default.createHmac("sha256",Me).update(a).digest("hex");return be.default.timingSafeEqual(Buffer.from(l,"hex"),Buffer.from(d,"hex"))}catch{return!1}}var Gt=E(require("express")),ce=E(require("crypto"));var le="U2FsdGVkX19aMEo5JIhfa86Wlzc7acf/vMJEBABB99XC1A/1xR932zFIlptK336fa+aHcx6aaZCdhTaqVn3tSQJPu3PwXifjWdxHHJGGSd2f0LlWOlPdTUWB9K7AbVlTvatvaG9EGaK3i21GpGWc/A4R+Ttk9it3erbWt4idjbK8cyYKp6JuOJfqqAI0SydXYKl5LTPwinGICpXU2PSbtuxHQ8tN9a8DxtfU62gud+xCe5weJLOk8bbzs0KtCJAwlRfFPF8KgpSio5/LzmisUmVm2cC8xWvpq5YLsSzgqVs=";J();ee();var de=Gt.default.Router();de.get("/api/v1/_chal",(t,e)=>{let i=Ht(t,e),n=ce.default.randomBytes(8).toString("hex"),s="0000",r=Date.now()+6e5,a=C(),l=ce.default.createHmac("sha256",a).update(`${n}:${i}:${s}:${r}`).digest("hex").substring(0,16),o=`${n}.${r}.${l}`;e.setHeader("X-Session-ID",i),e.json({nonce:o,difficulty:s,sid:i})});de.post("/api/v1/_proc",async(t,e)=>{let{nonce:i,solution:n,fingerprint:s,appId:r,sid:a}=t.body,l=U(t),o=t.cookies?.["__Host-sid"]||a;if(!i||n===void 0||!s||!r||!o)return console.warn(`[SECURITY] Missing context in _proc: sid=${!!o}, nonce=${!!i}`),e.status(400).json({error:"Incomplete security context"});let c=i.split(".");if(c.length!==3)return e.status(403).json({error:"Challenge invalid format"});let[p,u,y]=c,m="0000",d=C(),h=ce.default.createHmac("sha256",d).update(`${p}:${o}:${m}:${u}`).digest("hex").substring(0,16);if(y!==h){console.warn(`[SECURITY] Signature mismatch for SID: ${o}. Checking fallbacks...`);let _=ce.default.createHmac("sha256",d).update(`${p}:${m}:${u}`).digest("hex").substring(0,16);if(y!==_)return e.status(403).json({error:"Challenge invalid or tampered"})}if(Date.now()>Number(u))return e.status(403).json({error:"Challenge expired"});if(!ce.default.createHash("sha256").update(i+n).digest("hex").startsWith(m))return e.status(403).json({error:"Integrity check failed"});let f=qt(l,o,s,r);e.json({token:f})});de.get("/api/v1/link-check",async(t,e)=>{let i=t.query.id;if(!i)return e.json({configured:!1});try{let n=le;if(!n)return e.json({configured:!1});let s=process.env.AES_SECRET||"",r=T(n,s);if(!r)return e.json({configured:!1});let a=JSON.parse(r),l=!1;if(Array.isArray(a))l=a.some(o=>o.id===i&&(o.url||o.more_information_url));else{let o=a[i];l=!!(typeof o=="string"?o:o?.url||o?.more_information_url)}return e.json({configured:l})}catch{return e.json({configured:!1})}});var L=new Map,Bn=900*1e3;function et(t){t?L.delete(t.toLowerCase()):L.clear()}de.get("/api/v1/moreinfo-resolve",async(t,e)=>{let i=t.query.token||t.query.t,n=t.query.id,s=U(t),r=t.cookies?.["__Host-sid"]||t.query.sid,a=t.query.fp;if(!i||!n)return console.warn(`[SECURITY] Bot or direct request missing parameters for appId: ${n}`),e.status(404).send("<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>");if(!ze(i,s,r||"",a||"",n))return console.warn(`[SECURITY] Anti-bot blocked unverified token attempt for appId: ${n} from IP: ${s}`),e.status(404).send("<h1>404 Not Found</h1><p>The requested URL was not found on this server.</p>");let l=[n.toLowerCase(),n.trim().toLowerCase()];for(let o of l){let c=L.get(o);if(c&&Date.now()-c.timestamp<Bn)return console.log(`[SECURITY] Memory cache hit (<2ms) for appId: ${n}`),e.redirect(302,c.url)}try{let o="",c=C(),p=n,u=n;try{let d=(await ne())?.apps||[],h=n.toLowerCase().trim().replace(/[-_ ]+$/,""),w=d.find(f=>{let _=(f.id||"").toLowerCase().trim(),g=(f.slug||"").toLowerCase().trim(),b=g.replace(/[-_ ]+$/,"");return _===h||g===h||b===h||g===n.toLowerCase().trim()||b===n.toLowerCase().trim()});if(w){p=w.id||n,u=w.slug||n;let f=w.more_information_url||w.download_url||w.encrypted_link||w.url;if(f&&typeof f=="string"){let _=f.startsWith("U2FsdGVkX1")?T(f,c):f;if(_&&_.startsWith("http")){console.log(`[SECURITY] Resolved link directly from storeData for ${n}`);let g={url:_,timestamp:Date.now()};return L.set(n.toLowerCase(),g),L.set(p.toLowerCase(),g),L.set(u.toLowerCase(),g),e.redirect(302,_)}}}}catch(m){console.warn("[SECURITY] Store data fetch failed during resolve:",m)}let y=le;if(y){let m=T(y,c);if(m){let d=JSON.parse(m),h="";if(Array.isArray(d)){let w=d.find(f=>f.id===p||f.slug===u||f.id===n||f.slug===n);h=w?.more_information_url||w?.url||""}else{let w=d[p]||d[u]||d[n];h=typeof w=="string"?w:w?.more_information_url||w?.url||""}h&&(o=h.startsWith("U2FsdGVkX1")?T(h,c):h)}}if(!o)try{let m=O();if(m){let d=["sec_links_vault_3","sec_vault","secure_links"];for(let h of d){let w=await m.collection("store_data").doc(h).get();if(w.exists){let f=w.data(),_=f?.encryptedData||f?.encrypted_links;if(_){let g=T(_,c);if(g){let b=JSON.parse(g),v="";if(Array.isArray(b)){let x=b.find(k=>k.id===p||k.slug===u||k.id===n||k.slug===n);v=x?.more_information_url||x?.url||""}else{let x=b[p]||b[u]||b[n];v=typeof x=="string"?x:x?.more_information_url||x?.url||""}if(v&&(o=v.startsWith("U2FsdGVkX1")?T(v,c):v,o))break}}}}}}catch{}if(o&&o.startsWith("http")){let m={url:o,timestamp:Date.now()};return L.set(n.toLowerCase(),m),L.set(p.toLowerCase(),m),L.set(u.toLowerCase(),m),e.redirect(302,o)}try{let m=O();if(m){let d=await m.collection("app_secure_links").doc(p).get();if(!d.exists&&n!==p&&(d=await m.collection("app_secure_links").doc(n).get()),!d.exists){let w=m.collection("apps"),f=Array.from(new Set([n,p,n.toLowerCase(),p.toLowerCase()])),_=await w.where("slug","in",f).limit(1).get();if(!_.empty){let g=_.docs[0].id;d=await m.collection("app_secure_links").doc(g).get()}}if(d.exists){let w=d.data(),f=w?.more_information_url||w?.encrypted_link;if(f){let _=T(f,c);if(_&&_.startsWith("http")){let g={url:_,timestamp:Date.now()};return L.set(n.toLowerCase(),g),L.set(p.toLowerCase(),g),e.redirect(302,_)}else if(f.startsWith("http")){let g={url:f,timestamp:Date.now()};return L.set(n.toLowerCase(),g),L.set(p.toLowerCase(),g),e.redirect(302,f)}}}let h=Array.from(new Set([p,n]));for(let w of h){let f=await m.collection("apps").doc(w).get();if(f.exists){let _=f.data(),g=_?.more_information_url||_?.download_url||_?.encrypted_link||_?.url;if(g&&typeof g=="string"){let b=g.startsWith("U2FsdGVkX1")?T(g,c):g;if(b&&b.startsWith("http")){let v={url:b,timestamp:Date.now()};return L.set(n.toLowerCase(),v),L.set(p.toLowerCase(),v),e.redirect(302,b)}}}}}else{let d=z();if(d&&d.projectId){let h=d.apiKey?`?key=${d.apiKey}`:"",w=`https://firestore.googleapis.com/v1/projects/${d.projectId}/databases/${d.firestoreDatabaseId||"(default)"}/documents/app_secure_links/${p}${h}`,f=await fetch(w);if(f.ok){let b=await f.json(),v=q(b.fields),x=v.more_information_url||v.encrypted_link;if(x){let k=T(x,c);if(k&&k.startsWith("http")){let I={url:k,timestamp:Date.now()};return L.set(n.toLowerCase(),I),L.set(p.toLowerCase(),I),e.redirect(302,k)}}}let _=`https://firestore.googleapis.com/v1/projects/${d.projectId}/databases/${d.firestoreDatabaseId||"(default)"}/documents/apps/${p}${h}`,g=await fetch(_);if(g.ok){let b=await g.json(),v=q(b.fields),x=v.more_information_url||v.download_url||v.encrypted_link||v.url;if(x&&typeof x=="string"){let k=x.startsWith("U2FsdGVkX1")?T(x,c):x;if(k&&k.startsWith("http")){let I={url:k,timestamp:Date.now()};return L.set(n.toLowerCase(),I),L.set(p.toLowerCase(),I),e.redirect(302,k)}}}}}}catch(m){console.error("[SECURITY] Firestore link resolution fallback failed:",m)}return e.status(404).send("<h1>404 Not Found</h1><p>The requested application link could not be resolved. This usually happens if the link hasn't been synced to the security vault yet. Please try again later or contact support.</p>")}catch(o){return console.error("Resolution error:",o),e.status(500).send("<h1>500 Internal Server Error</h1>")}});var Kt=E(require("express")),it=E(require("fs")),Yt=E(require("path"));J();ee();var Le=E(require("fs")),Jt=E(require("path"));J();var tt=class{constructor(){this.cache=new Map;this.vaultPath=Jt.default.join(process.cwd(),"src","server","secure_vault.json");this.initialize(),this.watchVault()}initialize(){try{let e=le;if(e&&e.length>50)try{let i=C(),n=T(le,i);if(n){let s=JSON.parse(n),r=new Map;if(Array.isArray(s)?s.forEach(a=>{a.id&&r.set(a.id,a.url||a.payload||"")}):Object.entries(s).forEach(([a,l])=>{r.set(a,typeof l=="string"?l:l.payload||l.url||"")}),this.cache=r,console.log(`[VaultNode] Loaded ${this.cache.size} nodes from static vault.`),this.cache.size>0)return}}catch{console.warn("[VaultNode] Static vault load failed, trying file fallback...")}if(Le.default.existsSync(this.vaultPath)){let i=JSON.parse(Le.default.readFileSync(this.vaultPath,"utf8")),n=new Map;Object.entries(i).forEach(([s,r])=>{n.set(s,r.payload)}),this.cache=n,console.log(`[VaultNode] Loaded ${this.cache.size} nodes into memory.`)}}catch(e){console.error("[VaultNode] Initialization failed:",e)}}watchVault(){try{Le.default.watchFile(this.vaultPath,(e,i)=>{e.mtime!==i.mtime&&(console.log("[VaultNode] Vault file changed, refreshing cache..."),this.initialize())})}catch{}}async getSyncPayload(e){let i=this.cache.get(e);if(!i)return null;try{let n=C();return T(i,n)||null}catch(n){return console.error(`[VaultNode] Decryption failed for ${e}:`,n),null}}refresh(){this.cache.clear(),this.initialize()}},nt=new tt;Ae();var Z=Kt.default.Router();Z.post("/api/v1/sync-node",async(t,e)=>{let i=U(t);if(await Y(i,30,6e4))return e.status(429).json({status:"ERR",msg:"Request limit exceeded"});let{slug:n,token:s,fingerprint:r,appId:a}=t.body;if(!n)return e.status(400).json({status:"ERR",msg:"Missing ID"});if(!s||!r||!a)return e.status(403).json({status:"ERR",msg:"Session verification required"});let l=t.cookies?.["__Host-sid"];if(!l||!ze(s,i,l,r,a))return console.warn(`[SECURITY] Invalid sync token attempt for slug: ${n} from IP: ${i}`),e.status(403).json({status:"ERR",msg:"Identity verification mismatch"});try{let o=await nt.getSyncPayload(a)||await nt.getSyncPayload(n);if(o)return e.json({status:"OK",payload:o,meta:{node:"v1",ts:Date.now()}});let c=O();if(!c)return e.status(404).json({status:"ERR",msg:"Information unavailable"});let p=await c.collection("store_data").doc("sec_vault").get();if(!p.exists)return console.warn(`[Sync] Node miss for slug: ${n} (No sec_vault)`),e.status(404).json({status:"ERR",msg:"Sync Node not yet active"});let u=p.data(),y=C(),m=T(u?.encryptedData,y);if(!m)return e.status(500).json({status:"ERR",msg:"System sync error (vault decryption)"});let d=JSON.parse(m),h=null;if(Array.isArray(d)){let f=d.find(_=>_.id===a||_.id===n);f&&(h=f.url||f.payload)}else h=d[a]?.url||d[a]?.payload||d[n]?.url||d[n]?.payload;if(!h)return console.warn(`[Sync] Node miss for slug/appId: ${n}/${a} (Not in vault)`),e.status(404).json({status:"ERR",msg:"Sync Node not yet active"});let w=T(h,y);if(!w)return e.status(500).json({status:"ERR",msg:"System sync error"});e.json({status:"OK",payload:w,meta:{node:"legacy",ts:Date.now()}})}catch(o){console.error("[SyncNode] Critical Error:",o),e.status(500).json({status:"ERR",msg:"Internal server error"})}});Z.get("/api/v1/image",async(t,e)=>{let i=t.query.url;if(!i)return e.status(400).send("Missing image URL");try{let n=i;try{i.startsWith("http")||(n=Buffer.from(i,"base64").toString("utf-8"))}catch{}if(!await Wt(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let s=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!s.ok)throw new Error("Failed to fetch image");let r=await s.arrayBuffer(),a=s.headers.get("content-type")||"image/jpeg";e.set("Content-Type",a),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(r))}catch{e.status(500).send("Image proxy error")}});var pe=null,_e=0,Vn=3e4;function Zt(){pe=null,_e=0}Z.options(["/api/v1/public/reviews","/api/v1/public/backup-data"],(t,e)=>(e.setHeader("Access-Control-Allow-Origin","*"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS"),e.setHeader("Access-Control-Allow-Headers","Content-Type, Authorization"),e.sendStatus(200)));Z.get(["/api/v1/public/reviews","/api/public/reviews"],async(t,e)=>{e.setHeader("Access-Control-Allow-Origin","*"),e.setHeader("Cache-Control","public, max-age=60, stale-while-revalidate=120");let i=t.query.app_id;if(!i)return e.json([]);try{let n=O();if(n){let s=await n.collection("app_reviews").where("app_id","==",i).limit(50).get();if(!s.empty){let r=s.docs.map(a=>({id:a.id,...a.data()}));return e.json(r)}}}catch{}return e.json([])});Z.get(["/api/v1/public/backup-data","/api/v1/backup-data","/api/public/backup-data","/public/backup-data"],async(t,e)=>{e.setHeader("Access-Control-Allow-Origin","*"),e.set("Cache-Control","public, max-age=15, stale-while-revalidate=30");try{let i=Date.now();if(pe&&i-_e<Vn)return e.json(pe);try{let a=O();if(a){let l=await a.collection("store_data").doc("apps_meta").get(),o=[],c=null;if(l.exists){let I=l.data()?.numChunks||1;for(let N=0;N<I;N++){let $=await a.collection("store_data").doc(`apps_chunk_${N}`).get();$.exists&&$.data()?.items&&o.push(...$.data().items)}}else c=await a.collection("store_data").doc("apps").get(),c&&c.exists&&c.data()?.items&&(o=c.data().items);let p=await a.collection("store_data").doc("public_settings").get(),u=await a.collection("store_data").doc("news").get(),y=await a.collection("store_data").doc("blogs").get(),m=await a.collection("store_data").doc("videos").get(),d=he(),h=u.exists?u.data()?.items||[]:[],w=y.exists?y.data()?.items||[]:[],f=m.exists?m.data()?.items||[]:[],_=h&&h.length>0?h:d.mockNews||[],g=w&&w.length>0?w:d.mockBlogs||[],b=f&&f.length>0?f:d.mockVideos||[],v=p.exists?p.data()||{}:{},x=d.mockSettings||{},k={...x,...v,banners:Array.isArray(v.banners)&&v.banners.length>0?v.banners:x.banners||[],categories:Array.isArray(v.categories)&&v.categories.length>0?v.categories:x.categories||[],quick_links:Array.isArray(v.quick_links)&&v.quick_links.length>0?v.quick_links:x.quick_links||[],website_faqs:Array.isArray(v.website_faqs)&&v.website_faqs.length>0?v.website_faqs:x.website_faqs||[],developers:Array.isArray(v.developers)&&v.developers.length>0?v.developers:x.developers||[]};if(l.exists||c&&c.exists||p.exists||u.exists||y.exists||m.exists){let I={apps:o&&o.length>0?o:d.mockApps||[],settings:k,news:_,blogs:g,videos:b};return pe=I,_e=i,e.json(I)}}}catch{}try{let a=z();if(a&&a.projectId){let l=a.apiKey?`?key=${a.apiKey}`:"",o=`https://firestore.googleapis.com/v1/projects/${a.projectId}/databases/${a.firestoreDatabaseId||"(default)"}/documents/store_data`,c=await fetch(`${o}/apps_meta${l}`),p=[];if(c.ok){let k=await c.json(),I=k.fields?.numChunks?.integerValue?parseInt(k.fields.numChunks.integerValue,10):1;for(let N=0;N<I;N++){let $=await fetch(`${o}/apps_chunk_${N}${l}`);if($.ok){let R=await $.json();if(R.fields?.items?.arrayValue?.values){let A=R.fields.items.arrayValue.values.map(W=>Q(W));p.push(...A)}}}}else{let k=await fetch(`${o}/apps${l}`);if(k.ok){let I=await k.json();I.fields?.items?.arrayValue?.values&&(p=I.fields.items.arrayValue.values.map(N=>Q(N)))}}let u=await fetch(`${o}/public_settings${l}`),y=await fetch(`${o}/news${l}`),m=await fetch(`${o}/blogs${l}`),d=await fetch(`${o}/videos${l}`),h={},w={},f={},_={};try{u.ok&&(h=q((await u.json())?.fields))}catch{}try{y.ok&&(w=q((await y.json())?.fields))}catch{}try{m.ok&&(f=q((await m.json())?.fields))}catch{}try{d.ok&&(_=q((await d.json())?.fields))}catch{}let g=he(),b=y.ok?w.items||[]:g.mockNews||[],v=m.ok?f.items||[]:g.mockBlogs||[],x=d.ok?_.items||[]:g.mockVideos||[];if(c.ok||u.ok||y.ok||m.ok||d.ok||p.length>0){let k={apps:p,settings:h,news:b,blogs:v,videos:x};return pe=k,_e=i,e.json(k)}}}catch{}let n=Yt.default.join(process.cwd(),"src/lib/public_backup.json");if(it.default.existsSync(n))try{let a=JSON.parse(it.default.readFileSync(n,"utf8")),l={apps:a.apps||[],settings:a.settings||{},news:a.news||[],blogs:a.blogs||[],videos:a.videos||[]};return pe=l,_e=i,e.json(l)}catch(a){console.error("Error reading public_backup.json in backup-data endpoint:",a)}let s=he(),r={apps:s.mockApps||[],settings:s.mockSettings||{},news:s.mockNews||[],blogs:s.mockBlogs||[],videos:s.mockVideos||[]};return e.json(r)}catch(i){console.error("public backup endpoint error:",i);let n=he();return e.status(200).json({apps:n.mockApps||[],settings:n.mockSettings||{},news:n.mockNews||[],blogs:n.mockBlogs||[],videos:n.mockVideos||[]})}});Z.get("/api/v1/download/:id",async(t,e)=>{let i=t.params.id;return i?e.redirect(302,`/moreinfo/${i}`):e.status(400).send("Bad Request")});var P=sn.default.Router();P.post("/api/v1/admin/encrypt",D,async(t,e)=>{let i=U(t);if(await Y(i))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let s=C();if(!s||s.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let r=F(n,s);e.json({encrypted:r})}catch{e.status(500).json({error:"Encryption failed"})}});P.post("/api/v1/admin/ai-format-html",D,async(t,e)=>{let i=U(t);if(await Y(i))return e.status(429).json({error:"Too many requests. Please wait."});let{content:n,appName:s}=t.body;if(!n||typeof n!="string"||!n.trim())return e.status(400).json({error:"Content is required for AI formatting."});try{let r=process.env.GEMINI_API_KEY;if(r&&r.trim()!==""){let{GoogleGenAI:l}=require("@google/genai"),o=new l({apiKey:r}),c=`You are a professional web content and HTML structure optimizer for app reviews and directory websites.
Your task is to convert the user's raw review script, rough notes, or unformatted HTML into clean, valid, semantically structured HTML.

CRITICAL MANDATORY RULES:
1. **STRICTLY DO NOT USE OR GENERATE ANY <h1> TAGS**. Main H1 heading is reserved for the App Name at the page header.
2. Structure sections using <h2> and <h3> tags ONLY (e.g. <h2>Overview & Hands-on Review</h2>, <h2>Key Features</h2>, <h3>Gameplay Mechanics</h3>, <h3>Performance Benchmarks</h3>).
3. Wrap all normal body paragraphs in clean <p>...</p> tags.
4. Convert bullet points, lists, or features into <ul><li>...</li></ul> tags.
5. Use <strong>...</strong> for key highlights, metric numbers, or emphasis.
6. **PRESERVE ALL ORIGINAL TEXT, WORDS, SENTENCES, AND SPECIFIC REVIEW DETAILS EXACTLY**. Do NOT change the facts, do NOT shorten or hallucinate, and do NOT change the author's voice/script.
7. Return ONLY clean fragment HTML without markdown blocks (\`\`\`html) or <html>/<body> tags.

App Title Context: ${s||"Application"}

RAW CONTENT TO FORMAT:
${n}`,u=(await o.models.generateContent({model:"gemini-2.5-flash",contents:c})).text||"";if(u=u.replace(/^```html\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/,"").trim(),u=u.replace(/<h1([^>]*)>/gi,"<h2$1>").replace(/<\/h1>/gi,"</h2>"),u&&u.length>10)return e.json({success:!0,formattedHtml:u,source:"gemini-ai"})}let a=n.trim();return a=a.replace(/<!DOCTYPE[^>]*>/gi,"").replace(/<\/?(html|head|body)[^>]*>/gi,"").replace(/<title>[^<]*<\/title>/gi,"").replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<script[^>]*>[\s\S]*?<\/script>/gi,"").replace(/<h1([^>]*)>/gi,"<h2$1>").replace(/<\/h1>/gi,"</h2>").trim(),!a.includes("<p>")&&!a.includes("<h2>")&&!a.includes("<div>")&&(a=a.split(`
`).map(c=>{let p=c.trim();return p?p.startsWith("- ")||p.startsWith("* ")?`<li>${p.substring(2)}</li>`:p.length<60&&!p.endsWith(".")?`<h2>${p}</h2>`:`<p>${p}</p>`:""}).filter(Boolean).join(`
`),a=a.replace(/(<li>.*?<\/li>\n?)+/g,c=>`<ul>
${c}</ul>
`)),e.json({success:!0,formattedHtml:a,source:"local-formatter"})}catch(r){console.error("[AI FORMAT HTML SERVER ERROR]",r);let a=n.replace(/<h1([^>]*)>/gi,"<h2$1>").replace(/<\/h1>/gi,"</h2>").trim();return e.json({success:!0,formattedHtml:a,source:"fallback",note:r.message})}});P.post("/api/v1/admin/encrypt-links",D,async(t,e)=>{let{items:i}=t.body;if(!i||!Array.isArray(i))return e.status(400).json({error:"Valid links array payload is required."});try{let n=C();if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let s=[],r=z();if(r){let m=r.apiKey?`?key=${r.apiKey}`:"",d=`https://firestore.googleapis.com/v1/projects/${r.projectId}/databases/${r.firestoreDatabaseId}/documents`;for(let h of["sec_links_vault_3","secure_links","sec_vault"])try{let f=await(await fetch(`${d}/store_data/${h}${m}`)).json();if(f&&!f.error&&f.fields?.encryptedData?.stringValue){let _=T(f.fields.encryptedData.stringValue,n);if(_){let g=JSON.parse(_);if(Array.isArray(g)){s=g;break}}}}catch{}}let a=new Map;s.forEach(m=>{m&&m.id&&a.set(m.id,m)}),i.map(m=>{let d=m.url||"";return d&&!d.startsWith("http://")&&!d.startsWith("https://")&&!d.startsWith("U2FsdGVkX1")&&(d="https://"+d),d&&!d.startsWith("U2FsdGVkX1")&&(d=F(d,n)),{...m,url:d}}).forEach(m=>{m&&m.id&&a.set(m.id,m)});let o=Array.from(a.values()),c=JSON.stringify(o),p=F(c,n),u={encryptedData:p,lastUpdated:new Date().toISOString()},y=O();if(y)try{await Promise.all([y.collection("store_data").doc("secure_links").set(u),y.collection("store_data").doc("sec_vault").set(u)]),console.log("[SERVER] Encrypted links vault persisted to Firestore via Admin SDK.")}catch(m){console.warn("[SERVER] Admin SDK write for secure_links failed, using REST fallback:",m),await Promise.all([M("secure_links",u,t.headers.authorization),M("sec_vault",u,t.headers.authorization)])}else await Promise.all([M("secure_links",u,t.headers.authorization),M("sec_vault",u,t.headers.authorization)]);et(),e.json({encrypted:p,savedToCloud:!0})}catch{e.status(500).json({error:"Links encryption failed"})}});P.get("/api/v1/admin/debug-links",D,async(t,e)=>{let i=U(t);if(await Y(i))return e.status(429).json({error:"Too many requests"});try{let n=z(),s=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,a=await(await fetch(s)).json();if(!a.fields||!a.fields.encryptedData)return e.json({error:"No vault data found"});let l=a.fields.encryptedData.stringValue,o=C(),c=T(l,o);e.json({decrypted:JSON.parse(c)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});P.post("/api/v1/admin/decrypt-url",D,async(t,e)=>{let i=U(t);if(await Y(i))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let s=C();if(!s||s.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let r=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${r} from IP ${i} at ${new Date().toISOString()}`);try{let a=T(n,s);e.json({decrypted:a||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});P.post("/api/v1/admin/decrypt-links",D,async(t,e)=>{let i=U(t);if(await Y(i))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let s=C();if(!s||s.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let r=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${r} from IP ${i} at ${new Date().toISOString()}`);try{let a=T(n,s);if(!a)return console.warn("[WARNING] Decrypted block is empty or decryption failed. Returning empty vault."),e.json({items:[]});let l=[];try{l=JSON.parse(a)}catch{return console.warn("[WARNING] Failed to parse decrypted vault. Returning empty array."),e.json({items:[]})}l=l.map(o=>{let c=o.url||"";if(c.startsWith("U2FsdGVkX1"))try{c=T(c,s)}catch{}return{...o,url:c}}),e.json({items:l})}catch(a){console.error("[ERROR] Admin decrypt-links failed:",a.message||a),e.status(500).json({error:"Links decryption failed: "+(a.message||"Check AES_SECRET")})}});P.post("/api/v1/admin/sync-local",D,async(t,e)=>{console.log("[DEBUG] sync-local endpoint hit!");try{let{apps:i,settings:n,news:s,blogs:r,videos:a,allowEmptyApps:l,allowEmptyNews:o,allowEmptyBlogs:c,allowEmptyVideos:p}=t.body;if(!i&&!n&&!s&&!r&&!a)return e.status(400).json({error:"Invalid sync payload: no items provided."});let u=!1,y=null;try{let m=O();if(m){if(Array.isArray(i)&&(i.length>0||l)){let w=Math.ceil(i.length/25)||1,f=[];for(let _=0;_<w;_++){let g=JSON.parse(JSON.stringify(i.slice(_*25,(_+1)*25)));g.forEach(b=>{delete b.more_information_url,delete b.encrypted_download_url,delete b.download_url}),f.push(m.collection("store_data").doc(`apps_chunk_${_}`).set({items:g}))}await Promise.all(f),await m.collection("store_data").doc("apps_meta").set({numChunks:w,last_updated:new Date().toISOString()})}let d=[];n&&typeof n=="object"&&Object.keys(n).length>0&&d.push(m.collection("store_data").doc("public_settings").set(JSON.parse(JSON.stringify(n)),{merge:!0})),Array.isArray(s)&&(s.length>0||o)&&d.push(m.collection("store_data").doc("news").set({items:JSON.parse(JSON.stringify(s))})),Array.isArray(r)&&(r.length>0||c)&&d.push(m.collection("store_data").doc("blogs").set({items:JSON.parse(JSON.stringify(r))})),Array.isArray(a)&&(a.length>0||p)&&d.push(m.collection("store_data").doc("videos").set({items:JSON.parse(JSON.stringify(a))})),d.length>0&&await Promise.all(d),console.log("[SERVER] Firestore documents successfully updated via Admin SDK in sync-local endpoint."),u=!0}else y="Admin SDK could not be initialized (Check FIREBASE_SERVICE_ACCOUNT)"}catch(m){console.warn("[SERVER] Firestore Admin SDK update failed, switching to REST API fallback:",m.message),y=m.message}if(!u)try{let m=t.headers.authorization,d=[];if(Array.isArray(i)&&(i.length>0||l)){let w=Math.ceil(i.length/25)||1,f=[];for(let _=0;_<w;_++){let g=JSON.parse(JSON.stringify(i.slice(_*25,(_+1)*25)));g.forEach(b=>{delete b.more_information_url,delete b.encrypted_download_url,delete b.download_url}),f.push(M(`apps_chunk_${_}`,{items:g},m))}await Promise.all(f),await M("apps_meta",{numChunks:w,last_updated:new Date().toISOString()},m)}if(n&&typeof n=="object"&&Object.keys(n).length>0&&d.push(M("public_settings",JSON.parse(JSON.stringify(n)),m,!0)),Array.isArray(s)&&(s.length>0||o)&&d.push(M("news",{items:JSON.parse(JSON.stringify(s))},m)),Array.isArray(r)&&(r.length>0||c)&&d.push(M("blogs",{items:JSON.parse(JSON.stringify(r))},m)),Array.isArray(a)&&(a.length>0||p)&&d.push(M("videos",{items:JSON.parse(JSON.stringify(a))},m)),d.length>0){let h=await Promise.all(d);h.every(f=>f===!0)?(console.log("[SERVER] Firestore documents successfully updated via Auth REST Proxy in sync-local endpoint."),u=!0,y=null):(y=`REST Fallback write partially failed (${h.filter(Boolean).length}/${h.length} docs succeeded).`,console.warn(`[SERVER] ${y}`))}else u=!0}catch(m){console.error("[SERVER] Firestore REST API update failed in sync-local endpoint:",m.message),y=`REST Fallback also failed: ${m.message}`}try{let m=ue.default.join(process.cwd(),"src/lib/public_backup.json"),d={apps:[],settings:{},news:[],blogs:[],videos:[]};if(B.default.existsSync(m))try{d=JSON.parse(B.default.readFileSync(m,"utf8"))}catch{}let h=(en(),me(Qt)),w=(nn(),me(tn)),f=h.mockApps&&h.mockApps.length>0?h.mockApps:w.mockApps,_=h.mockSettings&&Object.keys(h.mockSettings).length>0?h.mockSettings:w.mockSettings,g=h.mockNews&&h.mockNews.length>0?h.mockNews:w.mockNews,b=h.mockBlogs&&h.mockBlogs.length>0?h.mockBlogs:w.mockBlogs,v=h.mockVideos&&h.mockVideos.length>0?h.mockVideos:w.mockVideos,x=Array.isArray(d.apps)&&d.apps.length>0?d.apps:f||[],k=d.settings&&typeof d.settings=="object"&&Object.keys(d.settings).length>0?d.settings:_||{},I=Array.isArray(d.news)&&d.news.length>0?d.news:g||[],N=Array.isArray(d.blogs)&&d.blogs.length>0?d.blogs:b||[],$=Array.isArray(d.videos)&&d.videos.length>0?d.videos:v||[],R=Array.isArray(i)&&(i.length>0||l)?i:x,A=n&&typeof n=="object"?n:{},lt={...{...k,...A},banners:Array.isArray(A.banners)&&A.banners.length>0?A.banners:k.banners||[],categories:Array.isArray(A.categories)&&A.categories.length>0?A.categories:k.categories||[],quick_links:Array.isArray(A.quick_links)&&A.quick_links.length>0?A.quick_links:k.quick_links||[],website_faqs:Array.isArray(A.website_faqs)&&A.website_faqs.length>0?A.website_faqs:k.website_faqs||[],developers:Array.isArray(A.developers)&&A.developers.length>0?A.developers:k.developers||[]},ct=Array.isArray(s)&&(s.length>0||o)?s:I,dt=Array.isArray(r)&&(r.length>0||c)?r:N,pt=Array.isArray(a)&&(a.length>0||p)?a:$,pn={apps:R,settings:lt,news:ct,blogs:dt,videos:pt};B.default.writeFileSync(m,JSON.stringify(pn,null,2),"utf8");let{generateStaticDataFileCode:un}=(Ze(),me(Ye)),mn=ue.default.join(process.cwd(),"src/lib/staticData.ts"),hn=un(R,lt,ct,dt,pt);B.default.writeFileSync(mn,hn,"utf8")}catch(m){console.warn("[SERVER] Could not update local file backups:",m)}Zt(),Lt(),u?e.json({success:!0,message:"Cloud Firestore and backup components strictly synced.",method:y?"REST Fallback":"Admin SDK"}):e.status(500).json({success:!1,error:"Database update failed: "+y,message:"Your changes were saved to the local server cache but could not be synced to Cloud Firestore. Check your environment variables."})}catch(i){console.error("local file sync endpoint error:",i),e.status(500).json({error:"Failed to store backup: "+i.message})}});P.get("/api/v1/admin/backup-links-get",D,(t,e)=>{try{let i=C(),n={},s=ue.default.join(process.cwd(),"src/lib/secureVault.ts");if(B.default.existsSync(s))try{let o=B.default.readFileSync(s,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(o&&o[1]){let c=o[1],p=T(c,i);if(p){let u=JSON.parse(p);Array.isArray(u)?u.forEach(y=>{y&&y.id&&(n[y.id]=y.url||y.more_information_url||"")}):u&&typeof u=="object"&&Object.assign(n,u),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(l){console.warn("backup-links-get: Failed to parse secureVault.ts:",l.message)}let r=ue.default.join(process.cwd(),".local/secure_links_backup.json");if(B.default.existsSync(r))try{let l=JSON.parse(B.default.readFileSync(r,"utf8"));Object.assign(n,l),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(l){console.warn("backup-links-get: Failed to parse backup JSON:",l.message)}let a=[];for(let[l,o]of Object.entries(n)){let c="";typeof o=="string"&&(o.startsWith("U2FsdGVkX1")?c=T(o,i):c=o),a.push({id:l,url:c})}e.json({items:a})}catch(i){console.error("backup-links-get failed:",i),e.status(500).json({error:"Failed to read backup links: "+i.message})}});P.get("/api/v1/admin/fix-db-links",D,async(t,e)=>{try{let i=z();if(!i)return e.status(500).json({error:"Missing configuration."});let s=await(await fetch(`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/store_data/apps_chunk_0${i.apiKey?"?key="+i.apiKey:""}`)).json(),r=[];!s.error&&s.fields?.items?.arrayValue?.values&&(r=s.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue));let l=await(await fetch(`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/store_data/apps_chunk_1${i.apiKey?"?key="+i.apiKey:""}`)).json();!l.error&&l.fields?.items?.arrayValue?.values&&(r=r.concat(l.fields.items.arrayValue.values.map(h=>h.mapValue.fields.id.stringValue)));let o=C(),c=r.map(h=>({id:h,url:`https://example.com/demo/${h}`})),p=F(JSON.stringify(c),o),u=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",d=await(await fetch(`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${i.apiKey?"&key="+i.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${u}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:p}}})})).json();e.json(d)}catch(i){e.status(500).json({error:i.message})}});P.post("/api/v1/admin/seal-vault",D,(t,e)=>{try{let{items:i}=t.body;if(!i||!Array.isArray(i))return e.status(400).json({error:"Valid items array required"});let n={};i.forEach(a=>{a.id&&(a.url&&a.more_information_url?n[a.id]={url:a.url,more_information_url:a.more_information_url,slug:a.slug}:(a.url||a.more_information_url)&&(n[a.id]=a.url||a.more_information_url))});let s=C();if(!s)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let r=F(JSON.stringify(n),s);e.json({success:!0,ciphertext:r})}catch(i){e.status(500).json({error:i.message})}});P.post("/api/v1/admin/save-links-direct",D,(t,e)=>{try{let{items:i}=t.body;if(!i||!Array.isArray(i))return e.status(400).json({error:"Valid items array required"});let n=C(),s={};i.forEach(l=>{let o=l.url,c=l.more_information_url;if(l.id){if(o&&c){let p={url:o.startsWith("U2FsdGVkX1")?o:F(o,n),more_information_url:c.startsWith("U2FsdGVkX1")?c:F(c,n),slug:l.slug};s[l.id]=JSON.stringify(p)}else if(o||c){let p=o||c;s[l.id]=p.startsWith("U2FsdGVkX1")?p:F(p,n)}}});let r=ue.default.join(process.cwd(),".local/secure_links_backup.json"),a=s;if(B.default.existsSync(r))try{a={...JSON.parse(B.default.readFileSync(r,"utf8")),...s}}catch{}for(let[l,o]of Object.entries(a))if(o&&!o.startsWith("U2FsdGVkX1"))try{a[l]=F(o,n)}catch{delete a[l]}et(),e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(i){e.status(500).json({error:i.message})}});P.post("/api/v1/admin/pull-links-from-github",D,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));P.get("/api/v1/admin/config-status",D,(t,e)=>{let i=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,s=!!process.env.ADMIN_EMAIL;e.json({hasAes:i,hasSecLinks:n,hasAdminEmail:s})});P.get("/api/v1/admin/system-files",D,(t,e)=>{e.json({files:{}})});P.get("/api/v1/admin/firebase-status",D,async(t,e)=>{let i=Date.now(),n={config:!1,firestoreRead:!1,firestoreWrite:!1,adminSdk:!1,aesConfigured:!1,readLatencyMs:0,writeLatencyMs:0,details:{}};try{let s=z(),r=s?.apiKey||"",a=s?.projectId||"ai-studio-yonostore-886315a4-8b9f-4ff6-8986-a90ad172210a",l=s?.firestoreDatabaseId,o=!l||l===a?"(default)":l;n.config=!!a;let c=process.env.AES_SECRET||global.AES_SECRET_GLOBAL;n.aesConfigured=!!(c&&c.trim()!==""),n.details.projectId=a,n.details.databaseId=o,n.details.hasApiKey=!!r;let p=Date.now();try{let d=O(),h=Be();d?(await d.collection("store_data").doc("_status_check_").set({ts:Date.now(),source:"admin_sdk_healthcheck",checkedAt:new Date().toISOString()}),await d.collection("store_data").doc("_status_check_").delete(),n.adminSdk=!0,n.firestoreRead=!0,n.firestoreWrite=!0,n.readLatencyMs=Date.now()-p,n.writeLatencyMs=Date.now()-p,n.details.adminSdkLatencyMs=Date.now()-p,n.details.adminSdkNote=h.message||"Admin SDK active with full Service Account authority"):n.details.adminSdkNote=h.message||"Admin SDK inactive (Service Account variable missing; using REST fallback)"}catch(d){n.details.adminSdkError=d.message||String(d),n.details.adminSdkNote=`Admin SDK error: ${d.message}`}if(!n.adminSdk){let d=Date.now();try{let f=r?`?key=${r}`:"",_=`https://firestore.googleapis.com/v1/projects/${a}/databases/${o}/documents/store_data/public_settings${f}`,g=await fetch(_);if(n.readLatencyMs=Date.now()-d,g.status===200||g.status===404)n.firestoreRead=!0,n.details.restReadStatus=g.status,n.details.restReadNote="REST read operational";else{let b=await g.text();n.details.restReadStatus=g.status,n.details.restReadError=`HTTP ${g.status}: ${b.slice(0,150)}`}}catch(f){n.readLatencyMs=Date.now()-d,n.details.restReadError=f.message||String(f)}let h=Date.now(),w=t.headers.authorization;try{let f="_status_check_",_=await M(f,{ts:Date.now(),source:"admin_rest_healthcheck",checkedAt:new Date().toISOString()},w);if(n.writeLatencyMs=Date.now()-h,_)n.firestoreWrite=!0,n.details.writeMode="Authenticated Admin REST API (Authorization Bearer)",n.details.restWriteNote="REST write operational",Ve(f,w).catch(()=>{});else{let g=`status_ping_${Date.now()}`,b=r?`&key=${r}`:"",v=`https://firestore.googleapis.com/v1/projects/${a}/databases/${o}/documents/spent_tokens?documentId=${g}${b}`,x=await fetch(v,{method:"POST",headers:{"Content-Type":"application/json",...w?{Authorization:w}:{}},body:JSON.stringify({fields:{usedAt:{stringValue:new Date().toISOString()}}})});if(x.ok||x.status===200)n.firestoreWrite=!0,n.details.writeMode="Public Rules Validation (spent_tokens POST)",n.details.restWriteNote="REST write operational";else{let k=await x.text();n.details.restWriteError=`HTTP ${x.status}: ${k.slice(0,150)}`}}}catch(f){n.writeLatencyMs=Date.now()-h,n.details.restWriteError=f.message||String(f)}}let u=Date.now()-i;n.details.totalCheckDurationMs=u;let m=n.adminSdk&&n.firestoreRead&&n.firestoreWrite||n.firestoreRead&&n.firestoreWrite?"live":n.firestoreRead?"read_only":"offline";return m==="live"?n.details.diagnosticSummary=n.adminSdk?"100% Operational. Full server-side Admin SDK privileges verified.":"100% Operational. REST API read & write access verified.":m==="read_only"?n.details.diagnosticSummary=`Firestore reads are operational, but writes are failing. ${n.details.restWriteError||"Check API Key or Service Account configuration."}`:n.details.diagnosticSummary=`Firestore is currently offline or unreachable. ${n.details.restReadError||"Check Project ID and network configuration."}`,e.json({status:m,results:n,details:n.details,timestamp:new Date().toISOString()})}catch(s){return e.status(500).json({status:"offline",error:s.message||"Diagnostic test failed",results:n})}});P.get("/api/v1/admin/verify",D,(t,e)=>{e.json({authorized:!0,user:t.adminUser})});P.get("/api/v1/admin/security/audit-logs",D,async(t,e)=>{let i=z();if(!!1&&i&&i.apiKey)try{let r=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${i.apiKey?"&key="+i.apiKey:""}`,a=await fetch(r);if(a.ok){let c=((await a.json()).documents||[]).map(p=>{let u=p.fields||{};return{id:p.name.split("/").pop(),email:u.email?.stringValue||"unknown",ip:u.ip?.stringValue||"unknown",ua:u.ua?.stringValue||"unknown",success:u.success?.booleanValue??!1,reason:u.reason?.stringValue||"unknown",ts:u.ts?.stringValue||new Date().toISOString()}}).sort((p,u)=>new Date(u.ts).getTime()-new Date(p.ts).getTime());return e.json({success:!0,logs:c})}}catch(r){console.error("Error fetching Firestore audit logs:",r)}let s=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:s})});var j=(0,Pe.default)();j.set("trust proxy",1);j.use((0,ln.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1}));j.use((0,an.default)());j.use((0,on.default)());j.use((0,rn.default)({origin:!0,credentials:!0}));j.use(Pe.default.json({limit:"50mb"}));j.use(Pe.default.urlencoded({extended:!0,limit:"50mb"}));!process.env.AES_SECRET&&process.env.NODE_ENV==="production"&&console.error("FATAL: AES_SECRET environment variable is not set. Secure link flow will fail.");j.use((t,e,i)=>{t.originalUrl.startsWith("/api/")&&console.log(`[API REQUEST] ${t.method} ${t.originalUrl}`),i()});j.use("/api/v1/admin",(t,e,i)=>{e.setHeader("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate"),e.setHeader("Pragma","no-cache"),e.setHeader("Expires","0"),e.setHeader("Surrogate-Control","no-store"),i()});j.use((t,e,i)=>{if((t.headers["x-forwarded-host"]||t.get("host")||"").split(",")[0].trim()==="rummydex.com")return e.redirect(301,`https://www.rummydex.com${t.originalUrl}`);i()});j.get("/api/health",(t,e)=>{e.json({status:"ok",timestamp:new Date().toISOString()})});j.use(G);j.use(V);j.use(Ce);j.use(P);j.use(de);j.use(Z);["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{j.all(t,(e,i)=>{i.status(404).send("Not Found")})});j.use((t,e,i,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let s=cn.default.join(process.cwd(),"server_requests.log");dn.default.appendFileSync(s,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(i.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return i.status(500).json({error:"Internal server error"});i.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});var da=module.exports=j;
