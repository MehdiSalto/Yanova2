# YANOVA — MERN E-Commerce Platform

A complete, production-ready e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js), styled to match the YANOVA black/gold brand identity.

## Features

- Fully responsive UI (desktop, tablet, mobile) using Tailwind CSS
- Admin dashboard with role-based authentication (JWT, httpOnly cookies, refresh token rotation)
- Secure password hashing with bcrypt
- CRUD for products, offers, banners, contact requests, and site settings
- Real-time analytics powered by Socket.IO (live visitor count, click tracking)
- Image upload handling with Multer
- Input validation with express-validator
- Security hardening: Helmet, CORS, rate limiting, CSRF protection, MongoDB sanitization
- Bold black/white/gold storefront UI with Framer Motion animations
- Dark admin dashboard
- SEO-friendly meta tags via react-helmet-async
- Toast notifications via react-toastify

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT, bcryptjs, Multer, Helmet, CORS, express-rate-limit, csurf, express-validator, express-mongo-sanitize

**Frontend:** React, React Router, Axios, Tailwind CSS, Framer Motion, React Icons, React Toastify, Socket.IO client

## Project Structure

```
mern-ecommerce/
├─ backend/
│  ├─ config/          # DB connection
│  ├─ controllers/     # Business logic
│  ├─ middleware/      # Auth, security, validation, upload
│  ├─ models/          # Mongoose schemas
│  ├─ routes/          # API endpoints
│  ├─ utils/           # JWT helpers, admin seeding
│  ├─ uploads/         # Uploaded images
│  └─ server.js        # Entry point
├─ frontend/
│  ├─ public/
│  └─ src/
│     ├─ components/   # Navbar, Footer, ProductCard, Toast, Loading, etc.
│     ├─ pages/        # Storefront pages + admin/ subfolder
│     ├─ context/      # AuthContext, SocketContext
│     ├─ layouts/       # MainLayout, AdminLayout
│     ├─ services/      # api.js (Axios), socket.js
│     ├─ App.js
│     ├─ index.css
│     └─ index.js
├─ .env / .env.example
├─ package.json         # Root scripts (concurrently runs client & server)
└─ README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

This installs root dev tools plus backend and frontend dependencies.

### 2. Configure environment variables

Copy `.env.example` to `.env` at the root (already done for you) and update:
- `MONGO_URI` — your MongoDB connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — replace with strong random strings
- `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` — seeded automatically on first boot if no admin exists

Also check `frontend/.env` for `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL`.

### 3. Start MongoDB

Make sure a local or remote MongoDB instance is running and reachable via `MONGO_URI`.

### 4. Run the development servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

On first boot, a default admin account is seeded using `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD`. Log in at `/admin/login`.

### 5. Build for production

```bash
npm run build
NODE_ENV=production npm start
```

The Express server serves the compiled React build from `frontend/build`.

## Scripts

| Script | Description |
|---|---|
| `dev` | Runs backend (nodemon) and frontend (react-scripts) concurrently |
| `server` | Starts the backend only |
| `client` | Starts the React dev server only |
| `build` | Builds the React app for production |
| `start` | Starts the production server (serves static React build) |
| `install:all` | Installs root, backend, and frontend dependencies |

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/login` | Admin login (rate-limited) |
| `POST /api/auth/refresh` | Rotate access/refresh tokens |
| `POST /api/auth/logout` | Clear session |
| `GET /api/products` | List products (public sees published only) |
| `POST /api/products/:id/click` | Track a buy-now click |
| `GET /api/offers` | List offers |
| `GET /api/banners` | List banners |
| `POST /api/contacts` | Submit a contact form |
| `GET /api/settings` | Get About Us / Policies content |
| `GET /api/dashboard/stats` | Admin analytics (protected) |
| `POST /api/upload` | Upload an image (protected) |

All admin-only routes require a valid `accessToken` httpOnly cookie.

## Security Notes

- JWT access + refresh tokens are stored in httpOnly cookies; refresh tokens are hashed and rotated on each use.
- Helmet sets secure HTTP headers; CORS is restricted to `CLIENT_URL`.
- Rate limiting protects the login endpoint from brute-force attempts.
- CSRF protection via `csurf` — the frontend fetches a token from `/api/csrf-token` before mutating requests.
- All user input is validated server-side with `express-validator` and sanitized against NoSQL injection.

## Design System

The storefront uses a bold black / white / gold visual identity (see `frontend/tailwind.config.js` and `frontend/src/index.css` for the full palette and utility classes: `btn-primary`, `btn-secondary`, `glass`, `glass-strong`, `eyebrow`). The admin dashboard keeps a dark panel theme for focus and contrast.

## Contributing

Feel free to open issues or submit pull requests. Follow the existing code style.
