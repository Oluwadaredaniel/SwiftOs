import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import devRoutes from './routes/devRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import splitRoutes from './routes/splitRoutes.js';
import autobillRoutes from './routes/autobillRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import billRoutes from './routes/billRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cronService from './services/cronService.js';

dotenv.config();

const app = express();

connectDB();
cronService.init();

// ── Security ───────────────────────────────────────────────────────────────────
app.use(helmet());

// CORS — allow configured origins + any Vercel preview deployments
const rawAllowed = process.env.FRONTEND_URL || 'http://localhost:3000';
const allowedOrigins = new Set(rawAllowed.split(',').map(s => s.trim()));

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin requests: Telegram WebView, curl, Swagger
    if (!origin) return cb(null, true);
    // Allow exact match from FRONTEND_URL env var (comma-separated)
    if (allowedOrigins.has(origin)) return cb(null, true);
    // Allow any Vercel deployment (*.vercel.app)
    if (/\.vercel\.app$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));

// ── Rate Limiters ──────────────────────────────────────────────────────────────

// General: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please slow down.' },
});

// Strict: auth + payment endpoints — 10 per minute per IP
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests on this endpoint.' },
});

app.use(generalLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/payment-links', paymentRoutes);
app.use('/api/splitpay', splitRoutes);
app.use('/api/autobills', autobillRoutes);
app.use('/api/ai', strictLimiter, aiRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/bills', strictLimiter, billRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/links', paymentRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'SwiftyOS API', status: 'ok' });
});

// ── Swagger ────────────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'SwiftyOS API', version: '1.0.0', description: 'Financial life directly from Telegram' },
    servers: [{ url: process.env.SERVER_URL || 'http://localhost:5000' }],
  },
  apis: ['./src/routes/*.js'],
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

// ── Error handler ──────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ status: 'error', message: err.message });
  }
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
