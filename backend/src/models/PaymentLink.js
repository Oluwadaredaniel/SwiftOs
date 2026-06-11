import mongoose from 'mongoose';

const paymentLinkSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['USDT', 'NGN'], required: true },
  token: { type: String, required: true, unique: true },
  note: { type: String },
  isClaimed: { type: Boolean, default: false },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('PaymentLink', paymentLinkSchema);
