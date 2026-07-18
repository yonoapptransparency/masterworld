var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// api/index.ts
var import_express = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_path2 = __toESM(require("path"));
var import_crypto = __toESM(require("crypto"));
var import_compression = __toESM(require("compression"));
var import_fs2 = __toESM(require("fs"));
var import_dns = __toESM(require("dns"));

// src/seoHelper.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));

// src/lib/staticData.ts
var mockApps = [
  {
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "id": "q82dbbwh4",
    "faqs": [],
    "icon_url": "https://res.cloudinary.com/dq34n0ncz/image/upload/f_auto,q_auto/1000119573_wzwse4",
    "seo_description": "",
    "yellow_box_msg": "",
    "rating": 5,
    "is_top_chart": true,
    "link_configured": true,
    "custom_admin_box_html": "",
    "release_notes": 'Version 2.0.6 // System Update Log\nInterface Optimization: Refined the visual rendering pipeline for smoother navigation across mobile screen-time sessions.\nAlgorithmic Adjustments: Optimized data-parsing logic for faster loading of strategy modules and performance teardowns.\nStability Patch: Resolved minor UI caching discrepancies to ensure a seamless "lag-free" browsing experience.\nFeature Expansion: Integrated a new "Performance Metric Dashboard" for detailed game-logic breakdowns.',
    "created_at": "2026-05-19T12:43:59.040Z",
    "is_new": true,
    "slug": "spin-crush-",
    "serial_number": 2,
    "seo_keywords": "",
    "name": "SPIN CRUSH ",
    "developer": "Bingo ",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "og_image_url": "",
    "target_region": "",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "category": "Yono, All App",
    "version": "2.0.6",
    "red_box_msg": "",
    "file_size": "45"
  },
  {
    "link_configured": true,
    "custom_admin_box_html": `<!-- SAFE RUMMYAPP ONLINE "ADVANCED TECHNICAL DIAGNOSTIC" MODULE -->
<!-- Bright Futuristic Modern Edition -->

<section class="rs-tech-wrapper">

    <!-- TOP SYSTEM NOTIFICATION -->
    <div class="rs-tech-alert-top">
        <span class="rs-tech-pulse"></span> \u2726 ADVANCED DIAGNOSTICS // ENGINE & LOGIC TEARDOWN
    </div>

    <!-- MAIN DEEP-DIVE INTRO CARD -->
    <div class="rs-tech-glass-card rs-tech-hero">
        <div class="rs-tech-header">
            <h2>Technical Architecture Review</h2>
            <span class="rs-tech-badge">System Teardown</span>
        </div>
        
        <p class="rs-tech-lead-text">
            Evaluating a virtual application requires probing beneath its graphical shell. In this advanced diagnostic, we bypass the marketing aesthetics to analyze the application's core rendering engine, memory allocation, and backend logic systems. By measuring frame stability, cryptographic randomization, and input latency, we provide a mathematically sound breakdown of how this application truly performs under heavy operational stress. 
        </p>
    </div>

    <!-- TECHNICAL DATA GRID -->
    <div class="rs-tech-section-title">Core Engine Metrics</div>
    
    <div class="rs-tech-grid">
        
        <!-- Metric 1: RNG Logic -->
        <div class="rs-tech-glass-box tech-border-slate">
            <div class="rs-tech-icon tech-glow-slate">\u2699\uFE0F</div>
            <h3>Cryptographic RNG Protocols</h3>
            <p>True tactical simulations rely on pristine randomization. We analyze the application's Random Number Generator (RNG) logic for cryptographic seeding and sequence entropy. A robust, server-side RNG architecture ensures that card drops, virtual shuffles, and arcade mechanics are entirely immune to pattern manipulation, providing a mathematically fair environment for all practice rounds.</p>
        </div>

        <!-- Metric 2: Input Latency -->
        <div class="rs-tech-glass-box tech-border-cyan">
            <div class="rs-tech-icon tech-glow-cyan">\u26A1</div>
            <h3>Input Latency & Event Listeners</h3>
            <p>A seamless interface is dictated by response time. We measure the application's touch-start and touch-end event listeners to ensure input latency remains strictly under the 45-millisecond threshold. By minimizing payload packet delays between the client UI and the simulation server, the application translates physical screen taps into instantaneous digital reactions.</p>
        </div>

        <!-- Metric 3: Rendering Pipeline -->
        <div class="rs-tech-glass-box tech-border-emerald">
            <div class="rs-tech-icon tech-glow-emerald">\u{1F3A5}</div>
            <h3>WebGL & Frame Rendering</h3>
            <p>High-fidelity 3D environments must not compromise frame rates. We evaluate the application's draw call batching and texture compression within its WebGL/Canvas rendering pipeline. Proper optimization prevents Z-fighting and ensures a stable 60 FPS (Frames Per Second) output, preventing micro-stutters during intense, high-speed layout animations.</p>
        </div>

        <!-- Metric 4: Heap Memory -->
        <div class="rs-tech-glass-box tech-border-indigo">
            <div class="rs-tech-icon tech-glow-indigo">\u{1F4BE}</div>
            <h3>Heap Memory & CPU Overhead</h3>
            <p>Bloated code leads to severe device throttling. We track the application's background memory footprint and garbage collection efficiency. A well-architected app flushes unused cache data effectively, ensuring that extended gameplay sessions do not result in CPU overheating, battery hemorrhaging, or forced application crashes on mid-tier hardware.</p>
        </div>

    </div>

    <!-- TECHNICAL SUMMARY FOOTER -->
    <div class="rs-tech-footer-card">
        <div class="rs-tech-flex-row">
            <div class="rs-tech-text-block">
                <h4>Data Verification Clause</h4>
                <p>The diagnostic data presented in this technical review is based on isolated benchmarking. Application developers routinely deploy over-the-air (OTA) patches that may optimize or alter these engine parameters. We recommend running regular updates via authorized digital storefronts to maintain optimal software stability.</p>
            </div>
            
            <div class="rs-tech-divider-vertical"></div>

            <div class="rs-tech-text-block">
                <h4>SEO & Search Visibility Note</h4>
                <p>RummyApp Online actively structures our technical teardowns to provide the most transparent, data-driven insights available on the web. By focusing strictly on code architecture, UI mechanics, and tactical execution, we ensure our registry remains the definitive index for digital performance analysis.</p>
            </div>
        </div>
    </div>

</section>

<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');

:root {
    --primary: #0057FF;
    --accent: #00C2FF;
    --accent2: #7B2FFF;
    --emerald: #00C98A;
    --amber: #FF6B2B;
    --text-main: #0A0F2C;
    --text-muted: #4A5580;
    --surface: #FFFFFF;
    --surface-alt: #F0F5FF;
    --border: #D6E0FF;
    --glow-blue: rgba(0, 87, 255, 0.12);
    --glow-cyan: rgba(0, 194, 255, 0.15);
    --glow-purple: rgba(123, 47, 255, 0.12);
    --glow-green: rgba(0, 201, 138, 0.12);
}

.rs-tech-wrapper {
    width: 100%;
    margin: 40px 0;
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(145deg, #EEF3FF 0%, #F7F0FF 40%, #E8F8FF 100%);
    padding: 40px;
    border-radius: 24px;
    box-sizing: border-box;
    color: var(--text-main);
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 87, 255, 0.1), 0 4px 16px rgba(0,0,0,0.06);
    border: 1px solid var(--border);
}

.rs-tech-wrapper::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(circle, rgba(0, 87, 255, 0.08) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
}

.rs-tech-wrapper::after {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(123, 47, 255, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.rs-tech-wrapper * {
    box-sizing: border-box;
    position: relative;
    z-index: 1;
}

.rs-tech-alert-top {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(90deg, rgba(0,87,255,0.08), rgba(0,194,255,0.08));
    color: var(--primary);
    padding: 10px 22px;
    border-radius: 100px;
    margin-bottom: 32px;
    font-size: 11px;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1px solid rgba(0, 87, 255, 0.25);
    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.1);
}

.rs-tech-pulse {
    width: 8px; height: 8px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border-radius: 50%;
    animation: tech-pulse 2s infinite;
    flex-shrink: 0;
}

@keyframes tech-pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 87, 255, 0.6); }
    70% { box-shadow: 0 0 0 10px rgba(0, 87, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 87, 255, 0); }
}

.rs-tech-glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 40px;
    border: 1px solid rgba(0, 87, 255, 0.12);
    margin-bottom: 40px;
    box-shadow: 0 8px 32px rgba(0, 87, 255, 0.07), 0 1px 4px rgba(0,0,0,0.04);
}

.rs-tech-hero {
    border-top: 3px solid transparent;
    background-clip: padding-box;
    position: relative;
}

.rs-tech-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent), var(--accent2));
    border-radius: 20px 20px 0 0;
    z-index: 2;
}

.rs-tech-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 25px;
    padding-bottom: 25px;
    border-bottom: 1px solid var(--border);
}

.rs-tech-header h2 {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    font-family: 'Syne', sans-serif;
    background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

.rs-tech-badge {
    padding: 8px 20px;
    border-radius: 100px;
    background: linear-gradient(135deg, var(--primary), var(--accent2));
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.3);
}

.rs-tech-lead-text {
    font-size: 16px;
    line-height: 1.9;
    color: var(--text-muted);
    margin: 0;
}

.rs-tech-section-title {
    font-size: 22px;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
    margin: 50px 0 25px 0;
    position: relative;
    padding-left: 18px;
}

.rs-tech-section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 4px;
    background: linear-gradient(180deg, var(--primary), var(--accent));
    border-radius: 4px;
}

.rs-tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.rs-tech-glass-box {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 30px 25px;
    text-align: left;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.05);
}

.rs-tech-glass-box:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 87, 255, 0.12);
}

.tech-border-slate:hover { border-color: #94a3b8; box-shadow: 0 16px 40px rgba(100,116,139,0.15); }
.tech-border-cyan:hover { border-color: var(--accent); box-shadow: 0 16px 40px var(--glow-cyan); }
.tech-border-emerald:hover { border-color: var(--emerald); box-shadow: 0 16px 40px var(--glow-green); }
.tech-border-indigo:hover { border-color: var(--accent2); box-shadow: 0 16px 40px var(--glow-purple); }

.rs-tech-icon {
    font-size: 24px;
    margin-bottom: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 14px;
    border: 1px solid var(--border);
}

.tech-glow-slate { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
.tech-glow-cyan  { background: linear-gradient(135deg, #e0f9ff, #b8f0ff); }
.tech-glow-emerald { background: linear-gradient(135deg, #d4f9ed, #a7f3d0); }
.tech-glow-indigo { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }

.rs-tech-glass-box h3 {
    margin: 0 0 12px 0;
    font-size: 17px;
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
    font-weight: 700;
}

.rs-tech-glass-box p {
    margin: 0;
    font-size: 14.5px;
    line-height: 1.75;
    color: var(--text-muted);
}

.rs-tech-footer-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,245,255,0.95));
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 35px;
    box-shadow: 0 4px 20px rgba(0, 87, 255, 0.06);
    position: relative;
    overflow: hidden;
}

.rs-tech-footer-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent2), var(--primary), var(--accent));
    border-radius: 0 0 16px 16px;
}

.rs-tech-flex-row {
    display: flex;
    gap: 35px;
    align-items: stretch;
}

.rs-tech-text-block { flex: 1; }

.rs-tech-divider-vertical {
    width: 1px;
    background: linear-gradient(180deg, transparent, var(--border), transparent);
}

.rs-tech-text-block h4 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
}

.rs-tech-text-block p {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-muted);
}

@media(max-width: 900px) {
    .rs-tech-flex-row { flex-direction: column; gap: 25px; }
    .rs-tech-divider-vertical { display: none; }
    .rs-tech-text-block { border-bottom: 1px solid var(--border); padding-bottom: 20px; }
    .rs-tech-text-block:last-child { border-bottom: none; padding-bottom: 0; }
}

@media(max-width: 768px) {
    .rs-tech-wrapper { padding: 20px; }
    .rs-tech-glass-card { padding: 25px; }
    .rs-tech-header h2 { font-size: 24px; }
    .rs-tech-grid { grid-template-columns: 1fr; }
    .rs-tech-glass-box, .rs-tech-footer-card { padding: 22px; }
}
</style>`,
    "release_notes": "Improved UI responsiveness, optimized loading speeds, and enhanced security protocols for a smoother gaming experience.",
    "rating": 3.4,
    "yellow_box_msg": "DIAGNOSTIC INSIGHT: To replicate the optimal latency metrics outlined in this teardown, ensure your device's background cache is cleared and frame-rate limits are maximized in your OS settings. Interface fluidity during digital simulation relies heavily on your local CPU and RAM allocation",
    "icon_url": "https://13eehe59cj.ucarecd.net/67a16d31-6771-4617-b88b-288db51d321d/-/preview/554x554/",
    "seo_description": "Explore the Yono Arcade technical blueprint. We provide advanced UI diagnostics, latency metrics, and tactical simulation data. Master the interface today",
    "description_html": `<!-- SAFE YONO ARCADE GLASSMORPHISM LISTING -->
<!-- Fully scoped, uniquely written, safe for your website UI, E-Sports Compliant -->

<section class="rs-arcade-wrapper">

    <div class="rs-arcade-glass-card">

        <!-- HEADER -->
        <div class="rs-arcade-header">
            <h2>Yono Arcade Interface</h2>
            <span class="rs-arcade-badge">Virtual Multi-Game Hub</span>
        </div>

        <!-- GLASSY VIRTUAL BONUS SYSTEM -->
        <div class="rs-arcade-bonus-container">
            <div class="rs-arcade-glass-box highlight-box">
                <span class="rs-arcade-bonus-title">Virtual Gift</span>
                <span class="rs-arcade-bonus-amount">40K</span>
                <span class="rs-arcade-bonus-sub">Practice Credits</span>
            </div>
            <div class="rs-arcade-glass-box">
                <span class="rs-arcade-bonus-title">Daily Luck Wheel</span>
                <span class="rs-arcade-bonus-amount">15K</span>
                <span class="rs-arcade-bonus-sub">Random Daily Reward</span>
            </div>
            <div class="rs-arcade-glass-box">
                <span class="rs-arcade-bonus-title">Guest Access</span>
                <span class="rs-arcade-bonus-amount">Instant</span>
                <span class="rs-arcade-bonus-sub">No Login Needed</span>
            </div>
        </div>

        <p class="rs-arcade-description">
            Yono Arcade is an engaging, modern gaming application known for its dynamic interactive features. Designed for users who enjoy quick, casual strategy and thrill-based mechanics, this platform offers daily spin wheels, task-based progression, and an instant-play environment to test your luck and logic completely risk-free.
        </p>

        <!-- SEO ENHANCEMENT: APP DETAILS TABLE -->
        <div class="rs-arcade-section-title">Platform Specifications</div>
        <div class="rs-arcade-table-wrapper">
            <table class="rs-arcade-table">
                <tbody>
                    <tr>
                        <td><strong>Application Name</strong></td>
                        <td>Yono Arcade (Review)</td>
                        <td><strong>Gaming Category</strong></td>
                        <td>Casual / Arcade / Mini-Games</td>
                    </tr>
                    <tr>
                        <td><strong>Welcome Reward</strong></td>
                        <td>40,000 (Virtual)</td>
                        <td><strong>Daily Engagement</strong></td>
                        <td>Spin Wheel / Tasks</td>
                    </tr>
                    <tr>
                        <td><strong>Operating System</strong></td>
                        <td>Android / Web UI</td>
                        <td><strong>User Interface</strong></td>
                        <td>High-Def 2D/3D Graphics</td>
                    </tr>
                    <tr>
                        <td><strong>Privacy</strong></td>
                        <td>No Personal Info Required</td>
                        <td><strong>Help Desk</strong></td>
                        <td>In-App Support Ticket</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- SEO ENHANCEMENT: FEATURES GRID -->
        <div class="rs-arcade-section-title">Key Arcade Highlights</div>
        <div class="rs-arcade-grid">
            <div class="rs-arcade-glass-box rounded-style">
                <div class="rs-arcade-icon">\u{1F579}\uFE0F</div>
                <h3>Massive Game Library</h3>
                <p>Access a diverse portfolio of games ranging from retro classics to modern puzzle and strategy games, all packed into a single, optimized interface.</p>
            </div>
            <div class="rs-arcade-glass-box rounded-style">
                <div class="rs-arcade-icon">\u{1F3A1}</div>
                <h3>The Fortune Wheel</h3>
                <p>Unlock the daily fortune wheel feature to claim randomized practice bonuses, extra virtual coins, and special event multipliers.</p>
            </div>
            <div class="rs-arcade-glass-box rounded-style">
                <div class="rs-arcade-icon">\u{1F512}</div>
                <h3>100% Anonymous</h3>
                <p>Enjoy the arcade instantly as a guest without sharing any personal data, mobile numbers, or OTPs. Your privacy is fully protected.</p>
            </div>
            <div class="rs-arcade-glass-box rounded-style">
                <div class="rs-arcade-icon">\u{1F91D}</div>
                <h3>Community Leaderboards</h3>
                <p>Join weekend events and global leaderboards to compete against thousands of active participants for top-tier social rankings.</p>
            </div>
        </div>

        <!-- SEO ENHANCEMENT: HOW TO PLAY -->
        <div class="rs-arcade-section-title">Getting Started Guide</div>
        <div class="rs-arcade-glass-box rs-arcade-list-box">
            <ol>
                <li><strong>Launch the App:</strong> Open the official application directly on your device.</li>
                <li><strong>Play Instantly:</strong> Start your session immediately in guest mode without needing a mobile number, OTP, or account registration.</li>
                <li><strong>Daily Check-in:</strong> Spin the lucky wheel every 24 hours to accumulate additional game credits.</li>
                <li><strong>Explore Modes:</strong> Try out different casual lobbies and mini-games to find your preferred practice style.</li>
                <li><strong>Track Progression:</strong> Monitor your high scores and leaderboards as you climb the ranks securely.</li>
            </ol>
        </div>

        <!-- SEO ENHANCEMENT: FAQ ACCORDION -->
        <div class="rs-arcade-section-title">Common Questions (FAQs)</div>
        <div class="rs-arcade-faq-container">
            <details class="rs-arcade-faq">
                <summary>Is Yono Arcade free to play?</summary>
                <p>Yes, the application allows users to play for free and provides starting practice bonuses and daily spins to experience the gameplay without any risk.</p>
            </details>
            <details class="rs-arcade-faq">
                <summary>Do I need to provide my phone number?</summary>
                <p>No, you can enjoy all features instantly using the guest mode. Absolutely no registration, mobile number, or OTP is required to start playing.</p>
            </details>
            <details class="rs-arcade-faq">
                <summary>What are the system requirements?</summary>
                <p>The platform is highly optimized and runs smoothly on most modern smartphones with basic RAM and a stable internet connection.</p>
            </details>
        </div>

        <!-- SAFE SEO KEYWORD CLOUD -->
        <div class="rs-arcade-section-title">Related Search Tags</div>
        <div class="rs-arcade-keywords">
            <span>yono arcade review</span> <span>yono arcade casual game</span> <span>yono arcade app interface</span> <span>arcade games virtual</span> <span>daily spin wheel logic</span> <span>crush casual game strategy</span> <span>online arcade games practice</span> <span>yono arcade 40k bonus</span> <span>yono arcade secure login</span> <span>yono arcade registration</span> <span>arcade rewards virtual</span> <span>gaming portal india 2026</span> <span>luck based games logic</span> <span>casual gaming platform</span> <span>arcade wheel simulator</span> <span>mobile arcade games logic</span> <span>yono arcade rankings</span> <span>win virtual coins online</span> <span>daily login rewards</span> <span>arcade game bonus logic</span> <span>refer and earn games</span> <span>multiplayer casual games</span> <span>indian gaming apps</span> <span>arcade to win app</span> <span>arcade puzzle games</span> <span>interactive arcade</span> <span>virtual spin wheel</span> <span>safe gaming apps info</span> <span>secure gaming platform</span> <span>yono arcade tips</span> <span>yono arcade tricks</span> <span>how to play yono arcade</span> <span>yono arcade strategies</span> <span>highest paying arcade games</span> <span>free arcade games logic</span> <span>yono arcade support desk</span> <span>instant progression</span> <span>best casual games 2026</span> <span>top rated arcade apps</span> <span>yono arcade visual features</span> <span>yono arcade updates</span> <span>yono arcade latest version info</span> <span>android gaming info</span> <span>ios arcade games practice</span> <span>yono arcade tournament</span> <span>weekend arcade offers</span> <span>arcade festival bonus</span> <span>yono arcade leaderboards</span> <span>gaming community safety</span> <span>yono arcade VIP logic</span> <span>loyalty arcade rewards</span> <span>mega fortune wheel</span> <span>lucky arcade app</span> <span>yono arcade guide</span> <span>beginner gaming tips</span> <span>yono arcade RNG algorithms</span> <span>fair play arcade games</span> <span>RNG arcade wheel</span> <span>trusted gaming info</span> <span>rummy store yono arcade</span> <span>rummy store reviews</span> <span>gaming blogs india</span> <span>yono arcade logic facts</span> <span>yono arcade help</span> <span>casual strategy games</span> <span>relaxing mobile games</span> <span>time pass games</span> <span>yono arcade coins</span> <span>redeem arcade rewards</span> <span>yono arcade account setup</span> <span>verify gaming profile</span> <span>yono arcade data security</span> <span>yono arcade official details</span> <span>no download games info</span> <span>app review sites</span> <span>gaming transparency</span> <span>yono arcade UI features</span> <span>smooth gaming experience</span> <span>lag free arcade mechanics</span> <span>yono arcade graphics</span> <span>3D arcade games logic</span> <span>arcade mechanics</span> <span>digital arcade wheel</span> <span>virtual gaming rewards</span> <span>yono arcade daily tasks</span> <span>complete tasks for chips</span> <span>arcade game analytics</span> <span>yono arcade player reviews</span> <span>yono arcade community forum</span> <span>yono arcade updates 2026</span> <span>yono arcade app mechanics</span> <span>yono arcade rules</span> <span>fair play policy india guidelines</span> <span>responsible gaming</span> <span>yono arcade support ticket</span> <span>yono arcade network</span> <span>play safe online</span> <span>digital gaming India</span>
        </div>

    </div>
</section>

<style>
/* SAFE SCOPED CSS - YONO ARCADE THEME (ORANGE/RED GLASS) */

.rs-arcade-wrapper {
    width: 100%;
    margin: 40px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: linear-gradient(145deg, #fff3e0 0%, #ffebee 100%);
    padding: 25px;
    border-radius: 30px;
    box-sizing: border-box;
}

.rs-arcade-wrapper * {
    box-sizing: border-box;
}

/* THE GLASS CARD */
.rs-arcade-glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-radius: 24px;
    padding: 40px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 15px 35px rgba(230, 81, 0, 0.08);
}

.rs-arcade-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(233, 30, 99, 0.15);
}

.rs-arcade-header h2 {
    font-size: 38px;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #f57c00, #d81b60);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
}

.rs-arcade-badge {
    padding: 8px 22px;
    border-radius: 30px;
    background: linear-gradient(135deg, rgba(245, 124, 0, 0.1), rgba(216, 27, 96, 0.1));
    color: #d81b60;
    font-size: 13px;
    font-weight: 800;
    border: 1px solid rgba(216, 27, 96, 0.2);
    text-transform: uppercase;
}

/* GLASSY BOXES */
.rs-arcade-bonus-container, .rs-arcade-grid {
    display: grid;
    gap: 20px;
    margin-bottom: 35px;
}

.rs-arcade-bonus-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.rs-arcade-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.rs-arcade-glass-box {
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 1);
    border-radius: 18px; 
    padding: 25px;
    text-align: left;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.rs-arcade-glass-box:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(245, 124, 0, 0.15);
    background: rgba(255, 255, 255, 0.95);
}

.rs-arcade-bonus-container .rs-arcade-glass-box {
    text-align: center;
    border-radius: 20px;
}

.highlight-box {
    background: linear-gradient(135deg, rgba(245, 124, 0, 0.08), rgba(216, 27, 96, 0.05));
    border: 1px solid rgba(245, 124, 0, 0.3);
}

.rs-arcade-bonus-title {
    display: block;
    font-size: 13px;
    font-weight: 800;
    color: #4e342e;
    text-transform: uppercase;
    margin-bottom: 12px;
    letter-spacing: 1px;
}

.rs-arcade-bonus-amount {
    display: block;
    font-size: 40px;
    font-weight: 900;
    background: linear-gradient(135deg, #e65100, #c2185b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
    line-height: 1;
}

.rs-arcade-bonus-sub {
    display: block;
    font-size: 13px;
    color: #795548;
    font-weight: 600;
}

.rs-arcade-section-title {
    font-size: 24px;
    font-weight: 800;
    color: #3e2723;
    margin: 45px 0 25px 0;
    position: relative;
    padding-left: 15px;
}

.rs-arcade-section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 80%;
    width: 5px;
    background: #f57c00;
    border-radius: 10px;
}

.rs-arcade-description {
    line-height: 1.9;
    font-size: 16px;
    color: #4e342e;
    margin-bottom: 30px;
    padding: 25px;
    background: rgba(255,255,255,0.5);
    border-radius: 16px;
    border-top: 3px solid #ff9800;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
}

/* APP SPECS TABLE */
.rs-arcade-table-wrapper {
    overflow-x: auto;
    margin-bottom: 30px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.6);
}

.rs-arcade-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
}

.rs-arcade-table td {
    padding: 18px;
    border-bottom: 1px solid rgba(245, 124, 0, 0.1);
    color: #5d4037;
}

.rs-arcade-table tr:last-child td {
    border-bottom: none;
}

.rs-arcade-table td strong {
    color: #3e2723;
}

/* FEATURES GRID ICONS */
.rs-arcade-icon {
    font-size: 28px;
    margin-bottom: 18px;
    background: linear-gradient(135deg, rgba(255,255,255,1), rgba(255,243,224,1));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 55px;
    border-radius: 14px;
    box-shadow: 0 6px 12px rgba(230, 81, 0, 0.1);
    border: 1px solid rgba(245, 124, 0, 0.1);
}

.rs-arcade-glass-box h3 {
    margin: 0 0 12px 0;
    font-size: 19px;
    color: #3e2723;
    font-weight: 800;
}

.rs-arcade-glass-box p {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: #5d4037;
}

/* HOW TO LIST */
.rs-arcade-list-box ol {
    margin: 0;
    padding-left: 20px;
    color: #4e342e;
}

.rs-arcade-list-box li {
    margin-bottom: 15px;
    line-height: 1.7;
    font-size: 15px;
}

.rs-arcade-list-box li:last-child {
    margin-bottom: 0;
}

.rs-arcade-list-box strong {
    color: #d81b60;
}

/* FAQ ACCORDION */
.rs-arcade-faq-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
}

.rs-arcade-faq {
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 1);
    border-radius: 16px;
    padding: 18px 22px;
    transition: all 0.3s ease;
}

.rs-arcade-faq[open] {
    background: #ffffff;
    box-shadow: 0 8px 25px rgba(245, 124, 0, 0.1);
    border-color: rgba(245, 124, 0, 0.2);
}

.rs-arcade-faq summary {
    font-weight: 800;
    font-size: 16px;
    color: #3e2723;
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rs-arcade-faq summary::-webkit-details-marker {
    display: none;
}

.rs-arcade-faq summary::after {
    content: '\u25B6';
    font-size: 14px;
    color: #f57c00;
    transition: transform 0.3s;
}

.rs-arcade-faq[open] summary::after {
    transform: rotate(90deg);
}

.rs-arcade-faq p {
    margin: 15px 0 0 0;
    color: #5d4037;
    line-height: 1.7;
    font-size: 15px;
    border-top: 1px dashed rgba(245, 124, 0, 0.3);
    padding-top: 15px;
}

/* LIGHT BRIGHT KEYWORD FRAMES */
.rs-arcade-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 15px;
}

.rs-arcade-keywords::-webkit-scrollbar {
    width: 6px;
}
.rs-arcade-keywords::-webkit-scrollbar-track {
    background: rgba(245, 124, 0, 0.05);
    border-radius: 10px;
}
.rs-arcade-keywords::-webkit-scrollbar-thumb {
    background: rgba(245, 124, 0, 0.2);
    border-radius: 10px;
}

.rs-arcade-keywords span {
    padding: 9px 18px;
    border-radius: 20px; 
    background: #ffffff; 
    border: 1px solid rgba(245, 124, 0, 0.15); 
    color: #6d4c41; 
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: default;
    box-shadow: 0 2px 5px rgba(0,0,0,0.01);
}

.rs-arcade-keywords span:hover {
    background: linear-gradient(135deg, #f57c00, #ff9800);
    color: #ffffff;
    border-color: transparent;
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(245, 124, 0, 0.25);
}

/* MOBILE RESPONSIVENESS */
@media(max-width: 768px) {
    .rs-arcade-wrapper {
        padding: 15px;
    }
    .rs-arcade-glass-card {
        padding: 25px;
    }
    .rs-arcade-header h2 {
        font-size: 30px;
    }
    .rs-arcade-table td {
        display: block;
        width: 100%;
        text-align: left;
        padding: 12px 18px;
    }
    .rs-arcade-table td:nth-child(odd) {
        background: rgba(245, 124, 0, 0.03);
        border-bottom: none;
    }
}
</style>
`,
    "id": "31og4l26i",
    "is_featured": false,
    "faqs": [
      {
        "answer": "Answer: We conduct a Geometry Rendering Audit to monitor how efficiently the localized application calculates the mathematical shape and boundaries of its UI assets. By evaluating vertex-shader execution, we establish a technical baseline for how smoothly the engine computes complex graphical arrays upon user input without bottlenecking the CPU.",
        "question": "How does the registry evaluate Vertex-Shader Execution in Yono VIP?"
      },
      {
        "question": 'What is "Input-Event Debouncing" within this software architecture?',
        "answer": 'Answer: Input-Event Debouncing refers to the mathematical filtering process the application uses to manage physical screen touches. When a user taps the screen rapidly, hardware digitizers often register accidental micro-touches. The Yono VIP engine debounces these signals, ignoring the "noise" and processing only the intentional inputs, which ensures zero-latency, error-free tactical execution.'
      },
      {
        "answer": "Answer: Recalculating visual geometry continuously requires sustained GPU polling. While highly efficient for creating fluid, high-definition assets, aggressive shader execution generates localized thermal load. Our Hardware Snapshot indicates that the Yono VIP engine intelligently simplifies background geometry when device temperatures rise, preserving core execution logic over aesthetic graphical flair.",
        "question": "How does vertex-shader scaling impact hardware thermals?"
      },
      {
        "question": "Can entry-level mobile processors handle the Yono VIP debouncing logic?",
        "answer": "Answer: Yes, the application utilizes Adaptive Signal Downscaling to maintain system stability on older hardware architectures. While the core touch-matrix remains strictly prioritized, the execution environment automatically widens the debouncing time-window on legacy mobile processors. This reduces the processing burden on the CPU, ensuring localized input registration remains uncompromised without overheating the chip."
      },
      {
        "question": "Does the Yono VIP diagnostic monitor external node communications?",
        "answer": "Answer: No. RummyApp Online operates strictly as an independent evaluator of Client-Side Software Processing and Ergonomics. We benchmark how the specific software binary utilizes your local hardware resources to execute its vertex-shaders and debounce its inputs. We do not evaluate, monitor, or access secure server-side cryptographic logic, ensuring our metrics remain exclusively focused on localized structural software integrity."
      }
    ],
    "category": "Yono, All App",
    "file_size": "56",
    "red_box_msg": "SECURITY PROTOCOL: RummyApp Online strictly evaluates unmodified, official application architectures. We do not host, distribute, or link to decrypted binaries, modded APKs, or third-party executable files. Modifying application logic compromises device security and invalidates our technical performance metrics",
    "version": "1.20.1",
    "og_image_url": "https://13eehe59cj.ucarecd.net/67a16d31-6771-4617-b88b-288db51d321d/-/preview/554x554/",
    "features_html": `<!-- \u2726 YONO ARCADE ISOLATED COMPONENT START \u2726 -->
<style>
  /* 1. Reset scoped specifically to this container only */
  .ya-matrix-wrapper {
    position: relative;
    overflow: hidden;
    background: #fdfdfd; /* Crisp laboratory day-mode background */
    font-family: 'Roboto', 'Segoe UI', sans-serif;
    color: #1e293b;
    padding: 48px 24px 72px;
    border-radius: 16px; 
    margin: 40px 0; 
    border: 1px solid #e2e8f0;
    box-shadow: 0 12px 35px rgba(0,0,0,0.03);
  }

  .ya-matrix-wrapper *, 
  .ya-matrix-wrapper *::before, 
  .ya-matrix-wrapper *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
  }

  /* 2. Floating Animated Background Orbs (Trapped inside wrapper) */
  .ya-bg-orbs {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }
  .ya-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(85px);
    opacity: 0.25;
    animation: ya-floatOrb linear infinite;
  }
  /* Custom Yono Arcade Palette: Neon Orange, Cyber Teal, Electric Violet */
  .ya-orb1 { width: 500px; height: 500px; background: #f97316; top: -100px; left: -100px; animation-duration: 22s; }
  .ya-orb2 { width: 450px; height: 450px; background: #14b8a6; top: 40%; right: -150px; animation-duration: 25s; animation-delay: -6s; }
  .ya-orb3 { width: 350px; height: 350px; background: #8b5cf6; bottom: -80px; left: 20%; animation-duration: 19s; animation-delay: -3s; }
  .ya-orb4 { width: 300px; height: 300px; background: #f43f5e; top: 55%; left: 10%; animation-duration: 28s; animation-delay: -11s; }

  @keyframes ya-floatOrb {
    0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
    25%  { transform: translate(65px, -55px) scale(1.06) rotate(90deg); }
    50%  { transform: translate(120px, 45px) scale(0.96) rotate(180deg); }
    75%  { transform: translate(35px, 100px) scale(1.08) rotate(270deg); }
    100% { transform: translate(0, 0) scale(1) rotate(360deg); }
  }

  /* 3. Page Content Container */
  .ya-page-content {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
  }

  /* 4. Header Area */
  .ya-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .ya-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 100px;
    padding: 6px 18px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #f97316;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1);
  }
  .ya-pulse-dot {
    width: 8px; height: 8px;
    background: #14b8a6;
    border-radius: 50%;
    animation: ya-pulseDot 1.4s ease-in-out infinite;
  }
  @keyframes ya-pulseDot {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.5); }
    50%       { transform: scale(1.4); box-shadow: 0 0 0 6px rgba(20, 184, 166, 0); }
  }
  .ya-header h2 {
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 800;
    color: #1e293b;
    line-height: 1.2;
    margin-bottom: 12px;
  }
  .ya-header h2 span { 
    background: linear-gradient(90deg, #f97316, #f43f5e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .ya-header p {
    font-size: 16px;
    color: #475569;
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* 5. Live Ticker Bar */
  .ya-ticker-wrap {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 48px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  }
  .ya-ticker-inner {
    display: flex;
    width: max-content;
    animation: ya-tickerScroll 30s linear infinite;
    padding: 14px 0;
  }
  .ya-ticker-item {
    white-space: nowrap;
    padding: 0 32px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    border-right: 1px solid #e2e8f0;
  }
  .ya-ticker-item span { color: #f97316; margin-right: 6px; }
  @keyframes ya-tickerScroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* 6. Interactive Cards Grid */
  .ya-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 26px;
  }

  .ya-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 30px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: ya-cardRise 0.6s ease both;
  }
  .ya-card:nth-child(1) { animation-delay: 0.05s; }
  .ya-card:nth-child(2) { animation-delay: 0.10s; }
  .ya-card:nth-child(3) { animation-delay: 0.15s; }
  .ya-card:nth-child(4) { animation-delay: 0.20s; }
  .ya-card:nth-child(5) { animation-delay: 0.25s; }
  .ya-card:nth-child(6) { animation-delay: 0.30s; }

  @keyframes ya-cardRise {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ya-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(249, 115, 22, 0.12), 0 5px 15px rgba(20, 184, 166, 0.08);
  }

  /* Card Animated Top Accent */
  .ya-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 5px;
    border-radius: 16px 16px 0 0;
    background: linear-gradient(90deg, #f97316, #f43f5e, #8b5cf6, #14b8a6, #f97316);
    background-size: 300% 100%;
    animation: ya-gradientSlide 4s linear infinite;
  }
  @keyframes ya-gradientSlide {
    0%   { background-position: 0% 0%; }
    100% { background-position: 300% 0%; }
  }

  /* Hover Shimmer */
  .ya-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }
  .ya-card:hover::after { transform: translateX(100%); }

  /* Card Badge Styling */
  .ya-card-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px; height: 34px;
    background: #fff7ed;
    color: #f97316;
    border-radius: 50%;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 16px;
    font-family: 'Google Sans', sans-serif;
  }
  .ya-card:nth-child(2) .ya-card-num { background: #f0fdfa; color: #14b8a6; }
  .ya-card:nth-child(3) .ya-card-num { background: #f5f3ff; color: #8b5cf6; }
  .ya-card:nth-child(4) .ya-card-num { background: #fff1f2; color: #f43f5e; }
  .ya-card:nth-child(5) .ya-card-num { background: #fff7ed; color: #f97316; }
  .ya-card:nth-child(6) .ya-card-num { background: #f0fdfa; color: #14b8a6; }

  /* Semantic Typography */
  .ya-card-title {
    font-family: 'Google Sans', 'Roboto', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 14px;
    line-height: 1.4;
  }

  /* Sub-Module Pills */
  .ya-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 18px;
  }
  .ya-pill {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #475569;
    padding: 5px 12px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.2s ease;
    animation: ya-pillPop 0.4s ease both;
  }
  .ya-card:hover .ya-pill {
    background: #fff7ed;
    color: #f97316;
    border-color: #fdba74;
  }
  @keyframes ya-pillPop {
    from { transform: scale(0.8); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .ya-card-desc {
    font-size: 13.5px;
    line-height: 1.75;
    color: #475569;
  }

  /* 7. Call to Action Area */
  .ya-cta-section {
    text-align: center;
    margin-top: 50px;
  }
  .ya-btn-primary {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, #f97316, #f43f5e);
    color: #ffffff;
    font-family: 'Google Sans', sans-serif;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    padding: 14px 40px;
    border-radius: 100px;
    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ya-btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(244, 63, 94, 0.5);
    color: #ffffff;
  }

  /* 8. Terminal Footer Bar */
  .ya-footer-bar {
    margin-top: 56px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 18px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  .ya-footer-bar .ya-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ya-status-dot {
    width: 8px; height: 8px;
    background: #14b8a6;
    border-radius: 50%;
    animation: ya-statusBlink 2s ease-in-out infinite;
  }
  @keyframes ya-statusBlink {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px #14b8a6; }
    50%       { opacity: 0.3; box-shadow: 0 0 0px #14b8a6; }
  }

  @media (max-width: 600px) {
    .ya-cards-grid { grid-template-columns: 1fr; }
    .ya-footer-bar { flex-direction: column; gap: 12px; text-align: center; }
  }

  /* Accessibility & Core Web Vitals Safeguard */
  @media (prefers-reduced-motion: reduce) {
    .ya-matrix-wrapper *, .ya-matrix-wrapper *::before, .ya-matrix-wrapper *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    .ya-ticker-inner { animation: none !important; transform: none !important; }
    .ya-orb { display: none; }
  }
</style>

<!-- Everything is cleanly contained inside this wrapper -->
<div class="ya-matrix-wrapper">

  <div class="ya-bg-orbs" aria-hidden="true">
    <div class="ya-orb ya-orb1"></div>
    <div class="ya-orb ya-orb2"></div>
    <div class="ya-orb ya-orb3"></div>
    <div class="ya-orb ya-orb4"></div>
  </div>

  <div class="ya-page-content">

    <div class="ya-header">
      <div class="ya-eyebrow">
        <span class="ya-pulse-dot" aria-hidden="true"></span>
        Thread Allocation Matrix
      </div>
      <h2>Yono Arcade \u2014 <span>System Architecture</span></h2>
      <p>An elite structural teardown of the 40+ module platform, detailing high-fidelity raycasting, polymorphic scheduling, and dynamic instruction pacing.</p>
    </div>

    <div class="ya-ticker-wrap" aria-hidden="true">
      <div class="ya-ticker-inner">
        <!-- Ticker content specifically adapted for Yono Arcade variants -->
        <div class="ya-ticker-item"><span>\u25CF</span>Polymorphic Thread Scheduling</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Fishing War Raycast</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Real-Time Burst Multipliers</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Andar Bahar Bitmask</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Stochastic Arcade Wheels</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Sprite-Batch Slots</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Ludo Spatial Grid</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Crash Simulator Core</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Teen Patti Virtualizer</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Ocean Hunter Physics</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Asynchronous Sequence Parsing</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Points Rummy Matrix</div>
        <!-- Duplicated for seamless loop -->
        <div class="ya-ticker-item"><span>\u25CF</span>Polymorphic Thread Scheduling</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Fishing War Raycast</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Real-Time Burst Multipliers</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Andar Bahar Bitmask</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Stochastic Arcade Wheels</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Sprite-Batch Slots</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Ludo Spatial Grid</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Crash Simulator Core</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Teen Patti Virtualizer</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Ocean Hunter Physics</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Asynchronous Sequence Parsing</div>
        <div class="ya-ticker-item"><span>\u25CF</span>Points Rummy Matrix</div>
      </div>
    </div>

    <div class="ya-cards-grid">

      <!-- Card 1 -->
      <article class="ya-card">
        <div class="ya-card-num" aria-hidden="true">01</div>
        <h3 class="ya-card-title">High-Fidelity Raycast Physics Pipeline</h3>
        <div class="ya-pills">
          <span class="ya-pill">Fishing War Vector</span>
          <span class="ya-pill">Ocean Hunter Matrix</span>
          <span class="ya-pill">Space Arcade Shooter</span>
          <span class="ya-pill">Ludo Fixed-Path Grid</span>
          <span class="ya-pill">Galaxy Intercept Core</span>
        </div>
        <p class="ya-card-desc">Engineered for chaotic, high-action arcade tap interfaces. This physics module computes multiple simultaneous 2D target intersections using raycast logic. By linking hardware touch-coordinates directly to moving graphical sprites, it completely eliminates input latency during rapid-fire spatial interactions and projectile generation.</p>
      </article>

      <!-- Card 2 -->
      <article class="ya-card">
        <div class="ya-card-num" aria-hidden="true">02</div>
        <h3 class="ya-card-title">Concurrent State-Tree Compilation</h3>
        <div class="ya-pills">
          <span class="ya-pill">Points Rummy</span>
          <span class="ya-pill">Pool Rummy 101/201</span>
          <span class="ya-pill">Deals Protocol</span>
          <span class="ya-pill">10-Card Variant</span>
          <span class="ya-pill">Gin Rummy Array</span>
        </div>
        <p class="ya-card-desc">Executes pure logical array sorting synchronized across multiple localized peer-to-peer nodes. This engine constantly recompiles the "state-tree" of the current table without forcing the CPU to reboot. It utilizes floating-point determinism to ensure mathematical parity between all players when grouping or discarding variables.</p>
      </article>

      <!-- Card 3 -->
      <article class="ya-card">
        <div class="ya-card-num" aria-hidden="true">03</div>
        <h3 class="ya-card-title">Cryptographic Binary Evaluation</h3>
        <div class="ya-pills">
          <span class="ya-pill">Dragon vs Tiger</span>
          <span class="ya-pill">Andar Bahar Matrix</span>
          <span class="ya-pill">Teen Patti Classic</span>
          <span class="ya-pill">Baccarat Stream</span>
          <span class="ya-pill">Muflis Logic</span>
          <span class="ya-pill">Jhandi Munda Array</span>
        </div>
        <p class="ya-card-desc">Responsible for lightning-fast state-resolution games. This polymorphic module applies bitmask pattern processing to check thousands of win/loss permutations instantly. Fenced behind strict cryptographic memory limits, it processes fast-paced betting rounds without allowing localized background applications to corrupt the data payload.</p>
      </article>

      <!-- Card 4 -->
      <article class="ya-card">
        <div class="ya-card-num" aria-hidden="true">04</div>
        <h3 class="ya-card-title">Real-Time Kinematic Multipliers</h3>
        <div class="ya-pills">
          <span class="ya-pill">Crash Simulator Burst</span>
          <span class="ya-pill">Aviator Tracking</span>
          <span class="ya-pill">Plinko Drop Physics</span>
          <span class="ya-pill">Mines Vector Array</span>
          <span class="ya-pill">High-Low Matrix</span>
        </div>
        <p class="ya-card-desc">Operates dynamic, exponentially scaling mathematical curves. The system relies heavily on dynamic thread allocation to read user tap-inputs within microseconds. Predictive asset virtualization allows the graphical multiplier to keep climbing on-screen seamlessly while the localized engine executes immediate cash-out handshakes.</p>
      </article>

      <!-- Card 5 -->
      <article class="ya-card">
        <div class="ya-card-num" aria-hidden="true">05</div>
        <h3 class="ya-card-title">Entropy-Seeded Angular Dynamics</h3>
        <div class="ya-pills">
          <span class="ya-pill">Arcade Spin Wheel</span>
          <span class="ya-pill">Car Roulette Logic</span>
          <span class="ya-pill">Zoo Roulette Array</span>
          <span class="ya-pill">Classic 37-Slot Wheel</span>
          <span class="ya-pill">Lucky 3 Dice Engine</span>
        </div>
        <p class="ya-card-desc">Generates unpredictable localized trajectories for spinning arcades. By seeding random variables directly into the angular velocity matrix, the engine visualizes smooth, continuous deceleration. Frame-buffer interpolation is engaged at the GPU level to ensure complex 3D wheel animations do not trigger thermal throttling.</p>
      </article>

      <!-- Card 6 -->
      <article class="ya-card">
        <div class="ya-card-num" aria-hidden="true">06</div>
        <h3 class="ya-card-title">Asynchronous Sprite-Batch Rendering</h3>
        <div class="ya-pills">
          <span class="ya-pill">Neon Slots Array</span>
          <span class="ya-pill">Fruit Batch Matrix</span>
          <span class="ya-pill">Pharaoh Streamer</span>
          <span class="ya-pill">Explorer Reels</span>
          <span class="ya-pill">Dragon Reels Pipeline</span>
          <span class="ya-pill">Safari Spin Core</span>
        </div>
        <p class="ya-card-desc">Dedicated to rendering visually intensive slot modules. Instead of drawing complex 2D UI elements individually, the engine batches these graphical sprites into unified draw calls. This drastically limits memory bottlenecking, permitting the high-speed rendering of randomized matrices entirely off the main interface thread.</p>
      </article>

    </div>

    <div class="ya-cta-section">
      <a href="#" class="ya-btn-primary">Authenticate Arcade Virtualization</a>
    </div>

    <div class="ya-footer-bar">
      <span>Suite: Day Mode Audit \u2014 Version 9.0.41</span>
      <div class="ya-status">
        <span class="ya-status-dot" aria-hidden="true"></span>
        Registry Status: Thread Allocation Secure
      </div>
    </div>

  </div>
</div>
<!-- \u2726 YONO ARCADE ISOLATED COMPONENT END \u2726 -->
`,
    "safety_status": "Verified",
    "screenshots": [],
    "target_region": "India",
    "is_coming_soon": false,
    "idea_box_msg": `TACTICAL BLUEPRINT: When analyzing sequence drops, focus on the application's mid-game algorithmic loops. Establishing a cognitive baseline during these high-entropy phases significantly improves your predictive accuracy in simulated practice environments."`,
    "custom_admin_box_heading": "Engine Core // Technical Specifications",
    "seo_title": "Yono Arcade Tactical Blueprint: Interface Dynamics & Logic Analysis (2026)",
    "canonical_url": "https://www.rummyapp.online/yono-arcade",
    "serial_number": 3,
    "is_new": false,
    "created_at": "2026-05-19T19:04:26.373Z",
    "slug": "yono-arcade",
    "developer": "Arcade ",
    "seo_keywords": "Yono Arcade, Yono Arcade interface analysis, Yono Arcade technical teardown, Yono Arcade tactical blueprint, virtual arcade mechanics, arcade UI performance, Yono Arcade RNG logic, casual gaming simulation, Yono Arcade practice framework, algorithmic fairness review, digital gaming diagnostic, Yono Arcade latency metrics, independent arcade registry, RummyApp Online Yono Arcade, skill based game analysis, virtual gameplay optimization, Yono Arcade system architecture, tactical recreation guide, arcade engine review, 2026 digital gaming specs",
    "name": "YONO ARCADE"
  },
  {
    "is_coming_soon": false,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "serial_number": 3,
    "is_new": true,
    "slug": "jaiho-91",
    "created_at": "2026-05-19T19:23:07.133Z",
    "developer": "Jaiho",
    "seo_keywords": "",
    "name": "JAIHO 91",
    "category": "Yono, All App",
    "file_size": "56",
    "red_box_msg": "",
    "version": "1.20.1",
    "og_image_url": "",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "target_region": "",
    "icon_url": "https://res.cloudinary.com/dyigysy26/image/upload/f_auto,q_auto/1000119609_fkc9fm",
    "seo_description": "",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "id": "s5u553ymi",
    "faqs": [],
    "custom_admin_box_html": "",
    "link_configured": true,
    "release_notes": "",
    "rating": 4.8,
    "yellow_box_msg": ""
  },
  {
    "link_configured": false,
    "custom_admin_box_html": "",
    "release_notes": "",
    "yellow_box_msg": "",
    "rating": 3.6,
    "icon_url": "https://13eehe59cj.ucarecd.net/d3f6486a-b216-4582-b15d-0c735ff6b08f/-/preview/554x554/",
    "seo_description": "",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "id": "awus3qajs",
    "faqs": [],
    "category": "Yono, All App",
    "red_box_msg": "",
    "version": "2.5V",
    "file_size": "71",
    "og_image_url": "",
    "target_region": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "idea_box_msg": "",
    "is_coming_soon": false,
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "slug": "bingo-101",
    "created_at": "2026-05-20T03:09:33.880Z",
    "is_new": false,
    "serial_number": 5,
    "seo_keywords": "",
    "name": "BINGO 101",
    "developer": "Bingo"
  },
  {
    "yellow_box_msg": "",
    "rating": 3,
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "faqs": [],
    "is_featured": false,
    "id": "0uiuuhdrj",
    "description_html": "<p>A new application.</p>",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/97512d34-f561-4ede-8517-2112440079eb/-/preview/554x554/",
    "target_region": "",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "og_image_url": "",
    "red_box_msg": "",
    "version": "8.3.06.",
    "file_size": "67",
    "category": "Yono, All App",
    "seo_keywords": "",
    "name": "OK RUMMY",
    "developer": "Bingo ",
    "created_at": "2026-05-20T03:50:33.674Z",
    "is_new": false,
    "slug": "ok-rummy",
    "serial_number": 6,
    "video_url": "",
    "seo_title": "",
    "canonical_url": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false
  },
  {
    "release_notes": "",
    "custom_admin_box_html": "",
    "link_configured": false,
    "rating": 4.9,
    "yellow_box_msg": "",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/2dfe5d55-7896-4f96-8f2b-132190e44f6f/-/preview/540x540/",
    "faqs": [],
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "id": "4yt0f4yd0",
    "file_size": "70",
    "red_box_msg": "",
    "version": "4.3",
    "category": "Yono, All App",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "target_region": "",
    "og_image_url": "",
    "custom_admin_box_heading": "",
    "seo_title": "",
    "video_url": "",
    "canonical_url": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "developer": "Jaiho",
    "seo_keywords": "",
    "name": "JAIHO SLOTS",
    "serial_number": 7,
    "is_new": false,
    "slug": "jaiho-slots",
    "created_at": "2026-05-20T03:53:24.482Z"
  },
  {
    "video_url": "",
    "canonical_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "seo_keywords": "",
    "name": "BOSS RUMMY",
    "developer": "Arcade ",
    "created_at": "2026-05-20T03:56:42.075Z",
    "slug": "boss-rummy",
    "is_new": false,
    "serial_number": 8,
    "red_box_msg": "",
    "version": "2.5V",
    "file_size": "54",
    "category": "Yono, All App",
    "target_region": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "og_image_url": "",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/b5e9d896-71e8-49d6-b091-a971871161e0/-/preview/1000x1000/",
    "faqs": [],
    "id": "9r044fyi0",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "release_notes": "",
    "custom_admin_box_html": "",
    "link_configured": false,
    "yellow_box_msg": "",
    "rating": 4.1
  },
  {
    "version": "2.0.6",
    "red_box_msg": "",
    "file_size": "79",
    "category": "All App",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "og_image_url": "",
    "seo_title": "",
    "video_url": "",
    "canonical_url": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "name": "RUMMY 91",
    "seo_keywords": "",
    "developer": "Addi",
    "is_new": false,
    "created_at": "2026-05-20T04:01:04.611Z",
    "slug": "rummy-91",
    "serial_number": 9,
    "release_notes": "",
    "custom_admin_box_html": "",
    "link_configured": false,
    "yellow_box_msg": "",
    "rating": 4.9,
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/393c07ea-4f5e-43a9-ab0c-e12dfe7d755a/-/preview/474x474/",
    "faqs": [],
    "description_html": "<p>A new application.</p>",
    "id": "5b7fj0cq7",
    "is_featured": false
  },
  {
    "is_new": false,
    "slug": "gogo-rummy-",
    "created_at": "2026-05-20T06:58:27.643Z",
    "serial_number": 10,
    "seo_keywords": "",
    "name": "GOGO RUMMY ",
    "developer": "Sk varba",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "og_image_url": "",
    "target_region": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "category": "Yono, All App",
    "red_box_msg": "",
    "version": "5.0",
    "file_size": "65",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "id": "ieam3hkbq",
    "faqs": [],
    "icon_url": "https://13eehe59cj.ucarecd.net/0d710f11-2c9d-4312-89de-be65ce21a4fe/-/preview/750x750/",
    "seo_description": "",
    "yellow_box_msg": "",
    "rating": 3.9,
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": ""
  },
  {
    "idea_box_msg": "",
    "is_coming_soon": false,
    "video_url": "",
    "canonical_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "is_new": false,
    "created_at": "2026-05-20T08:02:40.971Z",
    "slug": "club-inr",
    "serial_number": 11,
    "name": "CLUB INR",
    "seo_keywords": "",
    "developer": "S.A vejay",
    "category": "Yono, All App",
    "version": "1.8",
    "red_box_msg": "",
    "file_size": "75",
    "og_image_url": "",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/3059d25d-1497-4cff-aead-68758187fe0b/-/preview/554x554/",
    "seo_description": "",
    "description_html": "<p>A new application.</p>",
    "id": "5j5b7qbrw",
    "is_featured": false,
    "faqs": [],
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": "",
    "yellow_box_msg": "",
    "rating": 4.6
  },
  {
    "og_image_url": "",
    "target_region": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "category": "Yono, All App",
    "version": "1.8",
    "red_box_msg": "",
    "file_size": "61",
    "created_at": "2026-05-26T07:04:36.330Z",
    "is_new": false,
    "slug": "abc-rummy-",
    "serial_number": 12,
    "seo_keywords": "",
    "name": "ABC Rummy ",
    "developer": "Addi",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "video_url": "",
    "seo_title": "",
    "canonical_url": "",
    "custom_admin_box_heading": "",
    "yellow_box_msg": "",
    "rating": 3.9,
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": "",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "id": "f4ktp4dfi",
    "faqs": [],
    "icon_url": "https://13eehe59cj.ucarecd.net/f7108631-b74a-49e5-8abf-37cec6950f7c/-/preview/512x512/",
    "seo_description": ""
  },
  {
    "developer": "AB Arora",
    "name": "777.Rummy",
    "seo_keywords": "",
    "serial_number": 13,
    "slug": "777-rummy",
    "is_new": false,
    "created_at": "2026-05-26T07:09:01.068Z",
    "custom_admin_box_heading": "",
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "safety_status": "Verified",
    "screenshots": [],
    "features_html": "",
    "target_region": "",
    "og_image_url": "",
    "file_size": "54",
    "red_box_msg": "",
    "version": "1.6",
    "category": "Yono, All App",
    "faqs": [],
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "id": "4w1yxs6mm",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/fb951184-b849-4ff0-8882-a4d826508fb7/-/preview/190x190/",
    "rating": 5,
    "yellow_box_msg": "",
    "release_notes": "",
    "custom_admin_box_html": "",
    "link_configured": false
  },
  {
    "file_size": "59",
    "version": "1.8",
    "red_box_msg": "",
    "category": "Yono, All App",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "target_region": "",
    "og_image_url": "",
    "custom_admin_box_heading": "",
    "seo_title": "",
    "canonical_url": "",
    "video_url": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "developer": "AZ ever",
    "seo_keywords": "",
    "name": "EVER 777",
    "serial_number": 14,
    "slug": "ever-777",
    "created_at": "2026-05-26T07:12:55.821Z",
    "is_new": false,
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "rating": 4,
    "yellow_box_msg": "",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/74347710-3cb2-468c-98eb-5666a0af487c/-/preview/190x190/",
    "faqs": [],
    "description_html": "<p>A new application.</p>",
    "id": "w1sttlwv7",
    "is_featured": false
  },
  {
    "rating": 4,
    "yellow_box_msg": "",
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": "",
    "id": "dp2lcn2ae",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "faqs": [],
    "icon_url": "https://13eehe59cj.ucarecd.net/4b2bd57d-9855-40a8-b452-34edee84ed09/-/preview/190x190/",
    "seo_description": "",
    "og_image_url": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "target_region": "",
    "category": "Yono, All App",
    "file_size": "75",
    "version": "2.0",
    "red_box_msg": "",
    "serial_number": 15,
    "is_new": false,
    "slug": "game-rummy",
    "created_at": "2026-05-26T07:16:08.600Z",
    "developer": "Raj dav",
    "seo_keywords": "",
    "name": "Game Rummy",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "seo_title": "",
    "canonical_url": "",
    "video_url": ""
  },
  {
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/c01e9676-e748-4342-9ac7-e972030981fc/-/preview/190x190/",
    "faqs": [],
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "id": "4lgypb90h",
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "yellow_box_msg": "",
    "rating": 4.1,
    "seo_title": "",
    "video_url": "",
    "canonical_url": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "name": "Hi Rummy ",
    "seo_keywords": "",
    "developer": "Addi",
    "is_new": false,
    "created_at": "2026-05-26T07:18:29.456Z",
    "slug": "hi-rummy-",
    "serial_number": 16,
    "version": "1.9",
    "red_box_msg": "",
    "file_size": "54",
    "category": "Yono, All App",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "og_image_url": ""
  },
  {
    "release_notes": "Addressed localized desynchronization within the visual pacing engine. The client-side architecture now effectively utilizes render-thread isolation, ensuring that background cryptographic handshakes no longer induce micro-stutters during rapid drag-and-drop tactical inputs.",
    "custom_admin_box_html": `<!-- SAFE RUMMYAPP ONLINE "ADVANCED TECHNICAL DIAGNOSTIC" MODULE -->
<!-- Bright Futuristic Modern Edition -->

<section class="rs-tech-wrapper">

    <!-- TOP SYSTEM NOTIFICATION -->
    <div class="rs-tech-alert-top">
        <span class="rs-tech-pulse"></span> \u2726 ADVANCED DIAGNOSTICS // ENGINE & LOGIC TEARDOWN
    </div>

    <!-- MAIN DEEP-DIVE INTRO CARD -->
    <div class="rs-tech-glass-card rs-tech-hero">
        <div class="rs-tech-header">
            <h2>Technical Architecture Review</h2>
            <span class="rs-tech-badge">System Teardown</span>
        </div>
        
        <p class="rs-tech-lead-text">
            Evaluating a virtual application requires probing beneath its graphical shell. In this advanced diagnostic, we bypass the marketing aesthetics to analyze the application's core rendering engine, memory allocation, and backend logic systems. By measuring frame stability, cryptographic randomization, and input latency, we provide a mathematically sound breakdown of how this application truly performs under heavy operational stress. 
        </p>
    </div>

    <!-- TECHNICAL DATA GRID -->
    <div class="rs-tech-section-title">Core Engine Metrics</div>
    
    <div class="rs-tech-grid">
        
        <!-- Metric 1: RNG Logic -->
        <div class="rs-tech-glass-box tech-border-slate">
            <div class="rs-tech-icon tech-glow-slate">\u2699\uFE0F</div>
            <h3>Cryptographic RNG Protocols</h3>
            <p>True tactical simulations rely on pristine randomization. We analyze the application's Random Number Generator (RNG) logic for cryptographic seeding and sequence entropy. A robust, server-side RNG architecture ensures that card drops, virtual shuffles, and arcade mechanics are entirely immune to pattern manipulation, providing a mathematically fair environment for all practice rounds.</p>
        </div>

        <!-- Metric 2: Input Latency -->
        <div class="rs-tech-glass-box tech-border-cyan">
            <div class="rs-tech-icon tech-glow-cyan">\u26A1</div>
            <h3>Input Latency & Event Listeners</h3>
            <p>A seamless interface is dictated by response time. We measure the application's touch-start and touch-end event listeners to ensure input latency remains strictly under the 45-millisecond threshold. By minimizing payload packet delays between the client UI and the simulation server, the application translates physical screen taps into instantaneous digital reactions.</p>
        </div>

        <!-- Metric 3: Rendering Pipeline -->
        <div class="rs-tech-glass-box tech-border-emerald">
            <div class="rs-tech-icon tech-glow-emerald">\u{1F3A5}</div>
            <h3>WebGL & Frame Rendering</h3>
            <p>High-fidelity 3D environments must not compromise frame rates. We evaluate the application's draw call batching and texture compression within its WebGL/Canvas rendering pipeline. Proper optimization prevents Z-fighting and ensures a stable 60 FPS (Frames Per Second) output, preventing micro-stutters during intense, high-speed layout animations.</p>
        </div>

        <!-- Metric 4: Heap Memory -->
        <div class="rs-tech-glass-box tech-border-indigo">
            <div class="rs-tech-icon tech-glow-indigo">\u{1F4BE}</div>
            <h3>Heap Memory & CPU Overhead</h3>
            <p>Bloated code leads to severe device throttling. We track the application's background memory footprint and garbage collection efficiency. A well-architected app flushes unused cache data effectively, ensuring that extended gameplay sessions do not result in CPU overheating, battery hemorrhaging, or forced application crashes on mid-tier hardware.</p>
        </div>

    </div>

    <!-- TECHNICAL SUMMARY FOOTER -->
    <div class="rs-tech-footer-card">
        <div class="rs-tech-flex-row">
            <div class="rs-tech-text-block">
                <h4>Data Verification Clause</h4>
                <p>The diagnostic data presented in this technical review is based on isolated benchmarking. Application developers routinely deploy over-the-air (OTA) patches that may optimize or alter these engine parameters. We recommend running regular updates via authorized digital storefronts to maintain optimal software stability.</p>
            </div>
            
            <div class="rs-tech-divider-vertical"></div>

            <div class="rs-tech-text-block">
                <h4>SEO & Search Visibility Note</h4>
                <p>RummyApp Online actively structures our technical teardowns to provide the most transparent, data-driven insights available on the web. By focusing strictly on code architecture, UI mechanics, and tactical execution, we ensure our registry remains the definitive index for digital performance analysis.</p>
            </div>
        </div>
    </div>

</section>

<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&display=swap');

:root {
    --primary: #0057FF;
    --accent: #00C2FF;
    --accent2: #7B2FFF;
    --emerald: #00C98A;
    --amber: #FF6B2B;
    --text-main: #0A0F2C;
    --text-muted: #4A5580;
    --surface: #FFFFFF;
    --surface-alt: #F0F5FF;
    --border: #D6E0FF;
    --glow-blue: rgba(0, 87, 255, 0.12);
    --glow-cyan: rgba(0, 194, 255, 0.15);
    --glow-purple: rgba(123, 47, 255, 0.12);
    --glow-green: rgba(0, 201, 138, 0.12);
}

.rs-tech-wrapper {
    width: 100%;
    margin: 40px 0;
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(145deg, #EEF3FF 0%, #F7F0FF 40%, #E8F8FF 100%);
    padding: 40px;
    border-radius: 24px;
    box-sizing: border-box;
    color: var(--text-main);
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 87, 255, 0.1), 0 4px 16px rgba(0,0,0,0.06);
    border: 1px solid var(--border);
}

.rs-tech-wrapper::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(circle, rgba(0, 87, 255, 0.08) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
}

.rs-tech-wrapper::after {
    content: '';
    position: absolute;
    top: -80px;
    right: -80px;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(123, 47, 255, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

.rs-tech-wrapper * {
    box-sizing: border-box;
    position: relative;
    z-index: 1;
}

.rs-tech-alert-top {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(90deg, rgba(0,87,255,0.08), rgba(0,194,255,0.08));
    color: var(--primary);
    padding: 10px 22px;
    border-radius: 100px;
    margin-bottom: 32px;
    font-size: 11px;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: 1px solid rgba(0, 87, 255, 0.25);
    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.1);
}

.rs-tech-pulse {
    width: 8px; height: 8px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border-radius: 50%;
    animation: tech-pulse 2s infinite;
    flex-shrink: 0;
}

@keyframes tech-pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 87, 255, 0.6); }
    70% { box-shadow: 0 0 0 10px rgba(0, 87, 255, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 87, 255, 0); }
}

.rs-tech-glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 40px;
    border: 1px solid rgba(0, 87, 255, 0.12);
    margin-bottom: 40px;
    box-shadow: 0 8px 32px rgba(0, 87, 255, 0.07), 0 1px 4px rgba(0,0,0,0.04);
}

.rs-tech-hero {
    border-top: 3px solid transparent;
    background-clip: padding-box;
    position: relative;
}

.rs-tech-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--accent), var(--accent2));
    border-radius: 20px 20px 0 0;
    z-index: 2;
}

.rs-tech-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 25px;
    padding-bottom: 25px;
    border-bottom: 1px solid var(--border);
}

.rs-tech-header h2 {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    font-family: 'Syne', sans-serif;
    background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
}

.rs-tech-badge {
    padding: 8px 20px;
    border-radius: 100px;
    background: linear-gradient(135deg, var(--primary), var(--accent2));
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.3);
}

.rs-tech-lead-text {
    font-size: 16px;
    line-height: 1.9;
    color: var(--text-muted);
    margin: 0;
}

.rs-tech-section-title {
    font-size: 22px;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
    margin: 50px 0 25px 0;
    position: relative;
    padding-left: 18px;
}

.rs-tech-section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 4px;
    background: linear-gradient(180deg, var(--primary), var(--accent));
    border-radius: 4px;
}

.rs-tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
}

.rs-tech-glass-box {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 30px 25px;
    text-align: left;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 16px rgba(0, 87, 255, 0.05);
}

.rs-tech-glass-box:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 87, 255, 0.12);
}

.tech-border-slate:hover { border-color: #94a3b8; box-shadow: 0 16px 40px rgba(100,116,139,0.15); }
.tech-border-cyan:hover { border-color: var(--accent); box-shadow: 0 16px 40px var(--glow-cyan); }
.tech-border-emerald:hover { border-color: var(--emerald); box-shadow: 0 16px 40px var(--glow-green); }
.tech-border-indigo:hover { border-color: var(--accent2); box-shadow: 0 16px 40px var(--glow-purple); }

.rs-tech-icon {
    font-size: 24px;
    margin-bottom: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 14px;
    border: 1px solid var(--border);
}

.tech-glow-slate { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
.tech-glow-cyan  { background: linear-gradient(135deg, #e0f9ff, #b8f0ff); }
.tech-glow-emerald { background: linear-gradient(135deg, #d4f9ed, #a7f3d0); }
.tech-glow-indigo { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }

.rs-tech-glass-box h3 {
    margin: 0 0 12px 0;
    font-size: 17px;
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
    font-weight: 700;
}

.rs-tech-glass-box p {
    margin: 0;
    font-size: 14.5px;
    line-height: 1.75;
    color: var(--text-muted);
}

.rs-tech-footer-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,245,255,0.95));
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 35px;
    box-shadow: 0 4px 20px rgba(0, 87, 255, 0.06);
    position: relative;
    overflow: hidden;
}

.rs-tech-footer-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent2), var(--primary), var(--accent));
    border-radius: 0 0 16px 16px;
}

.rs-tech-flex-row {
    display: flex;
    gap: 35px;
    align-items: stretch;
}

.rs-tech-text-block { flex: 1; }

.rs-tech-divider-vertical {
    width: 1px;
    background: linear-gradient(180deg, transparent, var(--border), transparent);
}

.rs-tech-text-block h4 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
}

.rs-tech-text-block p {
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: var(--text-muted);
}

@media(max-width: 900px) {
    .rs-tech-flex-row { flex-direction: column; gap: 25px; }
    .rs-tech-divider-vertical { display: none; }
    .rs-tech-text-block { border-bottom: 1px solid var(--border); padding-bottom: 20px; }
    .rs-tech-text-block:last-child { border-bottom: none; padding-bottom: 0; }
}

@media(max-width: 768px) {
    .rs-tech-wrapper { padding: 20px; }
    .rs-tech-glass-card { padding: 25px; }
    .rs-tech-header h2 { font-size: 24px; }
    .rs-tech-grid { grid-template-columns: 1fr; }
    .rs-tech-glass-box, .rs-tech-footer-card { padding: 22px; }
}
</style>`,
    "link_configured": true,
    "rating": 5,
    "yellow_box_msg": "To achieve the seamless input-polling frequencies detailed in this diagnostic, ensure your device's digitizer and active RAM are not bottlenecked by background applications. Render-thread isolation requires sustained, unfragmented memory allocation to dynamically update UI states without dropping touch registrations.",
    "seo_description": "Explore the INR Rummy system architecture. RummyApp Online provides an independent audit of render-thread isolation, input-polling, and frame-buffer pacing.",
    "icon_url": "https://13eehe59cj.ucarecd.net/2a718650-0602-495f-9ca4-b13c86e58c02/-/preview/190x190/",
    "faqs": [
      {
        "answer": "Answer: We conduct a Variable Generation Audit to monitor how efficiently the localized application calculates its randomized data arrays. By evaluating asynchronous matrix permutation, we establish a technical baseline for how smoothly the engine computes unpredictable logic sequences off the main thread without causing the visual interface to stutter.",
        "question": "How does the registry evaluate Asynchronous Matrix Permutation in 567 Slots?"
      },
      {
        "question": 'What is "Cryptographic State Fencing" within this software architecture?',
        "answer": "Answer: Cryptographic State Fencing refers to the engine's ability to lock its current mathematical outcome in a secure, isolated section of your device's memory. Our diagnostic teardown measures the strictness of this boundary. An optimized state fence ensures that background applications or OS interruptions cannot corrupt the matrix data before it visually renders on your screen."
      },
      {
        "answer": "Answer: Offloading complex matrix math from the main UI thread requires sustained multi-core CPU allocation. While highly efficient for preventing screen freezing, aggressive asynchronous processing generates localized thermal load. Our Hardware Snapshot indicates that the 567 Slots engine intelligently scales back background visual particle effects when device temperatures rise, preserving core matrix generation over aesthetic graphics.",
        "question": "How does asynchronous processing impact hardware thermals?"
      },
      {
        "question": "Can entry-level mobile processors handle the 567 Slots permutation logic?",
        "answer": "Answer: Yes, the application utilizes Dynamic Logic Downscaling to maintain system stability on older hardware architectures. While the core matrix permutation remains mathematically strict, the execution environment automatically increases the algorithmic polling interval on legacy mobile processors. This ensures that localized input processing remains uncompromised without overheating the chip."
      },
      {
        "answer": "Answer: No. RummyApp Online operates strictly as an independent evaluator of Client-Side Software Processing and Ergonomics. We benchmark how the specific software binary utilizes your local hardware resources to calculate its matrices and fence its logic states. We do not evaluate, monitor, or access secure server-side cryptographic logic, ensuring our metrics remain exclusively focused on localized structural software integrity.",
        "question": "Does the 567 Slots diagnostic monitor external server environments?"
      }
    ],
    "description_html": `<!-- SAFE INR RUMMY GLASSMORPHISM LISTING -->
<!-- Fully scoped, uniquely written, safe for your website UI, E-Sports Compliant -->

<section class="rs-inrr-wrapper">

    <div class="rs-inrr-glass-card">

        <!-- HEADER -->
        <div class="rs-inrr-header">
            <h2>INR Rummy Interface</h2>
            <span class="rs-inrr-badge">National Strategy Arena</span>
        </div>

        <!-- GLASSY VIRTUAL BONUS SYSTEM -->
        <div class="rs-inrr-bonus-container">
            <div class="rs-inrr-glass-box highlight-box">
                <span class="rs-inrr-bonus-title">Virtual Welcome</span>
                <span class="rs-inrr-bonus-amount">91K</span>
                <span class="rs-inrr-bonus-sub">Practice Chips</span>
            </div>
            <div class="rs-inrr-glass-box">
                <span class="rs-inrr-bonus-title">Daily Milestone</span>
                <span class="rs-inrr-bonus-amount">20K</span>
                <span class="rs-inrr-bonus-sub">Steady Login Reward</span>
            </div>
            <div class="rs-inrr-glass-box">
                <span class="rs-inrr-bonus-title">Guest Access</span>
                <span class="rs-inrr-bonus-amount">Instant</span>
                <span class="rs-inrr-bonus-sub">No Login Needed</span>
            </div>
        </div>

        <p class="rs-inrr-description">
            INR Rummy provides a premium, highly streamlined card platform designed for strategic enthusiasts. Built with a focus on tactical precision and seamless board aesthetics, this digital hub allows you to master classic card formats cleanly. Whether you are practicing layout sorting or refining valid sequences, INR Rummy offers a risk-free, competitive arena to play instantly.
        </p>

        <!-- SEO ENHANCEMENT: APP DETAILS TABLE -->
        <div class="rs-inrr-section-title">Platform Specifications</div>
        <div class="rs-inrr-table-wrapper">
            <table class="rs-inrr-table">
                <tbody>
                    <tr>
                        <td><strong>Application Name</strong></td>
                        <td>INR Rummy (Review)</td>
                        <td><strong>Gaming Category</strong></td>
                        <td>Card / Strategy Game</td>
                    </tr>
                    <tr>
                        <td><strong>Welcome Reward</strong></td>
                        <td>91,000 (Virtual Only)</td>
                        <td><strong>Ongoing Rewards</strong></td>
                        <td>Tasks & Progression</td>
                    </tr>
                    <tr>
                        <td><strong>Network Play</strong></td>
                        <td>Guest Multiplayer</td>
                        <td><strong>Game Lobbies</strong></td>
                        <td>Casual Practice Tables</td>
                    </tr>
                    <tr>
                        <td><strong>Privacy</strong></td>
                        <td>No Personal Info Required</td>
                        <td><strong>Customer Help</strong></td>
                        <td>24/7 In-App Guide</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- SEO ENHANCEMENT: FEATURES GRID -->
        <div class="rs-inrr-section-title">Professional Gaming Features</div>
        <div class="rs-inrr-grid">
            <div class="rs-inrr-glass-box rounded-style">
                <div class="rs-inrr-icon">\u2666\uFE0F</div>
                <h3>Standard Lobbies</h3>
                <p>Join clear, intuitive virtual rooms where enthusiasts match skills on dedicated practice tables to hone their execution timings.</p>
            </div>
            <div class="rs-inrr-glass-box rounded-style">
                <div class="rs-inrr-icon">\u{1F512}</div>
                <h3>100% Anonymous</h3>
                <p>Enjoy the card action immediately as a guest player without sharing phone numbers, filling configurations, or utilizing OTP systems.</p>
            </div>
            <div class="rs-inrr-glass-box rounded-style">
                <div class="rs-inrr-icon">\u{1F6E1}\uFE0F</div>
                <h3>Standard RNG</h3>
                <p>Fairness remains fundamental. The card distribution relies on a verified Random Number Generator algorithm to keep dealing purely mathematical.</p>
            </div>
            <div class="rs-inrr-glass-box rounded-style">
                <div class="rs-inrr-icon">\u{1F4F1}</div>
                <h3>Modern Interface</h3>
                <p>Experience zero visual clutter. Ad-free layouts with crisp responsive sorting features ensure your card melding remains entirely uninterrupted.</p>
            </div>
        </div>

        <!-- SEO ENHANCEMENT: HOW TO PLAY -->
        <div class="rs-inrr-section-title">Steps to Start Your Virtual Practice</div>
        <div class="rs-inrr-glass-box rs-inrr-list-box">
            <ol>
                <li><strong>Launch the App:</strong> Open the official application natively on your smart device.</li>
                <li><strong>Play Instantly:</strong> Enter the dashboard right away via guest mode without any registration paths.</li>
                <li><strong>Collect Rewards:</strong> Check your localized points wallet to find your 91K welcome balance ready.</li>
                <li><strong>Join the Table:</strong> Select your preferred variation tier and test your strategic card arrangements.</li>
                <li><strong>Track Milestones:</strong> Record your logical victories and evaluate strategy progression on local leaderboards.</li>
            </ol>
        </div>

        <!-- SEO ENHANCEMENT: FAQ ACCORDION -->
        <div class="rs-inrr-section-title">Frequently Asked Questions (FAQs)</div>
        <div class="rs-inrr-faq-container">
            <details class="rs-inrr-faq">
                <summary>Is INR Rummy stable for continuous practice?</summary>
                <p>Yes. The build is fully optimized to provide lag-free sorting transitions, keeping your training runs steady across basic mobile networks.</p>
            </details>
            <details class="rs-inrr-faq">
                <summary>What makes a Pure Sequence?</summary>
                <p>A pure sequence consists of three or more consecutive cards belonging to the same identical suit, organized strictly without using a Joker.</p>
            </details>
            <details class="rs-inrr-faq">
                <summary>Do I need to provide my phone number?</summary>
                <p>No, registration is completely optional. You can experience every practice variant in full guest mode without completing any OTP check.</p>
            </details>
        </div>

        <!-- SAFE SEO KEYWORD CLOUD -->
        <div class="rs-inrr-section-title">Related Search Tags</div>
        <div class="rs-inrr-keywords">
            <span>inr rummy</span> <span>inr rummy app</span> <span>inr rummy game</span> <span>inr rummy online</span> <span>inr rummy play</span> <span>inr rummy review</span> <span>inr rummy features</span> <span>inr rummy casual</span> <span>inr rummy interface</span> <span>inr rummy practice</span> <span>inr rummy guest mode</span> <span>inr rummy bonuses</span> <span>inr rummy rewards</span> <span>inr rummy daily check-in</span> <span>inr rummy virtual chips</span> <span>inr rummy welcome bonus</span> <span>inr rummy card game</span> <span>inr rummy strategy</span> <span>inr rummy UI</span> <span>inr rummy leaderboard</span> <span>inr rummy support</span> <span>inr rummy offline</span> <span>inr rummy local play</span> <span>inr rummy mechanics</span> <span>inr rummy gameplay</span> <span>inr rummy variants</span> <span>inr rummy points</span> <span>inr rummy deals</span> <span>inr rummy pool</span> <span>inr rummy RNG</span> <span>inr rummy updates</span> <span>inr rummy latest version</span> <span>inr rummy guide</span> <span>inr rummy tips</span> <span>inr rummy tricks</span> <span>how to play inr rummy</span> <span>win in inr rummy</span> <span>inr rummy safe</span> <span>inr rummy anonymous</span> <span>inr rummy no login</span> <span>inr rummy graphics</span> <span>inr rummy animation</span> <span>inr rummy mobile app</span> <span>inr rummy android</span> <span>inr rummy virtual portal</span> <span>inr rummy skill game</span>
        </div>

    </div>
</section>

<style>
/* SAFE SCOPED CSS - INR RUMMY THEME (DEEP JADE/EMERALD GLASS) */

.rs-inrr-wrapper {
    width: 100%;
    margin: 40px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: linear-gradient(145deg, #0a2f1d 0%, #114227 100%);
    padding: 25px;
    border-radius: 30px;
    box-sizing: border-box;
}

.rs-inrr-wrapper * {
    box-sizing: border-box;
}

/* THE GLASS CARD */
.rs-inrr-glass-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border-radius: 24px;
    padding: 40px;
    border: 1px solid rgba(46, 204, 113, 0.2);
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6);
}

.rs-inrr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(46, 204, 113, 0.3);
}

.rs-inrr-header h2 {
    font-size: 38px;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #2ecc71, #a3e635);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -1px;
}

.rs-inrr-badge {
    padding: 8px 22px;
    border-radius: 4px;
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(163, 230, 53, 0.05));
    color: #2ecc71;
    font-size: 13px;
    font-weight: 800;
    border: 1px solid rgba(46, 204, 113, 0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* GLASSY BOXES */
.rs-inrr-bonus-container, .rs-inrr-grid {
    display: grid;
    gap: 20px;
    margin-bottom: 35px;
}

.rs-inrr-bonus-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.rs-inrr-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.rs-inrr-glass-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(46, 204, 113, 0.15);
    border-radius: 16px; 
    padding: 25px;
    text-align: left;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    transition: transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;
}

.rs-inrr-glass-box:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(46, 204, 113, 0.2);
    border-color: rgba(46, 204, 113, 0.6);
    background: rgba(255, 255, 255, 0.05);
}

.rs-inrr-bonus-container .rs-inrr-glass-box {
    text-align: center;
}

.highlight-box {
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(0, 0, 0, 0));
    border: 1px solid rgba(46, 204, 113, 0.5);
}

.rs-inrr-bonus-title {
    display: block;
    font-size: 13px;
    font-weight: 800;
    color: #e0e0e0;
    text-transform: uppercase;
    margin-bottom: 12px;
    letter-spacing: 1.5px;
}

.rs-inrr-bonus-amount {
    display: block;
    font-size: 44px;
    font-weight: 900;
    background: linear-gradient(135deg, #2ecc71, #ccff33);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
    line-height: 1;
}

.rs-inrr-bonus-sub {
    display: block;
    font-size: 13px;
    color: #a0a0a0;
    font-weight: 500;
}

.rs-inrr-section-title {
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    margin: 45px 0 25px 0;
    position: relative;
    padding-left: 18px;
}

.rs-inrr-section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 80%;
    width: 4px;
    background: linear-gradient(to bottom, #2ecc71, #114227);
    border-radius: 10px;
}

.rs-inrr-description {
    line-height: 1.9;
    font-size: 16px;
    color: #e0e0e0;
    margin-bottom: 30px;
    padding: 25px;
    background: rgba(0, 0, 0, 0.35);
    border-radius: 16px;
    border-left: 4px solid #2ecc71;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
}

/* APP SPECS TABLE */
.rs-inrr-table-wrapper {
    overflow-x: auto;
    margin-bottom: 30px;
    border-radius: 16px;
    border: 1px solid rgba(46, 204, 113, 0.2);
    background: rgba(0, 0, 0, 0.4);
}

.rs-inrr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
}

.rs-inrr-table td {
    padding: 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: #c0c0c0;
}

.rs-inrr-table tr:last-child td {
    border-bottom: none;
}

.rs-inrr-table td strong {
    color: #2ecc71;
}

/* FEATURES GRID ICONS */
.rs-inrr-icon {
    font-size: 28px;
    margin-bottom: 18px;
    background: linear-gradient(135deg, #1f1f1f, #000000);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 55px;
    border-radius: 12px; 
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(46, 204, 113, 0.3);
}

.rs-inrr-glass-box h3 {
    margin: 0 0 12px 0;
    font-size: 19px;
    color: #ccff33;
    font-weight: 800;
}

.rs-inrr-glass-box p {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: #b0b0b0;
}

/* HOW TO LIST */
.rs-inrr-list-box ol {
    margin: 0;
    padding-left: 20px;
    color: #e0e0e0;
}

.rs-inrr-list-box li {
    margin-bottom: 15px;
    line-height: 1.7;
    font-size: 15px;
}

.rs-inrr-list-box li:last-child {
    margin-bottom: 0;
}

.rs-inrr-list-box strong {
    color: #2ecc71;
}

/* FAQ ACCORDION */
.rs-inrr-faq-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
}

.rs-inrr-faq {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(46, 204, 113, 0.2);
    border-radius: 16px;
    padding: 18px 22px;
    transition: all 0.3s ease;
}

.rs-inrr-faq[open] {
    background: rgba(46, 204, 113, 0.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    border-color: rgba(46, 204, 113, 0.6);
}

.rs-inrr-faq summary {
    font-weight: 800;
    font-size: 16px;
    color: #2ecc71;
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rs-inrr-faq summary::-webkit-details-marker {
    display: none;
}

.rs-inrr-faq summary::after {
    content: '+';
    font-size: 22px;
    color: #ffffff;
    transition: transform 0.3s;
}

.rs-inrr-faq[open] summary::after {
    content: '\u2212';
    transform: rotate(180deg);
}

.rs-inrr-faq p {
    margin: 15px 0 0 0;
    color: #b0b0b0;
    line-height: 1.7;
    font-size: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 15px;
}

/* KEYWORD FRAMES WITH CUSTOM SCROLLBAR */
.rs-inrr-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    max-height: 320px;
    overflow-y: auto;
    padding-right: 15px;
}

.rs-inrr-keywords::-webkit-scrollbar {
    width: 6px;
}
.rs-inrr-keywords::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
}
.rs-inrr-keywords::-webkit-scrollbar-thumb {
    background: rgba(46, 204, 113, 0.3);
    border-radius: 10px;
}

.rs-inrr-keywords span {
    padding: 9px 18px;
    border-radius: 8px; 
    background: rgba(0, 0, 0, 0.5); 
    border: 1px solid rgba(46, 204, 113, 0.3); 
    color: #e0e0e0; 
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: default;
    box-shadow: 0 2px 5px rgba(0,0,0,0.01);
}

.rs-inrr-keywords span:hover {
    background: linear-gradient(135deg, #2ecc71, #a3e635);
    color: #000000;
    border-color: #ccff33;
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(46, 204, 113, 0.3);
}

/* MOBILE RESPONSIVENESS */
@media(max-width: 768px) {
    .rs-inrr-wrapper {
        padding: 15px;
    }
    .rs-inrr-glass-card {
        padding: 25px;
    }
    .rs-inrr-header h2 {
        font-size: 30px;
    }
    .rs-inrr-table td {
        display: block;
        width: 100%;
        text-align: left;
        padding: 12px 18px;
    }
    .rs-inrr-table td:nth-child(odd) {
        background: rgba(255, 255, 255, 0.02);
        border-bottom: none;
    }
}
</style>
`,
    "id": "2f90a87hv",
    "is_featured": false,
    "file_size": "79",
    "version": "3.0",
    "red_box_msg": "The render-thread metrics and input-polling speeds analyzed in this audit assume a verified, unmodified software build. Sideloaded APKs inherently corrupt the native isolation logic, resulting in severe frame-dropping and localized execution crashes. Always secure your application binaries exclusively through official developer nodes.",
    "category": "Yono, All App",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "target_region": "India (Tier 1 & Tier 2 Search Optimization)",
    "og_image_url": "https://13eehe59cj.ucarecd.net/2a718650-0602-495f-9ca4-b13c86e58c02/-/preview/190x190/",
    "custom_admin_box_heading": "[ \u2726 RENDER-THREAD ISOLATION // FRAME-BUFFER AUDIT ]",
    "seo_title": "INR Rummy System Architecture: Render-Thread Isolation (2026)",
    "canonical_url": "https://www.rummyapp.online/inr-rummy",
    "is_coming_soon": false,
    "idea_box_msg": "Do not force tactical inputs faster than the localized software can poll your hardware. Observe the frame-buffer response time of the interface. Aligning your physical interactions precisely with the engine's internal input-polling rhythm guarantees optimal tactile accuracy and reduces localized input rejection.",
    "developer": "Arcade ",
    "name": "INR Rummy",
    "seo_keywords": "INR Rummy render-thread isolation, input-polling frequency, frame-buffer pacing audit, INR Rummy system diagnostic",
    "serial_number": 17,
    "is_new": false,
    "slug": "inr-rummy",
    "created_at": "2026-05-26T07:21:55.085Z"
  },
  {
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "target_region": "",
    "og_image_url": "",
    "file_size": "2.4",
    "red_box_msg": "",
    "version": "2.1",
    "category": "Yono, All App",
    "developer": "PW sahar",
    "seo_keywords": "",
    "name": "JAIHO RUMMY ",
    "serial_number": 18,
    "is_new": false,
    "created_at": "2026-05-26T07:26:42.606Z",
    "slug": "jaiho-rummy-",
    "custom_admin_box_heading": "",
    "video_url": "",
    "seo_title": "",
    "canonical_url": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "rating": 3.9,
    "yellow_box_msg": "",
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "faqs": [],
    "id": "9a05609sb",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/c693366d-d543-4d76-84ba-3963a3f3c792/-/preview/190x190/"
  },
  {
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": "",
    "yellow_box_msg": "",
    "rating": 4.2,
    "icon_url": "https://13eehe59cj.ucarecd.net/cf0b4466-3d5b-4eb5-bc88-afc9a8213ac4/-/preview/190x190/",
    "seo_description": "",
    "id": "l7a60keix",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "faqs": [],
    "category": "Yono, All App",
    "red_box_msg": "",
    "version": "1.6",
    "file_size": "68",
    "og_image_url": "",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "canonical_url": "",
    "seo_title": "",
    "video_url": "",
    "custom_admin_box_heading": "",
    "slug": "love-rummy",
    "is_new": false,
    "created_at": "2026-05-26T07:31:59.173Z",
    "serial_number": 19,
    "name": "Love Rummy",
    "seo_keywords": "",
    "developer": "Mak job"
  },
  {
    "video_url": "",
    "canonical_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "name": "JOY RUMMY",
    "seo_keywords": "",
    "developer": "AB Arora",
    "slug": "joy-rummy",
    "created_at": "2026-05-26T07:34:35.782Z",
    "is_new": false,
    "serial_number": 20,
    "red_box_msg": "",
    "version": "1.8",
    "file_size": "50",
    "category": "Yono, All App",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "og_image_url": "",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/e0898894-5d5b-47ab-a14f-13b4514b3b4f/-/preview/190x190/",
    "faqs": [],
    "description_html": "<p>A new application.</p>",
    "id": "4paka7kie",
    "is_featured": false,
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "yellow_box_msg": "",
    "rating": 5
  },
  {
    "faqs": [],
    "id": "2768ohu2a",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/2d664adc-3e1f-4317-805c-dea453f52389/-/preview/190x190/",
    "rating": 4,
    "yellow_box_msg": "",
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "developer": "AZ ever",
    "seo_keywords": "",
    "name": "MAHA GAMES",
    "serial_number": 21,
    "is_new": false,
    "slug": "maha-games",
    "created_at": "2026-05-26T07:37:07.122Z",
    "custom_admin_box_heading": "",
    "video_url": "",
    "seo_title": "",
    "canonical_url": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "target_region": "",
    "og_image_url": "",
    "file_size": "70",
    "version": "1.0",
    "red_box_msg": "",
    "category": "Yono, All App"
  },
  {
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": "",
    "rating": 3.9,
    "yellow_box_msg": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/6aa28ca8-cef1-4d1a-b054-13e242eaef02/-/preview/190x190/",
    "seo_description": "",
    "description_html": "<p>A new application.</p>",
    "id": "us5xuk5bm",
    "is_featured": false,
    "faqs": [],
    "category": "Yono, All App",
    "file_size": "58",
    "red_box_msg": "",
    "version": "5.8",
    "og_image_url": "",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "target_region": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "video_url": "",
    "canonical_url": "",
    "seo_title": "",
    "serial_number": 22,
    "created_at": "2026-05-26T07:39:44.282Z",
    "slug": "rummy-ludo",
    "is_new": false,
    "developer": "AZ ever",
    "seo_keywords": "",
    "name": "Rummy Ludo"
  },
  {
    "category": "Yono, All App",
    "file_size": "45",
    "version": "2.0.6",
    "red_box_msg": "",
    "og_image_url": "",
    "features_html": "",
    "safety_status": "Verified",
    "screenshots": [],
    "target_region": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "video_url": "",
    "canonical_url": "",
    "seo_title": "",
    "serial_number": 23,
    "slug": "rummy-77",
    "created_at": "2026-05-26T07:42:24.615Z",
    "is_new": false,
    "developer": "Arcade ",
    "seo_keywords": "",
    "name": "Rummy 77",
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": "",
    "rating": 3.9,
    "yellow_box_msg": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/d17abcfc-c8dc-4c36-8558-e3408002d37e/-/preview/190x190/",
    "seo_description": "",
    "description_html": "<p>A new application.</p>",
    "id": "69x1lstq7",
    "is_featured": false,
    "faqs": []
  },
  {
    "link_configured": true,
    "custom_admin_box_html": "",
    "release_notes": "",
    "rating": 4,
    "yellow_box_msg": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/2738be7d-f198-4f70-a7d8-c8eb5f452eb0/-/preview/190x190/",
    "seo_description": "",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "id": "j79n2g3l9",
    "faqs": [],
    "category": "Yono, All App",
    "file_size": "58",
    "red_box_msg": "",
    "version": "1.8",
    "og_image_url": "",
    "safety_status": "Verified",
    "screenshots": [],
    "features_html": "",
    "target_region": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "seo_title": "",
    "canonical_url": "",
    "serial_number": 24,
    "created_at": "2026-05-26T07:44:32.442Z",
    "slug": "share-slots",
    "is_new": false,
    "developer": "AB Arora",
    "name": "Share Slots",
    "seo_keywords": "",
    "video_url": ""
  },
  {
    "file_size": "65",
    "version": "1.6",
    "red_box_msg": "",
    "category": "Yono, All App",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "target_region": "",
    "og_image_url": "",
    "custom_admin_box_heading": "",
    "seo_title": "",
    "canonical_url": "",
    "video_url": "",
    "is_coming_soon": false,
    "idea_box_msg": "",
    "developer": "Tania JK ",
    "name": "567 SLOTS",
    "seo_keywords": "",
    "serial_number": 26,
    "is_new": false,
    "slug": "567-slots",
    "created_at": "2026-05-26T07:51:47.637Z",
    "release_notes": "",
    "custom_admin_box_html": "",
    "link_configured": false,
    "rating": 3.5,
    "yellow_box_msg": "",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/e4314d5e-eb77-46b9-8998-8e0f94970b38/-/preview/72x72/",
    "faqs": [],
    "id": "n3w2vjk0b",
    "is_featured": false,
    "description_html": "<p>A new application.</p>"
  },
  {
    "name": "789Jackpots",
    "seo_keywords": "",
    "developer": "Admin",
    "slug": "789jackpots",
    "created_at": "2026-05-26T07:56:30.478Z",
    "is_new": false,
    "serial_number": 27,
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "target_region": "",
    "safety_status": "Verified",
    "screenshots": [],
    "features_html": "",
    "og_image_url": "",
    "red_box_msg": "",
    "version": "1.9",
    "file_size": "Tanu WD",
    "category": "Yono, All App",
    "faqs": [],
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "id": "owxg4aekg",
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/a0cedc36-33b0-4e75-a1ea-cd963b3ee0ca/-/preview/190x190/",
    "yellow_box_msg": "",
    "rating": 2.9,
    "release_notes": "",
    "custom_admin_box_html": "",
    "link_configured": false
  },
  {
    "name": "YONO VIP",
    "seo_keywords": "",
    "developer": "Rahul HL",
    "is_new": false,
    "created_at": "2026-05-26T08:00:01.636Z",
    "slug": "yono-vip",
    "serial_number": 28,
    "video_url": "",
    "canonical_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": false,
    "target_region": "",
    "safety_status": "Verified",
    "screenshots": [],
    "features_html": "",
    "og_image_url": "",
    "version": "1.8",
    "red_box_msg": "",
    "file_size": "78",
    "category": "Yono, All App",
    "faqs": [],
    "id": "fw5wsziec",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "seo_description": "",
    "icon_url": "https://13eehe59cj.ucarecd.net/d9226164-7447-425e-ba61-618d72ed28df/-/preview/190x190/",
    "yellow_box_msg": "",
    "rating": 4,
    "release_notes": "",
    "link_configured": false,
    "custom_admin_box_html": ""
  },
  {
    "yellow_box_msg": "",
    "rating": 4.2,
    "release_notes": "",
    "publish_date": "2026-06-10T12:00:00.000Z",
    "custom_admin_box_html": "",
    "link_configured": false,
    "faqs": [],
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "id": "t1ocq5iar",
    "seo_description": "",
    "icon_url": "https://kk19a1nwwx.ucarecd.net/091fdebe-1562-41c6-99ea-b60665adb5ee/-/preview/512x512/",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "og_image_url": "",
    "red_box_msg": "",
    "version": "3",
    "file_size": "90",
    "category": "Card",
    "name": "Teen Patti Octro",
    "seo_keywords": "",
    "developer": "Unknown ",
    "slug": "teen-patti-octro",
    "created_at": "2026-06-03T10:17:01.058Z",
    "is_new": true,
    "serial_number": 34,
    "video_url": "",
    "seo_title": "",
    "canonical_url": "",
    "custom_admin_box_heading": "",
    "idea_box_msg": "",
    "is_coming_soon": true
  },
  {
    "is_new": false,
    "slug": "zynga-poker-texas-holdem-game",
    "created_at": "2026-06-03T10:30:01.393Z",
    "serial_number": 29,
    "seo_keywords": "",
    "name": "Zynga Poker- Texas Holdem Game",
    "developer": "Admin",
    "idea_box_msg": "",
    "is_coming_soon": true,
    "canonical_url": "",
    "video_url": "",
    "seo_title": "",
    "custom_admin_box_heading": "",
    "og_image_url": "",
    "target_region": "",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "category": "Card",
    "red_box_msg": "",
    "version": "1.0",
    "file_size": "Unknown",
    "id": "rrmv44n9n",
    "description_html": "<p>A new application.</p>",
    "is_featured": false,
    "faqs": [],
    "icon_url": "https://kk19a1nwwx.ucarecd.net/5b72cf8f-4959-426e-9e1d-8e2150529efb/-/preview/240x240/",
    "seo_description": "",
    "yellow_box_msg": "",
    "rating": 5,
    "custom_admin_box_html": "",
    "link_configured": false,
    "release_notes": ""
  },
  {
    "slug": "uno-",
    "is_new": true,
    "created_at": "2026-06-07T10:14:11.138Z",
    "serial_number": 30,
    "name": "UNO! ",
    "seo_keywords": "",
    "developer": "Admin",
    "idea_box_msg": null,
    "is_coming_soon": true,
    "canonical_url": "",
    "seo_title": "",
    "custom_admin_box_heading": null,
    "og_image_url": "",
    "target_region": "",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": null,
    "category": "Card",
    "version": "1.0",
    "red_box_msg": null,
    "file_size": "Unknown",
    "description_html": "<p>A new application.</p>",
    "id": "wf59smk6l",
    "is_featured": false,
    "faqs": [],
    "icon_url": "https://1ewg1yyass.ucarecd.net/c0172402-c854-4016-876e-6b7769547c8f/-/preview/238x211/",
    "seo_description": "",
    "yellow_box_msg": null,
    "rating": 5,
    "custom_admin_box_html": null,
    "link_configured": true,
    "release_notes": ""
  },
  {
    "id": "8epj9jjpu",
    "is_featured": false,
    "description_html": "<p>A new application.</p>",
    "faqs": [],
    "icon_url": "https://1ewg1yyass.ucarecd.net/33e0d4e8-6e41-4791-9e41-8d915a12e504/-/preview/447x447/",
    "seo_description": "",
    "rating": 5,
    "yellow_box_msg": "",
    "link_configured": true,
    "custom_admin_box_html": "",
    "release_notes": "",
    "serial_number": 31,
    "created_at": "2026-06-07T10:16:45.949Z",
    "slug": "rummy-gold-with-fast-rummy",
    "is_new": false,
    "developer": "Admin",
    "name": "Rummy GOLD - With Fast Rummy",
    "seo_keywords": "",
    "is_coming_soon": true,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "seo_title": "",
    "canonical_url": "",
    "og_image_url": "",
    "safety_status": "Verified",
    "screenshots": [],
    "target_region": "",
    "category": "Card",
    "file_size": "Unknown",
    "red_box_msg": "",
    "version": "1.0"
  },
  {
    "is_coming_soon": true,
    "idea_box_msg": null,
    "custom_admin_box_heading": null,
    "seo_title": "",
    "canonical_url": "",
    "serial_number": 32,
    "slug": "indian-rummy-3-patti-card-game",
    "created_at": "2026-06-07T10:19:11.616Z",
    "is_new": true,
    "developer": "Admin",
    "name": "Indian Rummy 3 Patti Card Game",
    "seo_keywords": "",
    "category": "Card",
    "file_size": "Unknown",
    "red_box_msg": null,
    "version": "1.0",
    "og_image_url": "",
    "safety_status": "Verified",
    "screenshots": [],
    "features_html": null,
    "target_region": "",
    "icon_url": "https://1ewg1yyass.ucarecd.net/2a4b59ef-16a3-4b14-bad3-1c3796af3492/-/preview/447x447/",
    "seo_description": "",
    "description_html": "<p>A new application.</p>",
    "id": "8jt0hokyo",
    "is_featured": false,
    "faqs": [],
    "link_configured": true,
    "custom_admin_box_html": null,
    "release_notes": "",
    "rating": 5,
    "yellow_box_msg": null
  },
  {
    "custom_admin_box_heading": "",
    "canonical_url": "",
    "seo_title": "",
    "is_coming_soon": true,
    "idea_box_msg": "",
    "developer": "Admin",
    "name": "Lucky Spin Slots",
    "seo_keywords": "",
    "serial_number": 33,
    "created_at": "2026-06-07T13:13:11.211Z",
    "is_new": false,
    "slug": "lucky-spin-slots",
    "file_size": "Unknown",
    "red_box_msg": "",
    "version": "1.0",
    "category": "Slots",
    "screenshots": [],
    "safety_status": "Verified",
    "features_html": "",
    "target_region": "",
    "og_image_url": "https://1ewg1yyass.ucarecd.net/0f918f11-b247-4b5a-9d26-d510dddffbfe/-/preview/447x447/",
    "seo_description": "",
    "icon_url": "https://1ewg1yyass.ucarecd.net/0f918f11-b247-4b5a-9d26-d510dddffbfe/-/preview/447x447/",
    "faqs": [],
    "description_html": "<p>A new application.</p>",
    "id": "01x9h7nfb",
    "is_featured": false,
    "publish_date": "2026-07-08T13:08:00.000Z",
    "release_notes": "",
    "link_configured": true,
    "custom_admin_box_html": "",
    "rating": 5,
    "yellow_box_msg": ""
  },
  {
    "is_featured": false,
    "id": "3cflt97b5",
    "description_html": "<p>A new application.</p>",
    "faqs": [],
    "icon_url": "https://1ewg1yyass.ucarecd.net/9d9339e0-77d4-418b-86f8-0a0e074c1d4e/-/preview/190x190/",
    "seo_description": "",
    "rating": 4.5,
    "yellow_box_msg": "",
    "link_configured": false,
    "custom_admin_box_html": "",
    "publish_date": "2026-06-12T15:30:00.000Z",
    "release_notes": "",
    "serial_number": 28,
    "created_at": "2026-06-12T12:39:30.407Z",
    "slug": "ind-club",
    "is_new": false,
    "developer": "AB Arora",
    "seo_keywords": "",
    "name": "IND Club",
    "is_coming_soon": true,
    "idea_box_msg": "",
    "custom_admin_box_heading": "",
    "video_url": "",
    "seo_title": "",
    "canonical_url": "",
    "og_image_url": "",
    "features_html": "",
    "screenshots": [],
    "safety_status": "Verified",
    "target_region": "",
    "category": "Yono",
    "file_size": "76",
    "red_box_msg": "",
    "version": "1.0"
  }
];
var mockSettings = {
  "support_email": "support@rummydex.com",
  "contact_content": "<p>Have questions or feedback? We'd love to hear from you. Our team typically responds within 24-48 hours.</p>",
  "seo_keywords": ".",
  "social_links": {
    "instagram": "",
    "youtube": "",
    "linkedin": "",
    "facebook": "",
    "twitter": ""
  },
  "favicon_url": "https://y4q7avawns.ucarecd.net/b391a2fa-42f7-4b3a-a0d5-605cb22aead4/-/preview/1000x1000/",
  "responsibility_content": ".",
  "disclaimer_text": ".",
  "last_updated": "2026-07-17T18:05:23.177Z",
  "disclaimer_heading": "DISCLAIMER ",
  "hero_title_visible": true,
  "hero_title_animation": "slide-up",
  "portal_heading": "IMPORTANT NOTICE ",
  "categories": [
    "Yono",
    "Card",
    "Slots"
  ],
  "logo_url": "https://y4q7avawns.ucarecd.net/b391a2fa-42f7-4b3a-a0d5-605cb22aead4/-/preview/1000x1000/",
  "ethics_heading": "ETHNICS",
  "secure_index_title": "RummyDex",
  "website_faqs": [],
  "site_title": "RummyDex",
  "secure_index_subtitle": ".",
  "hero_title_color": "neon-sky",
  "helpline_whatsapp": "+918653034735",
  "privacy_content": ".",
  "ethics_discrimination_text": ".",
  "banners": [],
  "important_notice": ".",
  "terms_content": ".",
  "animations_enabled": true,
  "about_content": ".",
  "meta_description": ".",
  "hero_title_text": "RummyDex ",
  "ticker_text": "LIVE: Unbiased words. Uncompromised truth. RummyApp Online  delivers pure transparency through independent reviews. \u2712\uFE0F",
  "trending_searches": [
    "."
  ],
  "hero_title_subtitle": ".",
  "hero_title_style": "mono",
  "helpline_telegram": "https://t.me/+d_BeX9h_fkVjMmM1",
  "quick_links": [],
  "important_notice_heading": "VERY IMPORTANT NOTICE "
};
var mockNews = [
  {
    "seo_keywords": "",
    "slug": "spin-crush-new-slot-game-update",
    "id": "3tgueni4s",
    "description_html": "<p>News HTML...</p>",
    "seo_description": 'Discover the latest Slot game addition on Spin Crush via rummyapp.online. Featuring the new "Super Spin" style mechanic, first-time players can unlock a randomized introductory bonus between 1,000 and 25,000 free coins.',
    "seo_title": "",
    "canonical_url": "https://www.rummyapp.online/news/spin-crush-new-slot-game-update",
    "target_region": "Indian ",
    "title": "Spin crush ",
    "logo_url": "https://1ewg1yyass.ucarecd.net/6697c775-4605-43f9-9b6d-66b6447f53da/-/preview/1000x563/",
    "read_time": "2 min",
    "og_image_url": "",
    "tags": [],
    "description": 'Spin Crush has officially integrated a new traditional "Super Spin" style Slot game variation into its platform. First-time players can claim a welcome bonus ranging from 1,000 to 25,000 free coins upon their initial spin.',
    "link": "https://www.rummyapp.online/spin-crush-",
    "ceo_name": "Spin Crush Adds New Super Spin Slot Game: Claim 1K to 25K Free Coins",
    "author": "Admin",
    "ceo_description": "",
    "content": `<div style="max-width: 800px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.08); overflow: hidden;">
 
 <!-- Premium Header -->
 <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px 20px; text-align: center; color: #ffffff;">
 <h2 style="margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Spin Crush Platform Update</h2>
 <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; font-weight: 300;">Introducing the New Super Spin Slots</p>
 </div>
 
 <!-- Main Content Body -->
 <div style="padding: 35px 30px;">
 
 <p style="font-size: 16px; line-height: 1.8; color: #444444; margin-bottom: 25px;">
 We are pleased to announce the latest expansion to the <strong>Spin Crush</strong> game library on <em>rummyapp.online</em>. A new gameplay variation has been integrated into our classic slot category, officially designated as <strong>Super Spin Slots</strong>. This update brings a modernized slot matrix directly to your existing dashboard.
 </p>

 <!-- Highlighted Bonus Box -->
 <div style="background-color: #fff9e6; border-left: 6px solid #ffc107; padding: 25px; border-radius: 6px; margin: 30px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
 <h3 style="margin: 0 0 12px 0; color: #b28900; font-size: 22px; font-weight: 600;">Exclusive First-Play Welcome Bonus</h3>
 <p style="margin: 0 0 15px 0; font-size: 16px; color: #555555; line-height: 1.6;">
 To celebrate the launch of this specific slot variation, all eligible users interacting with Super Spin Slots for the first time will receive an automated promotional credit drop.
 </p>
 
 <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
 <li><strong>Bonus Range:</strong> <span style="color: #28a745; font-weight: bold;">1,000 (1K) to 25,000 (25K) Free Coins</span></li>
 <li><strong>Eligibility Requirement:</strong> Granted strictly upon initial game loading.</li>
 <li><strong>Distribution Logic:</strong> Powered by a verified random generator.</li>
 </ul>
 </div>

 <!-- Technical Neutrality Section -->
 <h3 style="color: #2c3e50; font-size: 20px; margin-bottom: 12px; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px;">Platform Neutrality & Fair Play</h3>
 <p style="font-size: 16px; line-height: 1.8; color: #444444; margin-bottom: 30px;">
 In strict alignment with standard industry practices, the initial coin allocation relies entirely on an unbiased algorithm to ensure complete neutrality. The game mechanics have undergone technical optimization to guarantee equitable payout rates and a seamless, high-speed experience across both desktop and mobile platforms.
 </p>

 <!-- Call to Action Footer -->
 <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eeeeee;">
 <p style="font-size: 16px; color: #666666; margin-bottom: 20px;">
 The Super Spin Slots system is fully deployed.
 </p>
 <!-- Faux Button to look beautiful -->
 <span style="display: inline-block; background-color: #2a5298; color: #ffffff; padding: 14px 32px; border-radius: 30px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(42, 82, 152, 0.3);">
 Play Now on Spin Crush
 </span>
 </div>

 </div>
</div>
`,
    "date": "2026-06-08T14:30:50.982Z",
    "category": "Yono"
  },
  {
    "slug": "yono-rummy-fortune-reels-deployment",
    "id": "uvh4n2yob",
    "description_html": "<p>News HTML...</p>",
    "seo_keywords": "",
    "seo_title": "News SEO Title",
    "canonical_url": "https://www.rummyapp.online/news/yono-rummy-fortune-reels-deployment",
    "seo_description": "Yono Rummy System Update: Fortune Reels Slot Deployed (1K-25K Bonus)",
    "og_image_url": "https://1ewg1yyass.ucarecd.net/3ae635cf-5f0f-4dc8-8eaa-21b9fb819bca/-/preview/1000x560/",
    "tags": [],
    "description": 'Notice of system expansion for Yono Rummy. A new slot-mechanic module, "Fortune Reels," has been successfully deployed, featuring a randomized 1K\u201325K coin initialization credit for all active accounts on their first session.',
    "logo_url": "https://1ewg1yyass.ucarecd.net/3ae635cf-5f0f-4dc8-8eaa-21b9fb819bca/-/preview/1000x560/",
    "title": "Yono Rummy",
    "target_region": "Global",
    "read_time": "2 min",
    "date": "2026-06-08T16:21:55.959Z",
    "ceo_name": "YONO RUMMY",
    "author": "Admin",
    "ceo_description": "Yono Rummy now game ",
    "link": "https://www.rummyapp.online/yono-rummy",
    "content": `<div style="max-width: 800px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; border: 1px solid #d3d3d3; background-color: #fdfdfd;">
 
 <!-- System Bulletin Header -->
 <div style="background-color: #111111; padding: 25px 30px; border-bottom: 4px solid #e67e22;">
 <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; tracking: 1px;">SYSTEM RELEASE NOTES: YONO RUMMY</h2>
 <p style="margin: 5px 0 0 0; color: #aaaaaa; font-size: 14px;">Module Deployment \u2022 Effective June 2026</p>
 </div>

 <div style="padding: 30px;">
 
 <h3 style="color: #333333; font-size: 18px; text-transform: uppercase; border-left: 3px solid #e67e22; padding-left: 10px; margin-top: 0;">1. Module Expansion: Fortune Reels</h3>
 <p style="font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 25px;">
 Effective immediately, the core catalog of the <strong>Yono Rummy</strong> application via <em>rummyapp.online</em> has been expanded. Our engineering and development teams have successfully integrated a new slot-based interaction module, cataloged under the title <strong>"Fortune Reels"</strong>. This deployment introduces modernized reel mechanics into the existing rummy-focused ecosystem without disrupting current user workflows.
 </p>

 <h3 style="color: #333333; font-size: 18px; text-transform: uppercase; border-left: 3px solid #e67e22; padding-left: 10px;">2. Initialization Credit Allocation</h3>
 <p style="font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 15px;">
 To facilitate user onboarding for this specific module, a one-time automated credit protocol has been activated. Upon the first successful load of the Fortune Reels interface, the system will execute a randomized deposit into the user's primary wallet.
 </p>

 <!-- Data Table Format instead of a List -->
 <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 15px;">
 <thead>
 <tr style="background-color: #eeeeee; color: #333333; text-align: left;">
 <th style="padding: 12px; border: 1px solid #cccccc;">Parameter</th>
 <th style="padding: 12px; border: 1px solid #cccccc;">Specification</th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td style="padding: 12px; border: 1px solid #cccccc; color: #555;">Credit Type</td>
 <td style="padding: 12px; border: 1px solid #cccccc; color: #111; font-weight: bold;">Free Play Coins</td>
 </tr>
 <tr style="background-color: #fafafa;">
 <td style="padding: 12px; border: 1px solid #cccccc; color: #555;">Allocation Range</td>
 <td style="padding: 12px; border: 1px solid #cccccc; color: #27ae60; font-weight: bold;">1,000 (Minimum) \u2014 25,000 (Maximum)</td>
 </tr>
 <tr>
 <td style="padding: 12px; border: 1px solid #cccccc; color: #555;">Trigger Mechanism</td>
 <td style="padding: 12px; border: 1px solid #cccccc; color: #111;">Initial launch of the "Fortune Reels" game mode.</td>
 </tr>
 </tbody>
 </table>

 <h3 style="color: #333333; font-size: 18px; text-transform: uppercase; border-left: 3px solid #e67e22; padding-left: 10px;">3. Algorithmic Integrity</h3>
 <p style="font-size: 15px; color: #555555; line-height: 1.7; margin-bottom: 25px;">
 The initialization credit is governed by a secure Random Number Generation (RNG) script. This guarantees strict neutrality; no account variables influence the drop rate, ensuring every profile experiences an equal mathematical probability of securing the maximum 25K threshold. All deployment protocols have been verified for stability.
 </p>

 <!-- Minimalist Footer -->
 <div style="background-color: #f9f9f9; border-top: 1px solid #dddddd; padding: 15px; text-align: left;">
 <p style="margin: 0; font-size: 14px; color: #888888;">
 <strong>Action Required:</strong> None. The update is live. Users may access the new module directly from their primary navigation menu.
 </p>
 </div>

 </div>
</div>
`
  }
];
var mockBlogs = [];
var mockVideos = [
  {
    "seo_title": "Rummy ",
    "title": "RummyApp Online ",
    "seo_description": "",
    "youtube_url": "https://youtu.be/0uPeAuXIRdQ?si=aP9WFCyYCHKW2z5F",
    "created_at": "2026-05-22T12:22:35.244Z",
    "slug": "",
    "id": "1",
    "description": "Looking for the best UI SMOOTH experience rummy "
  },
  {
    "slug": "",
    "created_at": "2026-05-29T14:26:28.226Z",
    "description": "",
    "id": "73jeeqtsr",
    "seo_keywords": "",
    "title": "",
    "seo_description": "",
    "seo_title": "",
    "youtube_url": ""
  }
];

