const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/hero-images.json');
const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const read = () => {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
  catch { return []; }
};
const write = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

router.get('/', (req, res) => res.json(read()));

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const images = read();
  const item = {
    id: Date.now(),
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    title: req.body.title || req.file.originalname,
  };
  images.push(item);
  write(images);
  res.status(201).json(item);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const images = read();
  const item = images.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  write(images.filter(i => i.id !== parseInt(req.params.id)));
  res.json({ success: true });
});

module.exports = router;
