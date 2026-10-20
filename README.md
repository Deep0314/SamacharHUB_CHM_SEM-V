# SamacharHUB — E-Newspaper platform

**SamacharHUB** is a full-stack regional e-newspaper platform built as a college project (TY Computer Science).  
It supports bilingual content (English + Marathi), PDF edition uploads, interactive article hotspots, breaking news, ads, and an admin dashboard.

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| Member 1 | Frontend + Project Setup | [@Deep0314](https://github.com/Deep0314) |
| Member 2 | Backend + Database | [@Gufran047](https://github.com/gufran047) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS |
| UI Components | ShadCN UI + Radix UI |
| Backend | Express.js v5 + TypeScript |
| Database | MongoDB (Mongoose) |
| Media Storage | Cloudinary |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Email | Nodemailer (SMTP) |
| Package Manager | pnpm (monorepo) |

---

## 📁 Project Structure

```
SamacharHUB/
├── artifacts/
│   ├── enewspaper/        # React frontend app (Vite on port 3000)
│   └── api-server/        # Express.js backend API (Node on port 8081)
├── lib/
│   ├── db/                # DB config & schemas
│   ├── api-zod/           # Zod validation schemas
│   └── api-client-react/  # React Query API hooks & types
├── package.json           # Root workspace config
├── pnpm-workspace.yaml    # pnpm monorepo config
└── tsconfig.base.json     # Base TypeScript config
```

---

## ✨ Features

- 📰 **Digital Editions** — upload and view newspaper pages with interactive hotspots
- 📝 **Articles** — Full article management with bilingual support (English + Marathi)
- 🔴 **Breaking News Ticker** — Real-time scrolling breaking news
- 🗂️ **Categories** — Organize articles by topic with color coding
- 🛡️ **Admin Panel** — Secure admin dashboard at `/admin`
- 📧 **Newsletter** — Email subscription and contact forms
- 📢 **Advertisements** — Multi-position ad management (popup, banner, sidebar)
- 🌙 **Dark Mode** — Full dark/light theme support
- 🌐 **Bilingual** — English + Marathi language toggle

---

## 🚀 Running on Localhost

### Prerequisites
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- MongoDB connection string (Atlas or local MongoDB)

### Quick Start

```bash
# 1. Install all dependencies across the monorepo
pnpm install

# 2. Build libraries & verify types
pnpm run build

# 3. Start the Backend API (runs on http://localhost:8081)
pnpm run dev:api

# 4. In a separate terminal, start the Frontend (runs on http://localhost:3000)
pnpm run dev:frontend
```

> **Note:** The Vite dev server automatically proxies all `/api/*` requests to the Express backend on `http://localhost:8081`.

### Useful Commands

- `pnpm run dev:api` — Start backend API server (`@samacharhub/api-server`)
- `pnpm run dev:frontend` — Start frontend React app (`@samacharhub/enewspaper`)
- `pnpm run seed` — Seed initial data (categories, sample articles, admin user)
- `pnpm run build` — Build both frontend and backend
- `pnpm run typecheck` — Run TypeScript type checking across all packages

### Environment Variables

**Backend (`artifacts/api-server/.env`):**
```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_jwt_secret_key
PORT=8081
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Frontend (`artifacts/enewspaper/.env.local`):**
```env
PORT=3000
BASE_PATH=/
```

---

## 📄 License

MIT — College Project
