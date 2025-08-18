import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: String,
  duration: Number,
  description: String,
  ageRestriction: String,
  posterUrl: String
}, { timestamps: true });

export default mongoose.model('Movie', MovieSchema);
