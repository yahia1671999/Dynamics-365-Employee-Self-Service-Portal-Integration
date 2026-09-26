import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { setupD365Backend } from './server/d365Backend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

// Parse port and host from command line arguments or environment
function getPort(): number {
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--port' && process.argv[i + 1]) {
      return Number(process.argv[i + 1]);
    }
    if (process.argv[i].startsWith('--port=')) {
      return Number(process.argv[i].split('=')[1]);
    }
  }

  // In production, respect process.env.PORT from Cloud Run
  if (isProduction && process.env.PORT) {
    return Number(process.env.PORT);
  }

  // In development, AI Studio runtime requirement: Dev server must run on port 3000
  return 3000;
}

function getHost(): string {
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === '--host' && process.argv[i + 1]) {
      return process.argv[i + 1];
    }
    if (process.argv[i].startsWith('--host=')) {
      return process.argv[i].split('=')[1];
    }
  }
  return process.env.HOST || '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();

// In production, if JwtSettings__SecretKey is missing, fail application startup.
// Do not generate an ephemeral JWT secret automatically.
if (isProduction) {
  const jwtSecret =
    process.env.JWT_SECRET ||
    process.env.JwtSettings__SecretKey ||
    process.env.JWT_SECRET_KEY;

  if (!jwtSecret || jwtSecret.trim().length === 0) {
    console.error('[FATAL] Application startup failed: JwtSettings__SecretKey is required in production environment.');
    process.exit(1);
  }
}

async function startServer() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Setup D365 native backend routes (/api/* and /health)
  setupD365Backend(app);

  // Setup Vite in Dev mode or serve static assets in Production
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback handler for client-side routing in dev mode
    app.use(async (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`[D365 ESS Portal] Server running on http://${HOST}:${PORT} (Mode: ${isProduction ? 'Production' : 'Development'})`);
  });

  const cleanShutdown = () => {
    console.log('[D365 ESS Portal] Shutting down...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', cleanShutdown);
  process.on('SIGTERM', cleanShutdown);
}

startServer().catch((err) => {
  console.error('[D365 ESS Portal] Server startup failed:', err);
  process.exit(1);
});
