const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/gallery.json');
const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const readGallery = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const writeGallery = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  res.json(readGallery());
});

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const gallery = readGallery();
  const newItem = {
    id: Date.now(),
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    title: req.body.title || req.file.originalname,
    category: req.body.category || 'room',
  };
  gallery.push(newItem);
  writeGallery(gallery);
  res.status(201).json(newItem);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const gallery = readGallery();
  const item = gallery.find(g => g.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Image not found' });
  const filePath = path.join(uploadsDir, item.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  const filtered = gallery.filter(g => g.id !== parseInt(req.params.id));
  writeGallery(filtered);
  res.json({ success: true });
});

module.exports = router;
