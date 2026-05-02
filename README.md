# TMS — Task Management System

A full-stack **Trello-inspired** project & task management application built with the **MERN stack**.

## ✨ Features

| Area | What's included |
|------|----------------|
| 🔐 Auth | Register, Login, JWT, password change |
| 🗂️ Workspaces | Multi-workspace support with role-based access |
| 📁 Projects | Create, manage, color/icon customization |
| ✅ Tasks | Full CRUD, priorities, deadlines, checklists, attachments |
| 🧱 Kanban | Drag-and-drop board powered by **@dnd-kit** |
| 💬 Comments | Threaded comments with emoji reactions |
| 📡 Real-time | Socket.io for live task updates & chat |
| 💬 Chat | Project group chat + direct messages |
| 🔔 Notifications | Real-time push notifications with read/unread |
| 📜 Activity | Full audit trail of all user actions |
| 📅 Calendar | Task deadline calendar view |
| 🌙 Dark Mode | Persistent theme preference |
| ☁️ Uploads | Cloudinary avatar & file attachments |
| ⏰ Cron | Daily deadline reminders via node-cron |

## 🏗️ Tech Stack

**Backend:** Node.js · Express · MongoDB (Mongoose) · Socket.io · JWT · Cloudinary · Nodemailer · node-cron · Winston

**Frontend:** React 18 · Vite · Redux Toolkit · TailwindCSS · @dnd-kit · Recharts · Framer Motion · react-hot-toast

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env      # fill in your values

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Environment Variables

**backend/.env**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run

```bash
# Backend (in /backend)
npm run dev

# Frontend (in /frontend)
npm run dev
```

Open → **http://localhost:5173**

## 📂 Project Structure

```
TMS/
├── backend/
│   ├── config/          # DB, Cloudinary, Socket.io
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── middleware/       # Auth, RBAC, error, upload
│   ├── services/        # Email, notifications, activity
│   ├── sockets/         # Chat & notification socket handlers
│   ├── jobs/            # Deadline cron job
│   ├── validations/     # express-validator rules
│   ├── utils/           # Logger, JWT, constants
│   ├── app.js
│   └── server.js
└── frontend/
    └── src/
        ├── app/         # Redux store
        ├── features/    # Redux slices (auth, tasks, projects…)
        ├── components/  # UI, Layout, Kanban, Chat, Timeline
        ├── pages/       # All route pages
        ├── hooks/       # useAuth, useSocket, useTheme
        ├── services/    # Axios API wrappers
        ├── context/     # ThemeContext
        └── utils/       # Helpers, constants
```

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Backend | Render / Railway |
| Frontend | Vercel / Netlify |
| Database | MongoDB Atlas |
| Files | Cloudinary |

## 📄 License

MIT
