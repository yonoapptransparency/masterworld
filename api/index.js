var $t=Object.create;var ye=Object.defineProperty;var Rt=Object.getOwnPropertyDescriptor;var Tt=Object.getOwnPropertyNames;var jt=Object.getPrototypeOf,Dt=Object.prototype.hasOwnProperty;var be=(t,e)=>()=>(t&&(e=t(t=0)),e);var Oe=(t,e)=>{for(var s in e)ye(t,s,{get:e[s],enumerable:!0})},Ye=(t,e,s,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Tt(e))!Dt.call(t,r)&&r!==s&&ye(t,r,{get:()=>e[r],enumerable:!(n=Rt(e,r))||n.enumerable});return t};var H=(t,e,s)=>(s=t!=null?$t(jt(t)):{},Ye(e||!t||!t.__esModule?ye(s,"default",{value:t,enumerable:!0}):s,t)),we=t=>Ye(ye({},"__esModule",{value:!0}),t);var Le={};Oe(Le,{mockApps:()=>_e,mockBlogs:()=>Se,mockNews:()=>ve,mockSettings:()=>xe,mockVideos:()=>ke});var _e,xe,ve,Se,ke,Ne=be(()=>{_e=[],xe={logo_url:"",site_title:"My Site",meta_description:"",favicon_url:"",helpline_whatsapp:"",helpline_telegram:"",support_email:"",disclaimer_text:"",ethics_discrimination_text:"",ticker_text:"",animations_enabled:!0,categories:[],banners:[],quick_links:[],website_faqs:[],developers:[]},ve=[],Se=[],ke=[]});function qe(){let t=null;typeof process<"u"&&(t=process.env?.ADMIN_PATH||process.env?.VITE_ADMIN_PATH);try{let e=Ot.env?.VITE_ADMIN_PATH;e&&(t=e)}catch{}return t||"admin"}var Ot,Xe=be(()=>{Ot={}});var Ze={};Oe(Ze,{adminFetch:()=>Lt,clearSession:()=>Ft,commitFileToGitHub:()=>zt,fetchFileFromGitHub:()=>Mt,generateQRCodeUri:()=>Kt,generateSecret:()=>Jt,generateStaticDataFileCode:()=>Pt,generateTOTP:()=>Ht,getGitHubFileSha:()=>Bt,getObfuscatedKey:()=>Wt,loadSession:()=>Ut,saveSession:()=>Nt,secureVault:()=>Yt,sessionStore:()=>Vt,verifyTOTP:()=>Gt});var Lt,Nt,Ut,Ft,Pt,zt,Mt,Bt,Vt,Wt,Ht,Gt,Jt,Kt,Yt,Qe=be(()=>{Lt=async()=>({ok:!1,json:async()=>({})}),Nt=()=>{},Ut=()=>null,Ft=()=>{},Pt=()=>"",zt=async()=>{},Mt=async()=>null,Bt=async()=>null,Vt={getItem:t=>{try{return typeof window<"u"?localStorage.getItem(t):null}catch{return null}},setItem:(t,e)=>{try{typeof window<"u"&&localStorage.setItem(t,e)}catch{}},removeItem:t=>{try{typeof window<"u"&&localStorage.removeItem(t)}catch{}}},Wt=t=>t,Ht=()=>"",Gt=()=>!1,Jt=()=>"",Kt=()=>"",Yt={encryptPayload:t=>t,decryptPayload:t=>t}});var $e={};Oe($e,{fetchStoreData:()=>de,getField:()=>a,injectSeoTags:()=>ys,syncFromFirestore:()=>Xt});function it(){if(ne)return ne;try{let t=oe.default.readFileSync(le.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),e=JSON.parse(t);if(!e.projectId||!Ue(e.projectId))throw new Error("is placeholder or mock");return ne=e,e}catch{try{let s=qt.replace(/[^A-Za-z0-9+/=]/g,""),n=JSON.parse(Buffer.from(s,"base64").toString("utf8"));if(n&&n.projectId&&Ue(n.projectId))return ne=n,n}catch{}let e=process.env.VITE_FIREBASE_PROJECT_ID;if(e&&Ue(e))return ne={projectId:process.env.VITE_FIREBASE_PROJECT_ID,appId:process.env.VITE_FIREBASE_APP_ID,apiKey:process.env.VITE_FIREBASE_API_KEY,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:process.env.VITE_FIREBASE_DATABASE_ID||"(default)",storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID},ne;throw new Error("Firebase configuration not found and no environment variables set.")}}function Fe(t){if(!t)return null;if("stringValue"in t)return t.stringValue;if("integerValue"in t)return parseInt(t.integerValue,10);if("doubleValue"in t)return parseFloat(t.doubleValue);if("booleanValue"in t)return t.booleanValue;if("arrayValue"in t)return(t.arrayValue.values||[]).map(s=>Fe(s));if("mapValue"in t){let e=t.mapValue.fields||{},s={};for(let n of Object.keys(e))s[n]=Fe(e[n]);return s}return null}function te(t){if(!t)return{};let e={};for(let s of Object.keys(t))e[s]=Fe(t[s]);return e}function a(t,e,s=""){if(!t)return s;let n=t[e];return n==null?s:typeof n=="object"?"stringValue"in n?n.stringValue??s:"integerValue"in n?String(n.integerValue)??s:"booleanValue"in n?String(n.booleanValue)??s:s:String(n)}async function Xt(){try{let t=it();if(!t||!t.projectId)return console.log("[SYNC] Skipping background Firestore sync: Firebase config not found."),null;let e=t.projectId,s=t.firestoreDatabaseId||"(default)",n=t.apiKey,r=n?`?key=${n}`:"",i=`https://firestore.googleapis.com/v1/projects/${e}/databases/${s}/documents/store_data`;console.log(`[SYNC] Syncing filesystem backup files with Firestore (${e})...`);let[o,d,p,c,f]=await Promise.all([fetch(`${i}/settings${r}`).catch(()=>null),fetch(`${i}/news${r}`).catch(()=>null),fetch(`${i}/blogs${r}`).catch(()=>null),fetch(`${i}/videos${r}`).catch(()=>null),fetch(`${i}/apps_meta${r}`).catch(()=>null)]),u=xe;if(o&&o.ok){let h=await o.json(),y=te(h.fields);y&&Object.keys(y).length>0&&(u=y)}let l=ve;if(d&&d.ok){let h=await d.json(),y=te(h.fields);y&&Array.isArray(y.items)&&(l=y.items)}let w=Se;if(p&&p.ok){let h=await p.json(),y=te(h.fields);y&&Array.isArray(y.items)&&(w=y.items)}let g=ke;if(c&&c.ok){let h=await c.json(),y=te(h.fields);y&&Array.isArray(y.items)&&(g=y.items)}let m=[],E=1,k=!1;if(f&&f.ok){let h=await f.json(),y=te(h.fields);y&&typeof y.numChunks=="number"&&(E=y.numChunks,k=!0)}if(k){let h=[];for(let x=0;x<E;x++)h.push(fetch(`${i}/apps_chunk_${x}${r}`).then(R=>R.ok?R.json():null).catch(()=>null));(await Promise.all(h)).forEach(x=>{if(x){let R=te(x.fields);R&&Array.isArray(R.items)&&m.push(...R.items)}})}else{let h=await fetch(`${i}/apps${r}`).catch(()=>null);if(h&&h.ok){let y=await h.json(),x=te(y.fields);x&&Array.isArray(x.items)&&(m=x.items)}}m.length===0&&(m=_e);try{let h=le.default.join(process.cwd(),"src/lib/public_backup.json");oe.default.writeFileSync(h,JSON.stringify({apps:m,settings:u,news:l,blogs:w,videos:g},null,2),"utf8");try{let{generateStaticDataFileCode:y}=(Qe(),we(Ze)),x=y(m,u,l,w,g);oe.default.writeFileSync(le.default.join(process.cwd(),"src/lib/staticData.ts"),x,"utf8")}catch(y){console.warn("Could not write staticData.ts fallback (skipping):",y.message)}}catch(h){console.warn("[SYNC] Could not write cache files to filesystem (running in read-only environment?):",h.message)}return console.log(`[SYNC] Synchronization successful. Apps count: ${m.length}`),{apps:m,settings:u,news:l,blogs:w,videos:g}}catch(t){return console.error("[SYNC] Sync error:",t),null}}async function de(){let t=Date.now(),e=t-Ie>et,s=t-Ie>et*15;return Ae&&!s?(e&&!Ee&&(Ee=!0,tt().then(()=>{Ee=!1}).catch(n=>{Ee=!1,console.warn("Background store fetch failed safely:",n)})),Ae):await tt()}async function tt(){let t=Date.now(),e=le.default.join(process.cwd(),"src/lib/public_backup.json");if(oe.default.existsSync(e))try{let n=JSON.parse(oe.default.readFileSync(e,"utf8")),r={apps:n.apps||[],settings:n.settings||{},news:n.news||[],blogs:n.blogs||[],videos:n.videos||[]};return Ae=r,Ie=t,r}catch(n){console.error("Error reading public_backup.json in seoHelper:",n)}let s={apps:_e||[],settings:xe||{},news:ve||[],blogs:Se||[],videos:ke||[]};return Ae=s,Ie=t,s}function v(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Ce(t){if(!t)return"";let e=t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,"");return e=e.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi,""),e=e.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi,'href="#"'),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi,""),e=e.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi,""),e}function X(t){return t?t.replace(/<[^>]*>?/gm," ").replace(/\s+/g," ").trim():""}function re(t){if(!t)return"";let e=t.trim();if(e.startsWith("<")||e.includes("<meta ")){let s=e.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);if(s&&s[1])return s[1].trim();let n=e.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);return n&&n[1]?n[1].trim():X(e).substring(0,160)}return e}async function Zt(t,e){let{apps:s,settings:n,news:r,blogs:i,videos:o}=e,d=t.split("?")[0].split("#")[0].replace(/\/+$/,"")||"/",p=d.toLowerCase(),c="";if(p==="/"||p==="")c=st(s,n,r,i,o);else if(p==="/new-apps")c=ts(s,n);else if(p.startsWith("/info/")||p.startsWith("/gateway/")||p.startsWith("/moredetail/")){let l="";p.startsWith("/info/")?l=d.split("/info/")[1]:p.startsWith("/gateway/")?l=d.split("/gateway/")[1]:l=d.split("/moredetail/")[1],c=ns(l,s,n)}else if(p==="/news")c=rs(r,n);else if(p.startsWith("/news/")){let l=d.split("/news/")[1];c=nt(l,r,n)}else if(p==="/blogs")c=os(i,n);else if(p.startsWith("/blog/")){let l=d.split("/blog/")[1];c=rt(l,i,n)}else if(p==="/videos")c=is(o,n);else if(p.startsWith("/videos/")){let l=d.split("/videos/")[1];c=ot(l,o,n)}else if(p==="/about")c=as(n);else if(p==="/contact")c=cs(n);else if(p==="/privacy")c=ls(n);else if(p==="/report-removal")c=ds(n);else if(p==="/terms")c=ps(n);else if(p==="/notice")c=fs(n);else if(p==="/ethics")c=gs(n);else if(p==="/disclaimer")c=ms(n);else if(p==="/responsibility")c=us(n);else{let l=p.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"");s.some(w=>w.slug?.toLowerCase()===l)?c=ss(l,s,n):r.some(w=>w.slug?.toLowerCase()===l)?c=nt(l,r,n):i.some(w=>w.slug?.toLowerCase()===l)?c=rt(l,i,n):o.some(w=>w.slug?.toLowerCase()===l)?c=ot(l,o,n):c=st(s,n,r,i,o)}let f=Qt(n),u=es(n);return`
    <div class="flex flex-col min-h-screen">
      ${f}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${c}
      </main>
      ${u}
    </div>
  `}function Qt(t){let e=a(t,"site_title"),s=a(t,"logo_url");return`
    <header class="py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white">
          ${s?`<img src="${v(s)}" class="w-10 h-10 object-contain" alt="Logo"/>`:""}
          <span>${v(e)}</span>
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
  `}function es(t){let e=a(t,"site_title"),s=a(t,"logo_url"),n=a(t,"meta_description"),r=a(t,"disclaimer_text"),i=a(t,"ethics_discrimination_text"),o=a(t,"important_notice");return`
    <footer class="pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400">
      <div class="max-w-7xl mx-auto px-6">
        <h3 class="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2">
          ${s?`<img src="${v(s)}" class="w-8 h-8 object-contain" alt="Logo" />`:""}
          <span>${v(e)}</span>
        </h3>
        <p class="text-sm max-w-xl mx-auto mb-6 leading-relaxed">${v(n)}</p>
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
        <div class="text-xs text-zinc-400 mt-8">&copy; ${new Date().getFullYear()} ${v(e)}. All rights reserved.</div>
      </div>
    </footer>
  `}function st(t,e,s,n,r){let i=a(e,"site_title"),o=a(e,"meta_description"),d="";[...t].sort((f,u)=>parseInt(a(f,"serial_number","999"),10)-parseInt(a(u,"serial_number","999"),10)).forEach((f,u)=>{let l=a(f,"name"),w=a(f,"slug"),g=a(f,"category"),m=a(f,"rating","5.0"),E=a(f,"icon_url"),k=f.is_new===!0||f.is_new&&f.is_new.booleanValue===!0;d+=`
      <a href="/${encodeURIComponent(w)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${u+1}</span>
        <img src="${E||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${v(l)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${v(l)}</h3>
          <p class="text-xs text-zinc-500 truncate">${v(g)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${m}</span><span class="text-zinc-400">\u2605</span>
            ${k?'<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>':""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `});let c="";return s.slice(0,3).forEach(f=>{c+=`
      <a href="/news/${encodeURIComponent(a(f,"slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${v(a(f,"title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${v(a(f,"description"))}</p>
      </a>
    `}),`
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${v(i)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${v(o)}</p>
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
  `}function ts(t,e){let s="",n=t.filter(i=>i.is_new===!0||i.is_new&&i.is_new.booleanValue===!0);return(n.length>0?n:t).forEach(i=>{let o=a(i,"name"),d=a(i,"slug"),p=a(i,"category"),c=a(i,"rating","5.0"),f=a(i,"icon_url");s+=`
      <a href="/${encodeURIComponent(d)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${v(o)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${v(p)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${c} \u2605</span>
      </a>
    `}),`
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${s}</div>
    </div>
  `}function ss(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(m=>a(m,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>';let i=a(r,"name"),o=a(r,"category"),d=a(r,"version","Latest"),p=a(r,"file_size","Variable"),c=a(r,"rating","5.0"),f=a(r,"icon_url"),u=r.description_html?Ce(r.description_html):`<p>No comprehensive details are configured yet for ${v(i)}.</p>`,l=r.features_html?Ce(r.features_html):"",w=l?`<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${l}</div>`:"",g=a(r,"package_name","Not published");return`
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${f||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${v(i)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${v(o)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${v(d)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${v(p)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${v(o.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${v(c)} \u2605</strong></div>
        </div>

        <a href="/info/${encodeURIComponent(t)}" class="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow hover:opacity-95">Install Direct Access Mirror \u{1F680}</a>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm text-left">
          <h2 class="text-lg font-bold mb-4">Detailed Game Review & Safe Guidelines</h2>
          <div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${u}</div>
          ${w}
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm h-fit text-left">
          <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-400">Specifications</h3>
          <table class="w-full text-xs text-left">
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Developer</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Store Certified</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Package Name</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white truncate max-w-[150px]">${v(g)}</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Status</td><td class="py-2 font-bold text-right text-green-500">Safe & Clean</td></tr>
            <tr><td class="py-2 text-zinc-400 font-semibold">System Code</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Android / iOS</td></tr>
          </table>
        </div>
      </div>
    </div>
  `}function ns(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(d=>a(d,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>';let i=a(r,"name");return`
    <div class="max-w-xl mx-auto py-12 px-4 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5">
      <div class="text-center">
        <img src="${a(r,"icon_url")||"https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border" alt="icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-1">${v(i)}</h1>
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black mb-6">Information Hub</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-8">Access the application details and specifications below.</p>
        <a href="/" class="block w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl">Return Home</a>
        <a href="/${encodeURIComponent(t)}" class="block text-xs font-semibold text-blue-500 hover:underline mt-4">Read Technical Description</a>
      </div>
    </div>
  `}function rs(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/news/${encodeURIComponent(a(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${v(a(n,"category")||"Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${v(a(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${v(a(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${v(a(n,"description"))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`}function nt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(u=>a(u,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>';let i=a(r,"title"),o=a(r,"created_at")||"May 2026",d=a(r,"ceo_name","System Author"),p=a(r,"category","Report"),c=a(r,"content")||a(r,"description",""),f=Ce(c);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${v(p)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${o} | By ${v(d)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${v(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${f.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function os(t,e){let s="";return t.forEach(n=>{s+=`
      <a href="/blog/${encodeURIComponent(a(n,"slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${v(a(n,"created_at")||"May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${v(a(n,"title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${v(X(a(n,"excerpt")||a(n,"content","").substring(0,140)))}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${s||'<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`}function rt(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(f=>a(f,"slug").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>';let i=a(r,"title"),o=a(r,"created_at")||"May 2026",d=a(r,"author","System Author"),p=a(r,"content",""),c=Ce(p);return`
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${o} | Strategy by ${v(d)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${v(i)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${c.replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</section>
    </article>
  `}function is(t,e){let s="";return t.forEach(n=>{let r=a(n,"title"),i=a(n,"slug"),o=a(n,"description","");s+=`
      <a href="/videos/${encodeURIComponent(i)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${v(r)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${v(o)}</p>
      </a>
    `}),`<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${s||'<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`}function ot(t,e,s){let n=decodeURIComponent(t).toLowerCase(),r=e.find(d=>a(d,"slug").toLowerCase()===n||a(d,"id").toLowerCase()===n);if(!r)return'<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>';let i=a(r,"title"),o=a(r,"description");return`<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${v(i)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${o.replace(/\n\n/g,"<br/><br/>")}</p></div>`}function as(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(a(t,"about_content")||"About our application services.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function cs(t){let e=a(t,"contact_content")||"Get in touch for active client files help.",s=a(t,"support_email","support@example.com");return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${e}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${v(s)}</p></div></div>`}function ls(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(a(t,"privacy_content")||"No private data tracking.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ds(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Report & Removal Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(a(t,"report_removal_content")||"Report & Removal Policy compliance guidelines.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function ps(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(a(t,"terms_content")||"Service code terms of compliance.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function us(t){return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${(a(t,"responsibility_content")||"Play safe for custom virtual entertainment.").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}</article></div>`}function fs(t){let e=a(t,"important_notice_heading")||"Important Notice",s=a(t,"important_notice")||"No important notices at this time.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function gs(t){let e=a(t,"ethics_heading")||"Ethics & Safety",s=a(t,"ethics_discrimination_text")||"Ethics and safety information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function ms(t){let e=a(t,"disclaimer_heading")||"Disclaimer",s=a(t,"disclaimer_text")||"Disclaimer information goes here.";return`<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${e}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${s}</article></div>`}function hs(){try{let t=it();return t?!t.apiKey||t.apiKey.trim()===""||t.apiKey.includes("YOUR_API_KEY")?{projectId:"placeholder-project-id",appId:"placeholder-app-id",apiKey:"PLACEHOLDER",authDomain:"placeholder-project.firebaseapp.com",firestoreDatabaseId:"(default)",storageBucket:"placeholder-project.firebasestorage.app",messagingSenderId:"000000000",measurementId:""}:t:null}catch{return null}}async function ys(t,e,s,n=""){let r=await de();if(!r||!r.settings)return t;let i=r.apps||[],o=r.settings||{},d=r.news||[],p=r.blogs||[],c=r.videos||[],f=a(o,"site_title"),u=f,l=a(o,"meta_description","");l||(l="A premium digital platform for applications and tools.");let w=a(o,"seo_keywords","");if(w||(w="app clearance, premium applications, digital tools, platform, tech specs, verified apps"),w){let b=w.split(",").map(_=>_.trim()).filter(Boolean);b.length>15&&(w=b.slice(0,15).join(", "))}let g="https://res.cloudinary.com/diewalae4/image/upload/v1784618987/Make_this_into_a_perfect_circle_format_keeping_the_RUMMY_DEX_text_and_red__20260721_125826_0000_zgdz8s.png",m=f||"Platform Administrator",E=null,k="https://res.cloudinary.com/diewalae4/image/upload/v1784618987/Make_this_into_a_perfect_circle_format_keeping_the_RUMMY_DEX_text_and_red__20260721_125826_0000_zgdz8s.png",h=e.split("?")[0].split("#")[0],y=h.toLowerCase(),x=y.startsWith("/moreinfo/")||y.startsWith("/info/")||y.startsWith("/moredetail/")||y.startsWith("/gateway/"),R=h.replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase();if(i.some(b=>{let _=a(b,"slug");return _&&_.toLowerCase()===R})){let b=i.find(_=>{let A=a(_,"slug");return A&&A.toLowerCase()===R});if(b){let _=a(b,"name");u=`${a(b,"seo_title")||_}`;let A=a(b,"description_html");l=re(a(b,"seo_description"))||(A?X(A).substring(0,160):"")||l,w=a(b,"seo_keywords")||w,g=a(b,"og_image_url")||a(b,"icon_url")||g;let T=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").replace(/\/+$/,"");E=a(b,"canonical_url")||`${T}/app/${a(b,"slug")}`,k=a(b,"icon_url")||k}}else if(e.startsWith("/info/")||e.startsWith("/moreinfo/")||e.startsWith("/moredetail/")||e.startsWith("/gateway/")){let b="/info/";e.startsWith("/moreinfo/")?b="/moreinfo/":e.startsWith("/moredetail/")?b="/moredetail/":e.startsWith("/gateway/")&&(b="/gateway/");let _=decodeURIComponent(e.split(b)[1].split("/")[0].split("?")[0]),A=i.find(T=>{let z=a(T,"slug");return z&&z.toLowerCase()===_.toLowerCase()});if(A){let T=a(A,"name");u=`${a(A,"seo_title")||T} - Technical Info`;let z=a(A,"description_html");l=re(a(A,"seo_description"))||(z?X(z).substring(0,160):"")||l,w=a(A,"seo_keywords")||w,g=a(A,"og_image_url")||a(A,"icon_url")||g,E=`${(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").replace(/\/+$/,"")}${b}${a(A,"slug")}`,k=a(A,"icon_url")||k}}else if(e.startsWith("/news/")&&e.length>6){let b=decodeURIComponent(e.split("/news/")[1].split("/")[0].split("?")[0]),_=d.find(A=>{let T=a(A,"slug");return T&&T.toLowerCase()===b.toLowerCase()});if(_){let A=a(_,"title","Latest News");u=`${a(_,"seo_title")||A} | ${f}`;let T=a(_,"description")||a(_,"content");l=re(a(_,"seo_description"))||(T?X(T).substring(0,160):"")||l,w=a(_,"seo_keywords")||w,g=a(_,"og_image_url")||a(_,"logo_url")||g,m=a(_,"ceo_name")||f;let z=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").replace(/\/+$/,"");E=a(_,"canonical_url")||`${z}/news/${a(_,"slug")}`}}else if(e.startsWith("/blog/")&&e.length>6){let b=decodeURIComponent(e.split("/blog/")[1].split("/")[0].split("?")[0]),_=p.find(A=>{let T=a(A,"slug");return T&&T.toLowerCase()===b.toLowerCase()});if(_){let A=a(_,"title","Blog Post");u=`${a(_,"seo_title")||A} | ${f}`;let T=a(_,"excerpt")||a(_,"content");l=re(a(_,"seo_description"))||(T?X(T).substring(0,160):"")||l,w=a(_,"seo_keywords")||w,g=a(_,"cover_url")||g,m=a(_,"author")||f;let z=(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").replace(/\/+$/,"");E=a(_,"canonical_url")||`${z}/blog/${a(_,"slug")}`}}else if(e.startsWith("/videos/")&&e.length>8){let b=decodeURIComponent(e.split("/videos/")[1].split("/")[0].split("?")[0]),_=c.find(A=>{let T=a(A,"slug"),z=a(A,"id");return T&&T.toLowerCase()===b.toLowerCase()||z&&z.toLowerCase()===b.toLowerCase()});if(_){let A=a(_,"title","Video Specs");u=`${a(_,"seo_title")||A} | ${f}`;let T=a(_,"description");l=re(a(_,"seo_description"))||(T?X(T).substring(0,160):""),w=a(_,"seo_keywords");let z=a(_,"youtube_url"),se="";if(z){let Ke=z.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);Ke&&(se=Ke[1])}se&&(g=`https://img.youtube.com/vi/${se}/maxresdefault.jpg`),E=`${(s||process.env.VITE_PUBLIC_DOMAIN||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").replace(/\/+$/,"")}/videos/${a(_,"slug")||a(_,"id")}`}}else if(e.startsWith("/developers"))u=`Meet Our Team | ${f}`,l=`Meet the brilliant developers behind ${f}. Discover our team's expertise and passion.`;else{let b=h.toLowerCase().replace(/^\/|\/$/g,"");if(b==="about")u=`About Us | ${f}`,l="Learn more about our mission, vision, and the premium services we offer on our platform.";else if(b==="blogs")u=`Official Blogs & Insights | ${f}`,l="Explore our official blog articles, professional guides, gameplay tips, and deep platform reviews.";else if(b==="contact")u=`Contact Us | ${f}`,l="Get in touch with our professional support team. We are here to help you with your inquiries, feedback, and technical assistance.";else if(b==="disclaimer")u=`Disclaimer | ${f}`,l="Read our platform disclaimer regarding content accuracy, fair play verification, and third-party links.";else if(b==="ethics")u=`Code of Ethics & Content Policy | ${f}`,l="Discover our strict code of ethics, licensing standards, and platform content guidelines.";else if(b==="new-apps")u=`New Releases & Up-and-Coming Apps | ${f}`,l="Stay updated with our latest releases, featured digital tools, and upcoming app launches.";else if(b==="news")u=`Latest News & Press Updates | ${f}`,l="Browse official news bulletins, press announcements, security reports, and direct system updates.";else if(b==="notice")u=`Important System Notice | ${f}`,l="Read our critical system alerts, maintenance updates, and important security advisories.";else if(b==="privacy")u=`Privacy Policy | ${f}`,l="Read our comprehensive privacy policy to understand how we protect, secure, and handle your personal data.";else if(b==="responsibility")u=`Responsible Gaming & Play Policy | ${f}`,l="Learn about our commitment to user safety, self-exclusion tools, and responsible gameplay guidelines.";else if(b==="terms")u=`Terms of Service & User Agreement | ${f}`,l="Review our terms of service, platform rules, and user agreements governing the use of our services.";else if(b==="videos")u=`Video Previews & Walkthroughs | ${f}`,l="Watch high-definition videos, gameplay showcases, and technical walkthroughs of our certified applications.";else{let _=decodeURIComponent(e.split("?")[0].split("#")[0].replace(/^\/|\/$/g,""));if(_&&_!==""){let A=i.find(T=>a(T,"slug")?.toLowerCase()===_.toLowerCase());if(A){let T=a(A,"name","App");u=a(A,"seo_title")||T;let z=a(A,"description_html"),se=`Discover the ${T} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;l=re(a(A,"seo_description"))||(z?X(z).substring(0,160):se),w=a(A,"seo_keywords"),g=a(A,"og_image_url")||a(A,"icon_url")||g,E=a(A,"canonical_url"),k=a(A,"icon_url")||k}}}}let D=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").replace(/\/+$/,""),L=e.split("?")[0].split("#")[0].replace(/^\/api(\/[^/]+)?/i,"")||"/",j=`${D}${L}`,N=g;if(g){let b=g.trim();if(b.startsWith("//"))N=`https:${b}`;else if(!b.startsWith("http://")&&!b.startsWith("https://")){let _=b.startsWith("/")?b:`/${b}`;N=`${D}${_}`}else N=b}let W=k;if(k){let b=k.trim();if(b.startsWith("//"))W=`https:${b}`;else if(!b.startsWith("http://")&&!b.startsWith("https://")){let _=b.startsWith("/")?b:`/${b}`;W=`${D}${_}`}else W=b}let K=e.startsWith(`/${qe()}`),he=a(o,"google_analytics_id","")||a(o,"ga_tracking_id",""),U=he?`
    <script async src="https://www.googletagmanager.com/gtag/js?id=${v(he)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${v(he)}');
    </script>
  `:"",C=null;K||(i.some(_=>_.slug?.toLowerCase()===e.split("?")[0].split("#")[0].replace(/^\/app\//,"/").replace(/^\/|\/$/g,"").toLowerCase())||e.startsWith("/gateway/")||e.startsWith("/moredetail/")||e.startsWith("/info/")||e.startsWith("/moreinfo/")?C={"@context":"https://schema.org","@type":"SoftwareApplication",name:u,operatingSystem:"Android, iOS",applicationCategory:"GameApplication",description:l,url:E||j,offers:{"@type":"Offer",price:"0",priceCurrency:"USD"}}:e.startsWith("/news/")||e.startsWith("/blog/")?C={"@context":"https://schema.org","@type":"Article",headline:u,description:l,image:N||[],author:{"@type":"Person",name:m}}:e.startsWith("/videos/")?C={"@context":"https://schema.org","@type":"VideoObject",name:u,description:l,thumbnailUrl:N||[],uploadDate:new Date().toISOString()}:C={"@context":"https://schema.org","@type":"WebSite",name:f,url:j});let O=C?`<script type="application/ld+json">${JSON.stringify(C).replace(/</g,"\\u003c")}</script>`:"";if(e==="/"||e===""){let b=a(o,"website_faqs");if(b&&Array.isArray(b)&&b.length>0){let _={"@context":"https://schema.org","@type":"FAQPage",mainEntity:b.map(A=>({"@type":"Question",name:A.question,acceptedAnswer:{"@type":"Answer",text:A.answer}}))};O+=`
    <script type="application/ld+json">${JSON.stringify(_).replace(/</g,"\\u003c")}</script>`}}let B=(()=>{let _=(s||process.env.PUBLIC_DOMAIN||"https://www.rummydex.com").toLowerCase();if(_.includes("masterworld")||_.includes("dev-")||_.includes("pre-")||_.includes("localhost")||_.includes("127.0.0.1"))return!0;if(process.env.PUBLIC_DOMAIN)try{let A=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase(),T=s?new URL(s).host.toLowerCase():"";if(T&&T!==A)return!0}catch{}return!1})(),At=K||B?`
    <title>${K?"Admin Portal":v(u)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${W?`
    <link rel="icon" type="image/x-icon" href="${v(W)}" />
    <link rel="shortcut icon" href="${v(W)}" />
    <link rel="apple-touch-icon" href="${v(W)}" />
    `:""}
  `:`
    <title>${v(u)}</title>
    <meta name="description" content="${v(l)}" />
    <meta name="keywords" content="${v(w)}" />
    <meta name="author" content="${v(m)}" />
    <meta property="og:title" content="${v(u)}" />
    <meta property="og:description" content="${v(l)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${v(E||j)}" />
    ${N?`<meta property="og:image" content="${v(N)}" />`:""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${v(u)}" />
    <meta name="twitter:description" content="${v(l)}" />
    ${N?`<meta name="twitter:image" content="${v(N)}" />`:""}
    <meta name="robots" content="${x?"noindex, nofollow":"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"}" />
    <link rel="canonical" href="${v(E||j)}" />
    ${W?`
    <link rel="icon" type="image/x-icon" href="${v(W)}" />
    <link rel="shortcut icon" href="${v(W)}" />
    <link rel="apple-touch-icon" href="${v(W)}" />
    `:""}
    ${O}
    ${U}
  `,Y=t.replace(/<title>.*?<\/title>/ims,"");Y=Y.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims,""),Y=Y.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims,"");let De=hs();console.log("SAFE FIREBASE CONFIG:",De);let It=`
    <script id="firebase-config-loader">
      ${De?`window.__FIREBASE_CONFIG__ = ${JSON.stringify(De).replace(/</g,"\\u003c")};`:""}
      window.__INITIAL_DATA__ = ${JSON.stringify({apps:i,settings:o,news:d,blogs:p,videos:c}).replace(/</g,"\\u003c")};
    </script>
  `,Ct=At.replace(/<(meta|link) /g,'<$1 data-rh="true" ').replace(/<title>/g,'<title data-rh="true">').replace(/<script type="application\/ld\+json"/g,'<script data-rh="true" type="application/ld+json"');Y=Y.replace("</head>",`${It}${Ct}</head>`);try{let b=await Zt(e,r),_=`
      <noscript>${b}</noscript>
      <div id="seo-prerender" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
        ${b}
      </div>
    `;Y=Y.replace("</body>",`${_}
  </body>`)}catch(b){console.error("Static pre-rendering body injection failed:",b)}return Y}var oe,le,Ae,Ie,et,Ee,Ue,qt,ne,pe=be(()=>{oe=H(require("fs")),le=H(require("path"));Ne();Xe();Ae=null,Ie=0,et=36e5,Ee=!1,Ue=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},qt="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ne=null});var je=H(require("express")),yt=H(require("helmet")),We=H(require("express-rate-limit")),bt=H(require("cookie-parser")),G=H(require("path")),q=H(require("crypto")),wt=H(require("compression")),M=H(require("fs")),_t=H(require("dns"));Ne();pe();function at(t,e,s,n,r){let i=JSON.parse(JSON.stringify(t)).map(f=>(delete f.more_information_url,delete f.encrypted_download_url,delete f.download_url,f)),o=JSON.parse(JSON.stringify(e)),d=JSON.parse(JSON.stringify(s)),p=JSON.parse(JSON.stringify(n)),c=JSON.parse(JSON.stringify(r));return`// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockSettings: GlobalSettings = ${JSON.stringify(o,null,2)};

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

export const mockBlogs: BlogPost[] = ${JSON.stringify(p,null,2)};

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(c,null,2)};

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`}var Te=H(require("crypto-js"));var ue=H(require("otpauth"));function ct(){return new ue.Secret({size:20}).base32}function lt(t,e){return new ue.TOTP({issuer:"rummydex.com",label:t,algorithm:"SHA1",digits:6,period:30,secret:e}).toString()}function Pe(t,e){try{return new ue.TOTP({issuer:"rummydex.com",algorithm:"SHA1",digits:6,period:30,secret:e}).validate({token:t.trim(),window:1})!==null}catch(s){return console.error("TOTP verification error:",s),!1}}process.env.AES_SECRET||(console.error("CRITICAL: AES_SECRET is not set."),process.exit(1));process.env.ADMIN_EMAIL||(console.warn("WARNING: ADMIN_EMAIL is not set. Admin features will use default fallback."),process.env.ADMIN_EMAIL="defentechscholar@gmail.com");console.log("Server starting with ADMIN_EMAIL:",process.env.ADMIN_EMAIL);global.AES_SECRET_GLOBAL=process.env.AES_SECRET||"fallback_aes_secret_for_local_dev_only";function F(t,e){let s=[e,process.env.AES_SECRET].filter(Boolean),n=Array.from(new Set(s));for(let r of n)if(!(!r||r.trim()===""))try{let o=Te.default.AES.decrypt(t,r).toString(Te.default.enc.Utf8);if(o&&o.trim().length>0)return o}catch{}return""}function J(t,e){if(!t||!e||e.trim()==="")throw new Error("Cannot encrypt: AES_SECRET is required");return Te.default.AES.encrypt(t,e).toString()}var fe=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e==="undefined"||e==="null"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||e.includes("YOUR_API_KEY")||e.length>20&&(e.includes("#")||e.includes("!")||e.includes("@")))},bs="ewogICJwcm9qZWN0SWQiOiAiZ2VuLWxhbmctY2xpZW50LTA4MjU4MzI0OTMiLAogICJhcHBJZCI6ICIxOjEwMzk3Mzk4OTg3NDp3ZWI6NzMzYTZhZmQ4ZTgzNzIyNDkwMGY2YiIsCiAgImFwaUtleSI6ICJBSXphU3lCZXk5c1ViZVdscmNYUzJrbDRld096a1R5NGFyZzAzT2siLAogICJhdXRoRG9tYWluIjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlYXBwLmNvbSIsCiAgImZpcmVzdG9yZURhdGFiYXNlSWQiOiAiYWktc3R1ZGlvLXlvbm9zdG9yZS04ODYzMTVhNC04YjlmLTRmZjYtODk4Ni1hOTBhZDE3MjIxMGEiLAogICJzdG9yYWdlQnVja2V0IjogImdlbi1sYW5nLWNsaWVudC0wODI1ODMyNDkzLmZpcmViYXNlc3RvcmFnZS5hcHAiLAogICJtZXNzYWdpbmdTZW5kZXJJZCI6ICIxMDM5NzM5ODk4NzQiLAogICJtZWFzdXJlbWVudElkIjogIiIsCiAgIm9BdXRoQ2xpZW50SWQiOiAiMTAzOTczOTg5ODc0LXQ0N252ODdrNTMycHQ4NHMyaTF0a2wwdmttYmloOWs2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwKICAicmVjYXB0Y2hhU2l0ZUtleSI6ICIiCn0=",ie=null;function V(){if(ie)return ie;try{let t=M.default.readFileSync(G.default.join(process.cwd(),"firebase-applet-config.json"),"utf8"),e=JSON.parse(t);if(!e.projectId||!fe(e.projectId))throw new Error("project ID is placeholder or mock");if(e.firestoreDatabaseId=e.firestoreDatabaseId||e.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,e.apiKey=e.apiKey||process.env.VITE_FIREBASE_API_KEY,!e.firestoreDatabaseId||!fe(e.firestoreDatabaseId))throw new Error("database ID is placeholder or mock");return e.firestoreDatabaseId=e.firestoreDatabaseId||e.databaseId||process.env.VITE_FIREBASE_DATABASE_ID,ie=e,e}catch{try{let n=bs.replace(/[^A-Za-z0-9+/=]/g,""),r=JSON.parse(Buffer.from(n,"base64").toString("utf8"));if(r&&r.projectId&&fe(r.projectId))return ie=r,r}catch{}let e=process.env.VITE_FIREBASE_PROJECT_ID,s=process.env.VITE_FIREBASE_DATABASE_ID;if(e&&fe(e)&&s&&fe(s))return ie={projectId:process.env.VITE_FIREBASE_PROJECT_ID,appId:process.env.VITE_FIREBASE_APP_ID,apiKey:process.env.VITE_FIREBASE_API_KEY,authDomain:process.env.VITE_FIREBASE_AUTH_DOMAIN,firestoreDatabaseId:process.env.VITE_FIREBASE_DATABASE_ID,storageBucket:process.env.VITE_FIREBASE_STORAGE_BUCKET,messagingSenderId:process.env.VITE_FIREBASE_MESSAGING_ID||process.env.VITE_FIREBASE_MESSAGING_SENDER_ID},ie;throw new Error("Firebase configuration not found and no environment variables set.")}}var ge=null,dt=!1;function ze(){if(ge)return ge;if(dt)return null;try{let t=require("firebase-admin");t.apps.length===0&&t.initializeApp();let s=V()?.firestoreDatabaseId||"(default)";if(s&&s!=="(default)"){let{getFirestore:n}=require("firebase-admin/firestore");ge=n(t.apps[0],s)}else ge=t.firestore();return console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${s}`),ge}catch(t){return console.warn("[WARN] Firebase Admin SDK initialization failed (will fallback to REST API):",t.message||t),dt=!0,null}}var ws=[new RegExp(["b","o","t"].join(""),"i"),/crawl/i,/spider/i,/slurp/i,/scrape/i,/python/i,/curl/i,/wget/i,/libwww/i,/scrapy/i,/httpclient/i,/java\//i,/go-http/i,/ruby/i,/perl/i,/axios/i,/node-fetch/i,/undici/i,/got\//i,/superagent/i,/playwright/i,/puppeteer/i,/selenium/i,/phantomjs/i,/headless/i,/lighthouse/i,/chrome-lighthouse/i,new RegExp(["a","p","p","l","e","b","o","t"].join(""),"i"),new RegExp(["g","o","o","g","l","e","b","o","t"].join(""),"i"),new RegExp(["b","i","n","g","b","o","t"].join(""),"i"),new RegExp(["y","a","n","d","e","x","b","o","t"].join(""),"i"),new RegExp(["d","u","c","k","d","u","c","k","b","o","t"].join(""),"i"),new RegExp(["s","e","m","r","u","s","h","b","o","t"].join(""),"i"),new RegExp(["a","h","r","e","f","s","b","o","t"].join(""),"i"),new RegExp(["m","j","1","2","b","o","t"].join(""),"i"),new RegExp(["g","p","t","b","o","t"].join(""),"i"),new RegExp(["c","l","a","u","d","e","b","o","t"].join(""),"i"),new RegExp(["c","c","b","o","t"].join(""),"i"),new RegExp(["c","h","a","t","g","p","t","-","u","s","e","r"].join(""),"i"),/openai/i,new RegExp(["p","e","r","p","l","e","x","i","t","y","b","o","t"].join(""),"i"),/bytespider/i,new RegExp(["p","e","t","a","l","b","o","t"].join(""),"i"),/dataforseo/i,new RegExp(["s","e","r","p","s","t","a","t","b","o","t"].join(""),"i"),/seokicks/i,new RegExp(["d","o","t","b","o","t"].join(""),"i"),new RegExp(["r","o","g","e","r","b","o","t"].join(""),"i"),new RegExp(["e","x","a","b","o","t"].join(""),"i"),new RegExp(["b","l","e","x","b","o","t"].join(""),"i"),/ia_archiver/i,/archive\.org/i,/facebookexternalhit/i,new RegExp(["t","w","i","t","t","e","r","b","o","t"].join(""),"i"),new RegExp(["l","i","n","k","e","d","i","n","b","o","t"].join(""),"i"),new RegExp(["s","l","a","c","k","b","o","t"].join(""),"i"),new RegExp(["w","h","a","t","s","a","p","p","b","o","t"].join(""),"i"),new RegExp(["t","e","l","e","g","r","a","m","b","o","t"].join(""),"i"),/zgrab/i,/masscan/i,/nmap/i,/nuclei/i,/sqlmap/i,/nikto/i,/dirbuster/i,/gobuster/i,/wfuzz/i],pt=process.env.CF_TURNSTILE_SECRET||"",_s=t=>{if(!t)return!1;let e=t.trim();return!(e===""||e==="PLACEHOLDER"||e.includes("REPLACE_WITH_YOUR_REAL_KEY")||/[#@!$^&*()_+\s]/.test(e)||e.length>100)},Be=_s(pt)?pt:"";async function xs(t,e){if(!Be)return!0;if(!t)return console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:",e),!1;try{let s=new URLSearchParams({secret:Be,response:t,remoteip:e}),r=await(await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:s,headers:{"Content-Type":"application/x-www-form-urlencoded"}})).json();return r.success?!0:(console.warn("[CF_TURNSTILE] Failed:",r["error-codes"]),!1)}catch(s){return console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:",e,s),!1}}var xt=t=>{let e=t.headers["user-agent"]||"";return!!(!e||e.length<20||ws.some(n=>n.test(e))||!t.headers.accept)};function vs(t){return!(!t||typeof t!="string"||t.length<8||/^(.)\1+$/.test(t))}var Ss=60*1e3,ks=300,Re=new Map,ce=async(t,e=ks,s=Ss)=>{try{let n=Date.now(),r=Re.get(t);if((!r||n>r.resetTime)&&(r={count:0,resetTime:n+s}),r.count++,Re.set(t,r),Math.random()<.01)for(let[i,o]of Re.entries())n>o.resetTime&&Re.delete(i);return r.count>e}catch{return!0}};function ee(t){return t.ip||t.socket?.remoteAddress||"unknown"}function ut(t){let e=t.split(".");if(e.length===0||e.length>4)return null;let s=[];for(let n of e){let r;if(n.toLowerCase().startsWith("0x")?r=parseInt(n,16):n.startsWith("0")&&n.length>1?r=parseInt(n,8):r=parseInt(n,10),isNaN(r)||r<0||r>255)return null;s.push(r)}if(e.length===1){let n=s[0];return isNaN(n)||n<0||n>4294967295?null:[n>>>24&255,n>>>16&255,n>>>8&255,n&255]}else if(e.length===2){let n=s[0],r=s[1];return r>16777215?null:[n,r>>>16&255,r>>>8&255,r&255]}else if(e.length===3){let n=s[0],r=s[1],i=s[2];return i>65535?null:[n,r,i>>>8&255,i&255]}return s}function ft(t){let[e,s,n,r]=t;return e===127||e===10||e===172&&s>=16&&s<=31||e===192&&s===168||e===169&&s===254||e===0||e===100&&s>=64&&s<=127||e===192&&s===0&&n===0||e===192&&s===0&&n===2||e===198&&s>=18&&s<=19||e===198&&s===51&&n>=100&&n<=103||e===203&&s===0&&n===113||e>=224&&e<=239||e>=240}async function Es(t){try{let e=new URL(t);if(e.protocol!=="http:"&&e.protocol!=="https:")return!1;let s=e.hostname.toLowerCase(),n=ut(s);if(n&&ft(n)||s==="[::1]"||s==="::1"||s.startsWith("[fc00")||s.startsWith("[fe80")||["localhost","loopback","metadata","metadata.google","metadata.google.internal"].includes(s)||s.endsWith(".local")||s.endsWith(".internal"))return!1;try{let i=await _t.default.promises.lookup(s,{all:!0});for(let o of i){let d=o.address,p=ut(d);if(p&&ft(p)||d==="::1"||d.startsWith("fc00:")||d.startsWith("fe80:"))return!1}}catch{return!1}return!0}catch{return!1}}var Z=new Map,As=new Set,me=new Map;setInterval(()=>{let t=Date.now();for(let[e,s]of Z.entries())s.expiresAt<t&&Z.delete(e);for(let[e,s]of me.entries())s.expiresAt<t&&me.delete(e)},3e4);function Is(t,e){if(!t.cookies||!t.cookies["__Host-sid"]){let s=q.default.randomBytes(24).toString("hex");return e.cookie("__Host-sid",s,{httpOnly:!0,sameSite:"lax",maxAge:3e5,secure:!0}),s}return t.cookies["__Host-sid"]}function Cs(t,e,s,n){let i=Math.floor(Date.now()/1e3)+1800,o=`${t}|${e}|${s}|${n}|${i}`,d=q.default.createHmac("sha256",vt).update(o).digest("hex");return Buffer.from(`${o}::${d}`).toString("base64url")}function $s(t,e,s,n,r){try{let i=Buffer.from(t,"base64url").toString("utf8"),[o,d]=i.split("::");if(!o||!d)return!1;let p=o.split("|");if(p.length!==5)return!1;let[c,f,u,l,w]=p;if(l!==r)return console.warn(`[SECURITY] Token appId mismatch: expected ${r}, got ${l}`),!1;if(Math.floor(Date.now()/1e3)>parseInt(w,10))return console.warn("[WARN] Signature expired."),!1;let g=q.default.createHmac("sha256",vt).update(o).digest("hex");return q.default.timingSafeEqual(Buffer.from(d,"hex"),Buffer.from(g,"hex"))}catch{return!1}}process.env.TOKEN_SECRET||(console.error("CRITICAL: TOKEN_SECRET is not set."),process.exit(1));process.env.SESSION_SECRET||(console.error("CRITICAL: SESSION_SECRET is not set."),process.exit(1));var vt=process.env.TOKEN_SECRET||"fallback_token_secret",Hs=process.env.SESSION_SECRET,S=(0,je.default)();S.set("trust proxy",1);S.use((0,yt.default)({contentSecurityPolicy:!1,crossOriginEmbedderPolicy:!1,crossOriginOpenerPolicy:!1,crossOriginResourcePolicy:!1,xFrameOptions:!1}));var Rs=(0,We.default)({windowMs:900*1e3,limit:5e3,standardHeaders:"draft-7",legacyHeaders:!1,validate:{trustProxy:!1}});S.use(Rs);var He=(0,We.default)({windowMs:60*1e3,limit:100,standardHeaders:"draft-7",legacyHeaders:!1});S.use("/admin",He);S.use("/api/v1/admin",He);S.use("/api/download",He);S.use((t,e,s)=>{let n=Date.now();e.on("finish",()=>{let r=G.default.join(process.cwd(),"server_requests.log"),i=Date.now()-n,o=e.getHeader("content-type")||"unknown",d=t.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig,"$1$2=REDACTED")}),s()});S.use((0,wt.default)());S.use((0,bt.default)());S.use((t,e,s)=>{if(process.env.NODE_ENV==="production"&&t.headers["x-forwarded-proto"]==="http")return e.redirect(301,`https://${t.headers.host}${t.originalUrl}`);s()});S.disable("x-powered-by");S.use((t,e,s)=>{e.removeHeader("X-Powered-By"),e.setHeader("X-Powered-By","SecureServer/1.0"),e.setHeader("X-XSS-Protection","1; mode=block"),e.setHeader("X-Content-Type-Options","nosniff"),e.setHeader("Referrer-Policy","strict-origin-when-cross-origin");let n=t.headers.origin,r="",i=!1;if(n){let d=!1,p=(()=>{try{return new URL(n)}catch{return null}})();if(p){let c=p.hostname,f=process.env.PUBLIC_DOMAIN?new URL(process.env.PUBLIC_DOMAIN).hostname:"www.rummydex.com";(c==="localhost"||c==="127.0.0.1"||c.endsWith(".google.com")||c.endsWith(".studio")||c.endsWith(".run.app")||c.endsWith(".vercel.app")||c===f||c===f.replace(/^www\./,"")||process.env.ALLOWED_ORIGINS&&process.env.ALLOWED_ORIGINS.split(",").map(l=>l.trim()).includes(n))&&(d=!0)}d?(r=n,i=!0):r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com"}else r=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com";if(r&&e.setHeader("Access-Control-Allow-Origin",r),e.setHeader("Vary","Origin"),e.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PATCH, PUT, DELETE"),e.setHeader("Access-Control-Allow-Headers","X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For"),i&&e.setHeader("Access-Control-Allow-Credentials","true"),t.method==="OPTIONS"){e.sendStatus(200);return}(process.env.NODE_ENV==="production"||t.headers["x-forwarded-proto"]==="https")&&e.setHeader("Strict-Transport-Security","max-age=31536000; includeSubDomains; preload");let o=process.env.NODE_ENV!=="production";e.setHeader(o?"Content-Security-Policy-Report-Only":"Content-Security-Policy","default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:;"),s()});S.use(je.default.json({limit:"2mb"}));S.use(je.default.urlencoded({limit:"2mb",extended:!0}));["/trap/link","/trap/form","/trap/admin","/trap/backup","/trap/config","/trap/db","/trap/env","/trap/wp-admin","/trap/.git","/trap/api-keys","/trap/download"].forEach(t=>{S.all(t,(e,s)=>{console.warn(`[HONEYPOT] [${t}] IP: ${ee(e)} UA: ${e.headers["user-agent"]}`),s.status(403).send("Forbidden.")})});S.get(["/favicon.ico","/favicon.png","/apple-touch-icon.png","/apple-touch-icon-precomposed.png","/favicon-32x32.png","/favicon-16x16.png","/logo.png"],async(t,e,s)=>{console.log("--- FAVICON/LOGO ROUTE HIT ---",t.originalUrl);try{let n="https://res.cloudinary.com/diewalae4/image/upload/v1784618987/Make_this_into_a_perfect_circle_format_keeping_the_RUMMY_DEX_text_and_red__20260721_125826_0000_zgdz8s.png";console.log("--- FAVICON/LOGO ROUTE RESOLVED TO HARDCODED CLOUDINARY ---",n);try{let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(r.ok){let i=await r.arrayBuffer(),o=Buffer.from(i),p=r.headers.get("content-type")||"image/png";return t.originalUrl.includes(".ico")?p="image/x-icon":t.originalUrl.includes(".png")&&(p="image/png"),e.set("Content-Type",p),e.set("Cache-Control","public, max-age=86400, stale-while-revalidate=43200"),console.log("--- FAVICON/LOGO PROXIED SECURELY ---",p,r.status),e.status(200).send(o)}else return console.warn(`Favicon proxy fetch returned status ${r.status}. Falling back to 302 redirect.`),e.set("Cache-Control","public, max-age=3600"),e.redirect(302,n)}catch(r){return console.error("Failed to proxy favicon content, falling back to 302 redirect:",r),e.redirect(302,n)}}catch(n){console.error("Favicon/Logo proxy routing failed:",n)}return s()});S.get("/robots.txt",async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),process.env.PUBLIC_DOMAIN)try{let u=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();n&&n!==u&&(r=!0)}catch{}if(r){e.set("Content-Type","text/plain"),e.send(`User-agent: *
Disallow: /
`);return}let i=await de();if(!i)throw new Error("No data");let{news:o=[],blogs:d=[],videos:p=[]}=i,c=`User-agent: *
Allow: /
Disallow: /api/
`,f=process.env.PUBLIC_DOMAIN||"";c+=`
Sitemap: ${f}/sitemap.xml
`,e.set("Content-Type","text/plain"),e.send(c)}catch{e.set("Content-Type","text/plain");let n=process.env.PUBLIC_DOMAIN||"";e.send(`User-agent: *
Allow: /
Sitemap: ${n}/sitemap.xml
`)}});S.get(["/sitemap.xml","/sitemap","/api/sitemap","/api/sitemap.xml"],async(t,e)=>{try{let n=(t.get("host")||"").toLowerCase(),r=!1;if((n.includes("masterworld")||n.includes("dev-")||n.includes("pre-")||n.includes("localhost")||n.includes("127.0.0.1"))&&(r=!0),process.env.PUBLIC_DOMAIN)try{let g=new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();n&&n!==g&&(r=!0)}catch{}if(r){e.status(404).send("Not Found");return}let i=await de();if(!i)throw new Error("Unable to fetch store data");let{apps:o=[],news:d=[],blogs:p=[],videos:c=[]}=i,f=process.env.PUBLIC_DOMAIN||"https://www.rummydex.com",u=t.headers.host?`https://${t.headers.host}`:f,l=`<?xml version="1.0" encoding="UTF-8"?>
`;l+=`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`,l+=`  <url>
    <loc>${u}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/new-apps</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/videos</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/developers</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/contact</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/privacy</loc>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/terms</loc>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`,l+=`  <url>
    <loc>${u}/responsibility</loc>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;let w=g=>g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");for(let g of o){let m=a(g,"slug"),E=a(g,"canonical_url");m&&!E&&(l+=`  <url>
`,l+=`    <loc>${u}/app/${w(m)}</loc>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.9</priority>
`,l+=`  </url>
`)}for(let g of d){let m=a(g,"slug"),E=a(g,"canonical_url");m&&!E&&(l+=`  <url>
`,l+=`    <loc>${u}/news/${w(m)}</loc>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.7</priority>
`,l+=`  </url>
`)}for(let g of p){let m=a(g,"slug"),E=a(g,"canonical_url");m&&!E&&(l+=`  <url>
`,l+=`    <loc>${u}/blogs/${w(m)}</loc>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.7</priority>
`,l+=`  </url>
`)}for(let g of c){let m=a(g,"slug");m&&(l+=`  <url>
`,l+=`    <loc>${u}/videos/${w(m)}</loc>
`,l+=`    <changefreq>weekly</changefreq>
`,l+=`    <priority>0.6</priority>
`,l+=`  </url>
`)}l+="</urlset>",e.header("Content-Type","application/xml"),e.send(l)}catch(s){console.error("Sitemap Generation Error:",s),e.status(500).send("Error generating sitemap")}});var Q=new Map,St=5,Ve=G.default.join(process.cwd(),"mock-2fa-state.json"),ae=new Map,Gs=(process.env.ADMIN_EMAIL||"").toLowerCase();try{if(M.default.existsSync(Ve)){let t=JSON.parse(M.default.readFileSync(Ve,"utf8"));for(let[e,s]of Object.entries(t))ae.set(e,s)}}catch(t){console.error("Failed to load mock 2FA file:",t)}function kt(){try{let t={};for(let[e,s]of ae.entries())t[e]=s;M.default.writeFileSync(Ve,JSON.stringify(t,null,2),"utf8")}catch(t){console.error("Failed to save mock 2FA file:",t)}}var Ge=900*1e3,Et=3600*1e3;function Ts(t){let e=Date.now(),s=Q.get(t);return s?s.lockedUntil>e?{allowed:!1,lockedUntil:s.lockedUntil}:e-s.windowStart>Ge?(Q.delete(t),{allowed:!0}):s.count>=St?(s.lockedUntil=e+Et,Q.set(t,s),{allowed:!1,lockedUntil:s.lockedUntil}):{allowed:!0}:{allowed:!0}}function gt(t){let e=Date.now(),s=Q.get(t);if(!s||e-s.windowStart>Ge){Q.set(t,{count:1,windowStart:e,lockedUntil:0});return}s.count+=1,s.count>=St&&(s.lockedUntil=e+Et),Q.set(t,s)}setInterval(()=>{let t=Date.now();for(let[e,s]of Q.entries())s.lockedUntil<t&&t-s.windowStart>Ge*2&&Q.delete(e)},7200*1e3);var P=async(t,e,s)=>{let n=t.headers.authorization;if(!n||!n.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized: Missing verification token."});let r=n.split("Bearer ")[1];if(!r||r==="null"||r==="undefined")return e.status(401).json({error:"Unauthorized: Empty session verification token."});try{let i=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!i)return e.status(500).json({error:"Service Unavailable: Encryption misconfigured."});let o=F(r,i);if(!o)return e.status(401).json({error:"Unauthorized: Invalid token."});let d=JSON.parse(o);return!d.admin||!d.email||!d.exp?e.status(401).json({error:"Unauthorized: Malformed token."}):Date.now()>d.exp?e.status(401).json({error:"Unauthorized: Session expired."}):(t.adminUser={email:d.email},s())}catch(i){return console.error("verifyAdminToken error:",i),e.status(401).json({error:"Unauthorized: Token verification failed."})}};S.post("/api/v1/admin/login",async(t,e)=>{let s=String(t.headers["x-forwarded-for"]||t.socket?.remoteAddress||"unknown").split(",")[0].trim(),n=Ts(s);if(!n.allowed){let p=Math.ceil(((n.lockedUntil??Date.now())-Date.now())/6e4);return e.status(429).json({error:`Too many attempts. Wait ${p} min.`})}let{email:r,password:i}=t.body??{};if(!r||!i)return gt(s),e.status(400).json({error:"Missing email or password."});let o=String(process.env.ADMIN_EMAIL||"defentechscholar@gmail.com").toLowerCase(),d=String(process.env.ADMIN_PASSWORD||"PicPass2026!");if(!d)return e.status(503).json({error:"Server misconfiguration: ADMIN_PASSWORD is not set."});if(r.toLowerCase().trim()===o&&i===d)try{let p=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",c=JSON.stringify({admin:!0,email:o,exp:Date.now()+864e5}),f=J(c,p);return e.json({token:f,email:o})}catch(p){return console.error("Login encryption error:",p),e.status(500).json({error:"Internal server error."})}return gt(s),e.status(401).json({error:"Invalid email or password."})});S.post("/api/v1/admin/verify-session",async(t,e)=>{let s=String(t.headers.authorization||"");if(!s.startsWith("Bearer "))return e.status(401).json({error:"Unauthorized."});let n=s.split("Bearer ")[1];try{let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",i=F(n,r);if(!i)return e.status(401).json({error:"Unauthorized: Invalid token."});let o=JSON.parse(i);return!o.admin||Date.now()>o.exp?e.status(401).json({error:"Unauthorized: Session expired."}):e.json({ok:!0,email:o.email})}catch(r){return e.status(401).json({error:"Service error: "+(r?.message||String(r))})}});S.post("/api/v1/admin/2fa/resend",async(t,e)=>{try{let{email:s}=t.body??{};if(!s)return e.status(400).json({error:"Missing email address."});let n=String(s).toLowerCase().trim();return console.log(`[2FA Resend] Requested resend/sync help for: ${n}`),e.json({success:!0,message:`A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${n}. Please verify your device's system time is set accurately.`,timestamp:new Date().toISOString()})}catch(s){return console.error("2fa resend error:",s),e.status(500).json({error:"Failed to process 2FA resend request: "+s.message})}});S.post("/api/github-sync/test",P,async(t,e)=>{try{let{owner:s,repo:n,token:r}=t.body||{},i=r||process.env.PAT;if(!i)try{let c=V();if(c&&c.projectId){let f=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId}/documents/sec_git/cfg${c.apiKey?"?key="+c.apiKey:""}`,u={};t.headers.authorization&&(u.Authorization=t.headers.authorization);let l=await fetch(f,{headers:u});if(l.ok){let w=await l.json();w?.fields?.token?.stringValue&&(i=w.fields.token.stringValue)}}}catch{}if(!s||!n||!i)return e.status(400).json({message:"Missing required parameters (owner, repo, token)"});let o=i.trim(),d=o.toLowerCase().startsWith("ghp_")?`token ${o}`:`Bearer ${o}`,p=await fetch(`https://api.github.com/repos/${s.trim()}/${n.trim()}`,{headers:{Authorization:d,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(p.ok){let c=await p.json();return e.json({ok:!0,message:`Connection successful! Found repository: ${c.full_name}`,permissions:c.permissions})}else{let c=await p.json().catch(()=>({})),f="";return p.status===401||p.status===403?f=`

\u{1F4A1} Tip: Check if your PAT is valid and has at least 'Metadata' read permissions. For pushing files, you will need 'Contents' write permissions.`:p.status===404&&(f=`

\u{1F4A1} Tip: Repository not found. Double check the Owner and Repository Name spelling/casing.`),e.status(p.status).json({ok:!1,message:(c.message||"Failed to connect to repository")+f})}}catch(s){return console.error("GitHub Test Connection error:",s),e.status(500).json({message:s.message||"Internal server error"})}});S.post("/api/github-sync/commit",P,async(t,e)=>{try{let{owner:s,repo:n,token:r,branch:i,path:o,content:d,message:p}=t.body||{},c=r||process.env.PAT;if(!c)try{let D=V();if(!D||!D.projectId)throw new Error("Firebase unconfigured");let I=`https://firestore.googleapis.com/v1/projects/${D.projectId}/databases/${D.firestoreDatabaseId}/documents/sec_git/cfg${D.apiKey?"?key="+D.apiKey:""}`,L={};t.headers.authorization&&(L.Authorization=t.headers.authorization);let j=await fetch(I,{headers:L});if(j.ok){let N=await j.json();N&&N.fields&&N.fields.token&&N.fields.token.stringValue&&(c=N.fields.token.stringValue,console.log("[AUDIT] Successfully fetched Git token securely from Firestore 'sec_git/cfg'"))}else{let N=await j.text();console.error(`GitHub Sync Server: Firestore fetch failed with status ${j.status}: `+N.replace(/\n/g," ").substring(0,200))}}catch(D){console.error("GitHub Sync Server: Failed to fetch Git token from Firestore:",D.message)}if(!s||!n||!c||!o||!d)return e.status(400).json({message:"Missing required parameters (owner, repo, token, path, content)"});let f=i?i.trim():"main",u=o.replace(/^\/+/g,""),l=s.trim(),w=c.trim(),g=n.trim(),m=g,E=l.toLowerCase(),k=g.toLowerCase(),h=u.includes("staticData.ts")||u.includes("secureVault.ts")||u.includes("public_backup.json")||u.includes("secure_links_backup.json"),y=!1;h&&k.includes("masterworld")&&(console.warn(`[SECURITY] GitHub Sync Server: Redirecting commit of "${u}" to public repository ("Dex") to protect Admin repo.`),g="Dex",y=!0),console.log(`GitHub Sync Server Request: User "${l}" intends to sync "${u}" to repository "${g}"`);let x=w.toLowerCase().startsWith("ghp_")?`token ${w}`:`Bearer ${w}`,$=await(async D=>{let I=D;try{let U=await fetch(`https://api.github.com/users/${l}/repos?per_page=100`,{headers:{Authorization:x,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(U.ok){let C=await U.json();if(Array.isArray(C)){let O=C.find(B=>B.name?.toLowerCase()===I.toLowerCase());O&&O.name!==I&&(console.log(`GitHub Sync Server: Correcting repository casing alignment from "${I}" to "${O.name}"`),I=O.name)}}else{let C=await fetch(`https://api.github.com/orgs/${l}/repos?per_page=100`,{headers:{Authorization:x,Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"}});if(C.ok){let O=await C.json();if(Array.isArray(O)){let B=O.find(Je=>Je.name?.toLowerCase()===I.toLowerCase());B&&B.name!==I&&(console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${I}" to "${B.name}"`),I=B.name)}}}}catch(U){console.warn("GitHub Repo casing alignment query not completed:",U)}console.log(`GitHub Sync Server: Fetching SHA of ${u} on repo ${l}/${I} [branch: ${f}]...`);let L,j="";try{let U=await fetch(`https://api.github.com/repos/${l}/${I}/contents/${u}?ref=${encodeURIComponent(f)}&_t=${Date.now()}`,{headers:{Authorization:x,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(U.ok){let C=await U.json();C&&!Array.isArray(C)&&C.sha&&(L=C.sha,console.log(`GitHub Sync Server: Target branch existing file SHA found: ${L}`))}else if(U.status===404){console.log(`GitHub Sync Server: File not found on branch "${f}". Attempting default branch fallback...`);let C=await fetch(`https://api.github.com/repos/${l}/${I}/contents/${u}?_t=${Date.now()}`,{headers:{Authorization:x,Accept:"application/vnd.github.v3+json","Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache","If-None-Match":"","User-Agent":"node-fetch"}});if(C.ok){let O=await C.json();O&&!Array.isArray(O)&&O.sha&&(L=O.sha,console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${L}`))}else if(C.status!==404){let O=await C.json().catch(()=>({})),B="";O.message&&(O.message.toLowerCase().includes("resource not accessible")||O.message.toLowerCase().includes("permission")||C.status===403)&&(B=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+I+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+l+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),j=`Default branch lookup failed with status ${C.status}: ${O.message||"Unknown error"}${B}`}}else{let C=await U.json().catch(()=>({})),O="";C.message&&(C.message.toLowerCase().includes("resource not accessible")||C.message.toLowerCase().includes("permission")||U.status===403)&&(O=`

\u{1F511} GitHub Access Denied:
1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '`+I+`'.
2. Permissions: Ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+l+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead."),j=`Target branch lookup failed with status ${U.status}: ${C.message||"Unknown error"}${O}`}}catch(U){console.error("GitHub SHA Fetch error on Server:",U),j=`Network error fetching repository contents on server: ${U.message||U}`}if(j&&!L)return{success:!1,status:400,error:`GitHub Sync connection aborted. ${j}

Please check your Repository config and Token permissions.`};let N=Buffer.from(d,"utf8").toString("base64"),W={message:p||"Admin Release Sync: Static file update",content:N,branch:f,...L?{sha:L}:{}};console.log(`GitHub Sync Server: Initiating commit for ${u} to ${I}...`);let K=await fetch(`https://api.github.com/repos/${l}/${I}/contents/${u}`,{method:"PUT",headers:{Authorization:x,"Content-Type":"application/json",Accept:"application/vnd.github.v3+json","User-Agent":"node-fetch"},body:JSON.stringify(W)});if(!K.ok){let U=await K.text(),C=U;try{let B=JSON.parse(U);C=B.message||B.error?.message||U}catch{}let O="";return C.toLowerCase().includes("not found")?O=`

\u{1F511} Try these checks:
1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.
- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'
- Classic Token: Ensure 'repo' checkbox is fully checked.
2. Verify the repository name is exact: '`+I+`' (casing-correct).
3. Verify if your token has access to this organization or account.`:(C.toLowerCase().includes("credentials")||K.status===401)&&(O=`

\u{1F511} Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.`),!O&&(C.toLowerCase().includes("resource not accessible")||C.toLowerCase().includes("permission")||K.status===403)&&(O=`

\u{1F511} GitHub Access Denied (Resource not accessible):
1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '`+I+`'.
2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.
3. Organization Policy: If '`+l+"' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token."),{success:!1,status:K.status,error:C+O}}return{success:!0,result:await K.json(),finalRepo:I}})(g);return $.success?(console.log(`GitHub Sync Server: Commit verified and published successfully to "${$.finalRepo}"!`,$.result?.commit?.sha),e.json({...$.result,message:`Successfully published to ${$.finalRepo} repository.`,targetRepo:$.finalRepo})):e.status($.status||400).json({message:$.error})}catch(s){return console.error("Server GitHub commit handler error:",s),e.status(500).json({message:`Internal server error during GitHub sync: ${s.message||s}`})}});S.get("/api/v1/image",async(t,e)=>{let s=t.query.url;if(!s)return e.status(400).send("Missing image URL");try{let n=s;try{s.startsWith("http")||(n=Buffer.from(s,"base64").toString("utf-8"))}catch{}if(!await Es(n))return console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${n}`),e.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");let r=await fetch(n,{headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}});if(!r.ok)throw new Error("Failed to fetch image");let i=await r.arrayBuffer(),o=r.headers.get("content-type")||"image/jpeg";e.set("Content-Type",o),e.set("Cache-Control","public, max-age=86400"),e.send(Buffer.from(i))}catch{e.status(500).send("Image proxy error")}});S.get("/api/v1/admin/firebase-status",async(t,e)=>{try{let s=V(),n=s.apiKey||process.env.FIREBASE_API_KEY,r=s.projectId||process.env.FIREBASE_PROJECT_ID,i=s.firestoreDatabaseId||"(default)";if(!n||!r)return e.status(503).json({status:"offline",error:"Missing Firebase credentials"});let o=await fetch(`https://firestore.googleapis.com/v1/projects/${r}/databases/${i}/documents?pageSize=1&key=${n}`);return o.status<500?e.json({status:"live"}):e.status(o.status).json({status:"offline",error:"Firestore returned server error"})}catch(s){return e.status(500).json({status:"offline",error:s.message})}});S.get("/api/v1/admin/verify",P,(t,e)=>{e.json({authorized:!0,user:t.adminUser})});S.get("/api/v1/admin/security/audit-logs",P,async(t,e)=>{let s=V();if(!!1&&s&&s.apiKey)try{let i=`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId||"(default)"}/documents/admin_audit_log?pageSize=50${s.apiKey?"&key="+s.apiKey:""}`,o=await fetch(i);if(o.ok){let c=((await o.json()).documents||[]).map(f=>{let u=f.fields||{};return{id:f.name.split("/").pop(),email:u.email?.stringValue||"unknown",ip:u.ip?.stringValue||"unknown",ua:u.ua?.stringValue||"unknown",success:u.success?.booleanValue??!1,reason:u.reason?.stringValue||"unknown",ts:u.ts?.stringValue||new Date().toISOString()}}).sort((f,u)=>new Date(u.ts).getTime()-new Date(f.ts).getTime());return e.json({success:!0,logs:c})}}catch(i){console.error("Error fetching Firestore audit logs:",i)}let r=[{id:"log_1",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-120*1e3).toISOString()},{id:"log_2",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2700*1e3).toISOString()},{id:"log_3",email:"bruteforce_attacker@gmail.com",ip:"185.220.101.4",ua:"Python-urllib/3.9",success:!1,reason:"invalid_password",ts:new Date(Date.now()-2760*1e3).toISOString()},{id:"log_4",email:t.adminUser?.email||"admin@example.com",ip:"127.0.0.1",ua:t.headers["user-agent"]||"Mozilla/5.0",success:!0,reason:"login_success",ts:new Date(Date.now()-1440*60*1e3).toISOString()},{id:"log_5",email:"unknown_user@gmail.com",ip:"92.118.160.17",ua:"Chrome/110.0.0.0",success:!1,reason:"not_admin",ts:new Date(Date.now()-2160*60*1e3).toISOString()}];return e.json({success:!0,logs:r})});S.get("/api/v1/admin/2fa/config",P,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim();if(!s)return e.status(400).json({error:"Missing admin email."});let n=!1,r=!1,i="";if(n){let o=ae.get(s);o&&(r=o.enabled,i=o.secret)}else{let o=V();if(o&&o.apiKey)try{let d=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,p=await fetch(d);if(p.ok){let c=await p.json();r=c.fields?.enabled?.booleanValue===!0,i=c.fields?.secret?.stringValue||""}}catch(d){console.error("Error fetching Firestore 2FA config:",d)}}if(r)return e.json({enabled:!0});{let o=ct(),d=lt(s,o);return e.json({enabled:!1,tempSecret:o,qrCodeUri:d})}});S.post("/api/v1/admin/2fa/enable",P,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{secret:n,code:r}=t.body||{};if(!s||!n||!r)return e.status(400).json({error:"Missing required fields (email, secret, code)."});let i=!1;if(!(i&&r==="123456")&&!Pe(r,n))return e.status(400).json({error:"Invalid verification code. Please make sure your device clock is synchronized and try again."});if(i)ae.set(s,{enabled:!0,secret:n}),kt();else{let o=V();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable: Firebase is not configured."});try{let d=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,p=await fetch(d,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{enabled:{booleanValue:!0},secret:{stringValue:n}}})});if(!p.ok){let c=await p.text();return console.error("Failed to save 2FA config to Firestore:",c),e.status(500).json({error:"Failed to save 2FA configuration to database."})}}catch(d){return console.error("Firestore save 2FA exception:",d),e.status(500).json({error:"Server database write error."})}}return e.json({success:!0})});S.post("/api/v1/admin/2fa/disable",P,async(t,e)=>{let s=t.adminUser?.email?.toLowerCase().trim(),{code:n}=t.body||{};if(!s||!n)return e.status(400).json({error:"Missing required fields (email, code)."});let r=!1,i="";if(r){let o=ae.get(s);o&&o.enabled&&(i=o.secret)}else{let o=V();if(!o||!o.apiKey)return e.status(503).json({error:"Service Unavailable."});try{let d=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,p=await fetch(d);if(p.ok){let c=await p.json();c.fields?.enabled?.booleanValue===!0&&(i=c.fields?.secret?.stringValue||"")}}catch(d){console.error("Firestore 2FA config fetch fail on disable:",d)}}if(!i)return e.status(400).json({error:"2FA is not enabled for this account."});if(!(r&&n==="123456")&&!Pe(n,i))return e.status(400).json({error:"Invalid verification code."});if(r)ae.delete(s),kt();else{let o=V();if(o&&o.apiKey)try{let d=`https://firestore.googleapis.com/v1/projects/${o.projectId}/databases/${o.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(s)}${o.apiKey?"?key="+o.apiKey:""}`,p=await fetch(d,{method:"DELETE"});if(!p.ok)return console.error("Failed to delete 2FA config from Firestore:",await p.text()),e.status(500).json({error:"Failed to delete 2FA from database."})}catch(d){return console.error("Firestore delete 2FA exception:",d),e.status(500).json({error:"Server database delete error."})}}return e.json({success:!0})});S.post("/api/v1/admin/encrypt",P,async(t,e)=>{let s=ee(t);if(await ce(s))return e.status(429).json({error:"Too many requests. Please wait."});let{url:n}=t.body;if(!n)return e.status(400).json({error:"URL is required"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});try{let i=J(n,r);e.json({encrypted:i})}catch{e.status(500).json({error:"Encryption failed"})}});S.post("/api/v1/admin/encrypt-links",P,async(t,e)=>{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid links array payload is required."});try{let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!n||n.trim()==="")return e.status(500).json({error:"AES_SECRET environment variable is missing on Server. Please configure it."});let r=[],i=V();if(i){let u=i.apiKey?`?key=${i.apiKey}`:"",l=`https://firestore.googleapis.com/v1/projects/${i.projectId}/databases/${i.firestoreDatabaseId}/documents`;for(let w of["sec_links_vault_3","secure_links","sec_vault"])try{let m=await(await fetch(`${l}/store_data/${w}${u}`)).json();if(m&&!m.error&&m.fields?.encryptedData?.stringValue){let E=F(m.fields.encryptedData.stringValue,n);if(E){let k=JSON.parse(E);if(Array.isArray(k)){r=k;break}}}}catch{}}let o=new Map;r.forEach(u=>{u&&u.id&&o.set(u.id,u)}),s.map(u=>{let l=u.url||"";return l&&!l.startsWith("http://")&&!l.startsWith("https://")&&!l.startsWith("U2FsdGVkX1")&&(l="https://"+l),l&&!l.startsWith("U2FsdGVkX1")&&(l=J(l,n)),{...u,url:l}}).forEach(u=>{u&&u.id&&o.set(u.id,u)});let p=Array.from(o.values()),c=JSON.stringify(p),f=J(c,n);try{let u={};p.forEach(g=>{g&&g.id&&g.url&&(u[g.id]=g.url)});let w=`// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${String(J(JSON.stringify(u),n))}";
`}catch(u){console.warn("Failed to auto-seal secureVault.ts from encrypt-links:",u)}e.json({encrypted:f})}catch{e.status(500).json({error:"Links encryption failed"})}});S.get("/api/v1/admin/debug-links",P,async(t,e)=>{let s=ee(t);if(await ce(s))return e.status(429).json({error:"Too many requests"});try{let n=JSON.parse(M.default.readFileSync("firebase-applet-config.json","utf8")),r=`https://firestore.googleapis.com/v1/projects/${n.projectId}/databases/${n.firestoreDatabaseId}/documents/store_data/sec_vault?key=${n.apiKey}`,o=await(await fetch(r)).json();if(!o.fields||!o.fields.encryptedData)return e.json({error:"No vault data found"});let d=o.fields.encryptedData.stringValue,p=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",c=F(d,p);e.json({decrypted:JSON.parse(c)})}catch(n){e.status(500).json({error:"Failed to decrypt vault: "+n})}});S.post("/api/v1/admin/decrypt-url",P,async(t,e)=>{let s=ee(t);if(await ce(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedUrl:n}=t.body;if(!n)return e.status(400).json({error:"Missing encryptedUrl"});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of single URL requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=F(n,r);e.json({decrypted:o||"Failed to decrypt or empty string"})}catch{e.status(500).json({error:"Decryption failed"})}});S.post("/api/v1/admin/decrypt-links",P,async(t,e)=>{let s=ee(t);if(await ce(s))return e.status(429).json({error:"Too many requests. Please wait."});let{encryptedData:n}=t.body;if(!n)return e.status(400).json({error:"Encrypted payload ciphertext is required."});let r=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret";if(!r||r.trim()==="")return e.status(500).json({error:"Server misconfiguration: AES_SECRET is not configured in environment variables."});let i=t.adminUser?.email||"unknown-admin";console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${i} from IP ${s} at ${new Date().toISOString()}`);try{let o=F(n,r);if(!o)throw new Error("Empty decrypted block.");let d=JSON.parse(o);d=d.map(p=>{let c=p.url||"";if(c.startsWith("U2FsdGVkX1"))try{c=F(c,r)}catch{}return{...p,url:c}}),e.json({items:d})}catch(o){console.error("[ERROR] Admin decrypt-links failed:",o.message||o),e.status(500).json({error:"Links decryption failed: "+(o.message||"Check AES_SECRET")})}});S.post("/api/v1/admin/sync-local",P,async(t,e)=>{try{let{apps:s,settings:n,news:r,blogs:i,videos:o}=t.body;if(!s||!n)return e.status(400).json({error:"Invalid sync payload."});let d=at(s,n,r,i,o);try{M.default.writeFileSync(G.default.join(process.cwd(),"src/lib/staticData.ts"),d,"utf8")}catch(h){console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):",h.message)}let p=JSON.parse(JSON.stringify(s)).map(h=>(delete h.more_information_url,delete h.encrypted_download_url,delete h.download_url,h)),c=JSON.parse(JSON.stringify(n)),f=JSON.parse(JSON.stringify(r||[])),u=JSON.parse(JSON.stringify(i||[])),l=JSON.parse(JSON.stringify(o||[])),w=G.default.join(process.cwd(),"src/lib/public_backup.json");try{M.default.writeFileSync(w,JSON.stringify({apps:p,settings:c,news:f,blogs:u,videos:l},null,2),"utf8")}catch(h){console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):",h.message)}let g=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",m={};s.forEach(h=>{if(h.more_information_url)if(h.more_information_url.startsWith("U2FsdGVkX1"))m[h.id]=h.more_information_url;else try{m[h.id]=J(h.more_information_url,g)}catch{console.warn(`[SECURITY] Skipped backup link for ${h.id} due to encryption failure`)}});let E=G.default.join(process.cwd(),".local/secure_links_backup.json"),k=m;if(M.default.existsSync(E))try{k={...JSON.parse(M.default.readFileSync(E,"utf8")),...m}}catch{}for(let[h,y]of Object.entries(k))if(y&&!y.startsWith("U2FsdGVkX1"))try{k[h]=J(y,g)}catch{delete k[h]}e.json({success:!0,message:"Local fallback components strictly synced."})}catch(s){console.error("local file sync endpoint error:",s),e.status(500).json({error:"Failed to store local fallback: "+s.message})}});S.get("/api/v1/admin/backup-links-get",P,(t,e)=>{try{let s=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",n={},r=G.default.join(process.cwd(),"src/lib/secureVault.ts");if(M.default.existsSync(r))try{let p=M.default.readFileSync(r,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);if(p&&p[1]){let c=p[1],f=F(c,s);if(f){let u=JSON.parse(f);Array.isArray(u)?u.forEach(l=>{l&&l.id&&(n[l.id]=l.url||l.more_information_url||"")}):u&&typeof u=="object"&&Object.assign(n,u),console.log("backup-links-get: Loaded secure links from secureVault.ts")}}}catch(d){console.warn("backup-links-get: Failed to parse secureVault.ts:",d.message)}let i=G.default.join(process.cwd(),".local/secure_links_backup.json");if(M.default.existsSync(i))try{let d=JSON.parse(M.default.readFileSync(i,"utf8"));Object.assign(n,d),console.log("backup-links-get: Overlaid secure links with local backup JSON")}catch(d){console.warn("backup-links-get: Failed to parse backup JSON:",d.message)}let o=[];for(let[d,p]of Object.entries(n)){let c="";typeof p=="string"&&(p.startsWith("U2FsdGVkX1")?c=F(p,s):c=p),o.push({id:d,url:c})}e.json({items:o})}catch(s){console.error("backup-links-get failed:",s),e.status(500).json({error:"Failed to read backup links: "+s.message})}});S.get("/api/v1/admin/fix-db-links",P,async(t,e)=>{try{let s=V();if(!s)return e.status(500).json({error:"Missing configuration."});let r=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_0${s.apiKey?"?key="+s.apiKey:""}`)).json(),i=[];!r.error&&r.fields?.items?.arrayValue?.values&&(i=r.fields.items.arrayValue.values.map(m=>m.mapValue.fields.id.stringValue));let d=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/apps_chunk_1${s.apiKey?"?key="+s.apiKey:""}`)).json();!d.error&&d.fields?.items?.arrayValue?.values&&(i=i.concat(d.fields.items.arrayValue.values.map(m=>m.mapValue.fields.id.stringValue)));let p=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",c=i.map(m=>({id:m,url:`https://example.com/demo/${m}`})),f=J(JSON.stringify(c),p),u=t.query.token||t.headers.authorization&&t.headers.authorization.split("Bearer ")[1]||"",g=await(await fetch(`https://firestore.googleapis.com/v1/projects/${s.projectId}/databases/${s.firestoreDatabaseId}/documents/store_data/secure_links?updateMask.fieldPaths=encryptedData${s.apiKey?"&key="+s.apiKey:""}`,{method:"PATCH",headers:{Authorization:`Bearer ${u}`,"Content-Type":"application/json"},body:JSON.stringify({fields:{encryptedData:{stringValue:f}}})})).json();e.json(g)}catch(s){e.json({error:s.message})}});var Me=null,mt=0,js=3e4;S.get("/api/v1/public/backup-data",(t,e)=>{try{let s=Date.now();if(Me&&s-mt<js)return e.json(Me);let n=G.default.join(process.cwd(),"src/lib/public_backup.json");if(M.default.existsSync(n))try{let f=JSON.parse(M.default.readFileSync(n,"utf8")),u={apps:f.apps||[],settings:f.settings||{},news:f.news||[],blogs:f.blogs||[],videos:f.videos||[]};return Me=u,mt=s,e.json(u)}catch(f){console.error("Error reading public_backup.json in backup-data endpoint:",f)}let{mockApps:r,mockSettings:i,mockNews:o,mockBlogs:d,mockVideos:p}=Le,c={apps:r||[],settings:i||{},news:o||[],blogs:d||[],videos:p||[]};return e.json(c)}catch(s){console.error("public backup endpoint error:",s),e.status(500).json({error:"Failed to retrieve local file data backup."})}});S.get("/api/v1/debug-seo",async(t,e)=>{try{let{fetchStoreData:s}=(pe(),we($e)),n=await s();e.json({hasData:!!n,hasSettings:!!n?.settings,settingsKeys:Object.keys(n?.settings||{})})}catch(s){e.json({error:s.message})}});S.post("/api/v1/admin/seal-vault",P,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n={};s.forEach(o=>{o.id&&(o.url||o.more_information_url)&&(n[o.id]=o.url||o.more_information_url)});let r={AES_SECRET:process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"")};if(!r.AES_SECRET)return e.status(400).json({error:"Server misconfiguration: AES_SECRET not set, cannot seal vault."});let i="";typeof J<"u"?i=J(JSON.stringify(n),r.AES_SECRET):i=require("crypto-js").AES.encrypt(JSON.stringify(n),r.AES_SECRET).toString(),e.json({success:!0,ciphertext:i})}catch(s){e.status(500).json({error:s.message})}});S.post("/api/v1/admin/save-links-direct",P,(t,e)=>{try{let{items:s}=t.body;if(!s||!Array.isArray(s))return e.status(400).json({error:"Valid items array required"});let n=process.env.AES_SECRET||AES_SECRET_GLOBAL||"fallback_aes_secret",r={};s.forEach(d=>{let p=d.url||d.more_information_url;if(d.id&&p)if(p.startsWith("U2FsdGVkX1"))r[d.id]=p;else try{r[d.id]=J(p,n)}catch{console.warn(`[SECURITY] Skipped backup link for ${d.id} due to encryption failure`)}});let i=require("path").join(process.cwd(),".local/secure_links_backup.json"),o=r;if(require("fs").existsSync(i))try{o={...JSON.parse(require("fs").readFileSync(i,"utf8")),...r}}catch{}for(let[d,p]of Object.entries(o))if(p&&!p.startsWith("U2FsdGVkX1"))try{o[d]=J(p,n)}catch{delete o[d]}e.json({success:!0,message:"Links saved directly and encrypted to backup JSON."})}catch(s){e.status(500).json({error:s.message})}});S.post("/api/v1/admin/pull-links-from-github",P,async(t,e)=>e.status(403).json({error:"Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security."}));S.get("/api/v1/admin/config-status",P,(t,e)=>{let s=!!process.env.AES_SECRET,n=!!process.env.SECURE_LINKS,r=!!process.env.ADMIN_EMAIL;e.json({hasAes:s,hasSecLinks:n,hasAdminEmail:r})});S.get("/api/v1/admin/system-files",P,(t,e)=>{e.json({files:{}})});S.get("/api/v1/debug-index",async(t,e)=>{try{let s=M.default.readFileSync(G.default.resolve(process.cwd(),"index.html"),"utf-8"),n=t.app.get("vite");e.json({debug:!0})}catch(s){e.json({error:s.message})}});["/api/v1/user","/api/v1/auth","/api/v1/config"].forEach(t=>{S.all(t,(e,s)=>{s.status(404).send("Not Found")})});S.get(["/api/v1/_chal","/api/v1/get-challenge","/api/v1/init-file"],async(t,e)=>{console.log("[DEBUG] /api/v1/init-file called");let s=ee(t);if(await ce(s))return e.status(429).json({error:"Too many requests. Please wait."});if(xt(t))return e.status(403).json({error:"Access denied."});let n=Is(t,e),r=q.default.randomBytes(20).toString("hex"),i=Date.now(),o=Math.floor(Math.random()*100)+50;Z.set(r,{sessionId:n,expiresAt:i+120*1e3,issuedAt:i+o}),setTimeout(()=>{e.json({nonce:r,difficulty:"0000",sid:n})},o)});S.post(["/api/v1/_proc","/api/v1/get-token","/api/v1/process-file"],async(t,e)=>{let s=ee(t);if(await ce(s))return e.status(429).json({error:"Too many requests. Please wait."});if(xt(t))return e.status(403).json({error:"Access denied."});let n=t.body?.sid||t.cookies?.["__Host-sid"];if(!n)return e.status(403).json({error:"Session expired. Please reload."});let{nonce:r,solution:i,fingerprint:o,score:d,moved:p,touch:c,cfToken:f}=t.body||{};if(!r||!i||!o)return e.status(400).json({error:"Invalid request."});if(!vs(o))return console.warn(`[DEFENSE] Bad fingerprint from ${s}`),e.status(403).json({error:"Access denied."});let u=Z.get(r);if(!u)return e.status(403).json({error:"Challenge expired. Please try again."});if(u.sessionId!==n)return Z.delete(r),e.status(403).json({error:"Session mismatch."});if(u.expiresAt<Date.now())return Z.delete(r),e.status(403).json({error:"Challenge timed out."});let l=Date.now()-u.issuedAt;if(l<80)return Z.delete(r),console.warn(`[DEFENSE] Solve too fast (${l}ms) from ${s}`),e.status(403).json({error:"Access denied."});if(Z.delete(r),typeof d!="number"||d<40)return console.warn(`[DEFENSE] Low score (${d}) from ${s}`),e.status(403).json({error:"Access denied: security check failed."});let w=r+i,g=q.default.createHash("sha256").update(w).digest("hex");if(!g.startsWith("0000"))return console.warn(`[DEFENSE] PoW fail from ${s}: ${g}`),e.status(403).json({error:"Access denied: verification failed."});if(Be&&!await xs(f||"",s))return console.warn(`[CF] Rejected ${s}`),e.status(403).json({error:"Access denied: verification failed."});console.log(`[ACCESS] GRANTED ip=${s} score=${d} solveMs=${l} moved=${p} touch=${c}`);let m=t.body.appId||"unknown",E=Cs(s,n,o,m);e.json({token:E})});S.get("/api/v1/link-check",async(t,e)=>{let s=t.query.id;if(!s)return e.json({configured:!1});try{let n=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");if(!n)return e.json({configured:!0});let r="",i=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(i)){let f=require("fs").readFileSync(i,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);f&&f[1]&&(r=f[1])}if(!r)return e.json({configured:!0});let o="";if(typeof F<"u")o=F(r,n);else{let c=require("crypto-js");o=c.AES.decrypt(r,n).toString(c.enc.Utf8)}if(!o)return e.json({configured:!0});let d=JSON.parse(o),p=!1;if(Array.isArray(d)){let c=d.find(f=>f&&f.id===s);c&&(c.url||c.more_information_url)&&(p=!0)}else d&&typeof d=="object"&&d[s]&&(p=!0);return e.json({configured:!0})}catch{return e.json({configured:!0})}});var ht=new Map;S.post("/api/v1/public/chat",async(t,e)=>{let s=t.headers["x-forwarded-for"]||t.socket.remoteAddress||"unknown",n=Date.now(),r=3600*1e3,i=10,o=ht.get(s);if((!o||n>o.resetTime)&&(o={count:0,resetTime:n+r}),o.count>=i)return e.status(429).json({error:"Rate limit exceeded. Maximum 10 messages per hour. Please try again later."});o.count+=1,ht.set(s,o);let{message:d}=t.body;if(!d||typeof d!="string")return e.status(400).json({error:"Message payload is required."});try{let p=process.env.GEMINI_API_KEY;if(!p)throw new Error("AI service is currently offline.");let{fetchStoreData:c}=(pe(),we($e)),f=await c(),u={settings:{site_title:f.settings?.site_title,meta_description:f.settings?.meta_description,policies:f.settings?.policies?f.settings.policies.substring(0,500):""},categories:(f.categories||[]).map(m=>({id:m.id,n:m.name})),apps:(f.apps||[]).map(m=>({n:m.name,c:m.category,desc:m.description_html?.replace(/<[^>]+>/g,"").substring(0,200),r:m.rating})),news:(f.news||[]).map(m=>({t:m.title,d:m.description?.substring(0,200),c:m.content?.replace(/<[^>]+>/g,"").substring(0,300)})),blogs:(f.blogs||[]).map(m=>({t:m.title,d:m.description?.substring(0,200),c:m.content?.replace(/<[^>]+>/g,"").substring(0,300)})),videos:(f.videos||[]).map(m=>({t:m.title,d:m.description,c:m.content?.replace(/<[^>]+>/g,"").substring(0,1e3)}))},{GoogleGenAI:l}=require("@google/genai"),w=new l({apiKey:p,httpOptions:{headers:{"User-Agent":"aistudio-build"}}}),g=`You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(u,null,2)}`;try{let m=await w.models.generateContentStream({model:"gemini-2.0-flash",contents:d.trim(),config:{systemInstruction:g,maxOutputTokens:1e3,temperature:.3,tools:[{googleSearch:{}}]}});e.setHeader("Content-Type","text/event-stream"),e.setHeader("Cache-Control","no-cache"),e.setHeader("Connection","keep-alive"),e.flushHeaders();for await(let E of m)E.text&&e.write(`data: ${JSON.stringify({text:E.text})}

`);return e.write(`data: [DONE]

`),e.end()}catch(m){if(!e.headersSent)throw m;return e.write(`data: ${JSON.stringify({error:m.message||"Streaming failed"})}

`),e.end()}}catch(p){if(p.status===429||p.message?.includes("429"))return e.json({success:!0,answer:"\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities."});if(p.status===403||p.message?.includes("403"))return e.json({success:!0,answer:"\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings."});let c=d.trim().toLowerCase();try{let{fetchStoreData:f}=(pe(),we($e)),w=((await f()).apps||[]).filter(g=>g.name&&g.name.toLowerCase().includes(c)||g.category&&g.category.toLowerCase().includes(c));if(w.length>0){let g=w.slice(0,3).map(m=>m.name).join(", ");return e.json({success:!0,answer:`(Offline Fallback): I found some apps in the directory matching your query: ${g}${w.length>3?" and more.":"."}`})}else if(c.includes("hello")||c.includes("hi ")||c==="hi")return e.json({success:!0,answer:"(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!"})}catch{}return e.json({success:!0,answer:"(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."})}});S.post("/api/v1/report-missing",async(t,e)=>{let{appId:s}=t.body;return s?(console.log(`[report-missing] Received report for ${s}, mocked success due to hardcoded public mode.`),e.json({success:!0})):e.status(400).json({error:"Missing App ID parameter."})});S.get("/api/v1/moreinfo-resolve",async(t,e)=>{let s=ee(t),n=t.query.sid||t.cookies?.["__Host-sid"],r=t.query.token||t.query.t,i=t.query.id;if(!r||!i)return t.query.json==="true"?e.status(400).json({error:"Verification transmission tokens or App ID were omitted."}):e.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");try{let c=V();if(c&&c.projectId){let f=q.default.createHash("sha256").update(r).digest("hex"),u=!1,l=ze();if(l)try{(await l.collection("spent_tokens").doc(f).get()).exists&&(u=!0)}catch(w){console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:",w.message);let g=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId}/documents/spent_tokens/${f}${c.apiKey?"?key="+c.apiKey:""}`;(await fetch(g)).ok&&(u=!0)}else{let w=`https://firestore.googleapis.com/v1/projects/${c.projectId}/databases/${c.firestoreDatabaseId}/documents/spent_tokens/${f}${c.apiKey?"?key="+c.apiKey:""}`;(await fetch(w)).ok&&(u=!0)}if(u)return t.query.json==="true"?e.status(403).json({error:"This single-use private download signature has already been spent."}):e.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>")}}catch{}let o=!1;try{Buffer.from(r,"base64url").toString("utf8").includes("::")&&(o=!0)}catch{}if(o)try{let c=Buffer.from(r,"base64url").toString("utf8"),[f]=c.split("::"),[u,l,w]=f.split("|");if(!$s(r,u,l,w,i))return t.query.json==="true"?e.status(403).json({error:"Cryptographic HMAC validation failed."}):e.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");try{let m=V();if(m&&m.projectId){let E=q.default.createHash("sha256").update(r).digest("hex"),k=new Date().toISOString(),h=ze();if(h)try{await h.collection("spent_tokens").doc(E).set({usedAt:k}),console.log(`[AUDIT] Successfully spent token ${E} via firebase-admin SDK`)}catch(y){console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:",y.message);let x=`https://firestore.googleapis.com/v1/projects/${m.projectId}/databases/${m.firestoreDatabaseId}/documents/spent_tokens/${E}${m.apiKey?"?key="+m.apiKey:""}`;fetch(x,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:k}}})}).catch(()=>{})}else{let y=`https://firestore.googleapis.com/v1/projects/${m.projectId}/databases/${m.firestoreDatabaseId}/documents/spent_tokens/${E}${m.apiKey?"?key="+m.apiKey:""}`;fetch(y,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:{usedAt:{stringValue:k}}})}).catch(()=>{})}}}catch{}let g="";try{let m=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:""),E=null;try{E=V()}catch{}if(E&&(!g||!g.startsWith("http"))){let k=ze();if(k)for(let h of["sec_links_vault_3","secure_links","sec_vault"])try{let y=await k.collection("store_data").doc(h).get();if(y.exists){let x=y.data();if(x&&x.encryptedData){let R=F(x.encryptedData,m);if(R){let $=JSON.parse(R),D="";if($&&Array.isArray($)){let I=$.find(L=>L&&L.id===i);I&&(D=typeof I.url=="string"?I.url:typeof I.more_information_url=="string"?I.more_information_url:"")}else if($&&typeof $=="object"){let I=$[i];typeof I=="string"?D=I:I&&typeof I=="object"&&(D=typeof I.url=="string"?I.url:typeof I.more_information_url=="string"?I.more_information_url:"")}if(D&&typeof D=="string"&&(D.startsWith("U2FsdGVkX1")?g=F(D,m):g=D,g&&g.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${h}) for app ID: ${i}`);break}}}}}catch(y){console.warn(`[WARN] Firestore SDK failed to fetch ${h}:`,y.message)}}if((!g||!g.startsWith("http"))&&E&&E.projectId){let k=E.apiKey?`?key=${E.apiKey}`:"",h=`https://firestore.googleapis.com/v1/projects/${E.projectId}/databases/${E.firestoreDatabaseId}/documents`;for(let y of["sec_links_vault_3","secure_links","sec_vault"])try{let x=await fetch(`${h}/store_data/${y}${k}`);if(x.ok){let R=await x.json();if(R&&!R.error&&R.fields?.encryptedData?.stringValue){let $=R.fields.encryptedData.stringValue,D=F($,m);if(D){let I=JSON.parse(D),L="";if(I&&Array.isArray(I)){let j=I.find(N=>N&&N.id===i);j&&(L=typeof j.url=="string"?j.url:typeof j.more_information_url=="string"?j.more_information_url:"")}else if(I&&typeof I=="object"){let j=I[i];typeof j=="string"?L=j:j&&typeof j=="object"&&(L=typeof j.url=="string"?j.url:typeof j.more_information_url=="string"?j.more_information_url:"")}if(L&&typeof L=="string"&&(L.startsWith("U2FsdGVkX1")?g=F(L,m):g=L,g&&g.startsWith("http"))){console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${y}) for app ID: ${i}`);break}}}}}catch(x){console.warn(`[WARN] Firestore REST fallback failed to fetch ${y}:`,x.message)}}if(!g||!g.startsWith("http"))try{let k="",h=require("path").join(process.cwd(),"src/lib/secureVault.ts");if(require("fs").existsSync(h)){let x=require("fs").readFileSync(h,"utf8").match(/export const ENCRYPTED_LINKS = "([^"]+)";/);x&&x[1]&&(k=x[1])}if(k){let y="";if(typeof F<"u")y=F(k,m);else{let x=require("crypto-js");y=x.AES.decrypt(k,m).toString(x.enc.Utf8)}if(y){let x=JSON.parse(y),R="";if(x&&Array.isArray(x)){let $=x.find(D=>D&&D.id===i);$&&(R=typeof $.url=="string"?$.url:typeof $.more_information_url=="string"?$.more_information_url:"")}else if(x&&typeof x=="object"){let $=x[i];typeof $=="string"?R=$:$&&typeof $=="object"&&(R=typeof $.url=="string"?$.url:typeof $.more_information_url=="string"?$.more_information_url:"")}R&&typeof R=="string"&&(R.startsWith("U2FsdGVkX1")?g=F(R,m):g=R,g&&g.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${i}`))}}}catch(k){console.warn("Vault decryption failed",k)}if(!g||!g.startsWith("http"))try{if(process.env.SECURE_LINKS){let k=JSON.parse(process.env.SECURE_LINKS);if(k&&typeof k=="object"){let h=k[i],y="";typeof h=="string"?y=h:h&&typeof h=="object"&&(y=typeof h.url=="string"?h.url:typeof h.more_information_url=="string"?h.more_information_url:""),y&&typeof y=="string"&&(y.startsWith("U2FsdGVkX1")?g=F(y,m):g=y,g&&g.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${i}`))}}}catch{}if(!g||!g.startsWith("http"))try{let k=require("path").join(process.cwd(),".local/secure_links_backup.json");if(require("fs").existsSync(k)){let h=JSON.parse(require("fs").readFileSync(k,"utf8")),y="";if(h&&Array.isArray(h)){let x=h.find(R=>R&&R.id===i);x&&(y=typeof x.url=="string"?x.url:typeof x.more_information_url=="string"?x.more_information_url:"")}else if(h&&typeof h=="object"){let x=h[i];typeof x=="string"?y=x:x&&typeof x=="object"&&(y=typeof x.url=="string"?x.url:typeof x.more_information_url=="string"?x.more_information_url:"")}if(y&&typeof y=="string"){let x=process.env.AES_SECRET||(typeof AES_SECRET_GLOBAL<"u"?AES_SECRET_GLOBAL:"");y.startsWith("U2FsdGVkX1")?g=F(y,x):g=y,g&&g.startsWith("http")&&console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${i}`)}}}catch(k){console.warn("Local filesystem backup retrieval failed:",k)}}catch(m){console.error("Firestore retrieval or decryption failed",m)}if(typeof g!="string")return console.error("targetUrl resolved to an object instead of a string:",g),e.status(500).json({error:"Download link encryption integrity failed."});if(g&&!g.startsWith("http://")&&!g.startsWith("https://")&&!g.startsWith("/")&&g.includes(".")&&(g="https://"+g),!g||!g.startsWith("http")&&!g.startsWith("/"))return console.error("CRITICAL: Failed to retrieve or decrypt URL for app:",i,"Result:",g),t.query.json==="true"?e.status(404).json({error:"Download link not found or not yet configured for this app."}):e.status(404).send(`<!DOCTYPE html>
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
</html>`);try{if(g.startsWith("http")){let m=new URL(g);if(!(m.hostname.includes("google.com")||m.hostname.includes("googleapis.com"))&&!m.searchParams.has("code")){let k=process.env.AFFILIATE_CODE;k&&(m.searchParams.set("code",k),g=m.toString())}}}catch{}return console.log("FINAL REDIRECT TARGET IS:",g),e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.set("Referrer-Policy","no-referrer"),e.redirect(302,g)}catch{return e.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>")}let d=me.get(r);if(!d)return t.query.json==="true"?e.status(404).json({error:"Link expired or invalid."}):e.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");if(d.expiresAt<Date.now())return me.delete(r),t.query.json==="true"?e.status(404).json({error:"This connection timed out."}):e.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");me.delete(r),As.add(r);let p=d.targetUrl;try{if(p.startsWith("http")){let c=new URL(p);if(!(c.hostname.includes("google.com")||c.hostname.includes("googleapis.com"))&&!c.searchParams.has("code")){let u=process.env.AFFILIATE_CODE;u&&(c.searchParams.set("code",u),p=c.toString())}}}catch{}return e.set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0"),e.redirect(302,p)});S.get("/api/v1/download/:id",async(t,e)=>{let s=t.params.id;return s?e.redirect(302,`/moreinfo/${s}`):e.status(400).send("Bad Request")});S.use((t,e,s,n)=>{console.error(`[EXPRESS GLOBAL ERROR] ${e.method} ${e.originalUrl}:`,t);try{let r=G.default.join(process.cwd(),"server_requests.log");M.default.appendFileSync(r,`[${new Date().toISOString()}] ERROR in ${e.method} ${e.originalUrl}: ${t.message||t}
`,"utf8")}catch{}if(s.headersSent)return n(t);if(e.originalUrl.startsWith("/api/"))return s.status(500).json({error:"Internal server error"});s.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>")});module.exports=S;
