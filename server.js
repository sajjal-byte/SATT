const express = require('express');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');
const initSqlJs = require('sql.js');

const app    = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'satt.db');

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE INIT ─────────────────────────────────────────────────────────────
let db;

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing DB file or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id        TEXT PRIMARY KEY,
      title     TEXT NOT NULL,
      subject   TEXT NOT NULL,
      due       TEXT NOT NULL,
      priority  TEXT NOT NULL DEFAULT 'medium',
      status    TEXT NOT NULL DEFAULT 'pending',
      notes     TEXT DEFAULT '',
      created   INTEGER NOT NULL
    )
  `);

  

  console.log(`📁 Database ready (${count === 0 ? 'new' : 'existing'}): satt.db`);
}

// Save DB to disk after every write
function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Convert sql.js query result to array of objects
function rowsToObjects(result) {
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}

// ── API ROUTES ────────────────────────────────────────────────────────────────

// GET all tasks
app.get('/api/tasks', (req, res) => {
  const result = db.exec('SELECT * FROM tasks ORDER BY due ASC');
  res.json(rowsToObjects(result));
});

// GET single task
app.get('/api/tasks/:id', (req, res) => {
  const result = db.exec('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  const tasks  = rowsToObjects(result);
  if (!tasks.length) return res.status(404).json({ error: 'Task not found' });
  res.json(tasks[0]);
});

// POST create task
app.post('/api/tasks', (req, res) => {
  const { title, subject, due, priority = 'medium', status = 'pending', notes = '' } = req.body;
  if (!title || !subject || !due) {
    return res.status(400).json({ error: 'title, subject, and due are required' });
  }

  const task = {
    id:      crypto.randomUUID(),
    title:   title.trim(),
    subject: subject.trim(),
    due,
    priority,
    status,
    notes:   notes.trim(),
    created: Date.now()
  };

  db.run(
    'INSERT INTO tasks (id,title,subject,due,priority,status,notes,created) VALUES (?,?,?,?,?,?,?,?)',
    [task.id, task.title, task.subject, task.due, task.priority, task.status, task.notes, task.created]
  );
  saveDB();
  res.status(201).json(task);
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  const existing = rowsToObjects(db.exec('SELECT * FROM tasks WHERE id = ?', [req.params.id]));
  if (!existing.length) return res.status(404).json({ error: 'Task not found' });
  const e = existing[0];

  const updated = {
    id:      req.params.id,
    title:   (req.body.title   ?? e.title).trim(),
    subject: (req.body.subject ?? e.subject).trim(),
    due:     req.body.due      ?? e.due,
    priority:req.body.priority ?? e.priority,
    status:  req.body.status   ?? e.status,
    notes:   (req.body.notes   ?? e.notes ?? '').trim(),
    created: e.created
  };

  db.run(
    'UPDATE tasks SET title=?,subject=?,due=?,priority=?,status=?,notes=? WHERE id=?',
    [updated.title, updated.subject, updated.due, updated.priority, updated.status, updated.notes, updated.id]
  );
  saveDB();
  res.json(updated);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  const existing = rowsToObjects(db.exec('SELECT * FROM tasks WHERE id = ?', [req.params.id]));
  if (!existing.length) return res.status(404).json({ error: 'Task not found' });
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  saveDB();
  res.json({ success: true });
});

// ── START ─────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 SATT is running → http://localhost:${PORT}\n`);
  });
});
