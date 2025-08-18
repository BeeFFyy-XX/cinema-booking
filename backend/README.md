# Cinema Booking Backend

**Stack:** Node.js, Express, MongoDB, JWT, Mongoose

## Quick start
1. Install MongoDB and start it (default uri: `mongodb://localhost:27017/cinema_booking`).
2. Copy `.env.example` to `.env` and adjust secrets if needed.
3. Install deps and run:
```bash
cd backend
npm install
npm run dev
```
Server runs on `http://localhost:4000`.

## API (short)
- `POST /api/auth/register {name,email,password}`
- `POST /api/auth/login {email,password}`
- `GET /api/movies` (public), `POST/PUT/DELETE /api/movies` (admin)
- `GET /api/halls` (public), `POST/PUT/DELETE /api/halls` (admin)
- `GET /api/sessions` (public), `POST /api/sessions` (admin)
- `GET /api/bookings` (auth)
- `POST /api/bookings {sessionId, tickets:[{row,seat}]}` (auth) -> returns QR data URL
- `POST /api/bookings/:id/cancel` (auth)
- `POST /api/payments/pay {bookingId, method}` (auth, mock payment)
