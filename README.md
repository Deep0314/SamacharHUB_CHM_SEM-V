# SamacharHUB — E-Newspaper platform

**SamacharHUB** is a full-stack regional e-newspaper platform built as a college project (TY Computer Science).  
It supports bilingual content (English + Marathi), PDF edition uploads, interactive article hotspots, breaking news, ads, and an admin dashboard.

---

## 👥 Team

| Name | Role | GitHub |
|---|---|---|
| Member 1 | Frontend + Project Setup | [@Deep0314](https://github.com/Deep0314) |
| Member 2 | Backend + Database | [@member2](https://github.com/) |

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
| deployment | Vercel |

---

## 📁 Project Structure

```
SamacharHUB/
├── artifacts/
│   ├── enewspaper/        # React frontend app
│   └── api-server/        # Express.js backend API
├── lib/
│   ├── db/                # Drizzle ORM + DB config
│   ├── api-zod/           # Zod validation schemas
│   └── api-client-react/  # Auto-generated API client
├── package.json           # Root workspace config
├── pnpm-workspace.yaml    # pnpm monorepo config
└── tsconfig.json          # Root TypeScript config
```

---

## ✨ Features

- 📰 **Digital Editions** — upload and view PDF newspaper pages with interactive hotspots
- 📝 **Articles** — Full article management with bilingual support (English + Marathi)
- 🔴 **Breaking News Ticker** — Real-time scrolling breaking news
- 🗂️ **Categories** — Organize articles by topic with color coding
- 🛡️ **Admin Panel** — Secure admin dashboard for all content management
- 📧 **Newsletter** — Email subscription and notification system
- 📢 **Advertisements** — Multi-position ad management (popup, banner, sidebar)
- 🌙 **Dark Mode** — Full dark/light theme support
- 🌐 **Bilingual** — English + Marathi language switching

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- pnpm (`npm install -g pnpm`)
- MongoDB Atlas account
- Cloudinary account

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/SamacharHUB.git
cd SamacharHUB

# Install dependencies
pnpm install

# Set up environment variables
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/enewspaper/.env.local.example artifacts/enewspaper/.env.local

# Start the backend
cd artifacts/api-server
pnpm dev

# Start the frontend (in a new terminal)
cd artifacts/enewspaper
pnpm dev
```

### Environment Variables

**Backend (`artifacts/api-server/.env`):**
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_jwt_secret
PORT=8081
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend (`artifacts/enewspaper/.env.local`):**
```
VITE_API_URL=http://localhost:8081
```

---

## 📖 Branch Strategy

| Branch | Owner | Description |
|---|---|---|
| `feat/project-setup` | Member 1 | Monorepo config, README, folder structure |
| `feat/database-models` | Member 2 | MongoDB models, DB connection |
| `feat/backend-auth-api` | Member 1 | Auth routes, articles, editions, settings |
| `feat/frontend-base` | Member 2 | Vite config, global CSS, Header, Footer |
| `feat/frontend-pages` | Member 1 | Home, Article, Category, Edition, About pages |
| `feat/admin-panel` | Member 2 | Admin dashboard and management pages |
| `feat/polish-deployment` | Member 1 | SEO, final fixes, Vercel config |

---

## 📄 License

MIT — College Project
