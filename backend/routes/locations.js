const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/locations.json');
const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const readLocations = () => JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const writeLocations = (data) => fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

// Public: enabled locations with enabled buildings
router.get('/', (req, res) => {
  const locations = readLocations();
  const result = locations
    .filter(l => l.enabled)
    .sort((a, b) => a.order - b.order)
    .map(l => ({ ...l, buildings: (l.buildings || []).filter(b => b.enabled) }));
  res.json(result);
});

// Admin: all locations
router.get('/all', authMiddleware, (req, res) => {
  res.json(readLocations().sort((a, b) => a.order - b.order));
});

// Admin: create location
router.post('/', authMiddleware, (req, res) => {
  const { name, slug, enabled, order, mapEmbed } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
  const locations = readLocations();
  const newLocation = {
    id: Date.now(),
    name,
    slug,
    enabled: enabled !== false,
    order: Number(order) || locations.length + 1,
    mapEmbed: mapEmbed || '',
    buildings: [],
  };
  locations.push(newLocation);
  writeLocations(locations);
  res.status(201).json(newLocation);
});

// Admin: update location
router.put('/:id', authMiddleware, (req, res) => {
  const locations = readLocations();
  const idx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Location not found' });
  const { name, slug, enabled, order, mapEmbed } = req.body;
  locations[idx] = {
    ...locations[idx],
    name: name ?? locations[idx].name,
    slug: slug ?? locations[idx].slug,
    enabled: enabled !== undefined ? enabled : locations[idx].enabled,
    order: order !== undefined ? Number(order) : locations[idx].order,
    mapEmbed: mapEmbed !== undefined ? mapEmbed : locations[idx].mapEmbed,
  };
  writeLocations(locations);
  res.json(locations[idx]);
});

