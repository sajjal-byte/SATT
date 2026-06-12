# SATT – Student Assignment & Task Tracker

> Software Engineering Project | Sajjal Farooq | BSCS 4th Semester, GCUF

A full-stack web app for managing academic assignments, deadlines, and progress across multiple subjects.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | SQLite (via sql.js) |
| Hosting | Netlify (frontend) + Railway (backend) |

## Features

- Add / edit / delete tasks with title, subject, due date, priority and status
- Auto-detects overdue tasks based on today's date
- Filter by subject, status, priority — sort by due date or priority
- Subject-wise progress bars
- Upcoming deadlines sidebar
- Solar system dark theme 🪐 + Sunny day light theme ☀️ with one-click toggle
- REST API backend with persistent SQLite database

## Folder Structure

```
SATT/
├── public/
│   └── index.html     ← Full frontend (single file)
├── server.js          ← Express REST API
├── package.json
└── .gitignore
```

## Run Locally

```bash
npm install
npm start
# Open http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

---
*Developed as part of the Software Engineering course at GCUF*
