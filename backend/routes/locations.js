const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const db = require('../db');

const router = express.Router();
const uploadsDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const parseAmenities = (a) =>
  Array.isArray(a) ? a : (a || '').split(',').map(x => x.trim()).filter(Boolean);

async function buildBuilding(b) {
  const [amenities] = await db.query('SELECT amenity FROM building_amenities WHERE building_id = ?', [b.id]);
  const [photos] = await db.query('SELECT url FROM building_photos WHERE building_id = ? ORDER BY id', [b.id]);
  const [roomTypes] = await db.query('SELECT * FROM room_types WHERE building_id = ? ORDER BY id', [b.id]);
  for (const rt of roomTypes) {
    const [rAm] = await db.query('SELECT amenity FROM room_amenities WHERE room_type_id = ?', [rt.id]);
    const [rPh] = await db.query('SELECT url FROM room_photos WHERE room_type_id = ? ORDER BY id', [rt.id]);
    rt.amenities = rAm.map(r => r.amenity);
    rt.photos = rPh.map(r => r.url);
    rt.enabled = Boolean(rt.enabled);
  }
  return {
    id: b.id,
    name: b.name,
    type: b.type,
    price: b.price,
    description: b.description,
    address: b.address,
    enabled: Boolean(b.enabled),
    amenities: amenities.map(r => r.amenity),
    photos: photos.map(r => r.url),
    roomTypes,
  };
}

async function buildLocation(loc, enabledBuildingsOnly = false) {
  const query = enabledBuildingsOnly
    ? 'SELECT * FROM buildings WHERE location_id = ? AND enabled = 1 ORDER BY id'
    : 'SELECT * FROM buildings WHERE location_id = ? ORDER BY id';
  const [buildings] = await db.query(query, [loc.id]);
  const fullBuildings = await Promise.all(buildings.map(b => buildBuilding(b)));
  return {
    id: loc.id,
    name: loc.name,
    slug: loc.slug,
    enabled: Boolean(loc.enabled),
    order: loc.display_order,
    phone: loc.phone || '',
    whatsapp: loc.whatsapp || '',
    mapEmbed: loc.map_embed || '',
    buildings: fullBuildings,
  };
}

