import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

import { injectSeoTags, fetchStoreData, resolveAppSlug } from './src/seoHelper';
import { adminAuthRouter } from './src/server/routes/adminAuthRoutes';
import { communityRouter } from './src/server/routes/communityRoutes';
import { githubSyncRouter } from './src/server/routes/githubSyncRoutes';
import { seoRouter } from './src/server/routes/seoRoutes';
import { adminVaultRouter } from './src/server/routes/adminVaultRoutes';
import { publicApiRouter } from './src/server/routes/publicApiRoutes';
import { securityRouter } from './src/server/routes/securityRoutes';


  const app = express();
  const PORT = 3000;

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }));

  app.use(compression({
    threshold: 256,
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // AES_SECRET verification for secure link flow
  if (!process.env.AES_SECRET && process.env.NODE_ENV === "production") {
    console.error("FATAL: AES_SECRET environment variable is not set. Secure link flow will fail.");
    // In some environments we might want to exit, but here we just log it clearly
  }

  // Request logger
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/')) {
      console.log(`[API REQUEST] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Admin routes anti-caching middleware
  app.use('/api/v1/admin', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // 301 Redirect non-www rummydex.com -> www.rummydex.com
  app.use((req, res, next) => {
    const host = (req.headers['x-forwarded-host'] as string || req.get('host') || '').split(',')[0].trim();
    if (host === 'rummydex.com') {
      return res.redirect(301, `https://www.rummydex.com${req.originalUrl}`);
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mount API & SEO Routes
  app.use(seoRouter);
  app.use(adminAuthRouter);
  app.use(communityRouter);
  app.use(githubSyncRouter);
  app.use(adminVaultRouter);
  app.use(securityRouter);
  app.use(publicApiRouter);

  // Roadblocks
  ["/api/v1/user", "/api/v1/auth", "/api/v1/config"].forEach(pathway => {
    app.all(pathway, (req, res) => {
      res.status(404).send("Not Found");
    });
  });

  

// Global Express Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[EXPRESS GLOBAL ERROR] ${req.method} ${req.originalUrl}:`, err);
    try {
      const logFile = path.join(process.cwd(), 'server_requests.log');
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] ERROR in ${req.method} ${req.originalUrl}: ${err.message || err}\n`, 'utf8');
    } catch (e) {}

    if (res.headersSent) {
      return next(err);
    }

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(500).send("<h1>500 Internal Server Error</h1><p>An unexpected error occurred.</p>");
  });

  const server = module.exports = app;


