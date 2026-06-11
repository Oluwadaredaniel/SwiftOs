import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balances: {
    USDT: { type: Number, default: 0 },
    NGN: { type: Number, default: 0 },
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Wallet', walletSchema);
