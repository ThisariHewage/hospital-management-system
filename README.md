# Hospital Management System (HMS)

A modern, full-stack Hospital Management System built with **React + Vite + Tailwind CSS**, **Node.js + Express.js**, and **MySQL**.

## Project Architecture

```
hospital-management-system/
├── database/
│   ├── schema.sql            # Pure MySQL schema script for MySQL Workbench / XAMPP
│   └── seed.sql              # Initial test data (7 roles, departments, patients, etc.)
├── server/                   # Node.js + Express Backend REST API
│   ├── src/
│   │   ├── config/           # Database connection & JWT config
│   │   ├── controllers/      # REST API route handlers
│   │   ├── middleware/       # JWT auth, RBAC role guard, audit logger
│   │   ├── models/           # MySQL query repository layer
│   │   ├── routes/           # Express API routes
│   │   ├── utils/            # Database initialization & backup script
│   │   └── server.js         # Backend server entry point
│   └── package.json
├── client/                   # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/              # Axios HTTP client with credentials
│   │   ├── components/       # Layout, Navigation, Modals, Tables, Calendar
│   │   ├── context/          # Auth & Role Context
│   │   ├── pages/            # 10 clinical & administrative pages
│   │   └── App.jsx           # Protected routes & role-based access
│   └── package.json
└── package.json              # Root script runner (concurrently)
```

## Setup & Running

### 1. Database Setup (MySQL / MySQL Workbench)
1. Start your MySQL Server (via MySQL Workbench or XAMPP).
2. Open **MySQL Workbench**.
3. Open `database/schema.sql` and click **Execute (⚡)**.
4. Open `database/seed.sql` and click **Execute (⚡)**.

### 2. Backend & Frontend Installation
Run the following from the root folder:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Run Development Environment
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`