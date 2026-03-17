require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('Connected to MySQL. Creating tables...');

  await db.query(`
    CREATE TABLE IF NOT EXISTS locations (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      enabled TINYINT(1) DEFAULT 1,
      display_order INT DEFAULT 1,
      phone VARCHAR(50) DEFAULT '',
      whatsapp VARCHAR(50) DEFAULT '',
      map_embed TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS buildings (
      id BIGINT PRIMARY KEY,
      location_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(20) DEFAULT 'boys',
      price INT DEFAULT 0,
      description TEXT,
      address TEXT,
      enabled TINYINT(1) DEFAULT 1,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS building_amenities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      building_id BIGINT NOT NULL,
      amenity VARCHAR(255) NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS building_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      building_id BIGINT NOT NULL,
      url VARCHAR(500) NOT NULL,
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS room_types (
      id BIGINT PRIMARY KEY,
      building_id BIGINT NOT NULL,
      name VARCHAR(255) NOT NULL,
      occupancy VARCHAR(50) DEFAULT 'double_sharing',
      price INT DEFAULT 0,
      description TEXT,
      enabled TINYINT(1) DEFAULT 1,
      FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS room_amenities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_type_id BIGINT NOT NULL,
      amenity VARCHAR(255) NOT NULL,
      FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS room_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_type_id BIGINT NOT NULL,
      url VARCHAR(500) NOT NULL,
      FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255),
      mobile VARCHAR(20),
      occupation VARCHAR(100),
      location_name VARCHAR(255),
      building_name VARCHAR(255),
      room_name VARCHAR(255),
      message TEXT,
      created_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS contact (
      id INT PRIMARY KEY DEFAULT 1,
      phone VARCHAR(50),
      whatsapp VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      address_full TEXT,
      hours VARCHAR(255),
      stats JSON,
      branches JSON
    );

    CREATE TABLE IF NOT EXISTS offers (
      id INT PRIMARY KEY DEFAULT 1,
      enabled TINYINT(1) DEFAULT 0,
      title VARCHAR(255),
      subtitle VARCHAR(255),
      discount VARCHAR(50),
      discount_percent INT DEFAULT 0,
      valid_until DATE,
      bg_color VARCHAR(20)
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id BIGINT PRIMARY KEY,
      filename VARCHAR(255),
      url VARCHAR(500),
      title VARCHAR(255),
      category VARCHAR(50)
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255),
      role VARCHAR(255),
      rating INT DEFAULT 5,
      text TEXT,
      date_label VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS hero_images (
      id BIGINT PRIMARY KEY,
      filename VARCHAR(255),
      url VARCHAR(500),
      title VARCHAR(255)
    );
  `);

  console.log('Tables created. Seeding data from JSON files...');

  const dataDir = path.join(__dirname, 'data');

  // ── Locations ────────────────────────────────────────────────
  const locations = JSON.parse(fs.readFileSync(path.join(dataDir, 'locations.json'), 'utf8'));
  for (const loc of locations) {
    await db.query(
      'INSERT IGNORE INTO locations (id, name, slug, enabled, display_order, phone, whatsapp, map_embed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [loc.id, loc.name, loc.slug, loc.enabled ? 1 : 0, loc.order || 1, loc.phone || '', loc.whatsapp || '', loc.mapEmbed || '']
    );
    for (const b of (loc.buildings || [])) {
      await db.query(
        'INSERT IGNORE INTO buildings (id, location_id, name, type, price, description, address, enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [b.id, loc.id, b.name, b.type || 'boys', b.price || 0, b.description || '', b.address || '', b.enabled ? 1 : 0]
      );
      for (const a of (b.amenities || [])) {
        await db.query('INSERT INTO building_amenities (building_id, amenity) VALUES (?, ?)', [b.id, a]);
      }
      for (const p of (b.photos || [])) {
        await db.query('INSERT INTO building_photos (building_id, url) VALUES (?, ?)', [b.id, p]);
      }
      for (const rt of (b.roomTypes || [])) {
        await db.query(
          'INSERT IGNORE INTO room_types (id, building_id, name, occupancy, price, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [rt.id, b.id, rt.name, rt.occupancy || 'double_sharing', rt.price || 0, rt.description || '', rt.enabled ? 1 : 0]
        );
        for (const a of (rt.amenities || [])) {
          await db.query('INSERT INTO room_amenities (room_type_id, amenity) VALUES (?, ?)', [rt.id, a]);
        }
        for (const p of (rt.photos || [])) {
          await db.query('INSERT INTO room_photos (room_type_id, url) VALUES (?, ?)', [rt.id, p]);
        }
      }
    }
  }
  console.log('Locations seeded.');

  // ── Enquiries ────────────────────────────────────────────────
  const enquiriesFile = path.join(dataDir, 'enquiries.json');
  if (fs.existsSync(enquiriesFile)) {
    const enquiries = JSON.parse(fs.readFileSync(enquiriesFile, 'utf8'));
    for (const e of enquiries) {
      await db.query(
        'INSERT IGNORE INTO enquiries (id, name, mobile, occupation, location_name, building_name, room_name, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [e.id, e.name, e.mobile, e.occupation || '', e.locationName || '', e.buildingName || '', e.roomName || '', e.message || '', new Date(e.createdAt)]
      );
    }
    console.log('Enquiries seeded.');
  }

  // ── Contact ──────────────────────────────────────────────────
  const contact = JSON.parse(fs.readFileSync(path.join(dataDir, 'contact.json'), 'utf8'));
  await db.query(
    'INSERT IGNORE INTO contact (id, phone, whatsapp, email, address, address_full, hours, stats, branches) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)',
    [contact.phone || '', contact.whatsapp || '', contact.email || '', contact.address || '', contact.addressFull || '', contact.hours || '', JSON.stringify(contact.stats || []), JSON.stringify(contact.branches || [])]
  );
  console.log('Contact seeded.');

  // ── Offers ───────────────────────────────────────────────────
  const offers = JSON.parse(fs.readFileSync(path.join(dataDir, 'offers.json'), 'utf8'));
  await db.query(
    'INSERT IGNORE INTO offers (id, enabled, title, subtitle, discount, discount_percent, valid_until, bg_color) VALUES (1, ?, ?, ?, ?, ?, ?, ?)',
    [offers.enabled ? 1 : 0, offers.title || '', offers.subtitle || '', offers.discount || '', offers.discountPercent || 0, offers.validUntil || null, offers.bgColor || '']
  );
  console.log('Offers seeded.');

  // ── Gallery ──────────────────────────────────────────────────
  const galleryFile = path.join(dataDir, 'gallery.json');
  if (fs.existsSync(galleryFile)) {
    const gallery = JSON.parse(fs.readFileSync(galleryFile, 'utf8'));
    for (const g of gallery) {
      await db.query(
        'INSERT IGNORE INTO gallery (id, filename, url, title, category) VALUES (?, ?, ?, ?, ?)',
        [g.id, g.filename || '', g.url, g.title || '', g.category || 'room']
      );
    }
    console.log('Gallery seeded.');
  }

  // ── Testimonials ─────────────────────────────────────────────
  const testimonialsFile = path.join(dataDir, 'testimonials.json');
  if (fs.existsSync(testimonialsFile)) {
    const testimonials = JSON.parse(fs.readFileSync(testimonialsFile, 'utf8'));
    for (const t of testimonials) {
      await db.query(
        'INSERT IGNORE INTO testimonials (id, name, role, rating, text, date_label) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, t.name, t.role || '', t.rating || 5, t.text || '', t.date || '']
      );
    }
    console.log('Testimonials seeded.');
  }

  // ── Hero Images ──────────────────────────────────────────────
  const heroFile = path.join(dataDir, 'hero-images.json');
  if (fs.existsSync(heroFile)) {
    const heroes = JSON.parse(fs.readFileSync(heroFile, 'utf8'));
    for (const h of heroes) {
      await db.query(
        'INSERT IGNORE INTO hero_images (id, filename, url, title) VALUES (?, ?, ?, ?)',
        [h.id, h.filename || '', h.url, h.title || '']
      );
    }
    console.log('Hero images seeded.');
  }

  await db.end();
  console.log('\nMigration complete!');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
