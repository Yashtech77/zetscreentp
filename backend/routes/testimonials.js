const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();

function rowToTestimonial(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    rating: row.rating,
    text: row.text,
    date: row.date_label,
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id');
    res.json(rows.map(rowToTestimonial));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, role, rating, text, date } = req.body;
    const id = Date.now();
    await db.query(
      'INSERT INTO testimonials (id, name, role, rating, text, date_label) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, role || '', rating || 5, text || '', date || '']
    );
    const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    res.status(201).json(rowToTestimonial(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const t = rows[0];
    const { name, role, rating, text, date } = req.body;
    await db.query(
      'UPDATE testimonials SET name=?, role=?, rating=?, text=?, date_label=? WHERE id=?',
      [name ?? t.name, role ?? t.role, rating ?? t.rating, text ?? t.text, date ?? t.date_label, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    res.json(rowToTestimonial(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
