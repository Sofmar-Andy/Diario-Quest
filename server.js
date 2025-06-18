// server.js
const express = require('express');
const db = require('./db');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Obtener usuarios
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, xp, level FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar usuario
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (name,email,password) VALUES (?,?,?)',
      [name, email, password]
    );
    res.json({ id: result.insertId, name, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Más rutas para login, metas, diario, logros...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
