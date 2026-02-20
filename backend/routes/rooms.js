const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/rooms.json');

const readRooms = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const writeRooms = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  res.json(readRooms());
});

router.post('/', authMiddleware, (req, res) => {
  const rooms = readRooms();
  const newRoom = { ...req.body, id: Date.now() };
  rooms.push(newRoom);
  writeRooms(rooms);
  res.status(201).json(newRoom);
});

router.put('/:id', authMiddleware, (req, res) => {
  const rooms = readRooms();
  const idx = rooms.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Room not found' });
  rooms[idx] = { ...rooms[idx], ...req.body, id: rooms[idx].id };
  writeRooms(rooms);
  res.json(rooms[idx]);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const rooms = readRooms();
  const filtered = rooms.filter(r => r.id !== parseInt(req.params.id));
  if (filtered.length === rooms.length) return res.status(404).json({ error: 'Room not found' });
  writeRooms(filtered);
  res.json({ success: true });
});

module.exports = router;
