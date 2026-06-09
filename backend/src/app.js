import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.json({ message: 'SwiftyOS API is running' });
});
// Authentication and User management
app.use('/auth', authRoutes);
// Protected API routes
app.use('/api/wallet', walletRoutes);
// app.use('/api/bills', billsRoutes);
// app.use('/api/links', linksRoutes);
// app.use('/api/savings', savingsRoutes);
export default app;
//# sourceMappingURL=app.js.map