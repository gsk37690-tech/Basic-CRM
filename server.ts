import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './server/routes/authRoutes.ts';
import leadRoutes from './server/routes/leadRoutes.ts';
import activityRoutes from './server/routes/activityRoutes.ts';
import followUpRoutes from './server/routes/followUpRoutes.ts';
import contactRoutes from './server/routes/contactRoutes.ts';
import dealRoutes from './server/routes/dealRoutes.ts';
import userRoutes from './server/routes/userRoutes.ts';
import dashboardRoutes from './server/routes/dashboardRoutes.ts';
import exportRoutes from './server/routes/exportRoutes.ts';
import { errorHandler } from './server/middleware/errorHandler.ts';
import { connectMongoDB, getDbStatus } from './server/config/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectMongoDB();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // CORS middleware for production deployment (Render backend + Netlify/Vercel frontend)
  app.use((req, res, next) => {
    const allowedOrigins = (process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean);
    const requestOrigin = req.headers.origin;
    if (allowedOrigins.length === 0) {
      res.header('Access-Control-Allow-Origin', '*');
    } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Mount CRM REST API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/followups', followUpRoutes);
  app.use('/api/contacts', contactRoutes);
  app.use('/api/deals', dealRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/export', exportRoutes);

  // Database Connection Status & Configuration APIs
  app.get('/api/db/status', (req, res) => {
    res.json(getDbStatus());
  });

  app.post('/api/db/connect', async (req, res) => {
    try {
      const { uri } = req.body;
      if (!uri || typeof uri !== 'string' || !uri.trim()) {
        return res.status(400).json({ success: false, message: 'MongoDB connection URI string is required' });
      }

      const cleanUri = uri.trim();
      process.env.MONGODB_URI = cleanUri;

      // Update .env file on disk
      try {
        const envPath = path.resolve(__dirname, '.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf-8');
        }
        if (envContent.includes('MONGODB_URI=')) {
          envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${cleanUri}`);
        } else {
          envContent += `\nMONGODB_URI=${cleanUri}\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf-8');
      } catch (e: any) {
        console.error('[.env file update error]:', e.message);
      }

      const result = await connectMongoDB(cleanUri);
      return res.json({ success: result.connected, ...result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const dbStatus = getDbStatus();
    res.json({
      status: 'healthy',
      app: 'Basic CRM College Project',
      timestamp: new Date().toISOString(),
      mode: process.env.MONGODB_URI ? 'MongoDB' : 'Local development store',
    });
  });

  // Centralized Error Handling Middleware for REST APIs
  app.use(errorHandler);

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Basic CRM Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Basic CRM Server] Failed to start:', err);
  process.exit(1);
});