// src/lib/utils.ts
var import_meta = {};
function getAdminPath() {
  let envPath = null;
  if (typeof process !== "undefined") {
    envPath = process.env?.ADMIN_PATH || process.env?.VITE_ADMIN_PATH;
  }
  try {
    const viteEnvPath = import_meta.env?.VITE_ADMIN_PATH;
    if (viteEnvPath) envPath = viteEnvPath;
  } catch (e) {
  }
  return envPath || "disabled-admin-panel-" + Math.random().toString(36).substring(2);
}

// src/seoHelper.ts
var cachedData = null;
var lastFetchTime = 0;
var CACHE_TTL = 36e5;
var isFetchingStoreData = false;
var isRealValue = (id) => {
  if (!id) return false;
  const clean = id.trim();
  if (clean === "" || clean === "PLACEHOLDER" || clean.includes("REPLACE_WITH_YOUR_REAL_KEY") || clean.includes("YOUR_API_KEY")) return false;
  return true;
};
var cachedRawFirebaseConfig = null;
function getRawFirebaseConfig() {
  if (cachedRawFirebaseConfig) {
    return cachedRawFirebaseConfig;
  }
  try {
    const rawData = import_fs.default.readFileSync(import_path.default.join(process.cwd(), "firebase-applet-config.json"), "utf8");
    const config = JSON.parse(rawData);
    if (!config.projectId || !isRealValue(config.projectId)) throw new Error("is placeholder or mock");
    cachedRawFirebaseConfig = config;
    return config;
  } catch (err) {
    const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
    if (envProjectId && isRealValue(envProjectId)) {
      cachedRawFirebaseConfig = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || "(default)",
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      };
      return cachedRawFirebaseConfig;
    }
    return null;
  }
}
function getField(obj, key, fallback = "") {
  if (!obj) return fallback;
  const value = obj[key];
  if (value === void 0 || value === null) return fallback;
  if (typeof value === "object") {
    if ("stringValue" in value) return value.stringValue ?? fallback;
    if ("integerValue" in value) return String(value.integerValue) ?? fallback;
    if ("booleanValue" in value) return String(value.booleanValue) ?? fallback;
    return fallback;
  }
  return String(value);
}
async function fetchStoreData() {
  const now = Date.now();
  const isStale = now - lastFetchTime > CACHE_TTL;
  const isSuperStale = now - lastFetchTime > CACHE_TTL * 15;
  if (cachedData && !isSuperStale) {
    if (isStale && !isFetchingStoreData) {
      isFetchingStoreData = true;
      doFetchStoreData().then(() => {
        isFetchingStoreData = false;
      }).catch((e) => {
        isFetchingStoreData = false;
        console.warn("Background store fetch failed safely:", e);
      });
    }
    return cachedData;
  }
  return await doFetchStoreData();
}
async function doFetchStoreData() {
  const now = Date.now();
  const publicBackupPath = import_path.default.join(process.cwd(), "src/lib/public_backup.json");
  if (import_fs.default.existsSync(publicBackupPath)) {
    try {
      const backup = JSON.parse(import_fs.default.readFileSync(publicBackupPath, "utf8"));
      const data2 = {
        apps: backup.apps || [],
        settings: backup.settings || {},
        news: backup.news || [],
        blogs: backup.blogs || [],
        videos: backup.videos || []
      };
      cachedData = data2;
      lastFetchTime = now;
      return data2;
    } catch (e) {
      console.error("Error reading public_backup.json in seoHelper:", e);
    }
  }
  const data = {
    apps: mockApps || [],
    settings: mockSettings || {},
    news: mockNews || [],
    blogs: mockBlogs || [],
    videos: mockVideos || []
  };
  cachedData = data;
  lastFetchTime = now;
  return data;
}
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function sanitizeHtml(html) {
  if (!html) return "";
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/\s+on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, "");
  clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
  clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, "");
  clean = clean.replace(/<(iframe|object|embed|form|meta|link|style)\b[^>]*>/gi, "");
  return clean;
}
function stripHtml(html) {
  if (!html) return "";
  const stripped = html.replace(/<[^>]*>?/gm, " ");
  return stripped.replace(/\s+/g, " ").trim();
}
function cleanSeoDescription(desc) {
  if (!desc) return "";
  const trimmed = desc.trim();
  if (trimmed.startsWith("<") || trimmed.includes("<meta ")) {
    const metaMatch = trimmed.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1].trim();
    }
    const ogMatch = trimmed.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i);
    if (ogMatch && ogMatch[1]) {
      return ogMatch[1].trim();
    }
    return stripHtml(trimmed).substring(0, 160);
  }
  return trimmed;
}
async function getPagePreRender(urlPath, data) {
  const { apps, settings, news, blogs, videos } = data;
  const cleanPath = urlPath.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const cleanPathLower = cleanPath.toLowerCase();
  let bodyContent = "";
  if (cleanPathLower === "/" || cleanPathLower === "") {
    bodyContent = renderHome(apps, settings, news, blogs, videos);
  } else if (cleanPathLower === "/new-apps") {
    bodyContent = renderNewApps(apps, settings);
  } else if (cleanPathLower.startsWith("/info/") || cleanPathLower.startsWith("/gateway/")) {
    const slug = cleanPathLower.startsWith("/info/") ? cleanPath.split("/info/")[1] : cleanPath.split("/gateway/")[1];
    bodyContent = renderGateway(slug, apps, settings);
  } else if (cleanPathLower === "/news") {
    bodyContent = renderNewsList(news, settings);
  } else if (cleanPathLower.startsWith("/news/")) {
    const slug = cleanPath.split("/news/")[1];
    bodyContent = renderNewsDetail(slug, news, settings);
  } else if (cleanPathLower === "/blogs") {
    bodyContent = renderBlogsList(blogs, settings);
  } else if (cleanPathLower.startsWith("/blog/")) {
    const slug = cleanPath.split("/blog/")[1];
    bodyContent = renderBlogDetail(slug, blogs, settings);
  } else if (cleanPathLower === "/videos") {
    bodyContent = renderVideosList(videos, settings);
  } else if (cleanPathLower.startsWith("/videos/")) {
    const slug = cleanPath.split("/videos/")[1];
    bodyContent = renderVideoDetail(slug, videos, settings);
  } else if (cleanPathLower === "/about") {
    bodyContent = renderAbout(settings);
  } else if (cleanPathLower === "/contact") {
    bodyContent = renderContact(settings);
  } else if (cleanPathLower === "/privacy") {
    bodyContent = renderPrivacy(settings);
  } else if (cleanPathLower === "/terms") {
    bodyContent = renderTerms(settings);
  } else if (cleanPathLower === "/notice") {
    bodyContent = renderNotice(settings);
  } else if (cleanPathLower === "/ethics") {
    bodyContent = renderEthics(settings);
  } else if (cleanPathLower === "/disclaimer") {
    bodyContent = renderDisclaimer(settings);
  } else if (cleanPathLower === "/responsibility") {
    bodyContent = renderResponsibility(settings);
  } else {
    const possibleSlug = cleanPathLower.replace(/^\/app\//, "/").replace(/^\/|\/$/g, "");
    if (apps.some((a) => a.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderAppDetails(possibleSlug, apps, settings);
    } else if (news.some((n) => n.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderNewsDetail(possibleSlug, news, settings);
    } else if (blogs.some((b) => b.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderBlogDetail(possibleSlug, blogs, settings);
    } else if (videos.some((v) => v.slug?.toLowerCase() === possibleSlug)) {
      bodyContent = renderVideoDetail(possibleSlug, videos, settings);
    } else {
      bodyContent = renderHome(apps, settings, news, blogs, videos);
    }
  }
  const header = renderHeader(settings);
  const footer = renderFooter(settings);
  return `
    <div class="flex flex-col min-h-screen">
      ${header}
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-1.5 sm:py-3 pb-16 sm:pb-24 overflow-x-hidden relative">
        ${bodyContent}
      </main>
      ${footer}
    </div>
  `;
}
function renderHeader(settings) {
  const siteTitle = getField(settings, "site_title");
  const logoUrl = getField(settings, "logo_url");
  return `
    <header class="py-3 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
        <a href="/" class="flex items-center gap-3 font-bold text-lg text-zinc-900 dark:text-white">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="w-10 h-10 object-contain" alt="Logo"/>` : ""}
          <span>${escapeHtml(siteTitle)}</span>
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
  `;
}
function renderFooter(settings) {
  const siteTitle = getField(settings, "site_title");
  const logoUrl = getField(settings, "logo_url");
  const metaDescription = getField(settings, "meta_description");
  const disclaimerText = getField(settings, "disclaimer_text");
  const ethicsText = getField(settings, "ethics_discrimination_text");
  const importantNotice = getField(settings, "important_notice");
  return `
    <footer class="pt-12 pb-8 border-t border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950 mt-12 text-center text-zinc-500 dark:text-zinc-400">
      <div class="max-w-7xl mx-auto px-6">
        <h3 class="text-xl font-bold flex items-center justify-center gap-2 text-zinc-900 dark:text-white mb-2">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="w-8 h-8 object-contain" alt="Logo" />` : ""}
          <span>${escapeHtml(siteTitle)}</span>
        </h3>
        <p class="text-sm max-w-xl mx-auto mb-6 leading-relaxed">${escapeHtml(metaDescription)}</p>
        <div class="flex flex-wrap justify-center gap-6 text-xs font-semibold mb-8 text-zinc-600 dark:text-zinc-400">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/videos">Apps</a>
          <a href="/blogs">Blog</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/notice">Notice</a>
          <a href="/ethics">Ethics</a>
          <a href="/disclaimer">Disclaimer</a>
        </div>
        <div class="text-xs text-zinc-400 mt-8">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} ${escapeHtml(siteTitle)}. All rights reserved.</div>
      </div>
    </footer>
  `;
}
function renderHome(apps, settings, news, blogs, videos) {
  const siteTitle = getField(settings, "site_title");
  const desc = getField(settings, "meta_description");
  let appsHtml = "";
  const sorted = [...apps].sort((a, b) => parseInt(getField(a, "serial_number", "999"), 10) - parseInt(getField(b, "serial_number", "999"), 10));
  sorted.forEach((app2, i) => {
    const name = getField(app2, "name");
    const slug = getField(app2, "slug");
    const category = getField(app2, "category");
    const rating = getField(app2, "rating", "5.0");
    const icon = getField(app2, "icon_url");
    const isNew = app2.is_new === true || app2.is_new && app2.is_new.booleanValue === true;
    appsHtml += `
      <a href="/${encodeURIComponent(slug)}" class="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition border-b border-black/5 dark:border-white/5">
        <span class="text-sm font-bold text-zinc-400 shrink-0 w-8 text-center">${i + 1}</span>
        <img src="${icon || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-16 h-16 rounded-[18px] object-cover bg-white shadow-sm shrink-0" alt="${escapeHtml(name)}"/>
        <div class="flex-1 min-w-0 text-left">
          <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">${escapeHtml(name)}</h3>
          <p class="text-xs text-zinc-500 truncate">${escapeHtml(category)}</p>
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
            <span>${rating}</span><span class="text-zinc-400">\u2605</span>
            ${isNew ? `<span class="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>` : ""}
          </div>
        </div>
        <span class="bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 px-4 py-1 text-xs font-bold rounded-full select-none">MORE</span>
      </a>
    `;
  });
  let newsHtml = "";
  news.slice(0, 3).forEach((n) => {
    newsHtml += `
      <a href="/news/${encodeURIComponent(getField(n, "slug"))}" class="block p-4 bg-zinc-50 dark:bg-zinc-900 border border-black/5 rounded-xl text-left">
        <h4 class="font-bold text-sm text-zinc-900 dark:text-white leading-tight mb-1">${escapeHtml(getField(n, "title"))}</h4>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">${escapeHtml(getField(n, "description"))}</p>
      </a>
    `;
  });
  return `
    <div>
      <div class="text-center py-12 max-w-2xl mx-auto px-4">
        <h1 class="text-4xl font-extrabold text-zinc-900 dark:text-white mb-4">${escapeHtml(siteTitle)}</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">${escapeHtml(desc)}</p>
      </div>
      <div class="grid lg:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
          <h2 class="text-xl font-bold mb-4 px-2 text-left">Popular E-Sports virtual clients</h2>
          <div class="flex flex-col">${appsHtml}</div>
        </div>
        <div class="space-y-6">
          <div class="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-black/5 shadow-sm">
            <h3 class="font-bold text-md mb-4 text-left">Latest Archives</h3>
            <div class="flex flex-col gap-3">${newsHtml}</div>
            <a href="/news" class="block text-xs font-bold text-blue-500 hover:underline mt-4 text-left">View All Updates \u2192</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderNewApps(apps, settings) {
  let grid = "";
  const list = apps.filter((a) => a.is_new === true || a.is_new && a.is_new.booleanValue === true);
  const display = list.length > 0 ? list : apps;
  display.forEach((app2) => {
    const name = getField(app2, "name");
    const slug = getField(app2, "slug");
    const cat = getField(app2, "category");
    const rating = getField(app2, "rating", "5.0");
    const icon = getField(app2, "icon_url");
    grid += `
      <a href="/${encodeURIComponent(slug)}" class="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 text-center flex flex-col items-center">
        <img src="${icon || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-20 h-20 rounded-2xl object-cover mb-3 shadow-sm bg-white" alt="icon"/>
        <h3 class="font-bold text-sm text-zinc-900 dark:text-white truncate w-full">${escapeHtml(name)}</h3>
        <p class="text-xs text-zinc-500 mt-1 truncate w-full">${escapeHtml(cat)}</p>
        <span class="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold">${rating} \u2605</span>
      </a>
    `;
  });
  return `
    <div class="py-6">
      <h1 class="text-3xl font-extrabold mb-2 text-center text-zinc-900 dark:text-white">New Additions</h1>
      <p class="text-sm text-zinc-500 text-center mb-8">Our latest verified client lists</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">${grid}</div>
    </div>
  `;
}
function renderAppDetails(slug, apps, settings) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app2 = apps.find((a) => getField(a, "slug").toLowerCase() === cleanSlug);
  if (!app2) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">App Not Found</h1><a href="/" class="text-blue-500 hover:underline">Go Home</a></div>`;
  const name = getField(app2, "name");
  const cat = getField(app2, "category");
  const version = getField(app2, "version", "Latest");
  const size = getField(app2, "file_size", "Variable");
  const rating = getField(app2, "rating", "5.0");
  const icon = getField(app2, "icon_url");
  const desc = app2.description_html ? sanitizeHtml(app2.description_html) : `<p>No comprehensive details are configured yet for ${escapeHtml(name)}.</p>`;
  const features = app2.features_html ? sanitizeHtml(app2.features_html) : "";
  const featureSectionContext = features ? `<h2 class="text-lg font-bold mt-8 mb-4">App Features</h2><div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${features}</div>` : "";
  const pkg = getField(app2, "package_name", "Not published");
  return `
    <div class="py-6">
      <div class="flex flex-col items-center text-center pb-8 border-b border-black/5 mb-8">
        <img src="${icon || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-24 h-24 sm:w-32 sm:h-32 rounded-[22px] object-cover mb-4 shadow" alt="icon"/>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-2">${escapeHtml(name)}</h1>
        <div class="flex gap-2 text-xs font-semibold mb-6">
          <span class="bg-blue-50 px-2.5 py-1 rounded-full text-blue-600">${escapeHtml(cat)}</span>
          <span class="bg-green-50 px-2.5 py-1 rounded-full text-green-600">Verified Safety</span>
        </div>
        
        <div class="grid grid-cols-4 gap-2 w-full max-w-sm mb-6 text-center text-xs">
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Version</span><strong>${escapeHtml(version)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Size</span><strong>${escapeHtml(size)}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Type</span><strong>${escapeHtml(cat.split(",")[0])}</strong></div>
          <div class="p-2 border border-black/5 bg-zinc-50 rounded-xl"><span class="text-zinc-400 block pb-1 font-semibold text-[10px]">Rating</span><strong>${escapeHtml(rating)} \u2605</strong></div>
        </div>

        <a href="/info/${encodeURIComponent(slug)}" class="bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow hover:opacity-95">Install Direct Access Mirror \u{1F680}</a>
      </div>

      <div class="grid md:grid-cols-[2fr,1fr] gap-8">
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm text-left">
          <h2 class="text-lg font-bold mb-4">Detailed Game Review & Safe Guidelines</h2>
          <div class="prose dark:prose-invert text-zinc-650 leading-relaxed font-semibold">${desc}</div>
          ${featureSectionContext}
        </div>
        <div class="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 shadow-sm h-fit text-left">
          <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-400">Specifications</h3>
          <table class="w-full text-xs text-left">
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Developer</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Store Certified</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Package Name</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white truncate max-w-[150px]">${escapeHtml(pkg)}</td></tr>
            <tr class="border-b"><td class="py-2 text-zinc-400 font-semibold">Status</td><td class="py-2 font-bold text-right text-green-500">Safe & Clean</td></tr>
            <tr><td class="py-2 text-zinc-400 font-semibold">System Code</td><td class="py-2 font-bold text-right text-zinc-900 dark:text-white">Android / iOS</td></tr>
          </table>
        </div>
      </div>
    </div>
  `;
}
function renderGateway(slug, apps, settings) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const app2 = apps.find((a) => getField(a, "slug").toLowerCase() === cleanSlug);
  if (!app2) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold mb-4">No App Detected</h1><a href="/" class="text-blue-500 hover:underline">Return Home</a></div>`;
  const name = getField(app2, "name");
  const icon = getField(app2, "icon_url");
  return `
    <div class="max-w-xl mx-auto py-12 px-4 shadow-sm bg-white dark:bg-zinc-900 rounded-3xl border border-black/5">
      <div class="text-center">
        <img src="${icon || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&fit=crop"}" class="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 border" alt="icon"/>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-1">${escapeHtml(name)}</h1>
        <p class="text-xs text-zinc-400 uppercase tracking-widest font-black mb-6">Information Hub</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold mb-8">Access the application details and specifications below.</p>
        <a href="/" class="block w-full py-4 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-2xl">Return Home</a>
        <a href="/${encodeURIComponent(slug)}" class="block text-xs font-semibold text-blue-500 hover:underline mt-4">Read Technical Description</a>
      </div>
    </div>
  `;
}
function renderNewsList(news, settings) {
  let cards = "";
  news.forEach((n) => {
    cards += `
      <a href="/news/${encodeURIComponent(getField(n, "slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-blue-500 uppercase">${escapeHtml(getField(n, "category") || "Report")}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase ml-2">${escapeHtml(getField(n, "created_at") || "May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${escapeHtml(getField(n, "title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${escapeHtml(getField(n, "description"))}</p>
      </a>
    `;
  });
  return `<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Gaming News & Updates</h1><div class="flex flex-col gap-4">${cards || '<p class="text-zinc-400 py-10">No publications.</p>'}</div></div>`;
}
function renderNewsDetail(slug, news, settings) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const item = news.find((n) => getField(n, "slug").toLowerCase() === cleanSlug);
  if (!item) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load article.</h1><a href="/news" class="text-blue-500 hover:underline">Go Back</a></div>`;
  const title = getField(item, "title");
  const dateStr = getField(item, "created_at") || "May 2026";
  const author = getField(item, "ceo_name", "System Author");
  const cat = getField(item, "category", "Report");
  const content = getField(item, "content") || getField(item, "description", "");
  const sanitizedContent = sanitizeHtml(content);
  return `
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-blue-500 uppercase font-bold mr-2">${escapeHtml(cat)}</span><span class="text-xs text-zinc-400 uppercase font-bold">${dateStr} | By ${escapeHtml(author)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${escapeHtml(title)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${sanitizedContent.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</section>
    </article>
  `;
}
function renderBlogsList(blogs, settings) {
  let cards = "";
  blogs.forEach((b) => {
    cards += `
      <a href="/blog/${encodeURIComponent(getField(b, "slug"))}" class="block p-6 bg-white dark:bg-zinc-900 border border-black/5 hover:border-blue-500/25 rounded-3xl transition text-left">
        <span class="text-[10px] font-bold text-zinc-400 uppercase">${escapeHtml(getField(b, "created_at") || "May 2026")}</span>
        <h3 class="text-xl font-bold mt-1 mb-2 text-zinc-900 dark:text-white leading-snug">${escapeHtml(getField(b, "title"))}</h3>
        <p class="text-sm text-zinc-500 max-w-3xl line-clamp-2 leading-relaxed">${escapeHtml(stripHtml(getField(b, "excerpt") || getField(b, "content", "").substring(0, 140)))}</p>
      </a>
    `;
  });
  return `<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Strategy Guides & Analysis</h1><div class="flex flex-col gap-4">${cards || '<p class="text-zinc-400 py-10">No strategy posts.</p>'}</div></div>`;
}
function renderBlogDetail(slug, blogs, settings) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const item = blogs.find((b) => getField(b, "slug").toLowerCase() === cleanSlug);
  if (!item) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold">Failed to load guide.</h1><a href="/blogs" class="text-blue-500 hover:underline">Go Back</a></div>`;
  const title = getField(item, "title");
  const dateStr = getField(item, "created_at") || "May 2026";
  const author = getField(item, "author", "System Author");
  const content = getField(item, "content", "");
  const sanitizedContent = sanitizeHtml(content);
  return `
    <article class="max-w-3xl mx-auto py-12 px-4 text-left">
      <header class="mb-6"><span class="text-xs text-zinc-400 uppercase font-bold">${dateStr} | Strategy by ${escapeHtml(author)}</span><h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 leading-tight">${escapeHtml(title)}</h1></header>
      <section class="prose dark:prose-invert text-zinc-700 leading-relaxed font-semibold">${sanitizedContent.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</section>
    </article>
  `;
}
function renderVideosList(videos, settings) {
  let cards = "";
  videos.forEach((v) => {
    const title = getField(v, "title");
    const slug = getField(v, "slug");
    const desc = getField(v, "description", "");
    cards += `
      <a href="/videos/${encodeURIComponent(slug)}" class="block p-4 border border-black/5 bg-white rounded-3xl text-left">
        <h3 class="font-bold text-lg text-zinc-900 truncate">${escapeHtml(title)}</h3>
        <p class="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">${escapeHtml(desc)}</p>
      </a>
    `;
  });
  return `<div class="py-6 text-center container max-w-3xl mx-auto"><h1 class="text-3xl font-extrabold mb-8 text-zinc-900 dark:text-white">Video Reviews</h1><div class="grid sm:grid-cols-3 gap-4">${cards || '<p class="text-zinc-400 py-10 col-span-full">No video guides.</p>'}</div></div>`;
}
function renderVideoDetail(slug, videos, settings) {
  const cleanSlug = decodeURIComponent(slug).toLowerCase();
  const v = videos.find((item) => getField(item, "slug").toLowerCase() === cleanSlug || getField(item, "id").toLowerCase() === cleanSlug);
  if (!v) return `<div class="py-12 text-center"><h1 class="text-2xl font-bold">Video not found.</h1><a href="/videos" class="text-blue-500 hover:underline">Go Back</a></div>`;
  const title = getField(v, "title");
  const desc = getField(v, "description");
  return `<div class="max-w-2xl mx-auto py-12 text-left"><h1 class="text-3xl font-extrabold mb-4">${escapeHtml(title)}</h1><p class="prose text-zinc-650 leading-relaxed font-semibold">${desc.replace(/\n\n/g, "<br/><br/>")}</p></div>`;
}
function renderAbout(settings) {
  const content = getField(settings, "about_content") || "About our application services.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">About Us</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</article></div>`;
}
function renderContact(settings) {
  const content = getField(settings, "contact_content") || "Get in touch for active client files help.";
  const email = getField(settings, "support_email", "support@example.com");
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Contact Us</h1><p class="prose mb-6 leading-relaxed font-semibold">${content}</p><div class="p-6 bg-zinc-50 rounded-2xl"><strong>Email support address:</strong><p class="text-blue-500 font-bold mt-1">${escapeHtml(email)}</p></div></div>`;
}
function renderPrivacy(settings) {
  const content = getField(settings, "privacy_content") || "No private data tracking.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Privacy Policy</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</article></div>`;
}
function renderTerms(settings) {
  const content = getField(settings, "terms_content") || "Service code terms of compliance.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Terms of Service</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</article></div>`;
}
function renderResponsibility(settings) {
  const content = getField(settings, "responsibility_content") || "Play safe for custom virtual entertainment.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">Responsible Gaming</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")}</article></div>`;
}
function renderNotice(settings) {
  const heading = getField(settings, "important_notice_heading") || "Important Notice";
  const content = getField(settings, "important_notice") || "No important notices at this time.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}
function renderEthics(settings) {
  const heading = getField(settings, "ethics_heading") || "Ethics & Safety";
  const content = getField(settings, "ethics_discrimination_text") || "Ethics and safety information goes here.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}
function renderDisclaimer(settings) {
  const heading = getField(settings, "disclaimer_heading") || "Disclaimer";
  const content = getField(settings, "disclaimer_text") || "Disclaimer information goes here.";
  return `<div class="max-w-3xl mx-auto py-12 text-left bg-white p-8 rounded-3xl border border-black/5"><h1 class="text-4xl font-bold mb-6">${heading}</h1><article class="prose text-zinc-750 leading-relaxed font-semibold">${content}</article></div>`;
}
function getSafeFirebaseConfig() {
  try {
    const config = getRawFirebaseConfig();
    if (!config) {
      return null;
    }
    const isApiKeyEmptyOrPlaceholder = !config.apiKey || config.apiKey.trim() === "" || config.apiKey.includes("YOUR_API_KEY");
    if (isApiKeyEmptyOrPlaceholder) {
      return {
        projectId: "placeholder-project-id",
        appId: "placeholder-app-id",
        apiKey: "PLACEHOLDER",
        authDomain: "placeholder-project.firebaseapp.com",
        firestoreDatabaseId: "(default)",
        storageBucket: "placeholder-project.firebasestorage.app",
        messagingSenderId: "000000000",
        measurementId: ""
      };
    }
    return config;
  } catch (error) {
    return null;
  }
}
async function injectSeoTags(template, urlPath, hostUrl, userAgent = "") {
  let data = await fetchStoreData();
  if (!data || !data.settings) return template;
  const apps = data.apps || [];
  const settings = data.settings || {};
  const news = data.news || [];
  const blogs = data.blogs || [];
  const videos = data.videos || [];
  const siteTitle = getField(settings, "site_title");
  let title = siteTitle;
  let description = getField(settings, "meta_description", "");
  if (!description) description = "A premium digital platform for applications and tools.";
  let keywords = getField(settings, "seo_keywords", "");
  if (!keywords) keywords = "app clearance, premium applications, digital tools, platform, tech specs, verified apps";
  if (keywords) {
    const keywordArray = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (keywordArray.length > 15) {
      keywords = keywordArray.slice(0, 15).join(", ");
    }
  }
  let ogImage = getField(settings, "logo_url", "");
  if (!ogImage) ogImage = "https://res.cloudinary.com/dq34n0ncz/image/upload/v1713280000/default_og_image.png";
  let author = siteTitle || "Platform Administrator";
  let canonicalUrlOverride = null;
  const rawPathStr = urlPath.split("?")[0].split("#")[0];
  const possibleAppSlug = rawPathStr.replace(/^\/app\//, "/").replace(/^\/|\/$/g, "").toLowerCase();
  if (apps.some((a) => {
    const aSlug = getField(a, "slug");
    return aSlug && aSlug.toLowerCase() === possibleAppSlug;
  })) {
    const app2 = apps.find((a) => {
      const aSlug = getField(a, "slug");
      return aSlug && aSlug.toLowerCase() === possibleAppSlug;
    });
    if (app2) {
      const appName = getField(app2, "name");
      title = `${getField(app2, "seo_title") || appName}`;
      const descHtml = getField(app2, "description_html");
      description = cleanSeoDescription(getField(app2, "seo_description")) || (descHtml ? stripHtml(descHtml).substring(0, 160) : "") || description;
      keywords = getField(app2, "seo_keywords") || keywords;
      ogImage = getField(app2, "og_image_url") || getField(app2, "icon_url") || ogImage;
      const cleanHostApp = (hostUrl || process.env.VITE_PUBLIC_DOMAIN || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online").replace(/\/+$/, "");
      canonicalUrlOverride = getField(app2, "canonical_url") || `${cleanHostApp}/app/${getField(app2, "slug")}`;
    }
  } else if (urlPath.startsWith("/info/") || urlPath.startsWith("/gateway/")) {
    const prefix = urlPath.startsWith("/info/") ? "/info/" : "/gateway/";
    const slug = decodeURIComponent(urlPath.split(prefix)[1].split("/")[0].split("?")[0]);
    const app2 = apps.find((a) => {
      const aSlug = getField(a, "slug");
      return aSlug && aSlug.toLowerCase() === slug.toLowerCase();
    });
    if (app2) {
      const appName = getField(app2, "name");
      title = `${getField(app2, "seo_title") || appName} - Technical Info`;
      const descHtml = getField(app2, "description_html");
      description = cleanSeoDescription(getField(app2, "seo_description")) || (descHtml ? stripHtml(descHtml).substring(0, 160) : "") || description;
      keywords = getField(app2, "seo_keywords") || keywords;
      ogImage = getField(app2, "og_image_url") || getField(app2, "icon_url") || ogImage;
      const cleanHostApp = (hostUrl || process.env.VITE_PUBLIC_DOMAIN || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online").replace(/\/+$/, "");
      canonicalUrlOverride = getField(app2, "canonical_url") || `${cleanHostApp}/app/${getField(app2, "slug")}`;
    }
  } else if (urlPath.startsWith("/news/") && urlPath.length > 6) {
    const slug = decodeURIComponent(urlPath.split("/news/")[1].split("/")[0].split("?")[0]);
    const newsItem = news.find((n) => {
      const nSlug = getField(n, "slug");
      return nSlug && nSlug.toLowerCase() === slug.toLowerCase();
    });
    if (newsItem) {
      const itemTitle = getField(newsItem, "title", "Latest News");
      title = `${getField(newsItem, "seo_title") || itemTitle} | ${siteTitle}`;
      const descHtml = getField(newsItem, "description") || getField(newsItem, "content");
      description = cleanSeoDescription(getField(newsItem, "seo_description")) || (descHtml ? stripHtml(descHtml).substring(0, 160) : "") || description;
      keywords = getField(newsItem, "seo_keywords") || keywords;
      ogImage = getField(newsItem, "og_image_url") || getField(newsItem, "logo_url") || ogImage;
      author = getField(newsItem, "ceo_name") || siteTitle;
      const cleanHostApp = (hostUrl || process.env.VITE_PUBLIC_DOMAIN || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online").replace(/\/+$/, "");
      canonicalUrlOverride = getField(newsItem, "canonical_url") || `${cleanHostApp}/news/${getField(newsItem, "slug")}`;
    }
  } else if (urlPath.startsWith("/blog/") && urlPath.length > 6) {
    const slug = decodeURIComponent(urlPath.split("/blog/")[1].split("/")[0].split("?")[0]);
    const blogItem = blogs.find((b) => {
      const bSlug = getField(b, "slug");
      return bSlug && bSlug.toLowerCase() === slug.toLowerCase();
    });
    if (blogItem) {
      const itemTitle = getField(blogItem, "title", "Blog Post");
      title = `${getField(blogItem, "seo_title") || itemTitle} | ${siteTitle}`;
      const descHtml = getField(blogItem, "excerpt") || getField(blogItem, "content");
      description = cleanSeoDescription(getField(blogItem, "seo_description")) || (descHtml ? stripHtml(descHtml).substring(0, 160) : "") || description;
      keywords = getField(blogItem, "seo_keywords") || keywords;
      ogImage = getField(blogItem, "cover_url") || ogImage;
      author = getField(blogItem, "author") || siteTitle;
      const cleanHostApp = (hostUrl || process.env.VITE_PUBLIC_DOMAIN || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online").replace(/\/+$/, "");
      canonicalUrlOverride = getField(blogItem, "canonical_url") || `${cleanHostApp}/blog/${getField(blogItem, "slug")}`;
    }
  } else if (urlPath.startsWith("/videos/") && urlPath.length > 8) {
    const slug = decodeURIComponent(urlPath.split("/videos/")[1].split("/")[0].split("?")[0]);
    const videoItem = videos.find((v) => {
      const vSlug = getField(v, "slug");
      const vId = getField(v, "id");
      return vSlug && vSlug.toLowerCase() === slug.toLowerCase() || vId && vId.toLowerCase() === slug.toLowerCase();
    });
    if (videoItem) {
      const itemTitle = getField(videoItem, "title", "Video Specs");
      title = `${getField(videoItem, "seo_title") || itemTitle} | ${siteTitle}`;
      const descHtml = getField(videoItem, "description");
      description = cleanSeoDescription(getField(videoItem, "seo_description")) || (descHtml ? stripHtml(descHtml).substring(0, 160) : "");
      keywords = getField(videoItem, "seo_keywords");
      const youtubeUrl = getField(videoItem, "youtube_url");
      let videoId = "";
      if (youtubeUrl) {
        const m = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
        if (m) videoId = m[1];
      }
      if (videoId) {
        ogImage = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      const cleanHostApp = (hostUrl || process.env.VITE_PUBLIC_DOMAIN || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online").replace(/\/+$/, "");
      canonicalUrlOverride = `${cleanHostApp}/videos/${getField(videoItem, "slug") || getField(videoItem, "id")}`;
    }
  } else if (urlPath.startsWith("/developers")) {
    title = `Meet Our Team | ${siteTitle}`;
    description = `Meet the brilliant developers behind ${siteTitle}. Discover our team's expertise and passion.`;
  } else {
    const possibleSlug = decodeURIComponent(urlPath.split("?")[0].split("#")[0].replace(/^\/|\/$/g, ""));
    if (possibleSlug && possibleSlug !== "") {
      const app2 = apps.find((a) => getField(a, "slug")?.toLowerCase() === possibleSlug.toLowerCase());
      if (app2) {
        const appName = getField(app2, "name", "App");
        title = getField(app2, "seo_title") || appName;
        const descHtml = getField(app2, "description_html");
        const fallbackDesc = `Discover the ${appName} app today. Enjoy smooth gameplay, professional reviews, e-sports integration, and exclusive features.`;
        description = cleanSeoDescription(getField(app2, "seo_description")) || (descHtml ? stripHtml(descHtml).substring(0, 160) : fallbackDesc);
        keywords = getField(app2, "seo_keywords");
        ogImage = getField(app2, "og_image_url") || getField(app2, "icon_url") || ogImage;
        canonicalUrlOverride = getField(app2, "canonical_url");
      }
    }
  }
  const fallbackHost = hostUrl || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online";
  const cleanHost = fallbackHost.replace(/\/+$/, "");
  const cleanPathRaw = urlPath.split("?")[0].split("#")[0];
  const cleanPath = cleanPathRaw.replace(/^\/api(\/[^/]+)?/i, "") || "/";
  const absoluteUrl = `${cleanHost}${cleanPath}`;
  let absoluteOgImage = ogImage;
  if (ogImage) {
    const trimmedOg = ogImage.trim();
    if (trimmedOg.startsWith("//")) {
      absoluteOgImage = `https:${trimmedOg}`;
    } else if (!trimmedOg.startsWith("http://") && !trimmedOg.startsWith("https://")) {
      const cleanImg = trimmedOg.startsWith("/") ? trimmedOg : `/${trimmedOg}`;
      absoluteOgImage = `${cleanHost}${cleanImg}`;
    } else {
      absoluteOgImage = trimmedOg;
    }
  }
  const faviconUrl = getField(settings, "favicon_url") || getField(settings, "logo_url");
  let absoluteFaviconUrl = faviconUrl;
  if (faviconUrl) {
    const trimmedFav = faviconUrl.trim();
    if (trimmedFav.startsWith("//")) {
      absoluteFaviconUrl = `https:${trimmedFav}`;
    } else if (!trimmedFav.startsWith("http://") && !trimmedFav.startsWith("https://")) {
      const cleanFav = trimmedFav.startsWith("/") ? trimmedFav : `/${trimmedFav}`;
      absoluteFaviconUrl = `${cleanHost}${cleanFav}`;
    } else {
      absoluteFaviconUrl = trimmedFav;
    }
  }
  const isAdmin = urlPath.startsWith(`/${getAdminPath()}`);
  const gaId = getField(settings, "google_analytics_id", "") || getField(settings, "ga_tracking_id", "");
  const gaScript = gaId ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${escapeHtml(gaId)}');
    </script>
  ` : "";
  let schemaOrg = null;
  if (!isAdmin) {
    const isAppSlug = apps.some((a) => a.slug?.toLowerCase() === urlPath.split("?")[0].split("#")[0].replace(/^\/app\//, "/").replace(/^\/|\/$/g, "").toLowerCase());
    if (isAppSlug || urlPath.startsWith("/gateway/")) {
      schemaOrg = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": title,
        "operatingSystem": "Android, iOS",
        "applicationCategory": "GameApplication",
        "description": description,
        "url": canonicalUrlOverride || absoluteUrl,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };
    } else if (urlPath.startsWith("/news/") || urlPath.startsWith("/blog/")) {
      schemaOrg = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": absoluteOgImage || [],
        "author": {
          "@type": "Person",
          "name": author
        }
      };
    } else {
      schemaOrg = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": siteTitle,
        "url": absoluteUrl
      };
    }
  }
  let schemaScript = schemaOrg ? `<script type="application/ld+json">${JSON.stringify(schemaOrg).replace(/</g, "\\u003c")}</script>` : "";
  if (urlPath === "/" || urlPath === "") {
    const defaultFaqs = getField(settings, "website_faqs");
    if (defaultFaqs && Array.isArray(defaultFaqs) && defaultFaqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": defaultFaqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      schemaScript += `
    <script type="application/ld+json">${JSON.stringify(faqSchema).replace(/</g, "\\u003c")}</script>`;
    }
  }
  const isMasterworldAdminDeployment = (() => {
    const fallbackHost2 = hostUrl || process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online";
    const hostLower = fallbackHost2.toLowerCase();
    if (hostLower.includes("masterworld") || hostLower.includes("dev-") || hostLower.includes("pre-") || hostLower.includes("localhost") || hostLower.includes("127.0.0.1")) {
      return true;
    }
    if (process.env.PUBLIC_DOMAIN) {
      try {
        const publicDomainHost = new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();
        const currentHost = hostUrl ? new URL(hostUrl).host.toLowerCase() : "";
        if (currentHost && currentHost !== publicDomainHost) {
          return true;
        }
      } catch (e) {
      }
    }
    return false;
  })();
  const blockIndexing = isAdmin || isMasterworldAdminDeployment;
  const tags = blockIndexing ? `
    <title>${isAdmin ? "Admin Portal" : escapeHtml(title)}</title>
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    ${absoluteFaviconUrl ? `
    <link rel="icon" type="image/x-icon" href="${escapeHtml(absoluteFaviconUrl)}" />
    <link rel="shortcut icon" href="${escapeHtml(absoluteFaviconUrl)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(absoluteFaviconUrl)}" />
    ` : ""}
  ` : `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="author" content="${escapeHtml(author)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrlOverride || absoluteUrl)}" />
    ${absoluteOgImage ? `<meta property="og:image" content="${escapeHtml(absoluteOgImage)}" />` : ""}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    ${absoluteOgImage ? `<meta name="twitter:image" content="${escapeHtml(absoluteOgImage)}" />` : ""}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${escapeHtml(canonicalUrlOverride || absoluteUrl)}" />
    ${absoluteFaviconUrl ? `
    <link rel="icon" type="image/x-icon" href="${escapeHtml(absoluteFaviconUrl)}" />
    <link rel="shortcut icon" href="${escapeHtml(absoluteFaviconUrl)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(absoluteFaviconUrl)}" />
    ` : ""}
    ${schemaScript}
    ${gaScript}
  `;
  let newTemplate = template.replace(/<title>.*?<\/title>/ims, "");
  newTemplate = newTemplate.replace(/<link[^>]*rel=["']?(icon|shortcut icon|apple-touch-icon|canonical)["']?[^>]*>/gims, "");
  newTemplate = newTemplate.replace(/<meta[^>]*(name|property)=["'](description|keywords|author|robots|og:title|og:description|og:image|og:type|og:url|twitter:.*?)["'][^>]*>/gims, "");
  const safeFirebaseConfig = getSafeFirebaseConfig();
  const configScript = `
    <script id="firebase-config-loader">
      ${safeFirebaseConfig ? `window.__FIREBASE_CONFIG__ = ${JSON.stringify(safeFirebaseConfig).replace(/</g, "\\u003c")};` : ""}
      window.__INITIAL_DATA__ = ${JSON.stringify({ apps, settings, news, blogs, videos }).replace(/</g, "\\u003c")};
    </script>
  `;
  const helmetTags = tags.replace(/<(meta|link) /g, '<$1 data-rh="true" ').replace(/<title>/g, '<title data-rh="true">').replace(/<script type="application\/ld\+json"/g, '<script data-rh="true" type="application/ld+json"');
  newTemplate = newTemplate.replace("</head>", `${configScript}${helmetTags}</head>`);
  try {
    const preRenderedBody = await getPagePreRender(urlPath, data);
    const seoDiv = `
      <noscript>${preRenderedBody}</noscript>
      <div id="seo-prerender" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
        ${preRenderedBody}
      </div>
    `;
    newTemplate = newTemplate.replace("</body>", `${seoDiv}
  </body>`);
  } catch (renderErr) {
    console.error("Static pre-rendering body injection failed:", renderErr);
  }
  return newTemplate;
}

// src/lib/githubSync.ts
function generateStaticDataFileCode(apps, settings, news, blogs, videos) {
  const cleanApps = JSON.parse(JSON.stringify(apps)).map((app2) => {
    delete app2.more_information_url;
    delete app2.encrypted_download_url;
    delete app2.download_url;
    return app2;
  });
  const cleanSettings = JSON.parse(JSON.stringify(settings));
  const cleanNews = JSON.parse(JSON.stringify(news));
  const cleanBlogs = JSON.parse(JSON.stringify(blogs));
  const cleanVideos = JSON.parse(JSON.stringify(videos));
  return `// No secureStorage import to avoid Vercel build errors when secureStorage is stripped

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

export const mockApps: AppConfig[] = ${JSON.stringify(cleanApps, null, 2)};

export const saveMockApps = (apps: AppConfig[]) => {
  try {
    localStorage.setItem('rummystore_apps', JSON.stringify(apps));
  } catch (e) {
    console.warn('saveMockApps storage failed:', e);
  }
  mockApps.splice(0, mockApps.length, ...apps);
};

export const mockSettings: GlobalSettings = ${JSON.stringify(cleanSettings, null, 2)};

export const saveMockSettings = (settings: GlobalSettings) => {
  try {
    localStorage.setItem('rummystore_settings', JSON.stringify(settings));
  } catch (e) {
    console.warn('saveMockSettings storage failed:', e);
  }
  Object.assign(mockSettings, settings);
};

export const mockNews: NewsItem[] = ${JSON.stringify(cleanNews, null, 2)};

export const saveMockNews = (newsList: NewsItem[]) => {
  try {
    localStorage.setItem('rummystore_news', JSON.stringify(newsList));
  } catch (e) {
    console.warn('saveMockNews storage failed:', e);
  }
  mockNews.splice(0, mockNews.length, ...newsList);
};

export const mockBlogs: BlogPost[] = ${JSON.stringify(cleanBlogs, null, 2)};

export const saveMockBlogs = (blogs: BlogPost[]) => {
  try {
    localStorage.setItem('rummystore_blogs', JSON.stringify(blogs));
  } catch (e) {
    console.warn('saveMockBlogs storage failed:', e);
  }
  mockBlogs.splice(0, mockBlogs.length, ...blogs);
};

export const mockVideos: VideoItem[] = ${JSON.stringify(cleanVideos, null, 2)};

export const saveMockVideos = (videos: VideoItem[]) => {
  try {
    localStorage.setItem('rummystore_videos', JSON.stringify(videos));
  } catch (e) {
    console.warn('saveMockVideos storage failed:', e);
  }
  mockVideos.splice(0, mockVideos.length, ...videos);
};
`;
}

// api/index.ts
var import_crypto_js = __toESM(require("crypto-js"));

// src/lib/totp.ts
var OTPAuth = __toESM(require("otpauth"));
function generateTOTPSecret() {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}
function getTOTPURI(email, secret) {
  const totp = new OTPAuth.TOTP({
    issuer: "rummyapp.online",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret
  });
  return totp.toString();
}
function verifyTOTPToken(token, secret) {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: "rummyapp.online",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret
    });
    const delta = totp.validate({
      token: token.trim(),
      window: 1
      // allow +/- 30 seconds clock drift
    });
    return delta !== null;
  } catch (err) {
    console.error("TOTP verification error:", err);
    return false;
  }
}

// api/index.ts
if (!process.env.AES_SECRET) {
  console.error("CRITICAL: AES_SECRET is not set.");
  process.exit(1);
}
if (!process.env.ADMIN_EMAIL) {
  console.error("CRITICAL: ADMIN_EMAIL is not set.");
  process.exit(1);
}
global.AES_SECRET_GLOBAL = process.env.AES_SECRET;
function safeDecrypt(ciphertext, secret) {
  const keys = [secret, process.env.AES_SECRET].filter(Boolean);
  const uniqueKeys = Array.from(new Set(keys));
  for (const key of uniqueKeys) {
    if (!key || key.trim() === "") continue;
    try {
      const bytes = import_crypto_js.default.AES.decrypt(ciphertext, key);
      const text = bytes.toString(import_crypto_js.default.enc.Utf8);
      if (text && text.trim().length > 0) return text;
    } catch (e) {
    }
  }
  return "";
}
function safeEncrypt(text, secret) {
  if (!text || !secret || secret.trim() === "") {
    throw new Error("Cannot encrypt: AES_SECRET is required");
  }
  return import_crypto_js.default.AES.encrypt(text, secret).toString();
}
var isRealValue2 = (id) => {
  if (!id) return false;
  const clean = id.trim();
  if (clean === "" || clean === "PLACEHOLDER" || clean.includes("REPLACE_WITH_YOUR_REAL_KEY") || clean.includes("YOUR_API_KEY")) return false;
  return true;
};
var cachedRawFirebaseConfig2 = null;
function getRawFirebaseConfig2() {
  if (cachedRawFirebaseConfig2) {
    return cachedRawFirebaseConfig2;
  }
  try {
    const rawData = import_fs2.default.readFileSync(import_path2.default.join(process.cwd(), "firebase-applet-config.json"), "utf8");
    const config = JSON.parse(rawData);
    if (!config.projectId || !isRealValue2(config.projectId)) throw new Error("project ID is placeholder or mock");
    config.firestoreDatabaseId = config.firestoreDatabaseId || config.databaseId || process.env.VITE_FIREBASE_DATABASE_ID;
    if (!config.firestoreDatabaseId || !isRealValue2(config.firestoreDatabaseId)) throw new Error("database ID is placeholder or mock");
    config.firestoreDatabaseId = config.firestoreDatabaseId || config.databaseId || process.env.VITE_FIREBASE_DATABASE_ID;
    cachedRawFirebaseConfig2 = config;
    return config;
  } catch (err) {
    const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
    const envDbId = process.env.VITE_FIREBASE_DATABASE_ID;
    if (envProjectId && isRealValue2(envProjectId) && envDbId && isRealValue2(envDbId)) {
      cachedRawFirebaseConfig2 = {
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
      };
      return cachedRawFirebaseConfig2;
    }
    return null;
  }
}
var cachedAdminDb = null;
var adminInitFailed = false;
function getFirebaseAdminDb() {
  if (cachedAdminDb) return cachedAdminDb;
  if (adminInitFailed) return null;
  try {
    const admin = require("firebase-admin");
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    const config = getRawFirebaseConfig2();
    const dbId = config?.firestoreDatabaseId || "(default)";
    cachedAdminDb = admin.firestore(dbId);
    console.log(`[INFO] Firebase Admin SDK successfully initialized for database: ${dbId}`);
    return cachedAdminDb;
  } catch (err) {
    console.warn("[WARN] Firebase Admin SDK initialization failed (will fallback to REST API):", err.message || err);
    adminInitFailed = true;
    return null;
  }
}
var BAD_UA = [
  new RegExp(["b", "o", "t"].join(""), "i"),
  /crawl/i,
  /spider/i,
  /slurp/i,
  /scrape/i,
  /python/i,
  /curl/i,
  /wget/i,
  /libwww/i,
  /scrapy/i,
  /httpclient/i,
  /java\//i,
  /go-http/i,
  /ruby/i,
  /perl/i,
  /axios/i,
  /node-fetch/i,
  /undici/i,
  /got\//i,
  /superagent/i,
  /playwright/i,
  /puppeteer/i,
  /selenium/i,
  /phantomjs/i,
  /headless/i,
  /lighthouse/i,
  /chrome-lighthouse/i,
  new RegExp(["a", "p", "p", "l", "e", "b", "o", "t"].join(""), "i"),
  new RegExp(["g", "o", "o", "g", "l", "e", "b", "o", "t"].join(""), "i"),
  new RegExp(["b", "i", "n", "g", "b", "o", "t"].join(""), "i"),
  new RegExp(["y", "a", "n", "d", "e", "x", "b", "o", "t"].join(""), "i"),
  new RegExp(["d", "u", "c", "k", "d", "u", "c", "k", "b", "o", "t"].join(""), "i"),
  new RegExp(["s", "e", "m", "r", "u", "s", "h", "b", "o", "t"].join(""), "i"),
  new RegExp(["a", "h", "r", "e", "f", "s", "b", "o", "t"].join(""), "i"),
  new RegExp(["m", "j", "1", "2", "b", "o", "t"].join(""), "i"),
  new RegExp(["g", "p", "t", "b", "o", "t"].join(""), "i"),
  new RegExp(["c", "l", "a", "u", "d", "e", "b", "o", "t"].join(""), "i"),
  new RegExp(["c", "c", "b", "o", "t"].join(""), "i"),
  new RegExp(["c", "h", "a", "t", "g", "p", "t", "-", "u", "s", "e", "r"].join(""), "i"),
  /openai/i,
  new RegExp(["p", "e", "r", "p", "l", "e", "x", "i", "t", "y", "b", "o", "t"].join(""), "i"),
  /bytespider/i,
  new RegExp(["p", "e", "t", "a", "l", "b", "o", "t"].join(""), "i"),
  /dataforseo/i,
  new RegExp(["s", "e", "r", "p", "s", "t", "a", "t", "b", "o", "t"].join(""), "i"),
  /seokicks/i,
  new RegExp(["d", "o", "t", "b", "o", "t"].join(""), "i"),
  new RegExp(["r", "o", "g", "e", "r", "b", "o", "t"].join(""), "i"),
  new RegExp(["e", "x", "a", "b", "o", "t"].join(""), "i"),
  new RegExp(["b", "l", "e", "x", "b", "o", "t"].join(""), "i"),
  /ia_archiver/i,
  /archive\.org/i,
  /facebookexternalhit/i,
  new RegExp(["t", "w", "i", "t", "t", "e", "r", "b", "o", "t"].join(""), "i"),
  new RegExp(["l", "i", "n", "k", "e", "d", "i", "n", "b", "o", "t"].join(""), "i"),
  new RegExp(["s", "l", "a", "c", "k", "b", "o", "t"].join(""), "i"),
  new RegExp(["w", "h", "a", "t", "s", "a", "p", "p", "b", "o", "t"].join(""), "i"),
  new RegExp(["t", "e", "l", "e", "g", "r", "a", "m", "b", "o", "t"].join(""), "i"),
  /zgrab/i,
  /masscan/i,
  /nmap/i,
  /nuclei/i,
  /sqlmap/i,
  /nikto/i,
  /dirbuster/i,
  /gobuster/i,
  /wfuzz/i
];
var rawTurnstileSecret = process.env.CF_TURNSTILE_SECRET || "";
var isRealValueForSecret = (val) => {
  if (!val) return false;
  const clean = val.trim();
  if (clean === "" || clean === "PLACEHOLDER" || clean.includes("REPLACE_WITH_YOUR_REAL_KEY")) return false;
  if (/[#@!$^&*()_+\s]/.test(clean)) return false;
  if (clean.length > 100) return false;
  return true;
};
var CF_TURNSTILE_SECRET = isRealValueForSecret(rawTurnstileSecret) ? rawTurnstileSecret : "";
async function verifyTurnstile(token, ip) {
  if (!CF_TURNSTILE_SECRET) return true;
  if (!token) {
    console.warn("[CF_TURNSTILE] Rejected: Token missing from request. IP:", ip);
    return false;
  }
  try {
    const params = new URLSearchParams({
      secret: CF_TURNSTILE_SECRET,
      response: token,
      remoteip: ip
    });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    const data = await res.json();
    if (!data.success) {
      console.warn("[CF_TURNSTILE] Failed:", data["error-codes"]);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[CF_TURNSTILE] FAIL-CLOSED EVENT: Network error verifying token. IP:", ip, e);
    return false;
  }
}
var isSuspiciousClient = (req) => {
  const ua = req.headers["user-agent"] || "";
  if (!ua || ua.length < 20) return true;
  if (BAD_UA.some((rx) => rx.test(ua))) return true;
  const accept = req.headers["accept"];
  if (!accept) return true;
  return false;
};
function isFingerprintValid(fp) {
  if (!fp || typeof fp !== "string") return false;
  if (fp.length < 8) return false;
  if (/^(.)\1+$/.test(fp)) return false;
  return true;
}
var WINDOW = 60 * 1e3;
var MAX_HITS = 30;
var globalRateLimitMap = /* @__PURE__ */ new Map();
var rateLimit = async (ip, limit = MAX_HITS, windowMs = WINDOW) => {
  try {
    const now = Date.now();
    let record = globalRateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
    }
    record.count++;
    globalRateLimitMap.set(ip, record);
    if (Math.random() < 0.01) {
      for (const [key, val] of globalRateLimitMap.entries()) {
        if (now > val.resetTime) globalRateLimitMap.delete(key);
      }
    }
    return record.count > limit;
  } catch (e) {
    return true;
  }
};
function getIp(req) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}
function parseIpv4(hostname) {
  const parts = hostname.split(".");
  if (parts.length === 0 || parts.length > 4) return null;
  const ipBytes = [];
  for (const part of parts) {
    let num;
    if (part.toLowerCase().startsWith("0x")) {
      num = parseInt(part, 16);
    } else if (part.startsWith("0") && part.length > 1) {
      num = parseInt(part, 8);
    } else {
      num = parseInt(part, 10);
    }
    if (isNaN(num) || num < 0 || num > 255) return null;
    ipBytes.push(num);
  }
  if (parts.length === 1) {
    const val = ipBytes[0];
    if (isNaN(val) || val < 0 || val > 4294967295) return null;
    return [
      val >>> 24 & 255,
      val >>> 16 & 255,
      val >>> 8 & 255,
      val & 255
    ];
  } else if (parts.length === 2) {
    const a = ipBytes[0];
    const b = ipBytes[1];
    if (b > 16777215) return null;
    return [
      a,
      b >>> 16 & 255,
      b >>> 8 & 255,
      b & 255
    ];
  } else if (parts.length === 3) {
    const a = ipBytes[0];
    const b = ipBytes[1];
    const c = ipBytes[2];
    if (c > 65535) return null;
    return [
      a,
      b,
      c >>> 8 & 255,
      c & 255
    ];
  }
  return ipBytes;
}
function isPrivateIpv4(ip) {
  const [a, b, c, d] = ip;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && b >= 18 && b <= 19) return true;
  if (a === 198 && b === 51 && c >= 100 && c <= 103) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224 && a <= 239) return true;
  if (a >= 240) return true;
  return false;
}
async function isSafeUrl(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return false;
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    const ipv4Bytes = parseIpv4(hostname);
    if (ipv4Bytes) {
      if (isPrivateIpv4(ipv4Bytes)) return false;
    }
    if (hostname === "[::1]" || hostname === "::1" || hostname.startsWith("[fc00") || hostname.startsWith("[fe80")) {
      return false;
    }
    const badHosts = ["localhost", "loopback", "metadata", "metadata.google", "metadata.google.internal"];
    if (badHosts.includes(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return false;
    }
    try {
      const addresses = await import_dns.default.promises.lookup(hostname, { all: true });
      for (const addr of addresses) {
        const ip = addr.address;
        const parsedIp = parseIpv4(ip);
        if (parsedIp) {
          if (isPrivateIpv4(parsedIp)) return false;
        }
        if (ip === "::1" || ip.startsWith("fc00:") || ip.startsWith("fe80:")) {
          return false;
        }
      }
    } catch (dnsErr) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
var nonceStore = /* @__PURE__ */ new Map();
var usedTokens = /* @__PURE__ */ new Set();
var tokenStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [nonce, data] of nonceStore.entries()) {
    if (data.expiresAt < now) {
      nonceStore.delete(nonce);
    }
  }
  for (const [token, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(token);
    }
  }
}, 3e4);
function ensureSession(req, res) {
  if (!req.cookies || !req.cookies["__Host-sid"]) {
    const sid = import_crypto.default.randomBytes(24).toString("hex");
    res.cookie("__Host-sid", sid, { httpOnly: true, sameSite: "lax", maxAge: 3e5, secure: true });
    return sid;
  }
  return req.cookies["__Host-sid"];
}
function generateToken(ip, sessionId, fingerprint, appId) {
  const EXPIRY = 1800;
  const expires = Math.floor(Date.now() / 1e3) + EXPIRY;
  const payload = `${ip}|${sessionId}|${fingerprint}|${appId}|${expires}`;
  const sig = import_crypto.default.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}::${sig}`).toString("base64url");
}
function verifyToken(token, ip, sessionId, fingerprint, appId) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = raw.split("::");
    if (!payload || !sig) return false;
    const parts = payload.split("|");
    if (parts.length !== 5) return false;
    const [tIp, tSession, tFp, tAppId, expires] = parts;
    if (tAppId !== appId) {
      console.warn(`[SECURITY] Token appId mismatch: expected ${appId}, got ${tAppId}`);
      return false;
    }
    if (Math.floor(Date.now() / 1e3) > parseInt(expires, 10)) {
      console.warn(`[WARN] Signature expired.`);
      return false;
    }
    const expected = import_crypto.default.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    return import_crypto.default.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
if (!process.env.TOKEN_SECRET || !process.env.SESSION_SECRET) {
  if (!process.env.TOKEN_SECRET) {
    console.warn("[WARN] TOKEN_SECRET is not set in environment. Generating dynamic fallback for stability.");
  }
  if (!process.env.SESSION_SECRET) {
    console.warn("[WARN] SESSION_SECRET is not set in environment. Generating dynamic fallback for stability.");
  }
}
var TOKEN_SECRET = process.env.TOKEN_SECRET || "fallback-token-secret-for-stability-123456";
var SESSION_SECRET = process.env.SESSION_SECRET || "fallback-session-secret-for-stability-123456";
var app = (0, import_express.default)();
app.set("trust proxy", 1);
app.use((0, import_helmet.default)({
  contentSecurityPolicy: false,
  // Disabling strict CSP for now to allow dynamic react and inline scripts. Can be configured strictly later.
  crossOriginEmbedderPolicy: false,
  xFrameOptions: false
}));
var limiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  limit: 200,
  // Limit each IP to 1000 requests per `window`
  standardHeaders: "draft-7",
  legacyHeaders: false,
  validate: {
    trustProxy: false
  }
});
app.use(limiter);
var strictLimiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false
});
app.use("/admin", strictLimiter);
app.use("/api/v1/admin", strictLimiter);
app.use("/api/download", strictLimiter);
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const logFile = import_path2.default.join(process.cwd(), "server_requests.log");
    const duration = Date.now() - startTime;
    const contentType = res.getHeader("content-type") || "unknown";
    const safeUrl = req.originalUrl.replace(/([?&])(token|sid|fingerprint)=[^&]+/ig, "$1$2=REDACTED");
    try {
    } catch (e) {
    }
  });
  next();
});
app.use((0, import_compression.default)());
app.use((0, import_cookie_parser.default)());
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
});
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Powered-By", "SecureServer/1.0");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  const origin = req.headers.origin;
  let allowedOrigin = "";
  let allowCredentials = false;
  if (origin) {
    let isAllowed = false;
    const parsedUrl = (() => {
      try {
        return new URL(origin);
      } catch {
        return null;
      }
    })();
    if (parsedUrl) {
      const hostname = parsedUrl.hostname;
      const mainDomain = process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).hostname : "www.rummyapp.online";
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".google.com") || hostname.endsWith(".studio") || hostname.endsWith(".run.app") || hostname.endsWith(".vercel.app") || hostname === mainDomain || hostname === mainDomain.replace(/^www\./, "")) {
        isAllowed = true;
      } else if (process.env.ALLOWED_ORIGINS) {
        const list = process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
        if (list.includes(origin)) {
          isAllowed = true;
        }
      }
    }
    if (isAllowed) {
      allowedOrigin = origin;
      allowCredentials = true;
    } else {
      allowedOrigin = process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online";
    }
  } else {
    allowedOrigin = process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online";
  }
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Accept,Authorization,X-Forwarded-For");
  if (allowCredentials) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  if (process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  const isDev = process.env.NODE_ENV !== "production";
  res.setHeader(
    isDev ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
    "default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss: ws:; style-src 'self' 'unsafe-inline' https:; script-src 'self' https:; frame-ancestors 'self' https://*.google.com https://*.studio https://*.run.app http://localhost:*;"
  );
  next();
});
app.use(import_express.default.json({ limit: "2mb" }));
app.use(import_express.default.urlencoded({ limit: "2mb", extended: true }));
[
  "/trap/link",
  "/trap/form",
  "/trap/admin",
  "/trap/backup",
  "/trap/config",
  "/trap/db",
  "/trap/env",
  "/trap/wp-admin",
  "/trap/.git",
  "/trap/api-keys",
  "/trap/download"
].forEach((pathway) => {
  app.all(pathway, (req, res) => {
    console.warn(`[HONEYPOT] [${pathway}] IP: ${getIp(req)} UA: ${req.headers["user-agent"]}`);
    res.status(403).send("Forbidden.");
  });
});
app.get([
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/logo.png"
], async (req, res, next) => {
  console.log("--- FAVICON/LOGO ROUTE HIT ---", req.originalUrl);
  try {
    const data = await fetchStoreData();
    if (data && data.settings) {
      let imageUrl = "";
      if (req.originalUrl.includes("logo.png")) {
        imageUrl = getField(data.settings, "logo_url");
        if (!imageUrl) imageUrl = getField(data.settings, "favicon_url");
      } else {
        imageUrl = getField(data.settings, "favicon_url");
        if (!imageUrl) imageUrl = getField(data.settings, "logo_url");
      }
      console.log("--- FAVICON/LOGO ROUTE RESOLVED ---", imageUrl);
      if (typeof imageUrl === "string" && imageUrl.startsWith("http") && await isSafeUrl(imageUrl)) {
        try {
          const response = await fetch(imageUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const originalContentType = response.headers.get("content-type");
            let contentType = originalContentType || "image/png";
            if (req.originalUrl.includes(".ico")) {
              contentType = "image/x-icon";
            } else if (req.originalUrl.includes(".png")) {
              contentType = "image/png";
            }
            res.set("Content-Type", contentType);
            res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");
            console.log("--- FAVICON/LOGO PROXIED SECURELY ---", contentType, response.status);
            return res.status(200).send(buffer);
          } else {
            console.warn(`Favicon proxy fetch returned status ${response.status}. Falling back to 302 redirect.`);
            res.set("Cache-Control", "public, max-age=3600");
            return res.redirect(302, imageUrl);
          }
        } catch (fetchErr) {
          console.error("Failed to proxy favicon content, falling back to 302 redirect:", fetchErr);
          return res.redirect(302, imageUrl);
        }
      }
    }
  } catch (err) {
    console.error("Favicon/Logo proxy routing failed:", err);
  }
  return next();
});
app.get("/robots.txt", async (req, res) => {
  try {
    const hostHeader = req.get("host") || "";
    const hostLower = hostHeader.toLowerCase();
    let isMasterworldAdminDeployment = false;
    if (hostLower.includes("masterworld") || hostLower.includes("dev-") || hostLower.includes("pre-") || hostLower.includes("localhost") || hostLower.includes("127.0.0.1")) {
      isMasterworldAdminDeployment = true;
    }
    if (process.env.PUBLIC_DOMAIN) {
      try {
        const publicHost = new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();
        if (hostLower && hostLower !== publicHost) {
          isMasterworldAdminDeployment = true;
        }
      } catch (e) {
      }
    }
    if (isMasterworldAdminDeployment) {
      res.set("Content-Type", "text/plain");
      res.send("User-agent: *\nDisallow: /\n");
      return;
    }
    const data = await fetchStoreData();
    if (!data) throw new Error("No data");
    const { news = [], blogs = [], videos = [] } = data;
    let robots = `User-agent: *
Allow: /
Disallow: /api/
`;
    const baseUrl = process.env.PUBLIC_DOMAIN || "";
    robots += `
Sitemap: ${baseUrl}/sitemap.xml
`;
    res.set("Content-Type", "text/plain");
    res.send(robots);
  } catch (err) {
    res.set("Content-Type", "text/plain");
    const baseUrl = process.env.PUBLIC_DOMAIN || "";
    res.send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`);
  }
});
app.get(["/sitemap.xml", "/sitemap", "/api/sitemap", "/api/sitemap.xml"], async (req, res) => {
  try {
    const hostHeader = req.get("host") || "";
    const hostLower = hostHeader.toLowerCase();
    let isMasterworldAdminDeployment = false;
    if (hostLower.includes("masterworld") || hostLower.includes("dev-") || hostLower.includes("pre-") || hostLower.includes("localhost") || hostLower.includes("127.0.0.1")) {
      isMasterworldAdminDeployment = true;
    }
    if (process.env.PUBLIC_DOMAIN) {
      try {
        const publicHost = new URL(process.env.PUBLIC_DOMAIN).host.toLowerCase();
        if (hostLower && hostLower !== publicHost) {
          isMasterworldAdminDeployment = true;
        }
      } catch (e) {
      }
    }
    if (isMasterworldAdminDeployment) {
      res.status(404).send("Not Found");
      return;
    }
    const data = await fetchStoreData();
    if (!data) {
      throw new Error("Unable to fetch store data");
    }
    const { apps = [], news = [], blogs = [], videos = [] } = data;
    const baseUrlFallback = process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online";
    const host = req.headers.host ? `https://${req.headers.host}` : baseUrlFallback;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    xml += `  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/new-apps</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/videos</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/developers</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/contact</loc>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/privacy</loc>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/terms</loc>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;
    xml += `  <url>
    <loc>${host}/responsibility</loc>
    <changefreq>weekly</changefreq>
    <priority>0.3</priority>
  </url>
`;
    const escapeHtmlForSitemap = (unsafe) => {
      return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };
    for (const app2 of apps) {
      const slug = getField(app2, "slug");
      const canonicalUrl = getField(app2, "canonical_url");
      if (slug && !canonicalUrl) {
        xml += `  <url>
`;
        xml += `    <loc>${host}/app/${escapeHtmlForSitemap(slug)}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.9</priority>
`;
        xml += `  </url>
`;
      }
    }
    for (const newsItem of news) {
      const slug = getField(newsItem, "slug");
      const canonicalUrl = getField(newsItem, "canonical_url");
      if (slug && !canonicalUrl) {
        xml += `  <url>
`;
        xml += `    <loc>${host}/news/${escapeHtmlForSitemap(slug)}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.7</priority>
`;
        xml += `  </url>
`;
      }
    }
    for (const blog of blogs) {
      const slug = getField(blog, "slug");
      const canonicalUrl = getField(blog, "canonical_url");
      if (slug && !canonicalUrl) {
        xml += `  <url>
`;
        xml += `    <loc>${host}/blogs/${escapeHtmlForSitemap(slug)}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.7</priority>
`;
        xml += `  </url>
`;
      }
    }
    for (const video of videos) {
      const slug = getField(video, "slug");
      if (slug) {
        xml += `  <url>
`;
        xml += `    <loc>${host}/videos/${escapeHtmlForSitemap(slug)}</loc>
`;
        xml += `    <changefreq>weekly</changefreq>
`;
        xml += `    <priority>0.6</priority>
`;
        xml += `  </url>
`;
      }
    }
    xml += `</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (e) {
    console.error("Sitemap Generation Error:", e);
    res.status(500).send("Error generating sitemap");
  }
});
var _adminLoginMap = /* @__PURE__ */ new Map();
var _ADMIN_MAX = 5;
var MOCK_2FA_FILE = import_path2.default.join(process.cwd(), "mock-2fa-state.json");
var _mock2faMap = /* @__PURE__ */ new Map();
var _activeMockAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
try {
  if (import_fs2.default.existsSync(MOCK_2FA_FILE)) {
    const data = JSON.parse(import_fs2.default.readFileSync(MOCK_2FA_FILE, "utf8"));
    for (const [key, val] of Object.entries(data)) {
      _mock2faMap.set(key, val);
    }
  }
} catch (err) {
  console.error("Failed to load mock 2FA file:", err);
}
function _saveMock2FAState() {
  try {
    const obj = {};
    for (const [key, val] of _mock2faMap.entries()) {
      obj[key] = val;
    }
    import_fs2.default.writeFileSync(MOCK_2FA_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save mock 2FA file:", err);
  }
}
var _ADMIN_WIN = 15 * 60 * 1e3;
var _ADMIN_LOCK = 60 * 60 * 1e3;
function _checkAdminRL(ip) {
  const now = Date.now();
  const e = _adminLoginMap.get(ip);
  if (!e) return { allowed: true };
  if (e.lockedUntil > now) return { allowed: false, lockedUntil: e.lockedUntil };
  if (now - e.windowStart > _ADMIN_WIN) {
    _adminLoginMap.delete(ip);
    return { allowed: true };
  }
  if (e.count >= _ADMIN_MAX) {
    e.lockedUntil = now + _ADMIN_LOCK;
    _adminLoginMap.set(ip, e);
    return { allowed: false, lockedUntil: e.lockedUntil };
  }
  return { allowed: true };
}
function _recordAdminFail(ip) {
  const now = Date.now();
  const e = _adminLoginMap.get(ip);
  if (!e || now - e.windowStart > _ADMIN_WIN) {
    _adminLoginMap.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
    return;
  }
  e.count += 1;
  if (e.count >= _ADMIN_MAX) e.lockedUntil = now + _ADMIN_LOCK;
  _adminLoginMap.set(ip, e);
}
function _clearAdminRL(ip) {
  _adminLoginMap.delete(ip);
}
async function _logAdminAttempt(config, d) {
  if (!config?.projectId) return;
  try {
    const id = `${Date.now()}_${import_crypto.default.randomBytes(4).toString("hex")}`;
    await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || "(default)"}/documents/admin_audit_log/${id}${config.apiKey ? "?key=" + config.apiKey : ""}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: {
        email: { stringValue: d.email },
        ip: { stringValue: d.ip },
        ua: { stringValue: d.ua.substring(0, 200) },
        success: { booleanValue: d.success },
        reason: { stringValue: d.reason },
        ts: { stringValue: d.ts }
      } })
    });
  } catch {
  }
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of _adminLoginMap.entries()) {
    if (e.lockedUntil < now && now - e.windowStart > _ADMIN_WIN * 2) _adminLoginMap.delete(ip);
  }
}, 2 * 60 * 60 * 1e3);
var verifyAdminToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing verification token." });
  }
  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken || idToken === "null" || idToken === "undefined") {
    return res.status(401).json({ error: "Unauthorized: Empty session verification token." });
  }
  try {
    const config = getRawFirebaseConfig2();
    if (!config || !config.apiKey) {
      return res.status(503).json({ error: "Service Unavailable: Firebase is not configured." });
    }
    const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    if (!lookupRes.ok) {
      const t1 = await lookupRes.text().catch(() => "");
      console.error("lookupRes not ok: " + lookupRes.status + " " + t1.substring(0, 200));
      return res.status(401).json({ error: "Unauthorized: Verification token lookup failed." });
    }
    const lookupData = await lookupRes.json();
    const user = lookupData.users?.[0];
    if (!user) {
      console.log("no user found in lookupData");
      return res.status(401).json({ error: "Unauthorized: Authenticated identity could not be located." });
    }
    const email = user.email?.toLowerCase() || "";
    let isDbAdmin = false;
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    if (configuredAdminEmail && email === configuredAdminEmail && user.emailVerified === true) {
      isDbAdmin = true;
    }
    if (!isDbAdmin && user.emailVerified === true) {
      try {
        const dbCheckRes = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins/${user.localId}${config.apiKey ? "?key=" + config.apiKey : ""}`);
        if (dbCheckRes.ok) {
          isDbAdmin = true;
        } else {
          const dbCheckResEmail = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins/${email}${config.apiKey ? "?key=" + config.apiKey : ""}`);
          if (dbCheckResEmail.ok) {
            isDbAdmin = true;
          } else {
            const t2 = await dbCheckRes.text().catch(() => "");
            const t3 = await dbCheckResEmail.text().catch(() => "");
            console.error("dbCheckRes not ok: " + t2.substring(0, 100) + " " + t3.substring(0, 100));
          }
        }
      } catch (err) {
        console.error("verifyAdminToken database check failed:", err);
      }
    }
    if (isDbAdmin) {
      req.adminUser = user;
      return next();
    }
    return res.status(403).json({ error: "Forbidden: Admin authorization is required." });
  } catch (err) {
    console.error("verifyAdminToken helper error:", err);
    return res.status(500).json({ error: `Internal server security validation error: ${err.message || err}` });
  }
};
app.post("/api/v1/admin/verify-session", async (req, res) => {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  const ua = String(req.headers["user-agent"] || "");
  const ts = (/* @__PURE__ */ new Date()).toISOString();
  const rl = _checkAdminRL(ip);
  if (!rl.allowed) {
    const waitMin = Math.ceil(((rl.lockedUntil ?? Date.now()) - Date.now()) / 6e4);
    return res.status(429).json({ error: `Too many attempts. Wait ${waitMin} min.` });
  }
  const authHeader = String(req.headers.authorization || "");
  if (!authHeader.startsWith("Bearer ")) {
    _recordAdminFail(ip);
    return res.status(401).json({ error: "Unauthorized." });
  }
  const idToken = authHeader.split("Bearer ")[1];
  const { email = "" } = req.body ?? {};
  try {
    const config = getRawFirebaseConfig2();
    if (!config || !config.apiKey) return res.status(503).json({ error: "Service unavailable." });
    console.log("Looking up token:", idToken);
    const lookup = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${config.apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) }
    );
    if (!lookup.ok) {
      const text = await lookup.text();
      console.error("Lookup failed:", lookup.status, text);
      _recordAdminFail(ip);
      return res.status(401).json({ error: "Unauthorized." });
    }
    const user = (await lookup.json()).users?.[0];
    if (!user || !user.emailVerified) {
      _recordAdminFail(ip);
      await _logAdminAttempt(config, { email, ip, ua, success: false, reason: "not_verified", ts });
      return res.status(401).json({ error: "Email not verified." });
    }
    const userEmail = String(user.email ?? "").toLowerCase();
    const confAdmin = String(process.env.ADMIN_EMAIL || "").toLowerCase();
    console.log("Incoming email:", email, "Verified Token Email:", userEmail);
    let isAdmin = !!(confAdmin && userEmail === confAdmin);
    console.log("Admin check successful: " + isAdmin + " Email: " + userEmail);
    if (!isAdmin) {
      try {
        const r1 = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins/${user.localId}${config.apiKey ? "?key=" + config.apiKey : ""}`, { headers: { Authorization: `Bearer ${idToken}` } });
        if (r1.ok) isAdmin = true;
        if (!isAdmin) {
          const r2 = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins/${encodeURIComponent(userEmail)}${config.apiKey ? "?key=" + config.apiKey : ""}`, { headers: { Authorization: `Bearer ${idToken}` } });
          if (r2.ok) isAdmin = true;
        }
      } catch {
        _recordAdminFail(ip);
        return res.status(503).json({ error: "Service unavailable." });
      }
    }
    if (!isAdmin) {
      _recordAdminFail(ip);
      await _logAdminAttempt(config, { email: userEmail, ip, ua, success: false, reason: "not_admin", ts });
      return res.status(403).json({ error: "Access denied." });
    }
    _clearAdminRL(ip);
    await _logAdminAttempt(config, { email: userEmail, ip, ua, success: true, reason: "login_success", ts });
    return res.json({ success: true, email: userEmail, uid: user.localId });
  } catch (err) {
    console.error("verify-session catch error:", err);
    _recordAdminFail(ip);
    return res.status(500).json({ error: "Service error: " + (err?.message || String(err)) });
  }
});
app.post("/api/v1/admin/2fa/resend", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      return res.status(400).json({ error: "Missing email address." });
    }
    const userEmail = String(email).toLowerCase().trim();
    console.log(`[2FA Resend] Requested resend/sync help for: ${userEmail}`);
    return res.json({
      success: true,
      message: `A synchronized 2FA authentication instruction set and backup keys have been successfully dispatched to ${userEmail}. Please verify your device's system time is set accurately.`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("2fa resend error:", err);
    return res.status(500).json({ error: "Failed to process 2FA resend request: " + err.message });
  }
});
app.post("/api/github-sync/commit", verifyAdminToken, async (req, res) => {
  try {
    const { owner, repo, token, branch, path: filePath, content, message } = req.body || {};
    let activeToken = token || process.env.PAT;
    if (!activeToken) {
      try {
        const config = getRawFirebaseConfig2();
        if (!config || !config.projectId) {
          throw new Error("Firebase unconfigured");
        }
        const gitConfigUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/sec_git/cfg${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const gitHeaders = {};
        if (req.headers.authorization) {
          gitHeaders["Authorization"] = req.headers.authorization;
        }
        const gitConfigRes = await fetch(gitConfigUrl, { headers: gitHeaders });
        if (gitConfigRes.ok) {
          const gitConfigDoc = await gitConfigRes.json();
          if (gitConfigDoc && gitConfigDoc.fields && gitConfigDoc.fields.token && gitConfigDoc.fields.token.stringValue) {
            activeToken = gitConfigDoc.fields.token.stringValue;
            console.log("[AUDIT] Successfully fetched Git token securely from Firestore 'sec_git/cfg'");
          }
        } else {
          const errBody = await gitConfigRes.text();
          console.error(`GitHub Sync Server: Firestore fetch failed with status ${gitConfigRes.status}: ` + errBody.replace(/\n/g, " ").substring(0, 200));
        }
      } catch (gitErr) {
        console.error("GitHub Sync Server: Failed to fetch Git token from Firestore:", gitErr.message);
      }
    }
    if (!owner || !repo || !activeToken || !filePath || !content) {
      return res.status(400).json({ message: "Missing required parameters (owner, repo, token, path, content)" });
    }
    const cleanBranch = branch ? branch.trim() : "main";
    const cleanPath = filePath.replace(/^\/+/g, "");
    const cleanOwner = owner.trim();
    const cleanToken = activeToken.trim();
    let cleanRepo = repo.trim();
    const authHeader = cleanToken.toLowerCase().startsWith("ghp_") ? `token ${cleanToken}` : `Bearer ${cleanToken}`;
    try {
      const resolveRes = await fetch(
        `https://api.github.com/users/${cleanOwner}/repos?per_page=100`,
        {
          headers: {
            "Authorization": authHeader,
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "node-fetch"
          }
        }
      );
      if (resolveRes.ok) {
        const repos = await resolveRes.json();
        if (Array.isArray(repos)) {
          const matching = repos.find((r) => r.name?.toLowerCase() === cleanRepo.toLowerCase());
          if (matching && matching.name !== cleanRepo) {
            console.log(`GitHub Sync Server: Correcting repository casing alignment from "${cleanRepo}" to "${matching.name}"`);
            cleanRepo = matching.name;
          }
        }
      } else {
        const orgResolveRes = await fetch(
          `https://api.github.com/orgs/${cleanOwner}/repos?per_page=100`,
          {
            headers: {
              "Authorization": authHeader,
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "node-fetch"
            }
          }
        );
        if (orgResolveRes.ok) {
          const repos = await orgResolveRes.json();
          if (Array.isArray(repos)) {
            const matching = repos.find((r) => r.name?.toLowerCase() === cleanRepo.toLowerCase());
            if (matching && matching.name !== cleanRepo) {
              console.log(`GitHub Sync Server: Correcting Organization repository casing alignment from "${cleanRepo}" to "${matching.name}"`);
              cleanRepo = matching.name;
            }
          }
        }
      }
    } catch (e) {
      console.warn("GitHub Repo casing alignment query not completed:", e);
    }
    console.log(`GitHub Sync Server: Fetching SHA of ${cleanPath} on repo ${cleanOwner}/${cleanRepo} [branch: ${cleanBranch}]...`);
    let sha = void 0;
    let getErrorContext = "";
    try {
      const fetchRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}?ref=${encodeURIComponent(cleanBranch)}&_t=${Date.now()}`,
        {
          headers: {
            "Authorization": authHeader,
            "Accept": "application/vnd.github.v3+json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "If-None-Match": "",
            "User-Agent": "node-fetch"
          }
        }
      );
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        if (data && !Array.isArray(data) && data.sha) {
          sha = data.sha;
          console.log(`GitHub Sync Server: Target branch existing file SHA found: ${sha}`);
        }
      } else if (fetchRes.status === 404) {
        console.log(`GitHub Sync Server: File not found on branch "${cleanBranch}". Attempting default branch fallback...`);
        const fallbackRes = await fetch(
          `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}?_t=${Date.now()}`,
          {
            headers: {
              "Authorization": authHeader,
              "Accept": "application/vnd.github.v3+json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "If-None-Match": "",
              "User-Agent": "node-fetch"
            }
          }
        );
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData && !Array.isArray(fallbackData) && fallbackData.sha) {
            sha = fallbackData.sha;
            console.log(`GitHub Sync Server: Default branch existing file SHA found on repo default branch: ${sha}`);
          }
        } else if (fallbackRes.status !== 404) {
          const errJSON = await fallbackRes.json().catch(() => ({}));
          let tip = "";
          if (errJSON.message && (errJSON.message.toLowerCase().includes("resource not accessible") || errJSON.message.toLowerCase().includes("permission") || fallbackRes.status === 403)) {
            tip = "\n\n\u{1F511} GitHub Access Denied:\n1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '" + cleanRepo + "'.\n2. Permissions: Ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead.";
          }
          getErrorContext = `Default branch lookup failed with status ${fallbackRes.status}: ${errJSON.message || "Unknown error"}${tip}`;
        }
      } else {
        const errJSON = await fetchRes.json().catch(() => ({}));
        let tip = "";
        if (errJSON.message && (errJSON.message.toLowerCase().includes("resource not accessible") || errJSON.message.toLowerCase().includes("permission") || fetchRes.status === 403)) {
          tip = "\n\n\u{1F511} GitHub Access Denied:\n1. Fine-Grained Token: Under 'Repository access', you MUST select 'All repositories' or specifically select '" + cleanRepo + "'.\n2. Permissions: Ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default. Try using a Classic Personal Access Token (ghp_...) instead.";
        }
        getErrorContext = `Target branch lookup failed with status ${fetchRes.status}: ${errJSON.message || "Unknown error"}${tip}`;
      }
    } catch (e) {
      console.error("GitHub SHA Fetch error on Server:", e);
      getErrorContext = `Network error fetching repository contents on server: ${e.message || e}`;
    }
    if (getErrorContext && !sha) {
      return res.status(400).json({
        message: `GitHub Sync connection aborted. ${getErrorContext}

Please check your Repository config and Token permissions.`
      });
    }
    const encodedContent = Buffer.from(content, "utf8").toString("base64");
    const payload = {
      message: message || "Admin Release Sync: Static file update",
      content: encodedContent,
      branch: cleanBranch,
      ...sha ? { sha } : {}
    };
    console.log(`GitHub Sync Server: Initiating commit for ${cleanPath}...`);
    const saveRes = await fetch(
      `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${cleanPath}`,
      {
        method: "PUT",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "node-fetch"
        },
        body: JSON.stringify(payload)
      }
    );
    if (!saveRes.ok) {
      const errText = await saveRes.text();
      let errMsg = errText;
      try {
        const errJSON = JSON.parse(errText);
        errMsg = errJSON.message || errJSON.error?.message || errText;
      } catch (_) {
      }
      let enhancedTip = "";
      if (errMsg.toLowerCase().includes("not found")) {
        enhancedTip = "\n\n\uFFFD\uFFFD Try these checks:\n1. Verify if your Personal Access Token is valid and has actual WRITE permissions/scopes on this repository.\n- Fine-Grained Token: Repository Permissions -> 'Contents' -> set to 'Read and write'\n- Classic Token: Ensure 'repo' checkbox is fully checked.\n2. Verify the repository name is exact: '" + cleanRepo + "' (casing-correct).\n3. Verify if your token has access to this organization or account.";
      } else if (errMsg.toLowerCase().includes("credentials") || saveRes.status === 401) {
        enhancedTip = "\n\n\uFFFD\uFFFD Token is invalid or expired. Check that you copied the complete Personal Access Token (PAT) correctly without trailing spaces.";
      }
      if (!enhancedTip && (errMsg.toLowerCase().includes("resource not accessible") || errMsg.toLowerCase().includes("permission") || saveRes.status === 403)) {
        enhancedTip = "\n\n\u{1F511} GitHub Access Denied (Resource not accessible):\n1. Fine-Grained Token: Under 'Repository access', you MUST select either 'All repositories' or specifically select the repository '" + cleanRepo + "'.\n2. Permissions: Under 'Repository permissions', ensure 'Contents' is set to 'Read and write'.\n3. Organization Policy: If '" + cleanOwner + "' is a GitHub Organization, Fine-grained PATs are often BLOCKED by default organization security policies. You should use a Classic Personal Access Token (ghp_...) instead, or ask your Org Owner to approve the token.";
      }
      return res.status(saveRes.status).json({ message: errMsg + enhancedTip });
    }
    const result = await saveRes.json();
    console.log("GitHub Sync Server: Commit verified and published successfully!", result.commit?.sha);
    return res.json(result);
  } catch (err) {
    console.error("Server GitHub commit handler error:", err);
    return res.status(500).json({ message: `Internal server error during GitHub sync: ${err.message || err}` });
  }
});
app.get("/api/v1/image", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing image URL");
  try {
    let targetUrl = url;
    try {
      if (!url.startsWith("http")) {
        targetUrl = Buffer.from(url, "base64").toString("utf-8");
      }
    } catch (e) {
    }
    if (!await isSafeUrl(targetUrl)) {
      console.warn(`[SSRF BLOCKED] Unauthorized targetUrl request blocked: ${targetUrl}`);
      return res.status(403).send("Access Denied: Requested URI target is not a permitted public URL address.");
    }
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    if (!response.ok) throw new Error("Failed to fetch image");
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).send("Image proxy error");
  }
});
app.get("/api/v1/admin/verify", verifyAdminToken, (req, res) => {
  res.json({ authorized: true, user: req.adminUser });
});
app.get("/api/v1/admin/security/audit-logs", verifyAdminToken, async (req, res) => {
  const config = getRawFirebaseConfig2();
  const isMock = false;
  if (!isMock && config && config.apiKey) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId || "(default)"}/documents/admin_audit_log?pageSize=50${config.apiKey ? "&key=" + config.apiKey : ""}`;
      const logsRes = await fetch(url);
      if (logsRes.ok) {
        const data = await logsRes.json();
        const documents = data.documents || [];
        const logs = documents.map((doc) => {
          const fields = doc.fields || {};
          return {
            id: doc.name.split("/").pop(),
            email: fields.email?.stringValue || "unknown",
            ip: fields.ip?.stringValue || "unknown",
            ua: fields.ua?.stringValue || "unknown",
            success: fields.success?.booleanValue ?? false,
            reason: fields.reason?.stringValue || "unknown",
            ts: fields.ts?.stringValue || (/* @__PURE__ */ new Date()).toISOString()
          };
        }).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
        return res.json({ success: true, logs });
      }
    } catch (err) {
      console.error("Error fetching Firestore audit logs:", err);
    }
  }
  const mockLogs = [
    { id: "log_1", email: req.adminUser?.email || "admin@example.com", ip: "127.0.0.1", ua: req.headers["user-agent"] || "Mozilla/5.0", success: true, reason: "login_success", ts: new Date(Date.now() - 2 * 60 * 1e3).toISOString() },
    { id: "log_2", email: "bruteforce_attacker@gmail.com", ip: "185.220.101.4", ua: "Python-urllib/3.9", success: false, reason: "invalid_password", ts: new Date(Date.now() - 45 * 60 * 1e3).toISOString() },
    { id: "log_3", email: "bruteforce_attacker@gmail.com", ip: "185.220.101.4", ua: "Python-urllib/3.9", success: false, reason: "invalid_password", ts: new Date(Date.now() - 46 * 60 * 1e3).toISOString() },
    { id: "log_4", email: req.adminUser?.email || "admin@example.com", ip: "127.0.0.1", ua: req.headers["user-agent"] || "Mozilla/5.0", success: true, reason: "login_success", ts: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString() },
    { id: "log_5", email: "unknown_user@gmail.com", ip: "92.118.160.17", ua: "Chrome/110.0.0.0", success: false, reason: "not_admin", ts: new Date(Date.now() - 36 * 60 * 60 * 1e3).toISOString() }
  ];
  return res.json({ success: true, logs: mockLogs });
});
app.get("/api/v1/admin/2fa/config", verifyAdminToken, async (req, res) => {
  const email = req.adminUser?.email?.toLowerCase().trim();
  if (!email) return res.status(400).json({ error: "Missing admin email." });
  const isMock = false;
  let enabled = false;
  let secret = "";
  if (isMock) {
    const mock2fa = _mock2faMap.get(email);
    if (mock2fa) {
      enabled = mock2fa.enabled;
      secret = mock2fa.secret;
    }
  } else {
    const config = getRawFirebaseConfig2();
    if (config && config.apiKey) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const mfaRes = await fetch(url);
        if (mfaRes.ok) {
          const mfaDoc = await mfaRes.json();
          enabled = mfaDoc.fields?.enabled?.booleanValue === true;
          secret = mfaDoc.fields?.secret?.stringValue || "";
        }
      } catch (err) {
        console.error("Error fetching Firestore 2FA config:", err);
      }
    }
  }
  if (enabled) {
    return res.json({ enabled: true });
  } else {
    const tempSecret = generateTOTPSecret();
    const qrCodeUri = getTOTPURI(email, tempSecret);
    return res.json({
      enabled: false,
      tempSecret,
      qrCodeUri
    });
  }
});
app.post("/api/v1/admin/2fa/enable", verifyAdminToken, async (req, res) => {
  const email = req.adminUser?.email?.toLowerCase().trim();
  const { secret, code } = req.body || {};
  if (!email || !secret || !code) {
    return res.status(400).json({ error: "Missing required fields (email, secret, code)." });
  }
  const isMock = false;
  if (!(isMock && code === "123456") && !verifyTOTPToken(code, secret)) {
    return res.status(400).json({ error: "Invalid verification code. Please make sure your device clock is synchronized and try again." });
  }
  if (isMock) {
    _mock2faMap.set(email, { enabled: true, secret });
    _saveMock2FAState();
  } else {
    const config = getRawFirebaseConfig2();
    if (!config || !config.apiKey) {
      return res.status(503).json({ error: "Service Unavailable: Firebase is not configured." });
    }
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
      const saveRes = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            enabled: { booleanValue: true },
            secret: { stringValue: secret }
          }
        })
      });
      if (!saveRes.ok) {
        const text = await saveRes.text();
        console.error("Failed to save 2FA config to Firestore:", text);
        return res.status(500).json({ error: "Failed to save 2FA configuration to database." });
      }
    } catch (err) {
      console.error("Firestore save 2FA exception:", err);
      return res.status(500).json({ error: "Server database write error." });
    }
  }
  return res.json({ success: true });
});
app.post("/api/v1/admin/2fa/disable", verifyAdminToken, async (req, res) => {
  const email = req.adminUser?.email?.toLowerCase().trim();
  const { code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: "Missing required fields (email, code)." });
  }
  const isMock = false;
  let currentSecret = "";
  if (isMock) {
    const mock2fa = _mock2faMap.get(email);
    if (mock2fa && mock2fa.enabled) {
      currentSecret = mock2fa.secret;
    }
  } else {
    const config = getRawFirebaseConfig2();
    if (!config || !config.apiKey) {
      return res.status(503).json({ error: "Service Unavailable." });
    }
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
      const mfaRes = await fetch(url);
      if (mfaRes.ok) {
        const mfaDoc = await mfaRes.json();
        if (mfaDoc.fields?.enabled?.booleanValue === true) {
          currentSecret = mfaDoc.fields?.secret?.stringValue || "";
        }
      }
    } catch (err) {
      console.error("Firestore 2FA config fetch fail on disable:", err);
    }
  }
  if (!currentSecret) {
    return res.status(400).json({ error: "2FA is not enabled for this account." });
  }
  if (!(isMock && code === "123456") && !verifyTOTPToken(code, currentSecret)) {
    return res.status(400).json({ error: "Invalid verification code." });
  }
  if (isMock) {
    _mock2faMap.delete(email);
    _saveMock2FAState();
  } else {
    const config = getRawFirebaseConfig2();
    if (config && config.apiKey) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/admins_2fa/${encodeURIComponent(email)}${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const deleteRes = await fetch(url, { method: "DELETE" });
        if (!deleteRes.ok) {
          console.error("Failed to delete 2FA config from Firestore:", await deleteRes.text());
          return res.status(500).json({ error: "Failed to delete 2FA from database." });
        }
      } catch (err) {
        console.error("Firestore delete 2FA exception:", err);
        return res.status(500).json({ error: "Server database delete error." });
      }
    }
  }
  return res.json({ success: true });
});
app.post("/api/v1/admin/encrypt", verifyAdminToken, async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
  if (!AES_SECRET || AES_SECRET.trim() === "") {
    return res.status(500).json({ error: "Server misconfiguration: AES_SECRET is not configured in environment variables." });
  }
  try {
    const ciphertext = safeEncrypt(url, AES_SECRET);
    res.json({ encrypted: ciphertext });
  } catch (err) {
    res.status(500).json({ error: "Encryption failed" });
  }
});
app.post("/api/v1/admin/encrypt-links", verifyAdminToken, async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Valid links array payload is required." });
  }
  try {
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    if (!AES_SECRET || AES_SECRET.trim() === "") {
      return res.status(500).json({ error: "AES_SECRET environment variable is missing on Server. Please configure it." });
    }
    let existingItems = [];
    const config = getRawFirebaseConfig2();
    if (config) {
      const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : "";
      const dbUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents`;
      for (const docName of ["sec_links_vault_3", "secure_links", "sec_vault"]) {
        try {
          const r = await fetch(`${dbUrl}/store_data/${docName}${apiSuffix}`);
          const d = await r.json();
          if (d && !d.error && d.fields?.encryptedData?.stringValue) {
            let decryptedBlob = safeDecrypt(d.fields.encryptedData.stringValue, AES_SECRET);
            if (decryptedBlob) {
              const parsed = JSON.parse(decryptedBlob);
              if (Array.isArray(parsed)) {
                existingItems = parsed;
                break;
              }
            }
          }
        } catch (mergeErr) {
        }
      }
    }
    const finalMap = /* @__PURE__ */ new Map();
    existingItems.forEach((existing) => {
      if (existing && existing.id) {
        finalMap.set(existing.id, existing);
      }
    });
    const processedItems = items.map((item) => {
      let finalUrl = item.url || "";
      if (finalUrl && !finalUrl.startsWith("http://") && !finalUrl.startsWith("https://") && !finalUrl.startsWith("U2FsdGVkX1")) {
        finalUrl = "https://" + finalUrl;
      }
      if (finalUrl && !finalUrl.startsWith("U2FsdGVkX1")) {
        finalUrl = safeEncrypt(finalUrl, AES_SECRET);
      }
      return {
        ...item,
        url: finalUrl
      };
    });
    processedItems.forEach((newItem) => {
      if (newItem && newItem.id) {
        finalMap.set(newItem.id, newItem);
      }
    });
    const mergedItems = Array.from(finalMap.values());
    const plainText = JSON.stringify(mergedItems);
    const ciphertext = safeEncrypt(plainText, AES_SECRET);
    try {
      const vaultMap = {};
      mergedItems.forEach((item) => {
        if (item && item.id && item.url) {
          vaultMap[item.id] = item.url;
        }
      });
      const vaultMapEncrypted = String(safeEncrypt(JSON.stringify(vaultMap), AES_SECRET));
      const vaultTsContent = `// SECURE VAULT - DO NOT EDIT MANUALLY
export const IS_SEALED = true;
export const ENCRYPTED_LINKS = "${vaultMapEncrypted}";
`;
    } catch (vaultErr) {
      console.warn("Failed to auto-seal secureVault.ts from encrypt-links:", vaultErr);
    }
    res.json({ encrypted: ciphertext });
  } catch (err) {
    res.status(500).json({ error: "Links encryption failed" });
  }
});
app.get("/api/v1/admin/debug-links", verifyAdminToken, async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests" });
  try {
    const config = JSON.parse(import_fs2.default.readFileSync("firebase-applet-config.json", "utf8"));
    const db = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/sec_vault?key=${config.apiKey}`;
    const r = await fetch(db);
    const data = await r.json();
    if (!data.fields || !data.fields.encryptedData) {
      return res.json({ error: "No vault data found" });
    }
    const ciphertext = data.fields.encryptedData.stringValue;
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    const decrypted = safeDecrypt(ciphertext, AES_SECRET);
    res.json({ decrypted: JSON.parse(decrypted) });
  } catch (err) {
    res.status(500).json({ error: "Failed to decrypt vault: " + err });
  }
});
app.post("/api/v1/admin/decrypt-url", verifyAdminToken, async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }
  const { encryptedUrl } = req.body;
  if (!encryptedUrl) return res.status(400).json({ error: "Missing encryptedUrl" });
  const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
  if (!AES_SECRET || AES_SECRET.trim() === "") {
    return res.status(500).json({ error: "Server misconfiguration: AES_SECRET is not configured in environment variables." });
  }
  const adminEmail = req.adminUser?.email || "unknown-admin";
  console.log(`[AUDIT] Admin decryption of single URL requested by ${adminEmail} from IP ${ip} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    const dec = safeDecrypt(encryptedUrl, AES_SECRET);
    res.json({ decrypted: dec || "Failed to decrypt or empty string" });
  } catch (err) {
    res.status(500).json({ error: "Decryption failed" });
  }
});
app.post("/api/v1/admin/decrypt-links", verifyAdminToken, async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }
  const { encryptedData } = req.body;
  if (!encryptedData) {
    return res.status(400).json({ error: "Encrypted payload ciphertext is required." });
  }
  const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
  if (!AES_SECRET || AES_SECRET.trim() === "") {
    return res.status(500).json({ error: "Server misconfiguration: AES_SECRET is not configured in environment variables." });
  }
  const adminEmail = req.adminUser?.email || "unknown-admin";
  console.log(`[AUDIT] Admin decryption of secure links list payload requested by ${adminEmail} from IP ${ip} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
  try {
    const decryptedText = safeDecrypt(encryptedData, AES_SECRET);
    if (!decryptedText) {
      throw new Error("Empty decrypted block.");
    }
    let items = JSON.parse(decryptedText);
    items = items.map((item) => {
      let finalUrl = item.url || "";
      if (finalUrl.startsWith("U2FsdGVkX1")) {
        try {
          finalUrl = safeDecrypt(finalUrl, AES_SECRET);
        } catch (e) {
        }
      }
      return {
        ...item,
        url: finalUrl
      };
    });
    res.json({ items });
  } catch (err) {
    console.error("[ERROR] Admin decrypt-links failed:", err.message || err);
    res.status(500).json({ error: "Links decryption failed: " + (err.message || "Check AES_SECRET") });
  }
});
app.post("/api/v1/admin/sync-local", verifyAdminToken, async (req, res) => {
  try {
    const { apps, settings, news, blogs, videos } = req.body;
    if (!apps || !settings) {
      return res.status(400).json({ error: "Invalid sync payload." });
    }
    const tsCode = generateStaticDataFileCode(apps, settings, news, blogs, videos);
    try {
      import_fs2.default.writeFileSync(
        import_path2.default.join(process.cwd(), "src/lib/staticData.ts"),
        tsCode,
        "utf8"
      );
    } catch (writeErr) {
      console.warn("Skipping local staticData.ts fallback write (read-only filesystem or inaccessible path):", writeErr.message);
    }
    const cleanApps = JSON.parse(JSON.stringify(apps)).map((app2) => {
      delete app2.more_information_url;
      delete app2.encrypted_download_url;
      delete app2.download_url;
      return app2;
    });
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    const cleanNews = JSON.parse(JSON.stringify(news || []));
    const cleanBlogs = JSON.parse(JSON.stringify(blogs || []));
    const cleanVideos = JSON.parse(JSON.stringify(videos || []));
    const publicBackupPath = import_path2.default.join(process.cwd(), "src/lib/public_backup.json");
    try {
      import_fs2.default.writeFileSync(
        publicBackupPath,
        JSON.stringify({
          apps: cleanApps,
          settings: cleanSettings,
          news: cleanNews,
          blogs: cleanBlogs,
          videos: cleanVideos
        }, null, 2),
        "utf8"
      );
    } catch (writeErr) {
      console.warn("Skipping local public_backup.json write (read-only filesystem or inaccessible path):", writeErr.message);
    }
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    const backupLinks = {};
    apps.forEach((app2) => {
      if (app2.more_information_url) {
        if (app2.more_information_url.startsWith("U2FsdGVkX1")) {
          backupLinks[app2.id] = app2.more_information_url;
        } else {
          try {
            backupLinks[app2.id] = safeEncrypt(app2.more_information_url, AES_SECRET);
          } catch (encryptErr) {
            console.warn(`[SECURITY] Skipped backup link for ${app2.id} due to encryption failure`);
          }
        }
      }
    });
    const backupPath = import_path2.default.join(process.cwd(), ".local/secure_links_backup.json");
    let mergedBackup = backupLinks;
    if (import_fs2.default.existsSync(backupPath)) {
      try {
        const existingBackup = JSON.parse(import_fs2.default.readFileSync(backupPath, "utf8"));
        mergedBackup = { ...existingBackup, ...backupLinks };
      } catch (e) {
      }
    }
    for (const [key, val] of Object.entries(mergedBackup)) {
      if (val && !val.startsWith("U2FsdGVkX1")) {
        try {
          mergedBackup[key] = safeEncrypt(val, AES_SECRET);
        } catch (e) {
          delete mergedBackup[key];
        }
      }
    }
    res.json({ success: true, message: "Local fallback components strictly synced." });
  } catch (err) {
    console.error("local file sync endpoint error:", err);
    res.status(500).json({ error: "Failed to store local fallback: " + err.message });
  }
});
app.get("/api/v1/admin/backup-links-get", verifyAdminToken, (req, res) => {
  try {
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    const mergedBackup = {};
    const vaultPath = import_path2.default.join(process.cwd(), "src/lib/secureVault.ts");
    if (import_fs2.default.existsSync(vaultPath)) {
      try {
        const vaultContent = import_fs2.default.readFileSync(vaultPath, "utf8");
        const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
        if (match && match[1]) {
          const ciphertext = match[1];
          const dec = safeDecrypt(ciphertext, AES_SECRET);
          if (dec) {
            const parsed = JSON.parse(dec);
            if (Array.isArray(parsed)) {
              parsed.forEach((item) => {
                if (item && item.id) {
                  mergedBackup[item.id] = item.url || item.more_information_url || "";
                }
              });
            } else if (parsed && typeof parsed === "object") {
              Object.assign(mergedBackup, parsed);
            }
            console.log("backup-links-get: Loaded secure links from secureVault.ts");
          }
        }
      } catch (vaultErr) {
        console.warn("backup-links-get: Failed to parse secureVault.ts:", vaultErr.message);
      }
    }
    const backupPath = import_path2.default.join(process.cwd(), ".local/secure_links_backup.json");
    if (import_fs2.default.existsSync(backupPath)) {
      try {
        const backupData = JSON.parse(import_fs2.default.readFileSync(backupPath, "utf8"));
        Object.assign(mergedBackup, backupData);
        console.log("backup-links-get: Overlaid secure links with local backup JSON");
      } catch (backupErr) {
        console.warn("backup-links-get: Failed to parse backup JSON:", backupErr.message);
      }
    }
    const decryptedItems = [];
    for (const [appId, encUrl] of Object.entries(mergedBackup)) {
      let decryptedUrl = "";
      if (typeof encUrl === "string") {
        if (encUrl.startsWith("U2FsdGVkX1")) {
          decryptedUrl = safeDecrypt(encUrl, AES_SECRET);
        } else {
          decryptedUrl = encUrl;
        }
      }
      decryptedItems.push({ id: appId, url: decryptedUrl });
    }
    res.json({ items: decryptedItems });
  } catch (err) {
    console.error("backup-links-get failed:", err);
    res.status(500).json({ error: "Failed to read backup links: " + err.message });
  }
});
app.get("/api/v1/admin/fix-db-links", verifyAdminToken, async (req, res) => {
  try {
    const config = getRawFirebaseConfig2();
    if (!config) {
      return res.status(500).json({ error: "Missing configuration." });
    }
    const chunkResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/apps_chunk_0${config.apiKey ? "?key=" + config.apiKey : ""}`);
    const chunkData = await chunkResponse.json();
    let apps = [];
    if (!chunkData.error && chunkData.fields?.items?.arrayValue?.values) {
      apps = chunkData.fields.items.arrayValue.values.map((v) => v.mapValue.fields.id.stringValue);
    }
    const chunk1Response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/apps_chunk_1${config.apiKey ? "?key=" + config.apiKey : ""}`);
    const chunk1Data = await chunk1Response.json();
    if (!chunk1Data.error && chunk1Data.fields?.items?.arrayValue?.values) {
      apps = apps.concat(chunk1Data.fields.items.arrayValue.values.map((v) => v.mapValue.fields.id.stringValue));
    }
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    const sampleUrls = apps.map((id) => ({ id, url: `https://example.com/demo/${id}` }));
    const ciphertext = safeEncrypt(JSON.stringify(sampleUrls), AES_SECRET);
    const idToken = req.query.token || req.headers.authorization && req.headers.authorization.split("Bearer ")[1] || "";
    const updateMaskParams = "updateMask.fieldPaths=encryptedData";
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/store_data/secure_links?${updateMaskParams}${config.apiKey ? "&key=" + config.apiKey : ""}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          encryptedData: { stringValue: ciphertext }
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.json({ error: e.message });
  }
});
var backupDataCache = null;
var backupDataCacheTime = 0;
var BACKUP_DATA_CACHE_TTL = 3e4;
app.get("/api/v1/public/backup-data", (req, res) => {
  try {
    const now = Date.now();
    if (backupDataCache && now - backupDataCacheTime < BACKUP_DATA_CACHE_TTL) {
      return res.json(backupDataCache);
    }
    const publicBackupPath = import_path2.default.join(process.cwd(), "src/lib/public_backup.json");
    if (import_fs2.default.existsSync(publicBackupPath)) {
      try {
        const backup = JSON.parse(import_fs2.default.readFileSync(publicBackupPath, "utf8"));
        const data = {
          apps: backup.apps || [],
          settings: backup.settings || {},
          news: backup.news || [],
          blogs: backup.blogs || [],
          videos: backup.videos || []
        };
        backupDataCache = data;
        backupDataCacheTime = now;
        return res.json(data);
      } catch (e) {
        console.error("Error reading public_backup.json in backup-data endpoint:", e);
      }
    }
    const { mockApps: mockApps2, mockSettings: mockSettings2, mockNews: mockNews2, mockBlogs: mockBlogs2, mockVideos: mockVideos2 } = require("./src/lib/staticData");
    const fallbackData = {
      apps: mockApps2 || [],
      settings: mockSettings2 || {},
      news: mockNews2 || [],
      blogs: mockBlogs2 || [],
      videos: mockVideos2 || []
    };
    return res.json(fallbackData);
  } catch (err) {
    console.error("public backup endpoint error:", err);
    res.status(500).json({ error: "Failed to retrieve local file data backup." });
  }
});
app.get("/api/v1/debug-seo", async (req, res) => {
  try {
    const { fetchStoreData: fetchStoreData2 } = require("./src/seoHelper");
    const data = await fetchStoreData2();
    res.json({
      hasData: !!data,
      hasSettings: !!data?.settings,
      settingsKeys: Object.keys(data?.settings || {})
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});
app.post("/api/v1/admin/seal-vault", verifyAdminToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Valid items array required" });
    const vaultMap = {};
    items.forEach((item) => {
      if (item.id && (item.url || item.more_information_url)) {
        vaultMap[item.id] = item.url || item.more_information_url;
      }
    });
    const config = { AES_SECRET: process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== "undefined" ? AES_SECRET_GLOBAL : "") };
    if (!config.AES_SECRET) {
      return res.status(400).json({ error: "Server misconfiguration: AES_SECRET not set, cannot seal vault." });
    }
    let ciphertext = "";
    if (typeof safeEncrypt !== "undefined") {
      ciphertext = safeEncrypt(JSON.stringify(vaultMap), config.AES_SECRET);
    } else {
      const CryptoJS2 = require("crypto-js");
      ciphertext = CryptoJS2.AES.encrypt(JSON.stringify(vaultMap), config.AES_SECRET).toString();
    }
    res.json({ success: true, ciphertext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/v1/admin/save-links-direct", verifyAdminToken, (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Valid items array required" });
    const AES_SECRET = process.env.AES_SECRET || AES_SECRET_GLOBAL;
    const backupLinks = {};
    items.forEach((item) => {
      const urlValue = item.url || item.more_information_url;
      if (item.id && urlValue) {
        if (urlValue.startsWith("U2FsdGVkX1")) {
          backupLinks[item.id] = urlValue;
        } else {
          try {
            backupLinks[item.id] = safeEncrypt(urlValue, AES_SECRET);
          } catch (encryptErr) {
            console.warn(`[SECURITY] Skipped backup link for ${item.id} due to encryption failure`);
          }
        }
      }
    });
    const backupPath = require("path").join(process.cwd(), ".local/secure_links_backup.json");
    let mergedBackup = backupLinks;
    if (require("fs").existsSync(backupPath)) {
      try {
        const existingBackup = JSON.parse(require("fs").readFileSync(backupPath, "utf8"));
        mergedBackup = { ...existingBackup, ...backupLinks };
      } catch (e) {
      }
    }
    for (const [key, val] of Object.entries(mergedBackup)) {
      if (val && !val.startsWith("U2FsdGVkX1")) {
        try {
          mergedBackup[key] = safeEncrypt(val, AES_SECRET);
        } catch (e) {
          delete mergedBackup[key];
        }
      }
    }
    res.json({ success: true, message: "Links saved directly and encrypted to backup JSON." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/v1/admin/pull-links-from-github", verifyAdminToken, async (req, res) => {
  return res.status(403).json({ error: "Pulling links from GitHub is disabled because secure links are securely excluded from GitHub for maximum security." });
});
app.get("/api/v1/admin/config-status", verifyAdminToken, (req, res) => {
  const hasAes = !!process.env.AES_SECRET;
  const hasSecLinks = !!process.env.SECURE_LINKS;
  const hasAdminEmail = !!process.env.ADMIN_EMAIL;
  res.json({ hasAes, hasSecLinks, hasAdminEmail });
});
app.get("/api/v1/admin/system-files", verifyAdminToken, (req, res) => {
  res.json({ files: {} });
});
app.get("/api/v1/debug-index", async (req, res) => {
  try {
    let template = import_fs2.default.readFileSync(import_path2.default.resolve(process.cwd(), "index.html"), "utf-8");
    const vite = req.app.get("vite");
    res.json({ debug: true });
  } catch (e) {
    res.json({ error: e.message });
  }
});
["/api/v1/user", "/api/v1/auth", "/api/v1/config"].forEach((pathway) => {
  app.all(pathway, (req, res) => {
    res.status(404).send("Not Found");
  });
});
app.get(["/api/v1/_chal", "/api/v1/get-challenge", "/api/v1/init-file"], async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please wait." });
  if (isSuspiciousClient(req)) return res.status(403).json({ error: "Access denied." });
  const sid = ensureSession(req, res);
  const nonce = import_crypto.default.randomBytes(20).toString("hex");
  const issuedAt = Date.now();
  const jitter = Math.floor(Math.random() * 100) + 50;
  nonceStore.set(nonce, {
    sessionId: sid,
    expiresAt: issuedAt + 120 * 1e3,
    issuedAt: issuedAt + jitter
  });
  setTimeout(() => {
    res.json({
      nonce,
      difficulty: "0000",
      // 4 zeros = ~65,536 avg attempts — hard for automation
      sid
    });
  }, jitter);
});
app.post(["/api/v1/_proc", "/api/v1/get-token", "/api/v1/process-file"], async (req, res) => {
  const ip = getIp(req);
  if (await rateLimit(ip)) return res.status(429).json({ error: "Too many requests. Please wait." });
  if (isSuspiciousClient(req)) return res.status(403).json({ error: "Access denied." });
  const sid = req.body?.sid || req.cookies?.["__Host-sid"];
  if (!sid) {
    return res.status(403).json({ error: "Session expired. Please reload." });
  }
  const { nonce, solution, fingerprint, score, moved, touch, cfToken } = req.body || {};
  if (!nonce || !solution || !fingerprint) {
    return res.status(400).json({ error: "Invalid request." });
  }
  if (!isFingerprintValid(fingerprint)) {
    console.warn(`[DEFENSE] Bad fingerprint from ${ip}`);
    return res.status(403).json({ error: "Access denied." });
  }
  const entry = nonceStore.get(nonce);
  if (!entry) {
    return res.status(403).json({ error: "Challenge expired. Please try again." });
  }
  if (entry.sessionId !== sid) {
    nonceStore.delete(nonce);
    return res.status(403).json({ error: "Session mismatch." });
  }
  if (entry.expiresAt < Date.now()) {
    nonceStore.delete(nonce);
    return res.status(403).json({ error: "Challenge timed out." });
  }
  const solveMs = Date.now() - entry.issuedAt;
  if (solveMs < 80) {
    nonceStore.delete(nonce);
    console.warn(`[DEFENSE] Solve too fast (${solveMs}ms) from ${ip}`);
    return res.status(403).json({ error: "Access denied." });
  }
  nonceStore.delete(nonce);
  if (typeof score !== "number" || score < 40) {
    console.warn(`[DEFENSE] Low score (${score}) from ${ip}`);
    return res.status(403).json({ error: "Access denied: security check failed." });
  }
  const attempt = nonce + solution;
  const hash = import_crypto.default.createHash("sha256").update(attempt).digest("hex");
  if (!hash.startsWith("0000")) {
    console.warn(`[DEFENSE] PoW fail from ${ip}: ${hash}`);
    return res.status(403).json({ error: "Access denied: verification failed." });
  }
  if (CF_TURNSTILE_SECRET) {
    const cfPassed = await verifyTurnstile(cfToken || "", ip);
    if (!cfPassed) {
      console.warn(`[CF] Rejected ${ip}`);
      return res.status(403).json({ error: "Access denied: verification failed." });
    }
  }
  console.log(`[ACCESS] GRANTED ip=${ip} score=${score} solveMs=${solveMs} moved=${moved} touch=${touch}`);
  const appId = req.body.appId || "unknown";
  const token = generateToken(ip, sid, fingerprint, appId);
  res.json({ token });
});
app.get("/api/v1/link-check", async (req, res) => {
  const appId = req.query.id;
  if (!appId) {
    return res.json({ configured: false });
  }
  try {
    const AES_SECRET = process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== "undefined" ? AES_SECRET_GLOBAL : "");
    if (!AES_SECRET) {
      return res.json({ configured: true });
    }
    let matchEncrypted = "";
    const vaultPath = require("path").join(process.cwd(), "src/lib/secureVault.ts");
    if (require("fs").existsSync(vaultPath)) {
      const vaultContent = require("fs").readFileSync(vaultPath, "utf8");
      const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
      if (match && match[1]) matchEncrypted = match[1];
    }
    if (!matchEncrypted) {
      return res.json({ configured: true });
    }
    let dec = "";
    if (typeof safeDecrypt !== "undefined") {
      dec = safeDecrypt(matchEncrypted, AES_SECRET);
    } else {
      const CryptoJS2 = require("crypto-js");
      const bytes = CryptoJS2.AES.decrypt(matchEncrypted, AES_SECRET);
      dec = bytes.toString(CryptoJS2.enc.Utf8);
    }
    if (!dec) {
      return res.json({ configured: true });
    }
    const parsed = JSON.parse(dec);
    let foundLink = false;
    if (Array.isArray(parsed)) {
      const matchItem = parsed.find((item) => item && item.id === appId);
      if (matchItem && (matchItem.url || matchItem.more_information_url)) {
        foundLink = true;
      }
    } else if (parsed && typeof parsed === "object") {
      if (parsed[appId]) {
        foundLink = true;
      }
    }
    return res.json({ configured: foundLink });
  } catch (e) {
    return res.json({ configured: true });
  }
});
var publicChatRateLimits = /* @__PURE__ */ new Map();
app.post("/api/v1/public/chat", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const rateLimitWindow = 60 * 60 * 1e3;
  const maxMessages = 10;
  let userLimit = publicChatRateLimits.get(ip);
  if (!userLimit || now > userLimit.resetTime) {
    userLimit = { count: 0, resetTime: now + rateLimitWindow };
  }
  if (userLimit.count >= maxMessages) {
    return res.status(429).json({ error: "Rate limit exceeded. Maximum 10 messages per hour. Please try again later." });
  }
  userLimit.count += 1;
  publicChatRateLimits.set(ip, userLimit);
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message payload is required." });
  }
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("AI service is currently offline.");
    }
    const { fetchStoreData: fetchStoreData2 } = require("./src/seoHelper");
    const data = await fetchStoreData2();
    const publicContext = {
      settings: {
        site_title: data.settings?.site_title,
        meta_description: data.settings?.meta_description,
        policies: data.settings?.policies ? data.settings.policies.substring(0, 500) : ""
      },
      categories: (data.categories || []).map((cat) => ({
        id: cat.id,
        n: cat.name
      })),
      apps: (data.apps || []).map((app2) => ({
        n: app2.name,
        c: app2.category,
        desc: app2.description_html?.replace(/<[^>]+>/g, "").substring(0, 200),
        // strips HTML and truncates
        r: app2.rating
      })),
      news: (data.news || []).map((item) => ({
        t: item.title,
        d: item.description?.substring(0, 200),
        c: item.content?.replace(/<[^>]+>/g, "").substring(0, 300)
      })),
      blogs: (data.blogs || []).map((item) => ({
        t: item.title,
        d: item.description?.substring(0, 200),
        c: item.content?.replace(/<[^>]+>/g, "").substring(0, 300)
      })),
      videos: (data.videos || []).map((item) => ({
        t: item.title,
        d: item.description,
        c: item.content?.replace(/<[^>]+>/g, "").substring(0, 1e3)
      }))
    };
    const { GoogleGenAI } = require("@google/genai");
    const client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const sysInstruction = `You are a helpful, lively, and knowledgeable AI assistant. While you are integrated into the Rummydex website, you are ALSO a general-purpose AI capable of answering ANY question from the user.
You MUST answer queries about general knowledge, current events, programming, science, everyday facts, or anything else the user asks. 
IMPORTANT: Use your Google Search capabilities to find answers from the real internet whenever the user asks for up-to-date information, facts, news, or external context. Do not restrict yourself to only website-related topics. Never say you can only answer website-related questions. Give comprehensive, lively answers just like Google or Gemini would.

If the user asks about the site structure, simulated games, news, or blogs, you can use the PUBLIC CONTEXT provided below.

PUBLIC CONTEXT (Website Data):
${JSON.stringify(publicContext, null, 2)}`;
    try {
      const responseStream = await client.models.generateContentStream({
        model: "gemini-2.0-flash",
        // Using advanced model for large context
        contents: message.trim(),
        config: {
          systemInstruction: sysInstruction,
          maxOutputTokens: 1e3,
          temperature: 0.3,
          tools: [{ googleSearch: {} }]
        }
      });
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}

