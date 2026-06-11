import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 }, // NGN stored — locked at deposit, never fluctuates
  currency: { type: String, enum: ['USDT', 'NGN'], default: 'NGN' },
  category: { type: String, enum: ['Electronics', 'Security', 'Business', 'Personal', 'Travel'], default: 'Personal' },
  deadline: { type: Date },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('SavingsGoal', savingsGoalSchema);
