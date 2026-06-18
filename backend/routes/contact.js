const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
const fallbackFile = path.join(__dirname, '../data/contact.json');

function parseJSON(val, fallback) {
  if (Array.isArray(val) || (val && typeof val === 'object')) return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function loadFallbackContact() {
  try {
    const raw = fs.readFileSync(fallbackFile, 'utf8');
    const contact = JSON.parse(raw);
    return {
      phone: contact.phone || '',
      whatsapp: contact.whatsapp || '',
      email: contact.email || '',
      address: contact.address || '',
      addressFull: contact.addressFull || '',
      hours: contact.hours || '',
      stats: Array.isArray(contact.stats) ? contact.stats : [],
      branches: Array.isArray(contact.branches) ? contact.branches : [],
    };
  } catch {
    return {
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      addressFull: '',
      hours: '',
      stats: [],
      branches: [],
    };
  }
}

function rowToContact(row) {
  if (!row) return loadFallbackContact();
  return {
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    address: row.address || '',
    addressFull: row.address_full || '',
    hours: row.hours || '',
    stats: parseJSON(row.stats, []),
    branches: parseJSON(row.branches, []),
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact WHERE id = 1');
    if (!rows.length) return res.json(loadFallbackContact());
    res.json(rowToContact(rows[0]));
  } catch (err) {
    console.error(err);
    res.json(loadFallbackContact());
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
    res.json(rowToContact(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
