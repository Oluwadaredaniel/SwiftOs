import mongoose from 'mongoose';

const autoBillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Airtime', 'Data', 'Electricity'], required: true },
  provider: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['USDT', 'NGN'], default: 'NGN' },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  // billersCode: phone number for airtime/data, meter number for electricity
  billersCode: { type: String, required: true },
  // variationCode: data bundle code (e.g. 'mtn-10mb-100') or 'prepaid'/'postpaid' for electricity
  variationCode: { type: String },
  lastPaid: { type: Date },
  nextDue: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AutoBill', autoBillSchema);
