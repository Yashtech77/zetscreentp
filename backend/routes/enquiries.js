const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const DATA_FILE = path.join(__dirname, '../data/enquiries.json');

function read() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function write(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// POST /api/enquiries — public, called from frontend before WhatsApp redirect
router.post('/', (req, res) => {
  const { name, mobile, occupation, locationName, buildingName, roomName, message } = req.body;
  if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required' });

  const enquiries = read();
  const entry = {
    id: Date.now(),
    name: name.trim(),
    mobile: mobile.trim(),
    occupation: occupation?.trim() || '',
    locationName: locationName || '',
    buildingName: buildingName || '',
    roomName: roomName || '',
    message: message || '',
    createdAt: new Date().toISOString(),
  };
  enquiries.unshift(entry);
  write(enquiries);
  res.json(entry);
});

// GET /api/enquiries — admin only
router.get('/', authMiddleware, (req, res) => {
  res.json(read());
});

// DELETE /api/enquiries/:id — admin only
router.delete('/:id', authMiddleware, (req, res) => {
  const enquiries = read();
  const updated = enquiries.filter(e => e.id !== parseInt(req.params.id));
  write(updated);
  res.json({ ok: true });
});

module.exports = router;
