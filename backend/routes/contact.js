const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact WHERE id = 1');
    if (!rows.length) return res.json({});
    const row = rows[0];
    res.json({
      phone: row.phone,
      whatsapp: row.whatsapp,
      email: row.email,
      address: row.address,
      addressFull: row.address_full,
      hours: row.hours,
      stats: row.stats || [],
      branches: row.branches || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact WHERE id = 1');
    const current = rows[0] || {};
    const {
      phone, whatsapp, email, address, addressFull, hours, stats, branches,
    } = req.body;
    await db.query(
      `INSERT INTO contact (id, phone, whatsapp, email, address, address_full, hours, stats, branches)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         phone = VALUES(phone),
         whatsapp = VALUES(whatsapp),
         email = VALUES(email),
         address = VALUES(address),
         address_full = VALUES(address_full),
         hours = VALUES(hours),
         stats = VALUES(stats),
         branches = VALUES(branches)`,
      [
        phone ?? current.phone,
        whatsapp ?? current.whatsapp,
        email ?? current.email,
        address ?? current.address,
        addressFull ?? current.address_full,
        hours ?? current.hours,
        JSON.stringify(stats ?? current.stats ?? []),
        JSON.stringify(branches ?? current.branches ?? []),
      ]
    );
    const [updated] = await db.query('SELECT * FROM contact WHERE id = 1');
    const r = updated[0];
    res.json({
      phone: r.phone, whatsapp: r.whatsapp, email: r.email,
      address: r.address, addressFull: r.address_full, hours: r.hours,
      stats: r.stats || [], branches: r.branches || [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
