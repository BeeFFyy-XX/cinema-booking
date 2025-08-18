import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  dateTime: { type: Date, required: true },
  price: { type: Number, required: true },
  takenSeats: [{ row: Number, seat: Number }]
}, { timestamps: true });

export default mongoose.model('Session', SessionSchema);
