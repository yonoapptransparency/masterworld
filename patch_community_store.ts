import fs from 'fs';
const file = 'src/server/services/communityStoreService.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes("import { atomicUpdateAppStats, readAppStats }")) {
  code = code.replace(/import \{.*?\} from '\.\.\/communityFirebaseAdmin';/, (match) => {
    return match.replace("}", ", atomicUpdateAppStats, readAppStats }");
  });
}

// Add memory cache for stats
if (!code.includes("private appStatsCache: Map<string, any> = new Map();")) {
  code = code.replace("private reports: Map<string, ReportRecord> = new Map();", "private reports: Map<string, ReportRecord> = new Map();\n  private appStatsCache: Map<string, any> = new Map();");
}

fs.writeFileSync(file, code);
