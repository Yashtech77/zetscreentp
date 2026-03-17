const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

function rowToOffer(row) {
  return {
    enabled: Boolean(row.enabled),
    title: row.title,
    subtitle: row.subtitle,
    discount: row.discount,
    discountPercent: row.discount_percent,
    validUntil: row.valid_until ? row.valid_until.toISOString().split('T')[0] : null,
    bgColor: row.bg_color,
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM offers WHERE id = 1');
    if (!rows.length) return res.json({ enabled: false });
    res.json(rowToOffer(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM offers WHERE id = 1');
    const current = rows[0] || {};
    const { enabled, title, subtitle, discount, discountPercent, validUntil, bgColor } = req.body;
    await db.query(
      `INSERT INTO offers (id, enabled, title, subtitle, discount, discount_percent, valid_until, bg_color)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         enabled = VALUES(enabled),
         title = VALUES(title),
         subtitle = VALUES(subtitle),
         discount = VALUES(discount),
         discount_percent = VALUES(discount_percent),
         valid_until = VALUES(valid_until),
         bg_color = VALUES(bg_color)`,
      [
        enabled !== undefined ? (enabled ? 1 : 0) : current.enabled,
        title ?? current.title,
        subtitle ?? current.subtitle,
        discount ?? current.discount,
        discountPercent !== undefined ? discountPercent : current.discount_percent,
        validUntil !== undefined ? (validUntil || null) : current.valid_until,
        bgColor ?? current.bg_color,
      ]
    );
    const [updated] = await db.query('SELECT * FROM offers WHERE id = 1');
    res.json(rowToOffer(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
