const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDb, getState, saveState } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/state', async (req, res) => {
  try {
    const state = await getState();
    res.json(state);
  } catch (error) {
    console.error('Error reading state from DB:', error);
    res.status(500).json({ error: 'Database read failed' });
  }
});

app.post('/api/state', async (req, res) => {
  try {
    const state = req.body;
    await saveState(state);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving state to DB:', error);
    res.status(500).json({ error: 'Database write failed' });
  }
});

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Database initialization failed', err);
    process.exit(1);
  });