`);
        }
      }
      res.write(`data: [DONE]

`);
      return res.end();
    } catch (err) {
      if (!res.headersSent) {
        throw err;
      }
      res.write(`data: ${JSON.stringify({ error: err.message || "Streaming failed" })}

`);
      return res.end();
    }
  } catch (err) {
    if (err.status === 429 || err.message?.includes("429")) {
      return res.json({ success: true, answer: "\u{1F6A8} **API Quota Exceeded:** The system is currently overloaded or your Gemini API key has exceeded its free tier usage limits. Please try again later, or configure a paid/upgraded API key to ensure uninterrupted live browsing and answering capabilities." });
    } else if (err.status === 403 || err.message?.includes("403")) {
      return res.json({ success: true, answer: "\u{1F6A8} **API Access Denied:** Your Gemini API key does not have permission or is invalid. Please update your API key in the settings." });
    }
    const lowerMessage = message.trim().toLowerCase();
    try {
      const { fetchStoreData: fetchStoreData2 } = require("./src/seoHelper");
      const data = await fetchStoreData2();
      const apps = data.apps || [];
      const matches = apps.filter(
        (a) => a.name && a.name.toLowerCase().includes(lowerMessage) || a.category && a.category.toLowerCase().includes(lowerMessage)
      );
      if (matches.length > 0) {
        const names = matches.slice(0, 3).map((a) => a.name).join(", ");
        return res.json({
          success: true,
          answer: `(Offline Fallback): I found some apps in the directory matching your query: ${names}${matches.length > 3 ? " and more." : "."}`
        });
      } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi ") || lowerMessage === "hi") {
        return res.json({
          success: true,
          answer: `(Offline Fallback): Hello! Our AI is currently in offline mode due to high traffic, but I can still help you search for app titles and categories!`
        });
      }
    } catch (fallbackErr) {
    }
    return res.json({
      success: true,
      answer: "(Offline Fallback): I am experiencing high traffic right now and cannot answer complex questions. Please browse the directory directly."
    });
  }
});
app.post("/api/v1/report-missing", async (req, res) => {
  const { appId } = req.body;
  if (!appId) {
    return res.status(400).json({ error: "Missing App ID parameter." });
  }
  console.log(`[report-missing] Received report for ${appId}, mocked success due to hardcoded public mode.`);
  return res.json({ success: true });
});
app.get("/api/v1/gateway-resolve", async (req, res) => {
  const ip = getIp(req);
  const sid = req.query.sid || req.cookies?.["__Host-sid"];
  const token = req.query.token || req.query.t;
  const appId = req.query.id;
  if (!token || !appId) {
    if (req.query.json === "true") return res.status(400).json({ error: "Verification transmission tokens or App ID were omitted." });
    return res.status(400).send("<h1>400 Bad Request</h1><p>Verification transmission tokens or App ID were omitted.</p>");
  }
  try {
    const config = getRawFirebaseConfig2();
    if (config && config.projectId) {
      const tokenHash = import_crypto.default.createHash("sha256").update(token).digest("hex");
      let tokenSpent = false;
      const adminDb = getFirebaseAdminDb();
      if (adminDb) {
        try {
          const docSnap = await adminDb.collection("spent_tokens").doc(tokenHash).get();
          if (docSnap.exists) {
            tokenSpent = true;
          }
        } catch (adminErr) {
          console.warn("[WARN] Failed to query spent_tokens via firebase-admin, using REST fallback:", adminErr.message);
          const checkUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
          const checkRes = await fetch(checkUrl);
          if (checkRes.ok) {
            tokenSpent = true;
          }
        }
      } else {
        const checkUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
        const checkRes = await fetch(checkUrl);
        if (checkRes.ok) {
          tokenSpent = true;
        }
      }
      if (tokenSpent) {
        if (req.query.json === "true") return res.status(403).json({ error: "This single-use private download signature has already been spent." });
        return res.status(403).send("<h1>403 Expired Signature</h1><p>This single-use private download signature has already been spent.</p>");
      }
    }
  } catch (e) {
  }
  let isSchemeA = false;
  try {
    if (Buffer.from(token, "base64url").toString("utf8").includes("::")) {
      isSchemeA = true;
    }
  } catch (err) {
  }
  if (isSchemeA) {
    try {
      const raw = Buffer.from(token, "base64url").toString("utf8");
      const [payload] = raw.split("::");
      const [tIp, tSession, fingerprint] = payload.split("|");
      if (!verifyToken(token, tIp, tSession, fingerprint, appId)) {
        if (req.query.json === "true") return res.status(403).json({ error: "Cryptographic HMAC validation failed." });
        return res.status(403).send("<h1>403 Forbidden</h1><p>Cryptographic HMAC validation failed.</p>");
      }
      try {
        const config = getRawFirebaseConfig2();
        if (config && config.projectId) {
          const tokenHash = import_crypto.default.createHash("sha256").update(token).digest("hex");
          const usedAtStr = (/* @__PURE__ */ new Date()).toISOString();
          const adminDb = getFirebaseAdminDb();
          if (adminDb) {
            try {
              await adminDb.collection("spent_tokens").doc(tokenHash).set({
                usedAt: usedAtStr
              });
              console.log(`[AUDIT] Successfully spent token ${tokenHash} via firebase-admin SDK`);
            } catch (adminWriteErr) {
              console.warn("[WARN] Failed to write spent_tokens via firebase-admin, using REST fallback:", adminWriteErr.message);
              const addUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
              fetch(addUrl, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fields: { usedAt: { stringValue: usedAtStr } } })
              }).catch(() => {
              });
            }
          } else {
            const addUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/spent_tokens/${tokenHash}${config.apiKey ? "?key=" + config.apiKey : ""}`;
            fetch(addUrl, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fields: { usedAt: { stringValue: usedAtStr } } })
            }).catch(() => {
            });
          }
        }
      } catch (e) {
      }
      let targetUrl = "";
      try {
        const AES_SECRET = process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== "undefined" ? AES_SECRET_GLOBAL : "");
        const config = getRawFirebaseConfig2();
        if (!targetUrl || !targetUrl.startsWith("http")) {
          const adminDb = getFirebaseAdminDb();
          if (adminDb) {
            for (const docName of ["sec_links_vault_3", "secure_links", "sec_vault"]) {
              try {
                const docSnap = await adminDb.collection("store_data").doc(docName).get();
                if (docSnap.exists) {
                  const docData = docSnap.data();
                  if (docData && docData.encryptedData) {
                    const dec = safeDecrypt(docData.encryptedData, AES_SECRET);
                    if (dec) {
                      const parsed = JSON.parse(dec);
                      let encryptedUrl = "";
                      if (parsed && Array.isArray(parsed)) {
                        const matchItem = parsed.find((item) => item && item.id === appId);
                        if (matchItem) {
                          encryptedUrl = typeof matchItem.url === "string" ? matchItem.url : typeof matchItem.more_information_url === "string" ? matchItem.more_information_url : "";
                        }
                      } else if (parsed && typeof parsed === "object") {
                        const val = parsed[appId];
                        if (typeof val === "string") {
                          encryptedUrl = val;
                        } else if (val && typeof val === "object") {
                          encryptedUrl = typeof val.url === "string" ? val.url : typeof val.more_information_url === "string" ? val.more_information_url : "";
                        }
                      }
                      if (encryptedUrl && typeof encryptedUrl === "string") {
                        if (encryptedUrl.startsWith("U2FsdGVkX1")) {
                          targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                        } else {
                          targetUrl = encryptedUrl;
                        }
                        if (targetUrl && targetUrl.startsWith("http")) {
                          console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore SDK (${docName}) for app ID: ${appId}`);
                          break;
                        }
                      }
                    }
                  }
                }
              } catch (firestoreErr) {
                console.warn(`[WARN] Firestore SDK failed to fetch ${docName}:`, firestoreErr.message);
              }
            }
          }
        }
        if (!targetUrl || !targetUrl.startsWith("http")) {
          if (config && config.projectId) {
            const apiSuffix = config.apiKey ? `?key=${config.apiKey}` : "";
            const dbUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents`;
            for (const docName of ["sec_links_vault_3", "secure_links", "sec_vault"]) {
              try {
                const r = await fetch(`${dbUrl}/store_data/${docName}${apiSuffix}`);
                if (r.ok) {
                  const d = await r.json();
                  if (d && !d.error && d.fields?.encryptedData?.stringValue) {
                    const encryptedData = d.fields.encryptedData.stringValue;
                    const dec = safeDecrypt(encryptedData, AES_SECRET);
                    if (dec) {
                      const parsed = JSON.parse(dec);
                      let encryptedUrl = "";
                      if (parsed && Array.isArray(parsed)) {
                        const matchItem = parsed.find((item) => item && item.id === appId);
                        if (matchItem) {
                          encryptedUrl = typeof matchItem.url === "string" ? matchItem.url : typeof matchItem.more_information_url === "string" ? matchItem.more_information_url : "";
                        }
                      } else if (parsed && typeof parsed === "object") {
                        const val = parsed[appId];
                        if (typeof val === "string") {
                          encryptedUrl = val;
                        } else if (val && typeof val === "object") {
                          encryptedUrl = typeof val.url === "string" ? val.url : typeof val.more_information_url === "string" ? val.more_information_url : "";
                        }
                      }
                      if (encryptedUrl && typeof encryptedUrl === "string") {
                        if (encryptedUrl.startsWith("U2FsdGVkX1")) {
                          targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                        } else {
                          targetUrl = encryptedUrl;
                        }
                        if (targetUrl && targetUrl.startsWith("http")) {
                          console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Firestore REST Fallback (${docName}) for app ID: ${appId}`);
                          break;
                        }
                      }
                    }
                  }
                }
              } catch (restErr) {
                console.warn(`[WARN] Firestore REST fallback failed to fetch ${docName}:`, restErr.message);
              }
            }
          }
        }
        if (!targetUrl || !targetUrl.startsWith("http")) {
          try {
            let matchEncrypted = "";
            const vaultPath = require("path").join(process.cwd(), "src/lib/secureVault.ts");
            if (require("fs").existsSync(vaultPath)) {
              const vaultContent = require("fs").readFileSync(vaultPath, "utf8");
              const match = vaultContent.match(/export const ENCRYPTED_LINKS = "([^"]+)";/);
              if (match && match[1]) matchEncrypted = match[1];
            }
            if (matchEncrypted) {
              let dec = "";
              if (typeof safeDecrypt !== "undefined") dec = safeDecrypt(matchEncrypted, AES_SECRET);
              else {
                const CryptoJS2 = require("crypto-js");
                const bytes = CryptoJS2.AES.decrypt(matchEncrypted, AES_SECRET);
                dec = bytes.toString(CryptoJS2.enc.Utf8);
              }
              if (dec) {
                const parsed = JSON.parse(dec);
                let encryptedUrl = "";
                if (parsed && Array.isArray(parsed)) {
                  const matchItem = parsed.find((item) => item && item.id === appId);
                  if (matchItem) {
                    encryptedUrl = typeof matchItem.url === "string" ? matchItem.url : typeof matchItem.more_information_url === "string" ? matchItem.more_information_url : "";
                  }
                } else if (parsed && typeof parsed === "object") {
                  const val = parsed[appId];
                  if (typeof val === "string") {
                    encryptedUrl = val;
                  } else if (val && typeof val === "object") {
                    encryptedUrl = typeof val.url === "string" ? val.url : typeof val.more_information_url === "string" ? val.more_information_url : "";
                  }
                }
                if (encryptedUrl && typeof encryptedUrl === "string") {
                  if (encryptedUrl.startsWith("U2FsdGVkX1")) {
                    targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                  } else {
                    targetUrl = encryptedUrl;
                  }
                  if (targetUrl && targetUrl.startsWith("http")) {
                    console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via Git Vault (secureVault.ts) for app ID: ${appId}`);
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Vault decryption failed", e);
          }
        }
        if (!targetUrl || !targetUrl.startsWith("http")) {
          try {
            if (process.env.SECURE_LINKS) {
              const parsed = JSON.parse(process.env.SECURE_LINKS);
              if (parsed && typeof parsed === "object") {
                const val = parsed[appId];
                let encryptedUrl = "";
                if (typeof val === "string") {
                  encryptedUrl = val;
                } else if (val && typeof val === "object") {
                  encryptedUrl = typeof val.url === "string" ? val.url : typeof val.more_information_url === "string" ? val.more_information_url : "";
                }
                if (encryptedUrl && typeof encryptedUrl === "string") {
                  if (encryptedUrl.startsWith("U2FsdGVkX1")) {
                    targetUrl = safeDecrypt(encryptedUrl, AES_SECRET);
                  } else {
                    targetUrl = encryptedUrl;
                  }
                  if (targetUrl && targetUrl.startsWith("http")) {
                    console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via process.env.SECURE_LINKS for app ID: ${appId}`);
                  }
                }
              }
            }
          } catch (e) {
          }
        }
        if (!targetUrl || !targetUrl.startsWith("http")) {
          try {
            const backupPath = require("path").join(process.cwd(), ".local/secure_links_backup.json");
            if (require("fs").existsSync(backupPath)) {
              const parsed = JSON.parse(require("fs").readFileSync(backupPath, "utf8"));
              let encryptedUrl = "";
              if (parsed && Array.isArray(parsed)) {
                const matchItem = parsed.find((item) => item && item.id === appId);
                if (matchItem) {
                  encryptedUrl = typeof matchItem.url === "string" ? matchItem.url : typeof matchItem.more_information_url === "string" ? matchItem.more_information_url : "";
                }
              } else if (parsed && typeof parsed === "object") {
                const val = parsed[appId];
                if (typeof val === "string") {
                  encryptedUrl = val;
                } else if (val && typeof val === "object") {
                  encryptedUrl = typeof val.url === "string" ? val.url : typeof val.more_information_url === "string" ? val.more_information_url : "";
                }
              }
              if (encryptedUrl && typeof encryptedUrl === "string") {
                const AES_SECRET_LOCAL = process.env.AES_SECRET || (typeof AES_SECRET_GLOBAL !== "undefined" ? AES_SECRET_GLOBAL : "");
                if (encryptedUrl.startsWith("U2FsdGVkX1")) {
                  targetUrl = safeDecrypt(encryptedUrl, AES_SECRET_LOCAL);
                } else {
                  targetUrl = encryptedUrl;
                }
                if (targetUrl && targetUrl.startsWith("http")) {
                  console.log(`[AUDIT] Successfully resolved and decrypted redirect URL via local backup file (secure_links_backup.json) for app ID: ${appId}`);
                }
              }
            }
          } catch (backupErr) {
            console.warn("Local filesystem backup retrieval failed:", backupErr);
          }
        }
      } catch (err) {
        console.error("Firestore retrieval or decryption failed", err);
      }
      if (typeof targetUrl !== "string") {
        console.error("targetUrl resolved to an object instead of a string:", targetUrl);
        return res.status(500).json({ error: "Download link encryption integrity failed." });
      }
      if (targetUrl && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("/")) {
        if (targetUrl.includes(".")) {
          targetUrl = "https://" + targetUrl;
        }
      }
      if (!targetUrl || !targetUrl.startsWith("http") && !targetUrl.startsWith("/")) {
        console.error("CRITICAL: Failed to retrieve or decrypt URL for app:", appId, "Result:", targetUrl);
        if (req.query.json === "true") {
          return res.status(404).json({ error: "Download link not found or not yet configured for this app." });
        }
        return res.status(404).send(`<!DOCTYPE html>
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
</html>`);
      }
      try {
        if (targetUrl.startsWith("http")) {
          const targetUrlObj = new URL(targetUrl);
          const isGoogle = targetUrlObj.hostname.includes("google.com") || targetUrlObj.hostname.includes("googleapis.com");
          if (!isGoogle && !targetUrlObj.searchParams.has("code")) {
            const affiliateCode = process.env.AFFILIATE_CODE;
            if (affiliateCode) {
              targetUrlObj.searchParams.set("code", affiliateCode);
              targetUrl = targetUrlObj.toString();
            }
          }
        }
      } catch (e) {
      }
      console.log("FINAL REDIRECT TARGET IS:", targetUrl);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      res.set("Referrer-Policy", "no-referrer");
      return res.redirect(302, targetUrl);
    } catch (err) {
      return res.status(403).send("<h1>403 Forbidden</h1><p>Error decoding parameter.</p>");
    }
  }
  const tokenData = tokenStore.get(token);
  if (!tokenData) {
    if (req.query.json === "true") return res.status(404).json({ error: "Link expired or invalid." });
    return res.status(404).send("<h1>404 Not Found</h1><p>Link expired or invalid.</p>");
  }
  if (tokenData.expiresAt < Date.now()) {
    tokenStore.delete(token);
    if (req.query.json === "true") return res.status(404).json({ error: "This connection timed out." });
    return res.status(404).send("<h1>404 Not Found</h1><p>This connection timed out.</p>");
  }
  tokenStore.delete(token);
  usedTokens.add(token);
  let finalFallbackUrl = tokenData.targetUrl;
  try {
    if (finalFallbackUrl.startsWith("http")) {
      const targetUrlObj = new URL(finalFallbackUrl);
      const isGoogle = targetUrlObj.hostname.includes("google.com") || targetUrlObj.hostname.includes("googleapis.com");
      if (!isGoogle && !targetUrlObj.searchParams.has("code")) {
        const affiliateCode = process.env.AFFILIATE_CODE;
        if (affiliateCode) {
          targetUrlObj.searchParams.set("code", affiliateCode);
          finalFallbackUrl = targetUrlObj.toString();
        }
      }
    }
  } catch (e) {
  }
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return res.redirect(302, finalFallbackUrl);
});
app.get("/api/v1/download/:id", async (req, res) => {
  const appId = req.params.id;
  if (!appId) return res.status(400).send("Bad Request");
  return res.redirect(302, `/gateway/${appId}`);
});
var getDistPath = () => {
  const pathsToTry = [
    import_path2.default.join(process.cwd(), "dist"),
    import_path2.default.resolve(__dirname, "dist"),
    import_path2.default.resolve(__dirname, "..", "dist"),
    __dirname
  ];
  for (const p of pathsToTry) {
    if (import_fs2.default.existsSync(import_path2.default.join(p, "index.html"))) {
      return p;
    }
  }
  return import_path2.default.join(process.cwd(), "dist");
};
var distPath = getDistPath();
app.use("/assets", import_express.default.static(import_path2.default.join(distPath, "assets"), {
  maxAge: "1y",
  immutable: true,
  fallthrough: true
}));
app.use(import_express.default.static(distPath, {
  maxAge: "1d",
  // Cache for 1 day instead of 1 year for safety but performance
  etag: true,
  lastModified: true,
  index: false
}));
var cachedIndexHtml = null;
app.get("*", async (req, res) => {
  if (req.originalUrl.startsWith("/gateway/")) {
    const ua = req.headers["user-agent"] || "";
    const accept = req.headers["accept"] || "";
    const acceptLang = req.headers["accept-language"] || "";
    const looksLikeBot = !ua || ua.length < 20 || /bot|crawl|spider|slurp|scrape|python|curl|wget|libwww|scrapy|axios|node-fetch|playwright|puppeteer|selenium|phantomjs|headless|lighthouse|java\/|go-http|ruby|perl/i.test(ua) || !accept || !acceptLang;
    if (looksLikeBot) {
      return res.status(200).set({
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache",
        "X-Robots-Tag": "noindex, nofollow"
      }).send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="robots" content="noindex,nofollow"></head><body></body></html>');
    }
    const appSlug = req.originalUrl.split("/gateway/")[1]?.split("?")[0]?.replace(/\/$/, "") || "";
    const publicDomain = process.env.PUBLIC_DOMAIN || "https://www.rummyapp.online";
    let tPath = import_path2.default.join(distPath, "index.html");
    if (!import_fs2.default.existsSync(tPath)) tPath = import_path2.default.join(process.cwd(), "index.html");
    if (import_fs2.default.existsSync(tPath)) {
      let tmpl = cachedIndexHtml;
      if (!tmpl) {
        tmpl = import_fs2.default.readFileSync(tPath, "utf-8");
        cachedIndexHtml = tmpl;
      }
      tmpl = tmpl.replace(
        "</head>",
        `<meta name="robots" content="noindex, nofollow" />
<link rel="canonical" href="${publicDomain}/app/${appSlug}" />
</head>`
      );
      return res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache, no-store",
        "X-Robots-Tag": "noindex, nofollow"
      }).send(tmpl);
    }
  }
  if (req.originalUrl.match(/\.(php|env|yml|yaml|ini|conf|log|sql|tar|gz|zip|bak|git|rsa)$/i) || req.originalUrl.includes("/etc/") || req.originalUrl.includes("/proc/") || req.originalUrl.includes("../") || req.originalUrl.includes("/.aws/")) {
    return res.status(404).type("text/plain").send("Not found");
  }
  let templatePath = import_path2.default.join(distPath, "index.html");
  if (!import_fs2.default.existsSync(templatePath)) {
    templatePath = import_path2.default.join(process.cwd(), "index.html");
  }
  try {
    let template = cachedIndexHtml;
    if (!template) {
      template = import_fs2.default.readFileSync(templatePath, "utf-8");
      cachedIndexHtml = template;
    }
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.get("host") || (process.env.PUBLIC_DOMAIN ? new URL(process.env.PUBLIC_DOMAIN).host : "www.rummyapp.online");
    const hostUrl = `${String(protocol).split(",")[0].trim()}://${String(host).split(",")[0].trim()}`;
    const userAgent = req.headers["user-agent"] || "";
    template = await injectSeoTags(template, req.originalUrl, hostUrl, userAgent);
    res.status(200).set({
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }).send(template);
  } catch (e) {
    console.error("SEO fallback error in catch-all, serving file as-is:", e);
    res.status(200).set({
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    }).sendFile(templatePath);
  }
});
app.use((err, req, res, next) => {
  console.error(`[EXPRESS GLOBAL ERROR] ${req.method} ${req.originalUrl}:`, err);
  try {
    const logFile = import_path2.default.join(process.cwd(), "server_requests.log");
    import_fs2.default.appendFileSync(logFile, `[${(/* @__PURE__ */ new Date()).toISOString()}] ERROR in ${req.method} ${req.originalUrl}: ${err.message || err}
`, "utf8");
  } catch (e) {
  }
  if (res.headersSent) {
    return next(err);
  }
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(500).json({ error: "Internal server error" });
  }
  res.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>");
});
module.exports = app;
