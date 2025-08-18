import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  row: Number,
  seat: Number,
  status: { type: String, enum: ['reserved', 'paid', 'cancelled'], default: 'reserved' }
});

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  tickets: [TicketSchema],
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
