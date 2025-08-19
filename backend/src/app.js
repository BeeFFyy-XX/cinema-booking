import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import hallRoutes from './routes/halls.js';
import sessionRoutes from './routes/sessions.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mongo connect
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cinema_booking';
mongoose.connect(uri).then(() => console.log('[backend] Mongo connected')).catch(err => console.error(err));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'cinema-booking-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);


// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
