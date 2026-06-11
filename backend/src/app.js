import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
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
import cronService from './services/cronService.js';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Initialize Cron Jobs
cronService.init();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/payment-links', paymentRoutes);
app.use('/api/splitpay', splitRoutes);
app.use('/api/autobills', autobillRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/links', paymentRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SwiftyOS API' });
});

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SwiftyOS API',
      version: '1.0.0',
      description: 'Financial life directly from Telegram',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
