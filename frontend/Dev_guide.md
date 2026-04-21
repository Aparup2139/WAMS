# WAMS Developer Guide

Warehouse Automated Management System — local development setup for the Flask backend and React/Vite frontend.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Repository Structure](#repository-structure)
4. [Environment Variables](#environment-variables)
5. [Backend Setup & Run](#backend-setup--run)
6. [Frontend Setup & Run](#frontend-setup--run)
7. [Running Both Together](#running-both-together)
8. [Database Management](#database-management)
9. [Test Credentials](#test-credentials)
10. [API Overview](#api-overview)
11. [Roles & Access](#roles--access)
12. [Common Issues](#common-issues)

---

## Project Overview

WAMS is a three-role warehouse management system:

| Role     | Responsibilities                                     |
|----------|------------------------------------------------------|
| Admin    | Manage parts, users, orders, quotations; view reports and audit logs |
| Dealer   | Place orders, view order history, view bills         |
| Supplier | Submit quotations for parts                          |

**Tech Stack:**

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python 3, Flask 3.1.1               |
| Database   | SQLite (via Flask-SQLAlchemy)        |
| Auth       | JWT (Flask-JWT-Extended)             |
| Frontend   | React 19, Vite 8, React Router 7     |
| HTTP Client| Axios                               |

---

## Prerequisites

Make sure the following are installed before starting:

- **Python 3.10+** — `python --version`
- **pip** — `pip --version`
- **Node.js 18+** — `node --version`
- **npm 9+** — `npm --version`

---

## Repository Structure

```
WAMS/
├── .env                    # Shared environment variables (root)
├── README.md
├── backend/
│   ├── app/
│   │   ├── __init__.py     # Flask app factory
│   │   ├── config.py       # Config loaded from .env
│   │   ├── extensions.py   # SQLAlchemy, JWT, CORS init
│   │   ├── models/         # ORM models (User, Part, Order, Quotation, Bill, AdminLog)
│   │   ├── routes/         # Blueprints: auth, parts, orders, quotations, bills, admin
│   │   └── utils/
│   │       └── decorators.py   # Role-based access decorators
│   ├── run.py              # Entry point — starts Flask on port 5000
│   ├── seed.py             # Seeds DB with sample data
│   ├── requirements.txt
│   └── wams.db             # SQLite database file (auto-created)
└── frontend/
    ├── src/
    │   ├── api/client.js   # Axios instance with JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/     # Navbar, Modal, ProtectedRoute, etc.
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── admin/      # Admin pages
    │   │   ├── dealer/     # Dealer pages
    │   │   └── supplier/   # Supplier pages
    │   ├── App.jsx         # Route definitions
    │   └── main.jsx        # React entry point
    ├── vite.config.js      # Dev server + /api proxy to :5000
    └── package.json
```

---

## Environment Variables

The root `.env` file is used by the backend. Fill in your Supabase connection string before starting:

```dotenv
# WAMS/.env
SECRET_KEY=wams-dev-secret-key-change-in-prod
JWT_SECRET_KEY=wams-jwt-secret-change-in-prod

# Supabase PostgreSQL — Session Pooler (port 5432)
# Get from: Supabase Dashboard → Project → Settings → Database
#            → Connection string → Session pooler
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

> **Production note:** Change `SECRET_KEY` and `JWT_SECRET_KEY` to long random strings before any deployment. Never commit secrets to version control.

The frontend has no separate `.env` file — all API calls use the `/api` path which Vite proxies to `http://localhost:5000` during development.

---

## Supabase Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the database to provision (~2 minutes).

### 2. Get the connection string

In your project dashboard:  
**Settings → Database → Connection string → Session pooler**

Copy the URI. It looks like:
```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

> Use the **Session Pooler** (port 5432), NOT the Transaction Pooler (port 6543). SQLAlchemy uses prepared statements which the transaction pooler disables.

### 3. Set the connection string in `.env`

Paste the URI as the value of `DATABASE_URL` in `WAMS/.env`.

### 4. Run migrations to create the schema

```bash
cd backend
flask db init          # creates the migrations/ folder (first time only)
flask db migrate -m "initial schema"
flask db upgrade       # pushes all tables to Supabase
```

### 5. Seed with test data

```bash
python seed.py
```

### SSL

The backend automatically appends `sslmode=require` for all PostgreSQL connections — no manual action needed.

---

## Backend Setup & Run

### 1. Navigate to the backend directory

```bash
cd WAMS/backend
```

### 2. Create and activate a virtual environment (recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

Dependencies installed:

| Package               | Version | Purpose                     |
|-----------------------|---------|-----------------------------|
| Flask                 | 3.1.1   | Web framework               |
| Flask-SQLAlchemy      | 3.1.1   | ORM / database integration  |
| Flask-Migrate         | 4.1.0   | Schema migrations           |
| Flask-JWT-Extended    | 4.7.1   | JWT authentication          |
| Flask-CORS            | 5.0.1   | Cross-origin requests       |
| bcrypt                | 4.3.0   | Password hashing            |
| python-dotenv         | 1.1.0   | Load `.env` file            |

### 4. Initialise the database (first run only)

```bash
python seed.py
```

This creates `wams.db` and populates it with sample users, parts, quotations, orders, and logs. Skip this step if `wams.db` already exists and you want to keep existing data.

### 5. Start the Flask development server

```bash
python run.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

The API is now available at `http://localhost:5000/api/`.

---

## Frontend Setup & Run

### 1. Navigate to the frontend directory

Open a **new terminal** (keep the backend terminal running).

```bash
cd WAMS/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the Vite development server

```bash
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://<your-ip>:5173/
```

Open `http://localhost:5173` in your browser.

### Other npm scripts

| Command           | Description                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start dev server with HMR on port 5173       |
| `npm run build`   | Compile production bundle to `dist/`         |
| `npm run preview` | Serve the production build locally           |
| `npm run lint`    | Run ESLint across all source files           |

---

## Running Both Together

You need **two separate terminals** running at the same time:

| Terminal | Command                               | URL                       |
|----------|---------------------------------------|---------------------------|
| 1        | `cd backend && python run.py`         | http://localhost:5000/api |
| 2        | `cd frontend && npm run dev`          | http://localhost:5173     |

The Vite dev server is configured to proxy all requests starting with `/api` to `http://localhost:5000`, so the frontend never makes direct cross-origin calls in development. This proxy is defined in `vite.config.js`:

```js
// frontend/vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## Database Management

### Re-seed (reset to sample data)

```bash
cd backend
python seed.py
```

This drops all tables and re-creates them with fresh sample data.

### Schema migrations (Flask-Migrate)

Use these commands when you change a model:

```bash
cd backend

# One-time setup (only if no migrations/ folder exists)
flask db init

# After changing a model — generate a new migration file
flask db migrate -m "describe your change"

# Apply pending migrations to the database
flask db upgrade
```

> `FLASK_APP` is automatically detected from `run.py`. If the command fails, set it manually: `set FLASK_APP=run.py` (Windows) or `export FLASK_APP=run.py` (macOS/Linux).

### Inspecting the database

The SQLite file is at `backend/wams.db`. You can open it with any SQLite client, for example:

```bash
# Using the built-in Python shell
cd backend
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); print(db.engine.url)"

# Or open directly with sqlite3
sqlite3 wams.db
.tables
SELECT * FROM user;
.quit
```

---

## Test Credentials

Seeded by `seed.py`:

| Role     | Username  | Password     |
|----------|-----------|--------------|
| Admin    | admin     | admin123     |
| Supplier | supplier1 | supplier123  |
| Dealer   | dealer1   | dealer123    |

Log in at `http://localhost:5173/login`. The app redirects each role to its own dashboard after authentication.

---

## API Overview

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

The JWT token is returned on login and stored in `localStorage` under the key `wams_token`.

| Blueprint     | Prefix             | Key Endpoints                                |
|---------------|--------------------|----------------------------------------------|
| Auth          | `/api/auth`        | `POST /login`, `POST /register`, `POST /refresh` |
| Parts         | `/api/parts`       | CRUD for warehouse parts                     |
| Quotations    | `/api/quotations`  | Supplier quotation submission & admin review |
| Orders        | `/api/orders`      | Dealer order placement & admin management    |
| Bills         | `/api/bills`       | Bill generation and retrieval                |
| Admin         | `/api/admin`       | User management, reports, audit logs         |

### Token refresh

`POST /api/auth/login` returns both an access token (24 h) and a refresh token (30 days):

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
}
```

To get a new access token without logging in again, call `POST /api/auth/refresh` with the refresh token in the `Authorization` header:

```
Authorization: Bearer <refresh_token>
```

The frontend Axios client handles this automatically — expired access tokens trigger a silent refresh, and the original request is retried transparently.

---

## Roles & Access

Access control is enforced server-side via decorators in `backend/app/utils/decorators.py` and client-side via `ProtectedRoute.jsx`.

| Page / Route              | Admin | Dealer | Supplier |
|---------------------------|:-----:|:------:|:--------:|
| `/admin/dashboard`        | Yes   | No     | No       |
| `/admin/parts`            | Yes   | No     | No       |
| `/admin/orders`           | Yes   | No     | No       |
| `/admin/quotations`       | Yes   | No     | No       |
| `/admin/users`            | Yes   | No     | No       |
| `/admin/reports`          | Yes   | No     | No       |
| `/admin/logs`             | Yes   | No     | No       |
| `/dealer/dashboard`       | No    | Yes    | No       |
| `/dealer/place-order`     | No    | Yes    | No       |
| `/dealer/orders`          | No    | Yes    | No       |
| `/dealer/bills`           | No    | Yes    | No       |
| `/supplier/dashboard`     | No    | No     | Yes      |
| `/supplier/quotation`     | No    | No     | Yes      |

---

## Common Issues

### `ModuleNotFoundError` when starting Flask

Ensure your virtual environment is activated and dependencies are installed:
```bash
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### `wams.db` not found / table does not exist

Run the seed script to create and populate the database:
```bash
cd backend
python seed.py
```

### Frontend shows network errors / 404 on `/api` calls

Make sure the **backend is running** on port 5000 before starting the frontend. The Vite proxy only works when the target server is reachable.

### Port already in use

```bash
# Find and kill the process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# macOS / Linux
lsof -ti:5000 | xargs kill
```

### JWT token expired

Access tokens expire after **24 hours**. The Axios interceptor in `src/api/client.js` automatically attempts a silent refresh using the stored refresh token (valid for 30 days) and retries the original request. Only if the refresh also fails does the user get redirected to `/login`.

### `FLASK_APP` not set error during `flask db` commands

```bash
# Windows
set FLASK_APP=run.py

# macOS / Linux
export FLASK_APP=run.py
```
