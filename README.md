# Cafe Website (cafe-v1)

A full-stack cafe web application consisting of a modular backend API and a frontend client.

---

## 📁 Repository Structure

```text
cafe-v1/
├── cafe-backend/      # Fastify + TypeScript + PostgreSQL + Prisma backend
├── frontend/          # Web frontend application
├── .gitignore         # Root gitignore
└── README.md          # Project overview & quickstart
```

---

## 🚀 Quick Start

### 1. Backend Setup

The backend handles customer authentication, menu browsing, cart checkout/demonstration orders, and table reservations.

```bash
cd cafe-backend

# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Setup database (PostgreSQL required or use Docker)
npm run db:generate
npm run db:deploy
npm run db:seed

# 4. Start backend server
npm run dev
```

* **Backend Base URL:** `http://localhost:4000/api/v1`
* **Interactive API Documentation (Swagger UI):** `http://localhost:4000/docs`
* **Health Check:** `http://localhost:4000/health`

> For detailed backend architecture, database schemas, and endpoints, see [cafe-backend/README.md](./cafe-backend/README.md).

---

### 2. Running with Docker Compose (Recommended for Backend)

If you have Docker Desktop installed, you can spin up PostgreSQL and the backend API with a single command:

```bash
cd cafe-backend
cp .env.example .env
docker compose up --build
```

---

### 3. Frontend Setup

```bash
cd frontend
# Run frontend development setup once chosen (e.g., npm install && npm run dev)
```

* Frontend connects to API at: `http://localhost:4000/api/v1`
* CORS is already enabled on the backend to allow requests from local frontend servers (Vite, Next.js, Create React App, etc.).

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Fastify, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcrypt, Pino
* **API Specs:** Swagger / OpenAPI 3.0 (`/docs`)
* **Frontend:** In development (`frontend/`)
