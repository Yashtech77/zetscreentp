const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/testimonials.json');

const readData = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const writeData = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  res.json(readData());
});

router.post('/', authMiddleware, (req, res) => {
  const items = readData();
  const newItem = { ...req.body, id: Date.now() };
  items.push(newItem);
  writeData(items);
  res.status(201).json(newItem);
});

router.put('/:id', authMiddleware, (req, res) => {
  const items = readData();
  const idx = items.findIndex(i => i.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  items[idx] = { ...items[idx], ...req.body, id: items[idx].id };
  writeData(items);
  res.json(items[idx]);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const items = readData();
  const filtered = items.filter(i => i.id !== parseInt(req.params.id));
  if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
  writeData(filtered);
  res.json({ success: true });
});

module.exports = router;
