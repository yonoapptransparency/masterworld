const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const loader = `
      <style>
        .initial-loader {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: #ffffff; z-index: 99999; transition: opacity 0.3s;
        }
        @media (prefers-color-scheme: dark) {
          .initial-loader { background: #18181b; }
        }
        html.dark .initial-loader { background: #18181b; }
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(59, 130, 246, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      </style>
      <div class="initial-loader" id="initial-loader">
        <div class="spinner"></div>
      </div>
`;

code = code.replace('<div id="root"></div>', `<div id="root">\n${loader}\n    </div>`);

fs.writeFileSync('index.html', code);
console.log('done updating index.html');
