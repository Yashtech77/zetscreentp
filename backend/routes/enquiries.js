const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

function rowToEnquiry(row) {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile,
    occupation: row.occupation,
    locationName: row.location_name,
    buildingName: row.building_name,
    roomName: row.room_name,
    message: row.message,
    createdAt: row.created_at,
  };
}

// POST /api/enquiries — public
router.post('/', async (req, res) => {
  try {
    const { name, mobile, occupation, locationName, buildingName, roomName, message } = req.body;
    if (!name || !mobile) return res.status(400).json({ error: 'Name and mobile are required' });
    const id = Date.now();
    await db.query(
      'INSERT INTO enquiries (id, name, mobile, occupation, location_name, building_name, room_name, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name.trim(), mobile.trim(), occupation?.trim() || '', locationName || '', buildingName || '', roomName || '', message || '', new Date()]
    );
    const [rows] = await db.query('SELECT * FROM enquiries WHERE id = ?', [id]);
    res.json(rowToEnquiry(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/enquiries — admin only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM enquiries ORDER BY created_at DESC');
    res.json(rows.map(rowToEnquiry));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/enquiries/:id — admin only
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
