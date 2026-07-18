const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Global rate limit
code = code.replace(
  /limit: 1000,/g,
  `limit: 200,`
);

// Define strict limit
const strictLimiter = `
  const strictLimiter = expressRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use('/admin', strictLimiter);
  app.use('/api/v1/admin', strictLimiter);
  app.use('/api/download', strictLimiter);
`;

code = code.replace(
  /app\.use\(limiter\);/g,
  `app.use(limiter);\n${strictLimiter}`
);

fs.writeFileSync('server.ts', code);
