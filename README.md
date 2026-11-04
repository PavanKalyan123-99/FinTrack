# FinTrack: AI-Powered Personal Finance & Expense Management System

FinTrack is an intelligent, production-quality financial management SaaS platform engineered for working professionals, college students, and freelancers to monitor cashflows, manage categorical monthly budgets, analyze spending trends, and receive AI-driven financial recommendations.

---

## 🎨 Minimalist Tech Design System

FinTrack strictly adheres to the **Minimalist Tech** fintech palette with a disciplined **60-30-10** distribution:

- **Deep Space** (`#1B262C` - 60% Dominant): Sidebar navigation, dark surfaces, high-contrast badges.
- **Soft Cloud** (`#BBE1FA` - 60% Accents): Soft card highlights, active badges, and background accents.
- **Main Background** (`#F7FAFC`): Clean, neutral fintech canvas.
- **Royal Blue** (`#0F4C75` - 30% Secondary): Primary CTAs, active navigation items, selected tabs, primary chart series.
- **Sky Focus** (`#3282B8` - 10% Accent): Secondary actions, chart gradients, links, active navigation indicator bar.
- **Income Green** (`#16A34A`): Cashflow inflows, surplus metrics, positive trends.
- **Expense Red** (`#DC2626`): Expenditure outflows, budget overruns, warning alerts.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS & Vanilla CSS Design Tokens
- **Routing**: React Router DOM (v7) with session-guarded protected routes
- **Charts**: Recharts (Responsive Cashflow Bar Charts, Donut Pie Charts, Weekly Area Charts, Savings Line Charts)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios with automatic JWT interceptors & token renewal

### Backend
- **Runtime**: Node.js v24 & Express.js
- **Security**: Helmet, CORS, Express-Rate-Limit, bcryptjs
- **Authentication**: Stateless JSON Web Tokens (JWT) with user ownership verification
- **Database**: MongoDB with Mongoose ODM
- **Local Dev Fallback**: Automatic in-memory MongoDB fallback (`mongodb-memory-server`) for instantaneous zero-setup onboarding without needing a pre-installed local MongoDB service.
- **AI Diagnostics**: Google Gemini 1.5 Flash (`@google/generative-ai`) combined with an algorithmic financial reasoning engine (savings rate, 50/30/20 compliance, category concentration, and budget overrun detection).

---

## 📁 Project Architecture

```
fintrack/
│
├── frontend/
│   ├── public/
│   │   └── logo.svg
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/         # Card, Button, Badge, Modal, Skeleton, EmptyState
│       │   ├── layout/         # Deep Space Sidebar, Topbar, AppLayout
│       │   └── transactions/   # TransactionList ledger, TransactionModal
│       ├── pages/              # Dashboard, Ledger, Income, Expenses, Budgets, Analytics, AI, Settings
│       ├── context/            # AuthContext, FinanceContext
│       ├── services/           # Axios API services for all REST endpoints
│       ├── utils/              # Formatters (INR currency, dates) and constants
│       ├── App.jsx             # Route definitions & guards
│       ├── main.jsx
│       └── index.css           # Minimalist Tech CSS variables
│
├── backend/
│   ├── config/                 # Resilient MongoDB connector
│   ├── controllers/            # Auth, Transaction, Budget, Analytics, Report, User, AI
│   ├── middleware/             # JWT auth guard, error handler, rate limiter
│   ├── models/                 # User, Transaction, Budget, AIInsight
│   ├── routes/                 # REST endpoints
│   ├── services/               # AI reasoning service & Gemini integration
│   ├── utils/                  # Development demo data seeder
│   ├── app.js                  # Express application setup
│   ├── server.js               # Server entry point
│   ├── .env.example
│   └── .env
│
├── docs/
│   ├── architecture.md
│   ├── database-schema.md
│   └── api-documentation.md
│
├── .gitignore
├── README.md
└── package.json
```

---

## ⚡ Quick Start & Development

### 1. Prerequisites
- Node.js >= 18.x (Node 24 recommended)
- npm >= 9.x

### 2. Install Dependencies
Run from workspace root:
```bash
npm run install:all
```
*Or individually:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Seed Realistic Demo Data
Populate realistic transactions, income, expense categories, and monthly budgets:
```bash
cd backend && npm run seed
```

**Pre-seeded Demo Credentials:**
- **Email**: `demo@fintrack.com`
- **Password**: `password123`
*(Or click the "Fill Demo Account" one-click button on the Login page!)*

### 4. Run Both Servers Concurrently
From the workspace root directory:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection String (Atlas or local)
# Note: If left blank or unreachable locally, FinTrack automatically initializes an embedded in-memory MongoDB for local dev!
MONGODB_URI=

# JWT Secret
JWT_SECRET=fintrack_super_secure_jwt_secret_production_2026_xyz
JWT_EXPIRE=30d

# Google Gemini API Key (Optional)
# If left blank, FinTrack automatically uses its built-in algorithmic financial diagnostic engine.
GEMINI_API_KEY=
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. Link the repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Set Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`.
5. Deploy.

### Backend (Render)
1. Create a **Web Service** in [Render](https://render.com).
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fintrack`
   - `JWT_SECRET=<your_secure_random_string>`
   - `GEMINI_API_KEY=<optional_gemini_key>`

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, whitelist your deployment IP or `0.0.0.0/0`.
3. Under **Database Access**, create a database user and password.
4. Copy the connection string into `MONGODB_URI`.
