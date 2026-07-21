const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLogin.tsx', 'utf8');

const bgRegex = /<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">[\s\S]*?<div className="w-full max-w-md relative z-10">\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 20 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*transition=\{\{ duration: 0\.5, ease: \[0\.16, 1, 0\.3, 1\] \}\}\s*className="bg-white\/80 dark:bg-zinc-900\/85 backdrop-blur-xl border border-zinc-200\/80 dark:border-zinc-800\/80 rounded-\[2rem\] p-8 sm:p-10 shadow-2xl shadow-zinc-200\/40 dark:shadow-black\/60 text-center"\s*>/g;

const newBg = `<div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Core dark background */}
      <div className="absolute inset-0 bg-zinc-950 z-0" />

      {/* Animated glowing orbs */}
      <motion.div
        animate={{ 
          opacity: [0.15, 0.4, 0.15],
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none z-0"
      />

      {/* Lightning electric beam lines */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: ["-100%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent top-[30%] shadow-[0_0_10px_rgba(96,165,250,0.8)]" 
        />
        <motion.div 
          animate={{ x: ["100%", "-100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-purple-400/60 to-transparent top-[70%] shadow-[0_0_10px_rgba(192,132,252,0.8)]" 
        />
        <motion.div 
          animate={{ y: ["-100%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent left-[40%] shadow-[0_0_10px_rgba(34,211,238,0.8)]" 
        />
        <motion.div 
          animate={{ y: ["100%", "-100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-[2px] h-full bg-gradient-to-b from-transparent via-blue-500/60 to-transparent left-[75%] shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
        />
      </div>

      {/* High tech grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.25)] text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />`;

code = code.replace(bgRegex, newBg);

// Force text white for headings
code = code.replace(/text-zinc-950 dark:text-white/g, 'text-white');
code = code.replace(/text-zinc-500 dark:text-zinc-400/g, 'text-zinc-400');
code = code.replace(/text-zinc-400 dark:text-zinc-500/g, 'text-zinc-400');

// Input styling
code = code.replace(/bg-zinc-50 dark:bg-zinc-950\/40 border border-zinc-200 dark:border-zinc-800\/80/g, 'bg-black/40 border-white/10');
code = code.replace(/text-zinc-900 dark:text-white/g, 'text-white');
code = code.replace(/placeholder-zinc-400 dark:placeholder-zinc-600/g, 'placeholder-zinc-500');
code = code.replace(/focus:ring-blue-500\/10 focus:border-blue-500 dark:focus:border-blue-400/g, 'focus:ring-blue-500/20 focus:border-blue-400');

// Signin Button styling
code = code.replace(/bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-black dark:hover:bg-zinc-100/g, 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.7)]');

// Change text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300
code = code.replace(/text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300/g, 'text-zinc-400 hover:text-zinc-200');

// Bottom line
code = code.replace(/border-zinc-100 dark:border-zinc-800/g, 'border-white/10');
code = code.replace(/bg-zinc-300 dark:bg-zinc-700/g, 'bg-zinc-600');

fs.writeFileSync('src/components/AdminLogin.tsx', code);
console.log('styled');
