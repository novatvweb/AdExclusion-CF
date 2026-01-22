
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Interni port za rad iza Nginxa
const port = process.env.PORT || 3000;

// Trust proxy je obavezan jer SSL terminira Nginx
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'rules.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DB_PATH) || fs.readFileSync(DB_PATH, 'utf8').trim() === "") {
  fs.writeFileSync(DB_PATH, JSON.stringify({ rules: [], script: '// Initial sync' }), 'utf8');
}

const readDB = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8').trim();
    return raw ? JSON.parse(raw) : { rules: [], script: '' };
  } catch (e) {
    return { rules: [], script: '' };
  }
};

app.get('/api/sync', (req, res) => {
  res.json(readDB());
});

app.post('/api/sync', (req, res) => {
  const current = readDB();
  const updated = { ...current, ...req.body };
  fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2), 'utf8');
  res.json({ success: true });
});

app.get('/exclusions/sponsorship_exclusions.js', (req, res) => {
  const data = readDB();
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.send(data.script || '/* AdExclusion: No active rules */');
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '127.0.0.1', () => {
  console.log(`---------------------------------------------------`);
  console.log(`🚀 AdExclusion Core Engine (Internal Mode)`);
  console.log(`📍 Port: ${port} (Listening on Localhost only)`);
  console.log(`🔒 Proxy: Nginx manages SSL & Public Port 443`);
  console.log(`---------------------------------------------------`);
});