// Admin: delete location (also deletes building photos)
router.delete('/:id', authMiddleware, (req, res) => {
  const locations = readLocations();
  const loc = locations.find(l => l.id === parseInt(req.params.id));
  if (!loc) return res.status(404).json({ error: 'Location not found' });
  (loc.buildings || []).forEach(b => {
    (b.photos || []).forEach(url => {
      const filePath = path.join(uploadsDir, path.basename(url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
  });
  writeLocations(locations.filter(l => l.id !== parseInt(req.params.id)));
  res.json({ success: true });
});

// Admin: add building to a location
router.post('/:id/buildings', authMiddleware, (req, res) => {
  const locations = readLocations();
  const idx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Location not found' });
  const { name, type, price, description, address, amenities, enabled } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const parseAmenities = (a) => Array.isArray(a) ? a : (a || '').split(',').map(x => x.trim()).filter(Boolean);
  const newBuilding = {
    id: Date.now(),
    name,
    type: type || 'boys',
    price: Number(price) || 0,
    description: description || '',
    address: address || '',
    amenities: parseAmenities(amenities),
    photos: [],
    enabled: enabled !== false,
  };
  locations[idx].buildings = locations[idx].buildings || [];
  locations[idx].buildings.push(newBuilding);
  writeLocations(locations);
  res.status(201).json(newBuilding);
});

// Admin: update building
router.put('/:id/buildings/:bid', authMiddleware, (req, res) => {
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const { name, type, price, description, address, amenities, enabled } = req.body;
  const b = locations[locIdx].buildings[bIdx];
  const parseAmenities = (a) => Array.isArray(a) ? a : (a || '').split(',').map(x => x.trim()).filter(Boolean);
  locations[locIdx].buildings[bIdx] = {
    ...b,
    name: name ?? b.name,
    type: type ?? b.type,
    price: price !== undefined ? Number(price) : b.price,
    description: description !== undefined ? description : b.description,
    address: address !== undefined ? address : b.address,
    amenities: amenities !== undefined ? parseAmenities(amenities) : b.amenities,
    enabled: enabled !== undefined ? enabled : b.enabled,
  };
  writeLocations(locations);
  res.json(locations[locIdx].buildings[bIdx]);
});

// Admin: delete building (also deletes photos)
router.delete('/:id/buildings/:bid', authMiddleware, (req, res) => {
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const building = (locations[locIdx].buildings || []).find(b => b.id === parseInt(req.params.bid));
  if (!building) return res.status(404).json({ error: 'Building not found' });
  (building.photos || []).forEach(url => {
    const filePath = path.join(uploadsDir, path.basename(url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
  locations[locIdx].buildings = locations[locIdx].buildings.filter(b => b.id !== parseInt(req.params.bid));
  writeLocations(locations);
  res.json({ success: true });
});

// Admin: upload photo to a building
router.post('/:id/buildings/:bid/photos', authMiddleware, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const url = `/uploads/${req.file.filename}`;
  locations[locIdx].buildings[bIdx].photos = locations[locIdx].buildings[bIdx].photos || [];
  locations[locIdx].buildings[bIdx].photos.push(url);
  writeLocations(locations);
  res.status(201).json({ url });
});

// Admin: delete photo from a building
router.delete('/:id/buildings/:bid/photos', authMiddleware, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const filePath = path.join(uploadsDir, path.basename(url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  locations[locIdx].buildings[bIdx].photos = (locations[locIdx].buildings[bIdx].photos || []).filter(p => p !== url);
  writeLocations(locations);
  res.json({ success: true });
});

// ── Room Types ────────────────────────────────────────────────

// Admin: add room type to a building
router.post('/:id/buildings/:bid/rooms', authMiddleware, (req, res) => {
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const { name, occupancy, price, description, amenities, enabled } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const parseAmenities = (a) => Array.isArray(a) ? a : (a || '').split(',').map(x => x.trim()).filter(Boolean);
  const newRoom = {
    id: Date.now(),
    name,
    occupancy: occupancy || 'single',
    price: Number(price) || 0,
    description: description || '',
    amenities: parseAmenities(amenities),
    photos: [],
    enabled: enabled !== false,
  };
  locations[locIdx].buildings[bIdx].roomTypes = locations[locIdx].buildings[bIdx].roomTypes || [];
  locations[locIdx].buildings[bIdx].roomTypes.push(newRoom);
  writeLocations(locations);
  res.status(201).json(newRoom);
});

// Admin: update room type
router.put('/:id/buildings/:bid/rooms/:rid', authMiddleware, (req, res) => {
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const rIdx = (locations[locIdx].buildings[bIdx].roomTypes || []).findIndex(r => r.id === parseInt(req.params.rid));
  if (rIdx === -1) return res.status(404).json({ error: 'Room not found' });
  const { name, occupancy, price, description, amenities, enabled } = req.body;
  const r = locations[locIdx].buildings[bIdx].roomTypes[rIdx];
  const parseAmenities = (a) => Array.isArray(a) ? a : (a || '').split(',').map(x => x.trim()).filter(Boolean);
  locations[locIdx].buildings[bIdx].roomTypes[rIdx] = {
    ...r,
    name: name ?? r.name,
    occupancy: occupancy ?? r.occupancy,
    price: price !== undefined ? Number(price) : r.price,
    description: description !== undefined ? description : r.description,
    amenities: amenities !== undefined ? parseAmenities(amenities) : r.amenities,
    enabled: enabled !== undefined ? enabled : r.enabled,
  };
  writeLocations(locations);
  res.json(locations[locIdx].buildings[bIdx].roomTypes[rIdx]);
});

// Admin: delete room type (+ photos)
router.delete('/:id/buildings/:bid/rooms/:rid', authMiddleware, (req, res) => {
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const room = (locations[locIdx].buildings[bIdx].roomTypes || []).find(r => r.id === parseInt(req.params.rid));
  if (!room) return res.status(404).json({ error: 'Room not found' });
  (room.photos || []).forEach(url => {
    const filePath = path.join(uploadsDir, path.basename(url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
  locations[locIdx].buildings[bIdx].roomTypes = locations[locIdx].buildings[bIdx].roomTypes.filter(r => r.id !== parseInt(req.params.rid));
  writeLocations(locations);
  res.json({ success: true });
});

// Admin: upload photo to a room type
router.post('/:id/buildings/:bid/rooms/:rid/photos', authMiddleware, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const rIdx = (locations[locIdx].buildings[bIdx].roomTypes || []).findIndex(r => r.id === parseInt(req.params.rid));
  if (rIdx === -1) return res.status(404).json({ error: 'Room not found' });
  const url = `/uploads/${req.file.filename}`;
  locations[locIdx].buildings[bIdx].roomTypes[rIdx].photos = locations[locIdx].buildings[bIdx].roomTypes[rIdx].photos || [];
  locations[locIdx].buildings[bIdx].roomTypes[rIdx].photos.push(url);
  writeLocations(locations);
  res.status(201).json({ url });
});

// Admin: delete photo from a room type
router.delete('/:id/buildings/:bid/rooms/:rid/photos', authMiddleware, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });
  const locations = readLocations();
  const locIdx = locations.findIndex(l => l.id === parseInt(req.params.id));
  if (locIdx === -1) return res.status(404).json({ error: 'Location not found' });
  const bIdx = (locations[locIdx].buildings || []).findIndex(b => b.id === parseInt(req.params.bid));
  if (bIdx === -1) return res.status(404).json({ error: 'Building not found' });
  const rIdx = (locations[locIdx].buildings[bIdx].roomTypes || []).findIndex(r => r.id === parseInt(req.params.rid));
  if (rIdx === -1) return res.status(404).json({ error: 'Room not found' });
  const filePath = path.join(uploadsDir, path.basename(url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  locations[locIdx].buildings[bIdx].roomTypes[rIdx].photos = (locations[locIdx].buildings[bIdx].roomTypes[rIdx].photos || []).filter(p => p !== url);
  writeLocations(locations);
  res.json({ success: true });
});

module.exports = router;