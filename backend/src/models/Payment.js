import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: Number,
  method: { type: String, enum: ['card', 'googlepay', 'applepay', 'mock'], default: 'mock' },
  status: { type: String, enum: ['success', 'declined'], default: 'success' },
  providerResponse: Object
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
