# MangaHub

MangaHub is an e-book and manga library web application with an admin dashboard and VIP subscription features for business use.

## Features
- Admin dashboard for managing series, manga, and users
- VIP access flow (admins grant VIP status manually after payment verification)
- OTP-based user registration and login
- File uploads for manga and cover images

## Tech stack
- MongoDB
- Express
- React (Vite)
- Node.js

## Prerequisites
- Node.js (16+ recommended)
- npm or yarn
- MongoDB (local or hosted)

## Environment variables
Create a `.env` file in the `backend` folder and set at least:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret used for signing JWTs
- `PORT` — backend port (optional, default 3000)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — for sending OTP/emails
- `FRONTEND_URL` — URL where the frontend is served (optional)

## Install
Run the following to install dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Run (development)

Backend:

```bash
cd backend
npm run start
```

Frontend:

```bash
cd frontend
npm run dev
```

Note: the backend can also be started directly with `node index.js` if preferred.

## Admin setup
- Do not commit admin credentials. To create an admin account, either use the registration endpoint and promote the user in the database, or add a short seed script to create the initial admin user from environment variables.
- Example manual promotion (Mongo shell):

```js
db.users.updateOne({ email: 'you@example.com' }, { $set: { role: 'admin' } })
```

## Security & privacy notes
- Never store plaintext credentials in the repository. Use `.env` files and a secrets manager in production.
- The current VIP flow is manual (admins verify payment screenshots). Consider integrating a payment provider (Stripe, PayPal) for automated billing and receipts.

## Contributing
- Fork the repo, create a feature branch, open a PR with a clear description.

## License
Add a license file if you plan to open-source this project.

---
Developed by MyoMyatAung
Duration: 03.06.2026 — 28.06.2026