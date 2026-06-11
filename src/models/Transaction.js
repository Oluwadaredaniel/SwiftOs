import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['transfer', 'receive', 'fund', 'split', 'autobill', 'convert'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['USDT', 'NGN'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  description: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of SplitPay, AutoBill, or PaymentLink
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', transactionSchema);
