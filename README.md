# TradeIQ — AI-Powered Trading Journal

> Stop guessing. Start understanding your trades.

TradeIQ is a production-ready trading journal that uses Claude AI to identify behavioral patterns, detect psychological mistakes, and generate personalized weekly improvement reports.

![TradeIQ Screenshot](https://via.placeholder.com/1200x630/0a0b0f/00d4aa?text=TradeIQ+Dashboard)

---

## Features

- **📓 Trade Logging** — Entry/exit price, contracts, direction, setup, emotions, plan adherence
- **🤖 AI Behavioral Analysis** — Detects revenge trading, FOMO, oversizing, plan deviation, and more
- **📊 Performance Dashboard** — Equity curve, win rate, profit factor, best hours
- **📈 Weekly AI Reports** — Grade your week (A–F), prioritized improvements, psychological insights
- **🔍 Journal & Filters** — Search and filter all trades with pagination
- **🔐 Auth** — JWT authentication, secure password hashing
- **📱 Mobile Responsive** — Works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| AI | Anthropic Claude API |
| Charts | Recharts |
| Auth | JWT + bcrypt |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
TradeIQ/
├── frontend/
│   ├── src/
│   │   ├── components/      # Layout, shared UI
│   │   ├── pages/           # Dashboard, LogTrade, Journal, Analysis, Settings
│   │   ├── context/         # AuthContext
│   │   └── utils/           # api.js, helpers.js
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── models/          # User.js, Trade.js
    │   ├── controllers/     # authController, tradeController, analysisController
    │   ├── routes/          # auth, trades, analysis
    │   ├── middleware/      # auth.js
    │   ├── services/        # aiService.js
    │   ├── server.js
    │   └── seed.js          # Sample data generator
    ├── .env.example
    ├── railway.toml
    └── package.json
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Anthropic API key

### 1. Clone & Install

```bash
git clone https://github.com/yourname/tradeiq.git
cd tradeiq

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/tradeiq
JWT_SECRET=your_super_long_secret_key_at_least_32_chars
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
# Login: demo@tradeiq.app / demo1234
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

App runs at `http://localhost:5173`

---

## Deployment

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. **Environment Variables**:
   - `VITE_API_URL` = `https://your-railway-backend.railway.app/api`
7. Deploy ✅

### Backend → Railway

1. Push `backend/` to GitHub (or the full monorepo)
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. **Root Directory**: `backend`
4. **Environment Variables** (add all from `.env.example`):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `CLIENT_URL` = your Vercel frontend URL
   - `NODE_ENV` = `production`
5. Railway auto-detects `npm start` from `package.json`
6. Deploy ✅

### MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user with read/write access
3. Whitelist `0.0.0.0/0` (all IPs) for Railway
4. Copy connection string → `MONGO_URI`

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Trades
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trades` | List trades (paginated, filterable) |
| POST | `/api/trades` | Create trade |
| GET | `/api/trades/stats` | Aggregated statistics |
| PUT | `/api/trades/:id` | Update trade |
| DELETE | `/api/trades/:id` | Delete trade |

### AI Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analysis/weekly` | Weekly AI report |
| POST | `/api/analysis/flag-trades` | Flag behavioral patterns |
| GET | `/api/analysis/insight/:id` | Quick insight for a trade |

---

## AI Behavioral Patterns Detected

| Pattern | Description |
|---------|-------------|
| 🔁 Revenge Trade | Trading immediately after a loss with emotional intent |
| 📊 Oversizing | Position sizes exceeding risk parameters |
| ⚡ FOMO Entry | Chasing moves without proper setups |
| 🛑 No Stop Loss | Trades without defined risk management |
| 😤 Emotional Trade | Decisions driven by fear, greed, or frustration |
| 📋 Plan Deviation | Not following stated trading criteria |
| 🔄 Overtrading | Excessive trades in a session |

---

## Environment Variables Reference

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing (32+ chars) |
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `PORT` | ❌ | Server port (default: 5000) |
| `JWT_EXPIRES_IN` | ❌ | Token expiry (default: 7d) |
| `NODE_ENV` | ❌ | `development` or `production` |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |

---

## License

MIT © 2025 TradeIQ
