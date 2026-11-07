import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
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
import { connectMongoDB } from './server/config/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectMongoDB();

  const app = express();
  const PORT = 3000;

  // CORS middleware for production deployment (Render backend + Netlify/Vercel frontend)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || '*');
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

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'Basic CRM College Project',
      timestamp: new Date().toISOString(),
      mode: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local In-Memory / File Persistent Store',
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
