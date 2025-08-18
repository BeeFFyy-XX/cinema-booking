import mongoose from 'mongoose';

const HallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rows: { type: Number, required: true },
  seatsPerRow: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Hall', HallSchema);
