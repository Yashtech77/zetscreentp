const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/contact.json');

router.get('/', (req, res) => {
  res.json(JSON.parse(fs.readFileSync(dataFile, 'utf8')));
});

router.put('/', authMiddleware, (req, res) => {
  const updated = { ...JSON.parse(fs.readFileSync(dataFile, 'utf8')), ...req.body };
  fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2));
  res.json(updated);
});

module.exports = router;
