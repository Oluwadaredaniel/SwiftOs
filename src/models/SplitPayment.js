import mongoose from 'mongoose';

const splitPaymentSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, enum: ['USDT', 'NGN'], default: 'NGN' },
  description: { type: String },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  }],
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SplitPayment', splitPaymentSchema);