// Public: enabled locations with enabled buildings
router.get('/', async (req, res) => {
  try {
    const [locations] = await db.query('SELECT * FROM locations WHERE enabled = 1 ORDER BY display_order');
    const result = await Promise.all(locations.map(l => buildLocation(l, true)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: all locations
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const [locations] = await db.query('SELECT * FROM locations ORDER BY display_order');
    const result = await Promise.all(locations.map(l => buildLocation(l, false)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: create location
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, slug, enabled, order, mapEmbed, phone, whatsapp } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });
    const [cnt] = await db.query('SELECT COUNT(*) as c FROM locations');
    const id = Date.now();
    const displayOrder = Number(order) || cnt[0].c + 1;
    await db.query(
      'INSERT INTO locations (id, name, slug, enabled, display_order, phone, whatsapp, map_embed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, slug, enabled !== false ? 1 : 0, displayOrder, phone || '', whatsapp || '', mapEmbed || '']
    );
    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [id]);
    res.status(201).json(await buildLocation(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: update location
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Location not found' });
    const loc = rows[0];
    const { name, slug, enabled, order, mapEmbed, phone, whatsapp } = req.body;
    await db.query(
      'UPDATE locations SET name=?, slug=?, enabled=?, display_order=?, phone=?, whatsapp=?, map_embed=? WHERE id=?',
      [
        name ?? loc.name,
        slug ?? loc.slug,
        enabled !== undefined ? (enabled ? 1 : 0) : loc.enabled,
        order !== undefined ? Number(order) : loc.display_order,
        phone !== undefined ? phone : loc.phone,
        whatsapp !== undefined ? whatsapp : loc.whatsapp,
        mapEmbed !== undefined ? mapEmbed : loc.map_embed,
        req.params.id,
      ]
    );
    const [updated] = await db.query('SELECT * FROM locations WHERE id = ?', [req.params.id]);
    res.json(await buildLocation(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: delete location
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM locations WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Location not found' });
    await db.query('DELETE FROM locations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: add building
router.post('/:id/buildings', authMiddleware, async (req, res) => {
  try {
    const [locs] = await db.query('SELECT id FROM locations WHERE id = ?', [req.params.id]);
    if (!locs.length) return res.status(404).json({ error: 'Location not found' });
    const { name, type, price, description, address, amenities, enabled } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = Date.now();
    await db.query(
      'INSERT INTO buildings (id, location_id, name, type, price, description, address, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.params.id, name, type || 'boys', Number(price) || 0, description || '', address || '', enabled !== false ? 1 : 0]
    );
    for (const a of parseAmenities(amenities)) {
      await db.query('INSERT INTO building_amenities (building_id, amenity) VALUES (?, ?)', [id, a]);
    }
    const [rows] = await db.query('SELECT * FROM buildings WHERE id = ?', [id]);
    res.status(201).json(await buildBuilding(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: update building
router.put('/:id/buildings/:bid', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM buildings WHERE id = ? AND location_id = ?', [req.params.bid, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Building not found' });
    const b = rows[0];
    const { name, type, price, description, address, amenities, enabled } = req.body;
    await db.query(
      'UPDATE buildings SET name=?, type=?, price=?, description=?, address=?, enabled=? WHERE id=?',
      [
        name ?? b.name,
        type ?? b.type,
        price !== undefined ? Number(price) : b.price,
        description !== undefined ? description : b.description,
        address !== undefined ? address : b.address,
        enabled !== undefined ? (enabled ? 1 : 0) : b.enabled,
        req.params.bid,
      ]
    );
    if (amenities !== undefined) {
      await db.query('DELETE FROM building_amenities WHERE building_id = ?', [req.params.bid]);
      for (const a of parseAmenities(amenities)) {
        await db.query('INSERT INTO building_amenities (building_id, amenity) VALUES (?, ?)', [req.params.bid, a]);
      }
    }
    const [updated] = await db.query('SELECT * FROM buildings WHERE id = ?', [req.params.bid]);
    res.json(await buildBuilding(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: delete building
router.delete('/:id/buildings/:bid', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM buildings WHERE id = ? AND location_id = ?', [req.params.bid, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Building not found' });
    await db.query('DELETE FROM buildings WHERE id = ?', [req.params.bid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: upload building photo
router.post('/:id/buildings/:bid/photos', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const [rows] = await db.query('SELECT id FROM buildings WHERE id = ? AND location_id = ?', [req.params.bid, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Building not found' });
    const url = `/uploads/${req.file.filename}`;
    await db.query('INSERT INTO building_photos (building_id, url) VALUES (?, ?)', [req.params.bid, url]);
    res.status(201).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: delete building photo
router.delete('/:id/buildings/:bid/photos', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    await db.query('DELETE FROM building_photos WHERE building_id = ? AND url = ?', [req.params.bid, url]);
    const filePath = path.join(uploadsDir, path.basename(url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: add room type
router.post('/:id/buildings/:bid/rooms', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM buildings WHERE id = ? AND location_id = ?', [req.params.bid, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Building not found' });
    const { name, occupancy, price, description, amenities, enabled } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = Date.now();
    await db.query(
      'INSERT INTO room_types (id, building_id, name, occupancy, price, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, req.params.bid, name, occupancy || 'single', Number(price) || 0, description || '', enabled !== false ? 1 : 0]
    );
    for (const a of parseAmenities(amenities)) {
      await db.query('INSERT INTO room_amenities (room_type_id, amenity) VALUES (?, ?)', [id, a]);
    }
    const [rtRows] = await db.query('SELECT * FROM room_types WHERE id = ?', [id]);
    const [rAm] = await db.query('SELECT amenity FROM room_amenities WHERE room_type_id = ?', [id]);
    const [rPh] = await db.query('SELECT url FROM room_photos WHERE room_type_id = ?', [id]);
    const rt = rtRows[0];
    res.status(201).json({ ...rt, enabled: Boolean(rt.enabled), amenities: rAm.map(r => r.amenity), photos: rPh.map(r => r.url) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: update room type
router.put('/:id/buildings/:bid/rooms/:rid', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM room_types WHERE id = ? AND building_id = ?', [req.params.rid, req.params.bid]);
    if (!rows.length) return res.status(404).json({ error: 'Room not found' });
    const r = rows[0];
    const { name, occupancy, price, description, amenities, enabled } = req.body;
    await db.query(
      'UPDATE room_types SET name=?, occupancy=?, price=?, description=?, enabled=? WHERE id=?',
      [
        name ?? r.name,
        occupancy ?? r.occupancy,
        price !== undefined ? Number(price) : r.price,
        description !== undefined ? description : r.description,
        enabled !== undefined ? (enabled ? 1 : 0) : r.enabled,
        req.params.rid,
      ]
    );
    if (amenities !== undefined) {
      await db.query('DELETE FROM room_amenities WHERE room_type_id = ?', [req.params.rid]);
      for (const a of parseAmenities(amenities)) {
        await db.query('INSERT INTO room_amenities (room_type_id, amenity) VALUES (?, ?)', [req.params.rid, a]);
      }
    }
    const [updated] = await db.query('SELECT * FROM room_types WHERE id = ?', [req.params.rid]);
    const [rAm] = await db.query('SELECT amenity FROM room_amenities WHERE room_type_id = ?', [req.params.rid]);
    const [rPh] = await db.query('SELECT url FROM room_photos WHERE room_type_id = ? ORDER BY id', [req.params.rid]);
    const rt = updated[0];
    res.json({ ...rt, enabled: Boolean(rt.enabled), amenities: rAm.map(r => r.amenity), photos: rPh.map(r => r.url) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: delete room type
router.delete('/:id/buildings/:bid/rooms/:rid', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id FROM room_types WHERE id = ? AND building_id = ?', [req.params.rid, req.params.bid]);
    if (!rows.length) return res.status(404).json({ error: 'Room not found' });
    await db.query('DELETE FROM room_types WHERE id = ?', [req.params.rid]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: upload room photo
router.post('/:id/buildings/:bid/rooms/:rid/photos', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const [rows] = await db.query('SELECT id FROM room_types WHERE id = ? AND building_id = ?', [req.params.rid, req.params.bid]);
    if (!rows.length) return res.status(404).json({ error: 'Room not found' });
    const url = `/uploads/${req.file.filename}`;
    await db.query('INSERT INTO room_photos (room_type_id, url) VALUES (?, ?)', [req.params.rid, url]);
    res.status(201).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin: delete room photo
router.delete('/:id/buildings/:bid/rooms/:rid/photos', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    await db.query('DELETE FROM room_photos WHERE room_type_id = ? AND url = ?', [req.params.rid, url]);
    const filePath = path.join(uploadsDir, path.basename(url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
