# Онлайн-бронювання квитків кінотеатру — Full Stack

Це повний робочий прототип: **Node.js/Express + MongoDB** (бекенд) і **Vanilla JS SPA** (фронтенд).

## Швидкий старт
1. **MongoDB**: встановіть і запустіть локально.
2. **Бекенд**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```
   Сервіс: `http://localhost:4000` (здоровʼя: `/`).
3. **Фронтенд**
   ```bash
   cd ../frontend
   npm install
   npm run serve
   ```
   Відкрийте `http://localhost:5173`. В шапці задайте `API: http://localhost:4000/api` (або залиште за замовчуванням).

## Наповнення даними
- Створіть адміна:
  1) Зареєструйтесь через фронтенд (або `POST /api/auth/register`).
  2) У MongoDB змініть поле `role` на `admin` для вашого користувача.
- Додайте фільми/зали/сеанси через запити:
  - `POST /api/movies` — { title, genre, duration, description, posterUrl? }
  - `POST /api/halls` — { name, rows, seatsPerRow }
  - `POST /api/sessions` — { movie, hall, dateTime, price }
- Далі працюйте з фронтендом: оберіть фільм → сеанс → місця → бронювання → оплата.

## Відповідність курсовій
- Ролі: user/admin.
- Сутності: Users, Movies, Halls, Sessions, Bookings, Payments.
- Функції: реєстрація/логін (JWT), афіша, вибір місць, бронювання, оплата (mock), скасування, QR для бронювання.
- Нефункціонал: безпека (helmet, JWT), продуктивність (Mongo індекси за замовчуванням), масштабованість (окремі шари).

## Подальші кроки (за бажанням)
- Додати справжній платіжний шлюз (LiqPay/Stripe).
- Додати адмін-панель на фронті.
- Валідація на фронтенді, інтернаціоналізація, юніт-тести.
